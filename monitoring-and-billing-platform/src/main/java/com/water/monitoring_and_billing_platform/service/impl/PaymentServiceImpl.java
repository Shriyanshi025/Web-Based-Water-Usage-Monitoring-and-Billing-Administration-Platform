package com.water.monitoring_and_billing_platform.service.impl;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import com.water.monitoring_and_billing_platform.dto.*;
import com.water.monitoring_and_billing_platform.entity.*;
import com.water.monitoring_and_billing_platform.enums.*;
import com.water.monitoring_and_billing_platform.repository.*;
import com.water.monitoring_and_billing_platform.service.AlertService;
import com.water.monitoring_and_billing_platform.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final BillRepository billRepository;
    private final InvoiceRepository invoiceRepository;
    private final UserRepository userRepository;
    private final CommunityAdminProfileRepository communityAdminProfileRepository;
    private final ResidentProfileRepository residentProfileRepository;
    private final AlertService alertService;

    @Value("${razorpay.key-id}")
    private String keyId;

    @Value("${razorpay.key-secret}")
    private String keySecret;

    // Helper to get client (overridable in tests or simulated if keys are placeholders)
    protected RazorpayClient getRazorpayClient() throws Exception {
        return new RazorpayClient(keyId, keySecret);
    }

    private User getUserOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
    }

    private ResidentProfile getResidentOrThrow(User user) {
        return residentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Resident profile not found"));
    }

    @Override
    @Transactional
    public PaymentResponse createOrder(String email, PaymentRequest request) {
        User user = getUserOrThrow(email);
        ResidentProfile resident = getResidentOrThrow(user);

        Bill bill = billRepository.findById(request.getBillId())
                .orElseThrow(() -> new IllegalArgumentException("Bill not found"));

        if (!Objects.equals(bill.getResidentProfile().getId(), resident.getId())) {
            throw new SecurityException("Unauthorized payment request");
        }

        // Prevent duplicate successful payments
        boolean alreadyPaid = paymentRepository.existsByBillIdAndPaymentStatus(bill.getId(), PaymentStatus.SUCCESS);
        if (alreadyPaid) {
            throw new IllegalArgumentException("Bill has already been paid successfully.");
        }

        String paymentNumber = "PAY-BILL-" + bill.getId();
        long attemptCount = paymentRepository.countByBillId(bill.getId());
        int attemptNumber = (int) (attemptCount + 1);

        BigDecimal amount = bill.getTotalAmount();
        int amountInPaise = amount.multiply(BigDecimal.valueOf(100)).intValue();

        String orderId = "order_simulated_" + UUID.randomUUID().toString().substring(0, 8);

        // Attempt actual Razorpay order creation
        if (!keyId.contains("placeholder")) {
            try {
                RazorpayClient razorpay = getRazorpayClient();
                JSONObject orderRequest = new JSONObject();
                orderRequest.put("amount", amountInPaise);
                orderRequest.put("currency", "INR");
                orderRequest.put("receipt", paymentNumber + "-A" + attemptNumber);

                Order order = razorpay.orders.create(orderRequest);
                orderId = order.get("id");
            } catch (Exception e) {
                log.error("Failed to create Razorpay order, falling back to simulated order ID. Error: {}", e.getMessage());
            }
        }

        Invoice invoice = invoiceRepository.findByBillId(bill.getId()).orElse(null);

        Payment payment = Payment.builder()
                .paymentNumber(paymentNumber)
                .attemptNumber(attemptNumber)
                .bill(bill)
                .invoice(invoice)
                .resident(resident)
                .razorpayOrderId(orderId)
                .amount(amount)
                .currency("INR")
                .paymentStatus(PaymentStatus.PENDING)
                .build();

        Payment saved = paymentRepository.save(payment);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public PaymentResponse verifyPayment(String email, PaymentVerificationRequest request) {
        User user = getUserOrThrow(email);

        Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new IllegalArgumentException("Payment record not found for Order ID: " + request.getRazorpayOrderId()));

        if (payment.getPaymentStatus() == PaymentStatus.SUCCESS) {
            throw new IllegalArgumentException("This payment is already successful and is immutable.");
        }

        boolean verified = false;

        // Perform signature verification
        if (keyId.contains("placeholder")) {
            // Simulated validation for test/placeholder mode
            verified = request.getRazorpaySignature() != null && !request.getRazorpaySignature().isBlank();
        } else {
            try {
                JSONObject options = new JSONObject();
                options.put("razorpay_order_id", request.getRazorpayOrderId());
                options.put("razorpay_payment_id", request.getRazorpayPaymentId());
                options.put("razorpay_signature", request.getRazorpaySignature());

                verified = Utils.verifyPaymentSignature(options, keySecret);
            } catch (Exception e) {
                log.error("Signature verification threw an exception: {}", e.getMessage());
                payment.setFailureReason(e.getMessage());
            }
        }

        if (verified) {
            payment.setPaymentStatus(PaymentStatus.SUCCESS);
            payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
            payment.setRazorpaySignature(request.getRazorpaySignature());
            payment.setTransactionDate(LocalDateTime.now());
            payment.setPaymentMethod("Razorpay");

            // Update Bill Status
            Bill bill = payment.getBill();
            bill.setPaid(true);
            bill.setPaidDate(LocalDate.now());
            bill.setPaymentStatus("PAID");
            bill.setBillStatus("PAID");
            bill.setStatus(com.water.monitoring_and_billing_platform.enums.BillStatus.PAID);
            billRepository.save(bill);

            // Update Invoice Status
            Invoice invoice = payment.getInvoice();
            if (invoice != null) {
                invoice.setPaymentStatus("PAID");
                invoice.setBillStatus("PAID");
                invoiceRepository.save(invoice);
            }

            // Trigger payment success alert
            alertService.generatePaymentSuccessAlert(bill.getId());

        } else {
            payment.setPaymentStatus(PaymentStatus.FAILED);
            if (payment.getFailureReason() == null) {
                payment.setFailureReason("Signature verification failed");
            }

            // Trigger payment failed alert
            alertService.generatePaymentFailedAlert(payment.getBill().getId(), payment.getFailureReason());
        }

        Payment saved = paymentRepository.save(payment);
        return mapToResponse(saved);
    }

    @Override
    public PaymentResponse getPaymentById(String email, Long id) {
        User user = getUserOrThrow(email);
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));

        validateAccess(user, payment);
        return mapToResponse(payment);
    }

    @Override
    public PaymentResponse getPaymentByPaymentNumber(String email, String paymentNumber) {
        User user = getUserOrThrow(email);
        List<Payment> payments = paymentRepository.findByPaymentNumber(paymentNumber);
        if (payments.isEmpty()) {
            throw new IllegalArgumentException("Payment not found");
        }
        // Return latest attempt
        Payment payment = payments.stream()
                .max(Comparator.comparing(Payment::getAttemptNumber))
                .get();

        validateAccess(user, payment);
        return mapToResponse(payment);
    }

    private void validateAccess(User user, Payment payment) {
        if (user.getRole() == Role.MAIN_ADMIN) {
            return;
        }
        if (user.getRole() == Role.COMMUNITY_ADMIN) {
            CommunityAdminProfile adminProfile = communityAdminProfileRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Admin profile not found"));
            if (!Objects.equals(adminProfile.getCommunity().getId(), payment.getBill().getResidentProfile().getCommunity().getId())) {
                throw new SecurityException("Unauthorized to view this community's payments");
            }
            return;
        }
        ResidentProfile resident = getResidentOrThrow(user);
        if (!Objects.equals(resident.getId(), payment.getResident().getId())) {
            throw new SecurityException("Unauthorized to view this payment");
        }
    }

    @Override
    public List<PaymentResponse> getMyPayments(String email) {
        User user = getUserOrThrow(email);
        ResidentProfile resident = getResidentOrThrow(user);
        return paymentRepository.findByResidentId(resident.getId()).stream()
                .filter(p -> p.getPaymentStatus() != PaymentStatus.PENDING)
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<PaymentResponse> getCommunityPayments(String email, Long communityId) {
        User user = getUserOrThrow(email);
        if (user.getRole() == Role.COMMUNITY_ADMIN) {
            CommunityAdminProfile adminProfile = communityAdminProfileRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Admin profile not found"));
            if (!Objects.equals(adminProfile.getCommunity().getId(), communityId)) {
                throw new SecurityException("Unauthorized access to this community");
            }
        }
        return paymentRepository.findByBillResidentProfileCommunityId(communityId).stream()
                .filter(p -> p.getPaymentStatus() != PaymentStatus.PENDING)
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<PaymentResponse> getPaymentHistory(String email) {
        User user = getUserOrThrow(email);
        if (user.getRole() == Role.COMMUNITY_ADMIN) {
            CommunityAdminProfile adminProfile = communityAdminProfileRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Admin profile not found"));
            return paymentRepository.findByBillResidentProfileCommunityId(adminProfile.getCommunity().getId()).stream()
                    .filter(p -> p.getPaymentStatus() != PaymentStatus.PENDING)
                    .map(this::mapToResponse)
                    .toList();
        } else if (user.getRole() == Role.USER) {
            ResidentProfile resident = getResidentOrThrow(user);
            return paymentRepository.findByResidentId(resident.getId()).stream()
                    .filter(p -> p.getPaymentStatus() != PaymentStatus.PENDING)
                    .map(this::mapToResponse)
                    .toList();
        } else {
            return paymentRepository.findAll().stream()
                    .filter(p -> p.getPaymentStatus() != PaymentStatus.PENDING)
                    .map(this::mapToResponse)
                    .toList();
        }
    }

    @Override
    @Transactional
    public PaymentResponse retryFailedPayment(String email, Long paymentId) {
        User user = getUserOrThrow(email);
        Payment previous = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));

        validateAccess(user, previous);

        if (previous.getPaymentStatus() == PaymentStatus.SUCCESS) {
            throw new IllegalArgumentException("Payment was already successful. Cannot retry.");
        }

        // Generate next attempt
        PaymentRequest request = new PaymentRequest();
        request.setBillId(previous.getBill().getId());
        return createOrder(email, request);
    }

    @Override
    public PaymentStatisticsResponse getStatistics(String email) {
        User user = getUserOrThrow(email);
        List<Payment> payments;
        if (user.getRole() == Role.COMMUNITY_ADMIN) {
            CommunityAdminProfile adminProfile = communityAdminProfileRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Admin profile not found"));
            payments = paymentRepository.findByBillResidentProfileCommunityId(adminProfile.getCommunity().getId());
        } else if (user.getRole() == Role.USER) {
            ResidentProfile resident = getResidentOrThrow(user);
            payments = paymentRepository.findByResidentId(resident.getId());
        } else {
            payments = paymentRepository.findAll();
        }

        long total = payments.size();
        long success = payments.stream().filter(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS).count();
        long failed = payments.stream().filter(p -> p.getPaymentStatus() == PaymentStatus.FAILED).count();
        long pending = payments.stream().filter(p -> p.getPaymentStatus() == PaymentStatus.PENDING).count();

        BigDecimal totalRevenue = payments.stream()
                .filter(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        double successRate = total > 0 ? (double) success / total * 100.0 : 0.0;
        double failureRate = total > 0 ? (double) failed / total * 100.0 : 0.0;

        LocalDate today = LocalDate.now();
        BigDecimal todaysCollection = payments.stream()
                .filter(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS && p.getTransactionDate() != null && p.getTransactionDate().toLocalDate().equals(today))
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        LocalDate firstOfMonth = today.withDayOfMonth(1);
        BigDecimal monthlyCollection = payments.stream()
                .filter(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS && p.getTransactionDate() != null && !p.getTransactionDate().toLocalDate().isBefore(firstOfMonth))
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return PaymentStatisticsResponse.builder()
                .totalPayments(total)
                .successfulPayments(success)
                .failedPayments(failed)
                .pendingPayments(pending)
                .totalRevenueCollected(totalRevenue)
                .successRate(successRate)
                .failureRate(failureRate)
                .todaysCollection(todaysCollection)
                .monthlyCollection(monthlyCollection)
                .build();
    }

    @Override
    public void processWebhook(String payload, String signature) {
        log.info("Processing Razorpay webhook payload: {}, Signature: {}", payload, signature);
        // Pluggable verification placeholder - does not require live configuration for Test mode.
    }

    @Override
    @Transactional
    public PaymentResponse processDemoPayment(String email, Long billId, String method) {
        User user = getUserOrThrow(email);
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new IllegalArgumentException("Bill not found with ID: " + billId));

        if (bill.isPaid() || paymentRepository.existsByBillIdAndPaymentStatus(billId, PaymentStatus.SUCCESS)) {
            throw new IllegalArgumentException("This bill is already paid.");
        }

        ResidentProfile resident = residentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Resident profile not found for user: " + email));

        // Generate Demo Payment Number
        String paymentNumber = "PAY-DEMO-" + System.currentTimeMillis() + "-" + (new java.util.Random().nextInt(900) + 100);
        String txnId = "txn_demo_" + String.format("%08d", new java.util.Random().nextInt(100000000));

        Invoice invoice = invoiceRepository.findByBillId(bill.getId()).orElse(null);

        Payment payment = Payment.builder()
                .paymentNumber(paymentNumber)
                .attemptNumber(1)
                .bill(bill)
                .invoice(invoice)
                .resident(resident)
                .razorpayOrderId("demo_order_" + bill.getId())
                .razorpayPaymentId(txnId)
                .amount(bill.getTotalAmount())
                .currency("INR")
                .paymentStatus(PaymentStatus.SUCCESS)
                .paymentMethod(method)
                .transactionDate(LocalDateTime.now())
                .build();

        Payment saved = paymentRepository.save(payment);

        // Update Bill Status
        bill.setPaid(true);
        bill.setPaidDate(LocalDate.now());
        bill.setPaymentStatus("PAID");
        bill.setBillStatus("PAID");
        bill.setStatus(com.water.monitoring_and_billing_platform.enums.BillStatus.PAID);
        billRepository.save(bill);

        // Update Invoice Status
        if (invoice != null) {
            invoice.setPaymentStatus("PAID");
            invoice.setBillStatus("PAID");
            invoiceRepository.save(invoice);
        }

        // Trigger payment success alert
        alertService.generatePaymentSuccessAlert(bill.getId());

        // Notify community admin(s) that payment was received
        List<com.water.monitoring_and_billing_platform.entity.CommunityAdminProfile> admins = 
                communityAdminProfileRepository.findByCommunityIdAndActiveTrue(resident.getCommunity().getId());
        for (com.water.monitoring_and_billing_platform.entity.CommunityAdminProfile admin : admins) {
            alertService.createInAppNotification(
                    admin.getUser(),
                    resident,
                    resident.getCommunity(),
                    "Payment Received",
                    "Resident " + resident.getUser().getFullName() + " paid " + method + " bill " + bill.getBillNumber() + " of Amount INR " + bill.getTotalAmount(),
                    com.water.monitoring_and_billing_platform.enums.AlertType.PAYMENT_SUCCESS,
                    com.water.monitoring_and_billing_platform.enums.AlertSeverity.LOW,
                    null
            );
        }

        return mapToResponse(saved);
    }

    private PaymentResponse mapToResponse(Payment payment) {
        String monthStr = "N/A";
        if (payment.getBill() != null) {
            if (payment.getBill().getBillingMonth() != null && payment.getBill().getBillingYear() != null) {
                java.time.Month m = java.time.Month.of(payment.getBill().getBillingMonth());
                String mName = m.getDisplayName(java.time.format.TextStyle.FULL, java.util.Locale.ENGLISH);
                monthStr = mName + " " + payment.getBill().getBillingYear();
            } else if (payment.getBill().getBillingCycle() != null) {
                monthStr = payment.getBill().getBillingCycle().getName();
            }
        }

        return PaymentResponse.builder()
                .id(payment.getId())
                .paymentNumber(payment.getPaymentNumber())
                .attemptNumber(payment.getAttemptNumber())
                .billId(payment.getBill().getId())
                .billNumber(payment.getBill() != null ? payment.getBill().getBillNumber() : "N/A")
                .invoiceId(payment.getInvoice() != null ? payment.getInvoice().getId() : null)
                .invoiceNumber(payment.getInvoice() != null ? payment.getInvoice().getInvoiceNumber() : "N/A")
                .billingMonth(monthStr)
                .residentId(payment.getResident().getId())
                .residentName(payment.getResident().getUser().getFullName())
                .razorpayOrderId(payment.getRazorpayOrderId())
                .razorpayPaymentId(payment.getRazorpayPaymentId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .paymentMethod(payment.getPaymentMethod())
                .paymentStatus(payment.getPaymentStatus().name())
                .transactionDate(payment.getTransactionDate())
                .failureReason(payment.getFailureReason())
                .refundStatus(payment.getRefundStatus().name())
                .refundAmount(payment.getRefundAmount())
                .refundDate(payment.getRefundDate())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
