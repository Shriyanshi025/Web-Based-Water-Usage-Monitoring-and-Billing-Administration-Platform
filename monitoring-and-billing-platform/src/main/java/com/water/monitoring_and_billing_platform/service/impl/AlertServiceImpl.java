package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.dto.AlertResponse;
import com.water.monitoring_and_billing_platform.dto.AlertStatisticsResponse;
import com.water.monitoring_and_billing_platform.dto.SystemAnnouncementRequest;
import com.water.monitoring_and_billing_platform.entity.*;
import com.water.monitoring_and_billing_platform.enums.*;
import com.water.monitoring_and_billing_platform.repository.*;
import com.water.monitoring_and_billing_platform.service.AlertService;
import com.water.monitoring_and_billing_platform.service.EmailNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertServiceImpl implements AlertService {

    private final AlertRepository alertRepository;
    private final AlertConfigurationRepository alertConfigurationRepository;
    private final ResidentProfileRepository residentProfileRepository;
    private final WaterMeterRepository waterMeterRepository;
    private final WaterUsageRepository waterUsageRepository;
    private final BillRepository billRepository;
    private final BillingCycleRepository billingCycleRepository;
    private final UserRepository userRepository;
    private final CommunityAdminProfileRepository communityAdminProfileRepository;
    private final EmailNotificationService emailNotificationService;

    private User getUserOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
    }

    private AlertConfiguration getConfiguration(Long communityId) {
        if (communityId != null) {
            return alertConfigurationRepository.findByCommunityId(communityId)
                    .orElseGet(() -> alertConfigurationRepository.findFirstByCommunityIdIsNull()
                            .orElseGet(this::createDefaultGlobalConfig));
        }
        return alertConfigurationRepository.findFirstByCommunityIdIsNull()
                .orElseGet(this::createDefaultGlobalConfig);
    }

    private AlertConfiguration createDefaultGlobalConfig() {
        AlertConfiguration config = AlertConfiguration.builder()
                .highUsagePercentage(150.0)
                .leakDetectionThreshold(0.01)
                .meterOfflineDurationHours(24)
                .overdueReminderDays(5)
                .build();
        return alertConfigurationRepository.save(config);
    }

    @Override
    public List<AlertResponse> getMyAlerts(String email) {
        User user = getUserOrThrow(email);
        List<Alert> alerts;
        if (user.getRole() == Role.MAIN_ADMIN) {
            alerts = alertRepository.findByRecipientIdOrderByCreatedDateDesc(user.getId());
        } else if (user.getRole() == Role.COMMUNITY_ADMIN) {
            CommunityAdminProfile adminProfile = communityAdminProfileRepository.findByUserId(user.getId()).orElse(null);
            if (adminProfile != null && adminProfile.getCommunity() != null) {
                alerts = alertRepository.findByRecipientIdOrCommunityIdOrderByCreatedDateDesc(user.getId(), adminProfile.getCommunity().getId());
            } else {
                alerts = alertRepository.findByRecipientIdOrderByCreatedDateDesc(user.getId());
            }
        } else {
            ResidentProfile resident = residentProfileRepository.findByUserId(user.getId()).orElse(null);
            if (resident != null) {
                alerts = alertRepository.findByRecipientIdOrResidentIdOrderByCreatedDateDesc(user.getId(), resident.getId());
            } else {
                alerts = alertRepository.findByRecipientIdOrderByCreatedDateDesc(user.getId());
            }
        }
        return alerts.stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<AlertResponse> getCommunityAlerts(String email, Long communityId) {
        User user = getUserOrThrow(email);
        if (user.getRole() == Role.COMMUNITY_ADMIN) {
            CommunityAdminProfile adminProfile = communityAdminProfileRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Admin profile not found"));
            if (!Objects.equals(adminProfile.getCommunity().getId(), communityId)) {
                throw new SecurityException("Unauthorized access to this community's alerts");
            }
        }
        return alertRepository.findByCommunityId(communityId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public AlertResponse getAlertById(String email, Long id) {
        User user = getUserOrThrow(email);
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Alert not found"));
        validateAccess(user, alert);
        return mapToResponse(alert);
    }

    private void validateAccess(User user, Alert alert) {
        if (user.getRole() == Role.COMMUNITY_ADMIN) {
            CommunityAdminProfile adminProfile = communityAdminProfileRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Admin profile not found"));
            if (!Objects.equals(adminProfile.getCommunity().getId(), alert.getCommunity().getId())) {
                throw new SecurityException("Unauthorized access to this community's alerts");
            }
        } else if (user.getRole() == Role.USER) {
            ResidentProfile resident = residentProfileRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Resident profile not found"));
            if (alert.getResident() != null && !Objects.equals(resident.getId(), alert.getResident().getId())) {
                throw new SecurityException("Unauthorized access to this alert");
            }
        }
    }

    @Override
    @Transactional
    public AlertResponse markAsRead(String email, Long id) {
        User user = getUserOrThrow(email);
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Alert not found"));
        validateAccess(user, alert);
        if (alert.getStatus() == AlertStatus.ACTIVE) {
            alert.setStatus(AlertStatus.READ);
            alert = alertRepository.save(alert);
        }
        return mapToResponse(alert);
    }

    @Override
    @Transactional
    public AlertResponse resolveAlert(String email, Long id) {
        User user = getUserOrThrow(email);
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Alert not found"));
        validateAccess(user, alert);
        if (alert.getStatus() != AlertStatus.RESOLVED) {
            alert.setStatus(AlertStatus.RESOLVED);
            alert.setResolvedDate(LocalDateTime.now());
            alert = alertRepository.save(alert);
        }
        return mapToResponse(alert);
    }

    @Override
    @Transactional
    public AlertResponse createSystemAnnouncement(String email, SystemAnnouncementRequest request) {
        User user = getUserOrThrow(email);
        if (user.getRole() != Role.COMMUNITY_ADMIN && user.getRole() != Role.MAIN_ADMIN) {
            throw new SecurityException("Only admins can create system announcements");
        }

        CommunityAdminProfile adminProfile = communityAdminProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Admin profile not found"));

        if (!Objects.equals(adminProfile.getCommunity().getId(), request.getCommunityId()) && user.getRole() != Role.MAIN_ADMIN) {
            throw new SecurityException("Unauthorized to create announcement for this community");
        }

        AlertSeverity severity = AlertSeverity.MEDIUM;
        if (request.getSeverity() != null) {
            try {
                severity = AlertSeverity.valueOf(request.getSeverity().toUpperCase());
            } catch (Exception e) {
                // Keep default MEDIUM
            }
        }

        String randomDigits = String.format("%06d", new Random().nextInt(1000000));
        String alertNumber = "ALT-SYS-" + randomDigits;

        Alert alert = Alert.builder()
                .alertNumber(alertNumber)
                .alertType(AlertType.SYSTEM_NOTIFICATION)
                .severity(severity)
                .title(request.getTitle())
                .message(request.getMessage())
                .community(adminProfile.getCommunity())
                .status(AlertStatus.ACTIVE)
                .createdDate(LocalDateTime.now())
                .build();

        Alert saved = alertRepository.save(alert);

        // Pluggable Notification triggering
        List<ResidentProfile> residents = residentProfileRepository.findByCommunityIdAndActiveTrue(adminProfile.getCommunity().getId());
        for (ResidentProfile resident : residents) {
            try {
                emailNotificationService.sendAlertEmail(
                        resident.getUser().getEmail(),
                        "System Announcement: " + request.getTitle(),
                        request.getMessage()
                );
            } catch (Exception e) {
                log.error("Failed to notify resident: {}", resident.getUser().getEmail());
            }
        }

        return mapToResponse(saved);
    }

    @Override
    public AlertStatisticsResponse getStatistics(String email) {
        User user = getUserOrThrow(email);
        List<Alert> alerts;
        if (user.getRole() == Role.COMMUNITY_ADMIN) {
            CommunityAdminProfile adminProfile = communityAdminProfileRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Admin profile not found"));
            alerts = alertRepository.findByCommunityId(adminProfile.getCommunity().getId());
        } else if (user.getRole() == Role.USER) {
            ResidentProfile resident = residentProfileRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Resident profile not found"));
            alerts = alertRepository.findByResidentId(resident.getId());
        } else {
            alerts = alertRepository.findAll();
        }

        long total = alerts.size();
        long active = alerts.stream().filter(a -> a.getStatus() == AlertStatus.ACTIVE).count();
        long resolved = alerts.stream().filter(a -> a.getStatus() == AlertStatus.RESOLVED).count();

        Map<String, Long> byType = alerts.stream()
                .collect(Collectors.groupingBy(a -> a.getAlertType().name(), Collectors.counting()));

        Map<String, Long> bySeverity = alerts.stream()
                .collect(Collectors.groupingBy(a -> a.getSeverity().name(), Collectors.counting()));

        LocalDate today = LocalDate.now();
        long todayCount = alerts.stream()
                .filter(a -> a.getCreatedDate().toLocalDate().equals(today))
                .count();

        return AlertStatisticsResponse.builder()
                .totalAlerts(total)
                .activeAlerts(active)
                .resolvedAlerts(resolved)
                .alertsByType(byType)
                .alertsBySeverity(bySeverity)
                .alertsToday(todayCount)
                .build();
    }

    @Override
    @Transactional
    public void processScheduledAlerts() {
        log.info("Running automatic alert detection scheduled job...");

        BillingCycle cycle = billingCycleRepository.findFirstByActiveTrueOrderByPeriodStartDesc().orElse(null);
        if (cycle == null) {
            log.warn("No active billing cycle found. Skipping scheduled alerts job.");
            return;
        }

        List<ResidentProfile> residents = residentProfileRepository.findAll().stream()
                .filter(ResidentProfile::isActive)
                .toList();

        for (ResidentProfile resident : residents) {
            AlertConfiguration config = getConfiguration(resident.getCommunity().getId());

            // 1. High Usage Detection
            try {
                detectHighUsage(resident, cycle, config);
            } catch (Exception e) {
                log.error("Error detecting high usage for resident {}: {}", resident.getId(), e.getMessage());
            }

            // 2. Leak Detection
            try {
                detectLeak(resident, cycle, config);
            } catch (Exception e) {
                log.error("Error detecting leak for resident {}: {}", resident.getId(), e.getMessage());
            }

            // 3. Meter Offline Detection
            try {
                detectMeterOffline(resident, config);
            } catch (Exception e) {
                log.error("Error detecting offline meter for resident {}: {}", resident.getId(), e.getMessage());
            }
        }

        // 4. Overdue Bills Detection
        try {
            detectOverdueBills();
        } catch (Exception e) {
            log.error("Error detecting overdue bills: {}", e.getMessage());
        }
    }

    private void detectHighUsage(ResidentProfile resident, BillingCycle cycle, AlertConfiguration config) {
        // Prevent duplicate ACTIVE high usage alert for this cycle
        boolean exists = alertRepository.existsByResidentIdAndBillingCycleIdAndAlertTypeAndStatus(
                resident.getId(), cycle.getId(), AlertType.HIGH_WATER_USAGE, AlertStatus.ACTIVE
        );
        if (exists) {
            return;
        }

        Optional<WaterMeter> meterOpt = waterMeterRepository.findByResidentProfileId(resident.getId());
        if (meterOpt.isEmpty()) {
            return;
        }
        WaterMeter meter = meterOpt.get();

        List<WaterUsage> usages = waterUsageRepository.findByWaterMeterIdAndReadingDateBetween(
                meter.getId(), cycle.getPeriodStart(), cycle.getPeriodEnd()
        );
        double currentUsage = usages.stream().mapToDouble(WaterUsage::getUnitsConsumed).sum();

        List<Bill> pastBills = billRepository.findByResidentProfileId(resident.getId());
        double avgPastUsage = pastBills.stream().mapToDouble(Bill::getUnitsConsumed).average().orElse(0.0);

        if (avgPastUsage > 0 && currentUsage > avgPastUsage * (config.getHighUsagePercentage() / 100.0)) {
            String randomDigits = String.format("%06d", new Random().nextInt(1000000));
            Alert alert = Alert.builder()
                    .alertNumber("ALT-HWU-" + randomDigits)
                    .alertType(AlertType.HIGH_WATER_USAGE)
                    .severity(AlertSeverity.HIGH)
                    .title("High Water Usage Alert")
                    .message("Your water usage this cycle (" + String.format("%.2f", currentUsage) + " units) has exceeded 150% of your historical average (" + String.format("%.2f", avgPastUsage) + " units).")
                    .resident(resident)
                    .community(resident.getCommunity())
                    .waterMeter(meter)
                    .billingCycle(cycle)
                    .status(AlertStatus.ACTIVE)
                    .createdDate(LocalDateTime.now())
                    .build();

            alertRepository.save(alert);
            emailNotificationService.sendAlertEmail(
                    resident.getUser().getEmail(),
                    alert.getTitle(),
                    alert.getMessage()
            );

            // Notify Community Admin(s)
            List<CommunityAdminProfile> admins = communityAdminProfileRepository.findByCommunityIdAndActiveTrue(resident.getCommunity().getId());
            for (CommunityAdminProfile admin : admins) {
                createInAppNotification(
                        admin.getUser(),
                        resident,
                        resident.getCommunity(),
                        "High Water Usage Detected",
                        "High water usage (" + String.format("%.2f", currentUsage) + " units) has been detected for resident " + resident.getUser().getFullName() + ".",
                        AlertType.HIGH_WATER_USAGE,
                        AlertSeverity.MEDIUM,
                        null
                );
            }
        }
    }

    private void detectLeak(ResidentProfile resident, BillingCycle cycle, AlertConfiguration config) {
        boolean exists = alertRepository.existsByResidentIdAndBillingCycleIdAndAlertTypeAndStatus(
                resident.getId(), cycle.getId(), AlertType.SUSPECTED_LEAK, AlertStatus.ACTIVE
        );
        if (exists) {
            return;
        }

        Optional<WaterMeter> meterOpt = waterMeterRepository.findByResidentProfileId(resident.getId());
        if (meterOpt.isEmpty()) {
            return;
        }
        WaterMeter meter = meterOpt.get();

        // Retrieve last 3 readings
        List<WaterUsage> recentUsages = waterUsageRepository.findByWaterMeterIdAndReadingDateBetween(
                meter.getId(), cycle.getPeriodStart(), cycle.getPeriodEnd()
        ).stream()
                .sorted(Comparator.comparing(WaterUsage::getReadingDate).reversed())
                .limit(3)
                .toList();

        if (recentUsages.size() >= 3) {
            boolean suspected = recentUsages.stream()
                    .allMatch(u -> u.getUnitsConsumed() > config.getLeakDetectionThreshold());

            if (suspected) {
                String randomDigits = String.format("%06d", new Random().nextInt(1000000));
                Alert alert = Alert.builder()
                        .alertNumber("ALT-LEAK-" + randomDigits)
                        .alertType(AlertType.SUSPECTED_LEAK)
                        .severity(AlertSeverity.CRITICAL)
                        .title("Suspected Water Leak")
                        .message("Continuous abnormal consumption has been detected on your meter. Please check your pipelines.")
                        .resident(resident)
                        .community(resident.getCommunity())
                        .waterMeter(meter)
                        .billingCycle(cycle)
                        .status(AlertStatus.ACTIVE)
                        .createdDate(LocalDateTime.now())
                        .build();

                alertRepository.save(alert);
                emailNotificationService.sendAlertEmail(
                        resident.getUser().getEmail(),
                        alert.getTitle(),
                        alert.getMessage()
                );
            }
        }
    }

    private void detectMeterOffline(ResidentProfile resident, AlertConfiguration config) {
        boolean exists = alertRepository.existsByResidentIdAndAlertTypeAndStatus(
                resident.getId(), AlertType.METER_OFFLINE, AlertStatus.ACTIVE
        );
        if (exists) {
            return;
        }

        Optional<WaterMeter> meterOpt = waterMeterRepository.findByResidentProfileId(resident.getId());
        if (meterOpt.isEmpty()) {
            return;
        }
        WaterMeter meter = meterOpt.get();

        Optional<WaterUsage> lastUsageOpt = waterUsageRepository.findFirstByWaterMeterResidentProfileIdOrderByReadingDateDescIdDesc(resident.getId());
        LocalDateTime lastActive = lastUsageOpt.map(WaterUsage::getCreatedAt).orElse(meter.getCreatedAt());

        if (lastActive == null) {
            lastActive = LocalDateTime.now().minusDays(5);
        }

        if (lastActive.isBefore(LocalDateTime.now().minusHours(config.getMeterOfflineDurationHours()))) {
            String randomDigits = String.format("%06d", new Random().nextInt(1000000));
            Alert alert = Alert.builder()
                    .alertNumber("ALT-OFF-" + randomDigits)
                    .alertType(AlertType.METER_OFFLINE)
                    .severity(AlertSeverity.MEDIUM)
                    .title("Water Meter Offline")
                    .message("No reading has been received from your meter in the last " + config.getMeterOfflineDurationHours() + " hours.")
                    .resident(resident)
                    .community(resident.getCommunity())
                    .waterMeter(meter)
                    .status(AlertStatus.ACTIVE)
                    .createdDate(LocalDateTime.now())
                    .build();

            alertRepository.save(alert);
            emailNotificationService.sendAlertEmail(
                    resident.getUser().getEmail(),
                    alert.getTitle(),
                    alert.getMessage()
            );
        }
    }

    private void detectOverdueBills() {
        List<Bill> unpaidBills = billRepository.findAll().stream()
                .filter(b -> !b.isPaid() && b.getDueDate() != null && LocalDate.now().isAfter(b.getDueDate()))
                .toList();

        for (Bill bill : unpaidBills) {
            AlertConfiguration config = getConfiguration(bill.getResidentProfile().getCommunity().getId());
            if (LocalDate.now().isAfter(bill.getDueDate().plusDays(config.getOverdueReminderDays()))) {
                boolean exists = alertRepository.existsByResidentIdAndBillingCycleIdAndAlertTypeAndStatus(
                        bill.getResidentProfile().getId(), bill.getBillingCycle().getId(), AlertType.BILL_OVERDUE, AlertStatus.ACTIVE
                );
                if (exists) {
                    continue;
                }

                String randomDigits = String.format("%06d", new Random().nextInt(1000000));
                Alert alert = Alert.builder()
                        .alertNumber("ALT-OVD-" + randomDigits)
                        .alertType(AlertType.BILL_OVERDUE)
                        .severity(AlertSeverity.HIGH)
                        .title("Overdue Bill Alert")
                        .message("Your bill of Rs. " + bill.getTotalAmount() + " is overdue since " + bill.getDueDate().toString() + ".")
                        .resident(bill.getResidentProfile())
                        .community(bill.getResidentProfile().getCommunity())
                        .billingCycle(bill.getBillingCycle())
                        .relatedBill(bill)
                        .status(AlertStatus.ACTIVE)
                        .createdDate(LocalDateTime.now())
                        .build();

                alertRepository.save(alert);
                emailNotificationService.sendAlertEmail(
                        bill.getResidentProfile().getUser().getEmail(),
                        alert.getTitle(),
                        alert.getMessage()
                );
            }
        }
    }

    @Override
    @Transactional
    public void generatePaymentSuccessAlert(Long billId) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new IllegalArgumentException("Bill not found with id: " + billId));

        boolean exists = alertRepository.existsByResidentIdAndBillingCycleIdAndAlertTypeAndStatus(
                bill.getResidentProfile().getId(), bill.getBillingCycle().getId(), AlertType.PAYMENT_SUCCESS, AlertStatus.ACTIVE
        );
        if (exists) {
            return;
        }

        String randomDigits = String.format("%06d", new Random().nextInt(1000000));
        Alert alert = Alert.builder()
                .alertNumber("ALT-PAY-OK-" + randomDigits)
                .alertType(AlertType.PAYMENT_SUCCESS)
                .severity(AlertSeverity.LOW)
                .title("Payment Successful")
                .message("We have successfully received payment for your bill of Rs. " + bill.getTotalAmount() + ".")
                .resident(bill.getResidentProfile())
                .community(bill.getResidentProfile().getCommunity())
                .billingCycle(bill.getBillingCycle())
                .relatedBill(bill)
                .status(AlertStatus.ACTIVE)
                .createdDate(LocalDateTime.now())
                .build();

        alertRepository.save(alert);
        emailNotificationService.sendAlertEmail(
                bill.getResidentProfile().getUser().getEmail(),
                alert.getTitle(),
                alert.getMessage()
        );
    }

    @Override
    @Transactional
    public void generatePaymentFailedAlert(Long billId, String reason) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new IllegalArgumentException("Bill not found with id: " + billId));

        boolean exists = alertRepository.existsByResidentIdAndBillingCycleIdAndAlertTypeAndStatus(
                bill.getResidentProfile().getId(), bill.getBillingCycle().getId(), AlertType.PAYMENT_FAILED, AlertStatus.ACTIVE
        );
        if (exists) {
            return;
        }

        String randomDigits = String.format("%06d", new Random().nextInt(1000000));
        Alert alert = Alert.builder()
                .alertNumber("ALT-PAY-ERR-" + randomDigits)
                .alertType(AlertType.PAYMENT_FAILED)
                .severity(AlertSeverity.HIGH)
                .title("Payment Failed")
                .message("Your payment attempt for your bill of Rs. " + bill.getTotalAmount() + " failed. Reason: " + reason)
                .resident(bill.getResidentProfile())
                .community(bill.getResidentProfile().getCommunity())
                .billingCycle(bill.getBillingCycle())
                .relatedBill(bill)
                .status(AlertStatus.ACTIVE)
                .createdDate(LocalDateTime.now())
                .build();

        alertRepository.save(alert);
        emailNotificationService.sendAlertEmail(
                bill.getResidentProfile().getUser().getEmail(),
                alert.getTitle(),
                alert.getMessage()
        );
    }

    @Override
    @Transactional
    public void markAllAsRead(String email) {
        User user = getUserOrThrow(email);
        List<Alert> alerts;
        if (user.getRole() == Role.MAIN_ADMIN) {
            alerts = alertRepository.findByRecipientIdOrderByCreatedDateDesc(user.getId());
        } else if (user.getRole() == Role.COMMUNITY_ADMIN) {
            CommunityAdminProfile adminProfile = communityAdminProfileRepository.findByUserId(user.getId()).orElse(null);
            if (adminProfile != null && adminProfile.getCommunity() != null) {
                alerts = alertRepository.findByRecipientIdOrCommunityIdOrderByCreatedDateDesc(user.getId(), adminProfile.getCommunity().getId());
            } else {
                alerts = alertRepository.findByRecipientIdOrderByCreatedDateDesc(user.getId());
            }
        } else {
            ResidentProfile resident = residentProfileRepository.findByUserId(user.getId()).orElse(null);
            if (resident != null) {
                alerts = alertRepository.findByRecipientIdOrResidentIdOrderByCreatedDateDesc(user.getId(), resident.getId());
            } else {
                alerts = alertRepository.findByRecipientIdOrderByCreatedDateDesc(user.getId());
            }
        }
        for (Alert alert : alerts) {
            if (alert.getStatus() == AlertStatus.ACTIVE) {
                alert.setStatus(AlertStatus.READ);
                alertRepository.save(alert);
            }
        }
    }

    @Override
    @Transactional
    public void createInAppNotification(
            User recipient,
            ResidentProfile resident,
            Community community,
            String title,
            String message,
            AlertType alertType,
            AlertSeverity severity,
            Long relatedBillId
    ) {
        if (recipient != null) {
            if (alertRepository.existsByRecipientIdAndAlertTypeAndMessageAndStatus(recipient.getId(), alertType, message, AlertStatus.ACTIVE)) {
                return;
            }
        } else if (community != null) {
            if (alertRepository.existsByRecipientIsNullAndCommunityIdAndAlertTypeAndMessageAndStatus(community.getId(), alertType, message, AlertStatus.ACTIVE)) {
                return;
            }
        }

        String randomDigits = String.format("%06d", new Random().nextInt(1000000));
        Bill bill = null;
        if (relatedBillId != null) {
            bill = billRepository.findById(relatedBillId).orElse(null);
        }
        Alert alert = Alert.builder()
                .alertNumber("ALT-INAPP-" + randomDigits)
                .alertType(alertType)
                .severity(severity)
                .title(title)
                .message(message)
                .recipient(recipient)
                .resident(resident)
                .community(community)
                .relatedBill(bill)
                .status(AlertStatus.ACTIVE)
                .createdDate(LocalDateTime.now())
                .build();
        alertRepository.save(alert);
    }

    private AlertResponse mapToResponse(Alert alert) {
        String targetRoute = "/";
        if (alert.getAlertType() != null) {
            switch (alert.getAlertType()) {
                case BILL_GENERATED:
                case BILL_OVERDUE:
                case PAYMENT_SUCCESS:
                case PAYMENT_FAILED:
                    targetRoute = "/user/bills";
                    break;
                case HIGH_WATER_USAGE:
                case SUSPECTED_LEAK:
                    targetRoute = "/user/usage";
                    break;
                case METER_OFFLINE:
                    targetRoute = "/user/meter";
                    break;
                case REGISTRATION_PENDING:
                    if (alert.getRecipient() != null && alert.getRecipient().getRole() == Role.MAIN_ADMIN) {
                        targetRoute = "/main-admin/approvals";
                    } else {
                        targetRoute = "/community-admin/approvals";
                    }
                    break;
                case REGISTRATION_APPROVED:
                case REGISTRATION_REJECTED:
                    targetRoute = "/user";
                    break;
                case COMPLAINT_CREATED:
                    targetRoute = "/community-admin/complaints";
                    break;
                case COMPLAINT_STATUS_UPDATED:
                    targetRoute = "/user/complaints";
                    break;
                default:
                    targetRoute = "/";
            }
        }

        return AlertResponse.builder()
                .id(alert.getId())
                .alertNumber(alert.getAlertNumber())
                .alertType(alert.getAlertType().name())
                .severity(alert.getSeverity().name())
                .title(alert.getTitle())
                .message(alert.getMessage())
                .residentId(alert.getResident() != null ? alert.getResident().getId() : null)
                .residentName(alert.getResident() != null ? alert.getResident().getUser().getFullName() : null)
                .communityId(alert.getCommunity() != null ? alert.getCommunity().getId() : null)
                .communityName(alert.getCommunity() != null ? alert.getCommunity().getCommunityName() : null)
                .waterMeterId(alert.getWaterMeter() != null ? alert.getWaterMeter().getId() : null)
                .billingCycleId(alert.getBillingCycle() != null ? alert.getBillingCycle().getId() : null)
                .relatedBillId(alert.getRelatedBill() != null ? alert.getRelatedBill().getId() : null)
                .status(alert.getStatus().name())
                .createdDate(alert.getCreatedDate())
                .resolvedDate(alert.getResolvedDate())
                .recipientId(alert.getRecipient() != null ? alert.getRecipient().getId() : null)
                .targetRoute(targetRoute)
                .build();
    }
}
