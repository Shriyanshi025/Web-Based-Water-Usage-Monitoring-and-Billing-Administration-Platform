package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.dto.*;
import com.water.monitoring_and_billing_platform.entity.*;
import com.water.monitoring_and_billing_platform.enums.*;
import com.water.monitoring_and_billing_platform.repository.*;
import com.water.monitoring_and_billing_platform.service.AlertService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PaymentServiceImplTest {

    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private BillRepository billRepository;
    @Mock
    private InvoiceRepository invoiceRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private CommunityAdminProfileRepository communityAdminProfileRepository;
    @Mock
    private ResidentProfileRepository residentProfileRepository;
    @Mock
    private AlertService alertService;

    @InjectMocks
    private PaymentServiceImpl paymentService;

    private User residentUser;
    private User adminUser;
    private Community community;
    private ResidentProfile resident;
    private CommunityAdminProfile adminProfile;
    private BillingCycle cycle;
    private Bill bill;
    private Invoice invoice;
    private Payment payment;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(paymentService, "keyId", "rzp_test_placeholder_key");
        ReflectionTestUtils.setField(paymentService, "keySecret", "rzp_test_placeholder_secret");

        residentUser = User.builder().id(1L).fullName("John Resident").email("resident@example.com").role(Role.USER).build();
        adminUser = User.builder().id(2L).fullName("Admin User").email("admin@example.com").role(Role.COMMUNITY_ADMIN).build();
        community = Community.builder().id(10L).communityName("Maplewood").build();
        resident = ResidentProfile.builder().id(1L).user(residentUser).community(community).active(true).build();
        adminProfile = CommunityAdminProfile.builder().id(1L).user(adminUser).community(community).build();
        cycle = BillingCycle.builder().id(5L).name("Cycle 1").periodStart(LocalDate.now().minusDays(10)).periodEnd(LocalDate.now().plusDays(10)).build();
        bill = Bill.builder().id(100L).residentProfile(resident).billingCycle(cycle).totalAmount(BigDecimal.valueOf(1250.00)).build();
        invoice = Invoice.builder().id(200L).bill(bill).build();
        payment = Payment.builder().id(1L).paymentNumber("PAY-BILL-100").attemptNumber(1).bill(bill).invoice(invoice).resident(resident).razorpayOrderId("order_123").amount(BigDecimal.valueOf(1250.00)).paymentStatus(PaymentStatus.PENDING).build();
    }

    @Test
    void testCreateOrder_Success() {
        PaymentRequest request = new PaymentRequest();
        request.setBillId(100L);

        when(userRepository.findByEmail("resident@example.com")).thenReturn(Optional.of(residentUser));
        when(residentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(resident));
        when(billRepository.findById(100L)).thenReturn(Optional.of(bill));
        when(paymentRepository.existsByBillIdAndPaymentStatus(100L, PaymentStatus.SUCCESS)).thenReturn(false);
        when(paymentRepository.countByBillId(100L)).thenReturn(0L);
        when(invoiceRepository.findByBillId(100L)).thenReturn(Optional.of(invoice));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        PaymentResponse response = paymentService.createOrder("resident@example.com", request);

        assertNotNull(response);
        assertEquals("PAY-BILL-100", response.getPaymentNumber());
        assertEquals(1, response.getAttemptNumber());
        assertEquals("INR", response.getCurrency());
        assertEquals("PENDING", response.getPaymentStatus());
        verify(paymentRepository).save(any(Payment.class));
    }

    @Test
    void testVerifyPayment_Success() {
        PaymentVerificationRequest request = new PaymentVerificationRequest();
        request.setRazorpayOrderId("order_123");
        request.setRazorpayPaymentId("pay_123");
        request.setRazorpaySignature("sig_123");

        when(userRepository.findByEmail("resident@example.com")).thenReturn(Optional.of(residentUser));
        when(paymentRepository.findByRazorpayOrderId("order_123")).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        PaymentResponse response = paymentService.verifyPayment("resident@example.com", request);

        assertNotNull(response);
        assertEquals("SUCCESS", response.getPaymentStatus());
        assertEquals("pay_123", response.getRazorpayPaymentId());
        verify(billRepository).save(any(Bill.class));
        verify(invoiceRepository).save(any(Invoice.class));
        verify(alertService).generatePaymentSuccessAlert(100L);
    }

    @Test
    void testVerifyPayment_Failure() {
        PaymentVerificationRequest request = new PaymentVerificationRequest();
        request.setRazorpayOrderId("order_123");
        request.setRazorpayPaymentId("pay_123");
        request.setRazorpaySignature(""); // Empty signature will trigger failure validation in test mode

        when(userRepository.findByEmail("resident@example.com")).thenReturn(Optional.of(residentUser));
        when(paymentRepository.findByRazorpayOrderId("order_123")).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        PaymentResponse response = paymentService.verifyPayment("resident@example.com", request);

        assertNotNull(response);
        assertEquals("FAILED", response.getPaymentStatus());
        verify(alertService).generatePaymentFailedAlert(eq(100L), anyString());
    }

    @Test
    void testGetStatistics() {
        Payment successPayment = Payment.builder().id(1L).paymentNumber("PAY-1").attemptNumber(1).amount(BigDecimal.valueOf(1000.00)).paymentStatus(PaymentStatus.SUCCESS).transactionDate(LocalDateTime.now()).bill(bill).build();
        Payment failedPayment = Payment.builder().id(2L).paymentNumber("PAY-2").attemptNumber(1).amount(BigDecimal.valueOf(1000.00)).paymentStatus(PaymentStatus.FAILED).bill(bill).build();

        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));
        when(communityAdminProfileRepository.findByUserId(2L)).thenReturn(Optional.of(adminProfile));
        when(paymentRepository.findByBillResidentProfileCommunityId(10L)).thenReturn(List.of(successPayment, failedPayment));

        PaymentStatisticsResponse stats = paymentService.getStatistics("admin@example.com");

        assertNotNull(stats);
        assertEquals(2, stats.getTotalPayments());
        assertEquals(1, stats.getSuccessfulPayments());
        assertEquals(1, stats.getFailedPayments());
        assertEquals(50.0, stats.getSuccessRate());
        assertEquals(50.0, stats.getFailureRate());
        assertEquals(BigDecimal.valueOf(1000.00), stats.getTotalRevenueCollected());
        assertEquals(BigDecimal.valueOf(1000.00), stats.getTodaysCollection());
    }
}
