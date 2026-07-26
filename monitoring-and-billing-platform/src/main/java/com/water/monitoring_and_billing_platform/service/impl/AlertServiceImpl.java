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
                .highConsumptionThreshold(30.0)
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
        Long targetCommunityId = communityId;
        if (user.getRole() == Role.COMMUNITY_ADMIN) {
            CommunityAdminProfile adminProfile = communityAdminProfileRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Admin profile not found"));
            targetCommunityId = adminProfile.getCommunity().getId();
        } else if (targetCommunityId == null) {
            throw new IllegalArgumentException("Community ID must be provided for MAIN_ADMIN");
        }
        return alertRepository.findByCommunityId(targetCommunityId).stream()
                .sorted(Comparator.comparing(Alert::getCreatedDate).reversed())
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
            if (alert.getCommunity() != null && !Objects.equals(adminProfile.getCommunity().getId(), alert.getCommunity().getId())) {
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
    public AlertResponse acknowledgeAlert(String email, Long id) {
        User user = getUserOrThrow(email);
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Alert not found"));
        validateAccess(user, alert);
        if (alert.getStatus() == AlertStatus.ACTIVE || alert.getStatus() == AlertStatus.READ) {
            alert.setStatus(AlertStatus.ACKNOWLEDGED);
            alert.setAcknowledgedDate(LocalDateTime.now());
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
        long active = alerts.stream().filter(a -> a.getStatus() == AlertStatus.ACTIVE || a.getStatus() == AlertStatus.READ).count();
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

        Map<Community, List<ResidentProfile>> communityResidents = residents.stream()
                .filter(r -> r.getCommunity() != null)
                .collect(Collectors.groupingBy(ResidentProfile::getCommunity));

        for (Map.Entry<Community, List<ResidentProfile>> entry : communityResidents.entrySet()) {
            Community community = entry.getKey();
            List<ResidentProfile> communityResList = entry.getValue();
            AlertConfiguration config = getConfiguration(community.getId());

            resolveStaleAlerts(community, cycle, config);

            for (ResidentProfile resident : communityResList) {
                try {
                    detectHighAndAbnormalUsage(resident, cycle, config);
                } catch (Exception e) {
                    log.error("Error detecting consumption alerts for resident {}: {}", resident.getId(), e.getMessage());
                }

                try {
                    detectPossibleLeak(resident, cycle, config);
                } catch (Exception e) {
                    log.error("Error detecting leak for resident {}: {}", resident.getId(), e.getMessage());
                }

                try {
                    detectContinuousConsumption(resident, cycle, config);
                } catch (Exception e) {
                    log.error("Error detecting continuous consumption for resident {}: {}", resident.getId(), e.getMessage());
                }

                try {
                    detectMeterStuck(resident, cycle, config);
                } catch (Exception e) {
                    log.error("Error detecting stuck meter for resident {}: {}", resident.getId(), e.getMessage());
                }

                try {
                    detectAbnormalLowUsage(resident, cycle, config);
                } catch (Exception e) {
                    log.error("Error detecting low usage for resident {}: {}", resident.getId(), e.getMessage());
                }

                try {
                    detectMeterOffline(resident, config);
                } catch (Exception e) {
                    log.error("Error detecting offline meter for resident {}: {}", resident.getId(), e.getMessage());
                }

                try {
                    detectMissingMeterReading(resident, cycle, config);
                } catch (Exception e) {
                    log.error("Error detecting missing meter reading for resident {}: {}", resident.getId(), e.getMessage());
                }
            }

            try {
                detectBillingCycleClosingReminder(community, cycle, communityResList);
            } catch (Exception e) {
                log.error("Error detecting billing cycle closing reminder for community {}: {}", community.getId(), e.getMessage());
            }
        }

        try {
            detectOverdueBills();
        } catch (Exception e) {
            log.error("Error detecting overdue bills: {}", e.getMessage());
        }
    }

    private void resolveStaleAlerts(Community community, BillingCycle activeCycle, AlertConfiguration config) {
        List<Alert> unresolvedAlerts = new ArrayList<>();
        unresolvedAlerts.addAll(alertRepository.findByCommunityIdAndStatus(community.getId(), AlertStatus.ACTIVE));
        unresolvedAlerts.addAll(alertRepository.findByCommunityIdAndStatus(community.getId(), AlertStatus.READ));
        unresolvedAlerts.addAll(alertRepository.findByCommunityIdAndStatus(community.getId(), AlertStatus.ACKNOWLEDGED));

        for (Alert alert : unresolvedAlerts) {
            if (alert.getResident() == null) continue;
            ResidentProfile resident = alert.getResident();
            Optional<WaterMeter> meterOpt = waterMeterRepository.findByResidentProfileId(resident.getId());

            if (alert.getAlertType() == AlertType.MISSING_METER_READING) {
                if (meterOpt.isPresent() && alert.getBillingCycle() != null) {
                    List<WaterUsage> usages = waterUsageRepository.findByWaterMeterIdAndReadingDateBetween(
                            meterOpt.get().getId(), alert.getBillingCycle().getPeriodStart(), alert.getBillingCycle().getPeriodEnd()
                    );
                    if (!usages.isEmpty()) {
                        alert.setStatus(AlertStatus.RESOLVED);
                        alert.setResolvedDate(LocalDateTime.now());
                        alertRepository.save(alert);
                    }
                }
            }
        }
    }

    // 1. Alert Type: ABNORMAL_HIGH_USAGE & HIGH_WATER_USAGE
    private void detectHighAndAbnormalUsage(ResidentProfile resident, BillingCycle cycle, AlertConfiguration config) {
        Optional<WaterMeter> meterOpt = waterMeterRepository.findByResidentProfileId(resident.getId());
        if (meterOpt.isEmpty()) return;
        WaterMeter meter = meterOpt.get();

        List<WaterUsage> usages = waterUsageRepository.findByWaterMeterIdAndReadingDateBetween(
                meter.getId(), cycle.getPeriodStart(), cycle.getPeriodEnd()
        );
        double currentUsage = usages.stream().mapToDouble(WaterUsage::getUnitsConsumed).sum();

        // Historical baseline
        List<Bill> pastBills = billRepository.findByResidentProfileId(resident.getId());
        double avgPastUsage = pastBills.stream().mapToDouble(Bill::getUnitsConsumed).average().orElse(0.0);

        // ABNORMAL_HIGH_USAGE Trigger: > 150% of historical average
        if (avgPastUsage > 0 && currentUsage > avgPastUsage * (config.getHighUsagePercentage() / 100.0)) {
            boolean duplicate = alertRepository.existsByResidentIdAndBillingCycleIdAndAlertTypeAndStatus(
                    resident.getId(), cycle.getId(), AlertType.ABNORMAL_HIGH_USAGE, AlertStatus.ACTIVE
            );
            if (!duplicate) {
                String randomDigits = String.format("%06d", new Random().nextInt(1000000));
                Alert alert = Alert.builder()
                        .alertNumber("ALT-HIGH-" + randomDigits)
                        .alertType(AlertType.ABNORMAL_HIGH_USAGE)
                        .severity(AlertSeverity.HIGH)
                        .title("Abnormal High Water Usage")
                        .message("Current cycle water usage of " + String.format("%.2f", currentUsage) + " kL significantly exceeds your historical average of " + String.format("%.2f", avgPastUsage) + " kL (" + String.format("%.0f", (currentUsage / avgPastUsage) * 100) + "% of normal baseline).")
                        .resident(resident)
                        .community(resident.getCommunity())
                        .waterMeter(meter)
                        .billingCycle(cycle)
                        .status(AlertStatus.ACTIVE)
                        .createdDate(LocalDateTime.now())
                        .build();

                alertRepository.save(alert);
                emailNotificationService.sendAlertEmail(resident.getUser().getEmail(), alert.getTitle(), alert.getMessage());
            }
        }
    }

    // 2. Alert Type: POSSIBLE_LEAK / SUSPECTED_LEAK
    private void detectPossibleLeak(ResidentProfile resident, BillingCycle cycle, AlertConfiguration config) {
        Optional<WaterMeter> meterOpt = waterMeterRepository.findByResidentProfileId(resident.getId());
        if (meterOpt.isEmpty()) return;
        WaterMeter meter = meterOpt.get();

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
                boolean duplicate = alertRepository.existsByResidentIdAndBillingCycleIdAndAlertTypeAndStatus(
                        resident.getId(), cycle.getId(), AlertType.POSSIBLE_LEAK, AlertStatus.ACTIVE
                );
                if (!duplicate) {
                    String randomDigits = String.format("%06d", new Random().nextInt(1000000));
                    Alert alert = Alert.builder()
                            .alertNumber("ALT-LEAK-" + randomDigits)
                            .alertType(AlertType.POSSIBLE_LEAK)
                            .severity(AlertSeverity.HIGH)
                            .title("Possible Water Leak")
                            .message("Continuous consumption above leak threshold (" + config.getLeakDetectionThreshold() + " kL) detected over 3 consecutive reading intervals. Please inspect pipeline integrity.")
                            .resident(resident)
                            .community(resident.getCommunity())
                            .waterMeter(meter)
                            .billingCycle(cycle)
                            .status(AlertStatus.ACTIVE)
                            .createdDate(LocalDateTime.now())
                            .build();

                    alertRepository.save(alert);
                    emailNotificationService.sendLeakAlertEmail(
                            resident.getUser().getEmail(),
                            resident.getUser().getFullName(),
                            meter.getMeterNumber(),
                            resident.getUnit() != null ? resident.getUnit().getUnitNumber() : "N/A",
                            recentUsages.stream().mapToDouble(WaterUsage::getUnitsConsumed).sum(),
                            config.getLeakDetectionThreshold()
                    );
                }
            }
        }
    }

    // 3. Alert Type: CONTINUOUS_CONSUMPTION
    private void detectContinuousConsumption(ResidentProfile resident, BillingCycle cycle, AlertConfiguration config) {
        Optional<WaterMeter> meterOpt = waterMeterRepository.findByResidentProfileId(resident.getId());
        if (meterOpt.isEmpty()) return;
        WaterMeter meter = meterOpt.get();

        List<WaterUsage> recentUsages = waterUsageRepository.findByWaterMeterIdAndReadingDateBetween(
                meter.getId(), cycle.getPeriodStart(), cycle.getPeriodEnd()
        ).stream()
                .sorted(Comparator.comparing(WaterUsage::getReadingDate).reversed())
                .limit(3)
                .toList();

        if (recentUsages.size() >= 3) {
            boolean continuous = recentUsages.stream().allMatch(u -> u.getUnitsConsumed() > 0.0);
            if (continuous) {
                boolean duplicate = alertRepository.existsByResidentIdAndBillingCycleIdAndAlertTypeAndStatus(
                        resident.getId(), cycle.getId(), AlertType.CONTINUOUS_CONSUMPTION, AlertStatus.ACTIVE
                );
                if (!duplicate) {
                    String randomDigits = String.format("%06d", new Random().nextInt(1000000));
                    Alert alert = Alert.builder()
                            .alertNumber("ALT-CONT-" + randomDigits)
                            .alertType(AlertType.CONTINUOUS_CONSUMPTION)
                            .severity(AlertSeverity.HIGH)
                            .title("Continuous Water Consumption")
                            .message("Continuous water flow detected across 3 consecutive reading intervals without an expected idle period. Check for running taps or valves.")
                            .resident(resident)
                            .community(resident.getCommunity())
                            .waterMeter(meter)
                            .billingCycle(cycle)
                            .status(AlertStatus.ACTIVE)
                            .createdDate(LocalDateTime.now())
                            .build();

                    alertRepository.save(alert);
                    emailNotificationService.sendMeterAlertEmail(
                            resident.getUser().getEmail(),
                            resident.getUser().getFullName(),
                            meter.getMeterNumber(),
                            "CONTINUOUS_CONSUMPTION",
                            "HIGH",
                            alert.getMessage()
                    );
                }
            }
        }
    }

    // 4. Alert Type: METER_STUCK / METER_DAMAGE
    private void detectMeterStuck(ResidentProfile resident, BillingCycle cycle, AlertConfiguration config) {
        Optional<WaterMeter> meterOpt = waterMeterRepository.findByResidentProfileId(resident.getId());
        if (meterOpt.isEmpty()) return;
        WaterMeter meter = meterOpt.get();

        List<WaterUsage> recentUsages = waterUsageRepository.findByWaterMeterIdAndReadingDateBetween(
                meter.getId(), cycle.getPeriodStart(), cycle.getPeriodEnd()
        ).stream()
                .sorted(Comparator.comparing(WaterUsage::getReadingDate).reversed())
                .limit(3)
                .toList();

        if (recentUsages.size() >= 3) {
            boolean stuck = recentUsages.stream().allMatch(u -> u.getUnitsConsumed() == 0.0);
            List<Bill> pastBills = billRepository.findByResidentProfileId(resident.getId());
            double avgPastUsage = pastBills.stream().mapToDouble(Bill::getUnitsConsumed).average().orElse(0.0);

            // Trigger METER_STUCK if usage is 0 across 3 consecutive active reading intervals when baseline > 0
            if (stuck && avgPastUsage > 0.0) {
                boolean duplicate = alertRepository.existsByResidentIdAndBillingCycleIdAndAlertTypeAndStatus(
                        resident.getId(), cycle.getId(), AlertType.METER_STUCK, AlertStatus.ACTIVE
                );
                if (!duplicate) {
                    String randomDigits = String.format("%06d", new Random().nextInt(1000000));
                    Alert alert = Alert.builder()
                            .alertNumber("ALT-STK-" + randomDigits)
                            .alertType(AlertType.METER_STUCK)
                            .severity(AlertSeverity.HIGH)
                            .title("Meter Stuck / Damage Alert")
                            .message("Meter reading has remained static (0.0 kL consumed) across 3 consecutive reading intervals despite historical usage baseline of " + String.format("%.2f", avgPastUsage) + " kL. Your water meter may not be functioning correctly.")
                            .resident(resident)
                            .community(resident.getCommunity())
                            .waterMeter(meter)
                            .billingCycle(cycle)
                            .status(AlertStatus.ACTIVE)
                            .createdDate(LocalDateTime.now())
                            .build();

                    alertRepository.save(alert);
                    if (resident.getUser() != null && resident.getUser().getEmail() != null) {
                        emailNotificationService.sendAlertEmail(
                                resident.getUser().getEmail(),
                                alert.getTitle(),
                                alert.getMessage()
                        );
                    }
                }
            }
        }
    }

    // 5. Alert Type: ABNORMAL_LOW_USAGE
    private void detectAbnormalLowUsage(ResidentProfile resident, BillingCycle cycle, AlertConfiguration config) {
        Optional<WaterMeter> meterOpt = waterMeterRepository.findByResidentProfileId(resident.getId());
        if (meterOpt.isEmpty()) return;
        WaterMeter meter = meterOpt.get();

        List<WaterUsage> usages = waterUsageRepository.findByWaterMeterIdAndReadingDateBetween(
                meter.getId(), cycle.getPeriodStart(), cycle.getPeriodEnd()
        );
        double currentUsage = usages.stream().mapToDouble(WaterUsage::getUnitsConsumed).sum();

        List<Bill> pastBills = billRepository.findByResidentProfileId(resident.getId());
        double avgPastUsage = pastBills.stream().mapToDouble(Bill::getUnitsConsumed).average().orElse(0.0);

        if (avgPastUsage >= 5.0 && currentUsage < avgPastUsage * 0.20) {
            boolean duplicate = alertRepository.existsByResidentIdAndBillingCycleIdAndAlertTypeAndStatus(
                    resident.getId(), cycle.getId(), AlertType.ABNORMAL_LOW_USAGE, AlertStatus.ACTIVE
            );
            if (!duplicate) {
                String randomDigits = String.format("%06d", new Random().nextInt(1000000));
                Alert alert = Alert.builder()
                        .alertNumber("ALT-LOW-" + randomDigits)
                        .alertType(AlertType.ABNORMAL_LOW_USAGE)
                        .severity(AlertSeverity.LOW)
                        .title("Abnormal Low Water Usage")
                        .message("Current water consumption of " + String.format("%.2f", currentUsage) + " kL is significantly lower than normal historical baseline of " + String.format("%.2f", avgPastUsage) + " kL.")
                        .resident(resident)
                        .community(resident.getCommunity())
                        .waterMeter(meter)
                        .billingCycle(cycle)
                        .status(AlertStatus.ACTIVE)
                        .createdDate(LocalDateTime.now())
                        .build();

                alertRepository.save(alert);
            }
        }
    }

    private void detectMeterOffline(ResidentProfile resident, AlertConfiguration config) {
        boolean exists = alertRepository.existsByResidentIdAndAlertTypeAndStatus(
                resident.getId(), AlertType.METER_OFFLINE, AlertStatus.ACTIVE
        );
        if (exists) return;

        Optional<WaterMeter> meterOpt = waterMeterRepository.findByResidentProfileId(resident.getId());
        if (meterOpt.isEmpty()) return;
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
            emailNotificationService.sendAlertEmail(resident.getUser().getEmail(), alert.getTitle(), alert.getMessage());
        }
    }

    private void detectMissingMeterReading(ResidentProfile resident, BillingCycle cycle, AlertConfiguration config) {
        Optional<WaterMeter> meterOpt = waterMeterRepository.findByResidentProfileId(resident.getId());
        if (meterOpt.isEmpty()) return;
        WaterMeter meter = meterOpt.get();

        List<WaterUsage> usages = waterUsageRepository.findByWaterMeterIdAndReadingDateBetween(
                meter.getId(), cycle.getPeriodStart(), cycle.getPeriodEnd()
        );

        if (usages.isEmpty()) {
            boolean duplicate = alertRepository.existsByResidentIdAndBillingCycleIdAndAlertTypeAndStatus(
                    resident.getId(), cycle.getId(), AlertType.MISSING_METER_READING, AlertStatus.ACTIVE
            );
            if (!duplicate) {
                String randomDigits = String.format("%06d", new Random().nextInt(1000000));
                Alert alert = Alert.builder()
                        .alertNumber("ALT-MSG-" + randomDigits)
                        .alertType(AlertType.MISSING_METER_READING)
                        .severity(AlertSeverity.LOW)
                        .title("Missing Meter Reading")
                        .message("No water usage readings have been recorded for your unit " + (resident.getUnit() != null ? resident.getUnit().getUnitNumber() : "") + " during cycle: " + cycle.getName())
                        .resident(resident)
                        .community(resident.getCommunity())
                        .waterMeter(meter)
                        .billingCycle(cycle)
                        .status(AlertStatus.ACTIVE)
                        .createdDate(LocalDateTime.now())
                        .build();

                alertRepository.save(alert);
            }
        }
    }

    private void detectBillingCycleClosingReminder(Community community, BillingCycle cycle, List<ResidentProfile> residents) {
        if (cycle.getPeriodEnd() != null && LocalDate.now().plusDays(2).isAfter(cycle.getPeriodEnd())) {
            long missingCount = 0;
            for (ResidentProfile res : residents) {
                Optional<WaterMeter> meterOpt = waterMeterRepository.findByResidentProfileId(res.getId());
                if (meterOpt.isPresent()) {
                    List<WaterUsage> usages = waterUsageRepository.findByWaterMeterIdAndReadingDateBetween(
                            meterOpt.get().getId(), cycle.getPeriodStart(), cycle.getPeriodEnd()
                    );
                    if (usages.isEmpty()) missingCount++;
                }
            }

            if (missingCount > 0) {
                boolean duplicate = alertRepository.existsByCommunityIdAndBillingCycleIdAndAlertTypeAndStatus(
                        community.getId(), cycle.getId(), AlertType.BILLING_CYCLE_CLOSING_REMINDER, AlertStatus.ACTIVE
                );
                if (!duplicate) {
                    String randomDigits = String.format("%06d", new Random().nextInt(1000000));
                    List<CommunityAdminProfile> admins = communityAdminProfileRepository.findByCommunityIdAndActiveTrue(community.getId());
                    for (CommunityAdminProfile admin : admins) {
                        Alert alert = Alert.builder()
                                .alertNumber("ALT-REM-" + randomDigits)
                                .alertType(AlertType.BILLING_CYCLE_CLOSING_REMINDER)
                                .severity(AlertSeverity.LOW)
                                .title("Billing Cycle Closing Reminder")
                                .message("Billing cycle " + cycle.getName() + " is closing on " + cycle.getPeriodEnd() + ". There are " + missingCount + " households with missing meter readings.")
                                .recipient(admin.getUser())
                                .community(community)
                                .billingCycle(cycle)
                                .status(AlertStatus.ACTIVE)
                                .createdDate(LocalDateTime.now())
                                .build();
                        alertRepository.save(alert);
                    }
                }
            }
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
                if (exists) continue;

                String randomDigits = String.format("%06d", new Random().nextInt(1000000));
                Alert alert = Alert.builder()
                        .alertNumber("ALT-OVD-" + randomDigits)
                        .alertType(AlertType.BILL_OVERDUE)
                        .severity(AlertSeverity.LOW)
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
                long daysOverdue = java.time.temporal.ChronoUnit.DAYS.between(bill.getDueDate(), LocalDate.now());
                emailNotificationService.sendBillDueReminderEmail(
                        bill.getResidentProfile().getUser().getEmail(),
                        bill.getResidentProfile().getUser().getFullName(),
                        bill.getBillNumber(),
                        bill.getTotalAmount(),
                        bill.getDueDate(),
                        daysOverdue
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
        if (exists) return;

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
        emailNotificationService.sendPaymentSuccessEmail(
                bill.getResidentProfile().getUser().getEmail(),
                bill.getResidentProfile().getUser().getFullName(),
                bill.getBillNumber(),
                "TXN-" + System.currentTimeMillis(),
                bill.getTotalAmount(),
                LocalDate.now().toString()
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
        if (exists) return;

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
        emailNotificationService.sendPaymentFailedEmail(
                bill.getResidentProfile().getUser().getEmail(),
                bill.getResidentProfile().getUser().getFullName(),
                bill.getBillNumber(),
                bill.getTotalAmount(),
                reason
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
        String uniqueSuffix = "-unique-" + System.nanoTime();
        Bill bill = null;
        if (relatedBillId != null) {
            bill = billRepository.findById(relatedBillId).orElse(null);
        }
        Alert alert = Alert.builder()
                .alertNumber("ALT-INAPP-" + randomDigits + uniqueSuffix)
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
                case ABNORMAL_HIGH_USAGE:
                case ABNORMAL_LOW_USAGE:
                case SUSPECTED_LEAK:
                case POSSIBLE_LEAK:
                case CONTINUOUS_CONSUMPTION:
                case METER_STUCK:
                case METER_DAMAGE:
                case INVALID_READING:
                case MANUAL_TAMPERING:
                    targetRoute = "/community-admin/usage";
                    break;
                case METER_OFFLINE:
                    targetRoute = "/community-admin/meters";
                    break;
                default:
                    targetRoute = "/community-admin/alerts";
            }
        }

        String residentName = alert.getResident() != null && alert.getResident().getUser() != null ? alert.getResident().getUser().getFullName() : null;
        String unitNumber = alert.getResident() != null && alert.getResident().getUnit() != null ? alert.getResident().getUnit().getUnitNumber() : null;
        String meterNumber = alert.getWaterMeter() != null ? alert.getWaterMeter().getMeterNumber() : null;

        return AlertResponse.builder()
                .id(alert.getId())
                .alertNumber(alert.getAlertNumber())
                .alertType(alert.getAlertType().name())
                .severity(alert.getSeverity().name())
                .title(alert.getTitle())
                .message(alert.getMessage())
                .reason(alert.getMessage())
                .residentId(alert.getResident() != null ? alert.getResident().getId() : null)
                .residentName(residentName)
                .unitNumber(unitNumber)
                .communityId(alert.getCommunity() != null ? alert.getCommunity().getId() : null)
                .communityName(alert.getCommunity() != null ? alert.getCommunity().getCommunityName() : null)
                .waterMeterId(alert.getWaterMeter() != null ? alert.getWaterMeter().getId() : null)
                .meterNumber(meterNumber)
                .billingCycleId(alert.getBillingCycle() != null ? alert.getBillingCycle().getId() : null)
                .relatedBillId(alert.getRelatedBill() != null ? alert.getRelatedBill().getId() : null)
                .status(alert.getStatus().name())
                .createdDate(alert.getCreatedDate())
                .acknowledgedDate(alert.getAcknowledgedDate())
                .resolvedDate(alert.getResolvedDate())
                .recipientId(alert.getRecipient() != null ? alert.getRecipient().getId() : null)
                .targetRoute(targetRoute)
                .build();
    }

    @Override
    @Transactional
    public void deleteAlert(String email, Long id) {
        User user = getUserOrThrow(email);
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Alert not found"));
        validateAccess(user, alert);
        alertRepository.delete(alert);
    }

    @Override
    @Transactional
    public void bulkMarkAsRead(String email, List<Long> ids) {
        if (ids == null || ids.isEmpty()) return;
        User user = getUserOrThrow(email);
        for (Long id : ids) {
            try {
                Alert alert = alertRepository.findById(id).orElse(null);
                if (alert != null) {
                    validateAccess(user, alert);
                    if (alert.getStatus() == AlertStatus.ACTIVE) {
                        alert.setStatus(AlertStatus.READ);
                        alertRepository.save(alert);
                    }
                }
            } catch (Exception e) {
                // Ignore
            }
        }
    }

    @Override
    @Transactional
    public void bulkDelete(String email, List<Long> ids) {
        if (ids == null || ids.isEmpty()) return;
        User user = getUserOrThrow(email);
        for (Long id : ids) {
            try {
                Alert alert = alertRepository.findById(id).orElse(null);
                if (alert != null) {
                    validateAccess(user, alert);
                    alertRepository.delete(alert);
                }
            } catch (Exception e) {
                // Ignore
            }
        }
    }
}
