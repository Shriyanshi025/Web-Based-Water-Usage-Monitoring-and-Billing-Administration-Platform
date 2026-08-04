package com.water.monitoring_and_billing_platform.service.impl;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.water.monitoring_and_billing_platform.dto.WaterUsageRequest;
import com.water.monitoring_and_billing_platform.dto.WaterUsageResponse;
import com.water.monitoring_and_billing_platform.entity.CommunityAdminProfile;
import com.water.monitoring_and_billing_platform.entity.User;
import com.water.monitoring_and_billing_platform.entity.WaterMeter;
import com.water.monitoring_and_billing_platform.entity.WaterUsage;
import com.water.monitoring_and_billing_platform.exception.DuplicateWaterUsageException;
import com.water.monitoring_and_billing_platform.exception.InvalidMeterReadingException;
import com.water.monitoring_and_billing_platform.exception.UserNotFoundException;
import com.water.monitoring_and_billing_platform.exception.WaterMeterNotFoundException;
import com.water.monitoring_and_billing_platform.repository.CommunityAdminProfileRepository;
import com.water.monitoring_and_billing_platform.repository.UserRepository;
import com.water.monitoring_and_billing_platform.repository.WaterMeterRepository;
import com.water.monitoring_and_billing_platform.repository.WaterUsageRepository;
import com.water.monitoring_and_billing_platform.service.WaterUsageService;
import com.water.monitoring_and_billing_platform.service.BillingService;
import com.water.monitoring_and_billing_platform.entity.ResidentProfile;
import com.water.monitoring_and_billing_platform.repository.ResidentProfileRepository;
import com.water.monitoring_and_billing_platform.repository.BillingCycleRepository;
import com.water.monitoring_and_billing_platform.entity.BillingCycle;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WaterUsageServiceImpl implements WaterUsageService {

    private final WaterUsageRepository waterUsageRepository;
    private final WaterMeterRepository waterMeterRepository;
    private final UserRepository userRepository;
    private final CommunityAdminProfileRepository communityAdminProfileRepository;
    private final ResidentProfileRepository residentProfileRepository;
    private final BillingService billingService;
    private final com.water.monitoring_and_billing_platform.repository.ActivityLogRepository activityLogRepository;
    private final BillingCycleRepository billingCycleRepository;

    private final com.water.monitoring_and_billing_platform.repository.AlertRepository alertRepository;
    private final com.water.monitoring_and_billing_platform.repository.MeterResetLogRepository meterResetLogRepository;
    private final com.water.monitoring_and_billing_platform.service.EmailNotificationService emailNotificationService;
    private final com.water.monitoring_and_billing_platform.repository.BillRepository billRepository;

    private CommunityAdminProfile getAdminProfile(String adminEmail) {
        User user = userRepository.findByEmail(adminEmail)
                .orElseThrow(UserNotFoundException::new);
        return communityAdminProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Community Admin profile not found."));
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public WaterUsageResponse addReading(String adminEmail, WaterUsageRequest request) {
        validateReadingRequest(adminEmail, request.getWaterMeterId(), request.getCurrentReading(), request.getReadingDate());
        if (waterUsageRepository.existsByWaterMeterIdAndReadingDate(request.getWaterMeterId(), request.getReadingDate())) {
            throw new DuplicateWaterUsageException();
        }

        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);

        WaterMeter meter = waterMeterRepository.findById(request.getWaterMeterId())
                .orElseThrow(WaterMeterNotFoundException::new);

        if (!meter.getResidentProfile().getCommunity().getId().equals(adminProfile.getCommunity().getId())) {
            throw new WaterMeterNotFoundException();
        }

        java.util.Optional<WaterUsage> prevOpt = waterUsageRepository.findFirstByWaterMeterIdAndReadingDateLessThanOrderByReadingDateDescIdDesc(meter.getId(), request.getReadingDate());
        double previousReading = prevOpt.isPresent() ? prevOpt.get().getCurrentReading() : meter.getInitialReading();

        if (request.getCurrentReading() < previousReading) {
            triggerInvalidReadingAlert(meter, previousReading, request.getCurrentReading(), request.getReadingDate());
            throw new InvalidMeterReadingException();
        }

        java.util.Optional<WaterUsage> nextOpt = waterUsageRepository.findFirstByWaterMeterIdAndReadingDateGreaterThanOrderByReadingDateAscIdAsc(meter.getId(), request.getReadingDate());
        if (nextOpt.isPresent() && nextOpt.get().getCurrentReading() < request.getCurrentReading()) {
            throw new InvalidMeterReadingException();
        }

        double unitsConsumed = request.getCurrentReading() - previousReading;

        WaterUsage usage = WaterUsage.builder()
                .waterMeter(meter)
                .previousReading(previousReading)
                .currentReading(request.getCurrentReading())
                .unitsConsumed(unitsConsumed)
                .readingDate(request.getReadingDate())
                .billed(false)
                .build();

        usage = waterUsageRepository.save(usage);

        recalculateMeterReadings(meter);

        try {
            billingService.generateBillForReading(usage);
        } catch (Exception e) {
            System.err.println("Bill auto-generation skipped for reading ID " + usage.getId() + ": " + e.getMessage());
        }

        activityLogRepository.save(com.water.monitoring_and_billing_platform.entity.ActivityLog.builder()
                .title("Water Usage Recorded")
                .description("Recorded " + unitsConsumed + " units for meter " + meter.getMeterNumber())
                .timestamp(java.time.LocalDateTime.now())
                .icon("Speed")
                .color("primary.main")
                .community(adminProfile.getCommunity())
                .user(adminProfile.getUser())
                .build());

        return mapToResponse(usage);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public List<WaterUsageResponse> uploadCsv(String adminEmail, InputStream inputStream) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);
        List<WaterUsageResponse> saved = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            String line;
            int lineNumber = 0;
            while ((line = reader.readLine()) != null) {
                lineNumber++;
                if (lineNumber == 1 || line.trim().isEmpty()) {
                    continue;
                }

                String[] columns = line.split(",");
                if (columns.length < 3) {
                    throw new IllegalArgumentException("Invalid CSV row at line " + lineNumber + ": expected meter id, date, and reading");
                }

                Long meterId = Long.valueOf(columns[0].trim());
                LocalDate readingDate = LocalDate.parse(columns[1].trim());
                Double currentReading = Double.valueOf(columns[2].trim());

                WaterUsageRequest request = new WaterUsageRequest();
                request.setWaterMeterId(meterId);
                request.setReadingDate(readingDate);
                request.setCurrentReading(currentReading);

                validateReadingRequest(adminEmail, meterId, currentReading, readingDate);

                WaterMeter meter = waterMeterRepository.findById(meterId)
                        .orElseThrow(WaterMeterNotFoundException::new);
                if (!meter.getResidentProfile().getCommunity().getId().equals(adminProfile.getCommunity().getId())) {
                    throw new WaterMeterNotFoundException();
                }
                if (waterUsageRepository.existsByWaterMeterIdAndReadingDate(meterId, readingDate)) {
                    continue;
                }

                java.util.Optional<WaterUsage> prevOpt = waterUsageRepository.findFirstByWaterMeterIdAndReadingDateLessThanOrderByReadingDateDescIdDesc(meter.getId(), readingDate);
                double previousReading = prevOpt.isPresent() ? prevOpt.get().getCurrentReading() : meter.getInitialReading();

                if (currentReading < previousReading) {
                    throw new InvalidMeterReadingException();
                }

                java.util.Optional<WaterUsage> nextOpt = waterUsageRepository.findFirstByWaterMeterIdAndReadingDateGreaterThanOrderByReadingDateAscIdAsc(meter.getId(), readingDate);
                if (nextOpt.isPresent() && nextOpt.get().getCurrentReading() < currentReading) {
                    throw new InvalidMeterReadingException();
                }

                double unitsConsumed = currentReading - previousReading;

                WaterUsage usage = WaterUsage.builder()
                        .waterMeter(meter)
                        .previousReading(previousReading)
                        .currentReading(currentReading)
                        .unitsConsumed(unitsConsumed)
                        .readingDate(readingDate)
                        .billed(false)
                        .build();

                usage = waterUsageRepository.save(usage);

                recalculateMeterReadings(meter);
                
                billingService.generateBillForReading(usage);
                
                saved.add(mapToResponse(usage));
            }
        } catch (Exception ex) {
            if (ex instanceof IllegalArgumentException) {
                throw (IllegalArgumentException) ex;
            }
            throw new RuntimeException("Failed to process CSV upload: " + ex.getMessage(), ex);
        }

        if (!saved.isEmpty()) {
            activityLogRepository.save(com.water.monitoring_and_billing_platform.entity.ActivityLog.builder()
                    .title("Water Usage Recorded (Bulk Upload)")
                    .description("Bulk uploaded " + saved.size() + " water usage readings.")
                    .timestamp(java.time.LocalDateTime.now())
                    .icon("CloudUpload")
                    .color("info.main")
                    .community(adminProfile.getCommunity())
                    .user(adminProfile.getUser())
                    .build());
        }

        return saved;
    }

    @Override
    public List<WaterUsageResponse> getAllReadings(String adminEmail) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);

        return waterUsageRepository.findByWaterMeterResidentProfileCommunityId(adminProfile.getCommunity().getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<WaterUsageResponse> getReadingsByMeter(String adminEmail, Long meterId) {
        if (meterId == null) {
            throw new WaterMeterNotFoundException();
        }

        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);

        WaterMeter meter = waterMeterRepository.findById(meterId)
                .orElseThrow(WaterMeterNotFoundException::new);
        
        if (!meter.getResidentProfile().getCommunity().getId().equals(adminProfile.getCommunity().getId())) {
            throw new WaterMeterNotFoundException(); // 404
        }

        return waterUsageRepository.findByWaterMeterId(meterId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<WaterUsageResponse> getMyReadings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        ResidentProfile profile = residentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Resident profile not found"));

        var meterOpt = waterMeterRepository.findByResidentProfileId(profile.getId());
        if (meterOpt.isEmpty()) {
            return List.of();
        }

        return waterUsageRepository.findByWaterMeterId(meterOpt.get().getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private void validateReadingRequest(String adminEmail, Long meterId, Double currentReading, LocalDate readingDate) {
        if (meterId == null) {
            throw new WaterMeterNotFoundException();
        }
        if (currentReading == null || currentReading < 0) {
            throw new IllegalArgumentException("Current reading must be a non-negative number.");
        }
        if (readingDate == null) {
            throw new IllegalArgumentException("Reading date is required.");
        }
        getAdminProfile(adminEmail);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public WaterUsageResponse updateReading(String adminEmail, Long readingId, WaterUsageRequest request) {
        validateReadingRequest(adminEmail, request.getWaterMeterId(), request.getCurrentReading(), request.getReadingDate());
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);

        WaterUsage usage = waterUsageRepository.findById(readingId)
                .orElseThrow(com.water.monitoring_and_billing_platform.exception.WaterUsageNotFoundException::new);

        WaterMeter meter = usage.getWaterMeter();
        if (!meter.getResidentProfile().getCommunity().getId().equals(adminProfile.getCommunity().getId())) {
            throw new WaterMeterNotFoundException();
        }

        // Prevent duplicate readings for the same meter and date (except if it is the current record we are updating)
        java.util.Optional<WaterUsage> duplicateOpt = waterUsageRepository.findByWaterMeterIdAndReadingDate(request.getWaterMeterId(), request.getReadingDate());
        if (duplicateOpt.isPresent() && !duplicateOpt.get().getId().equals(readingId)) {
            throw new DuplicateWaterUsageException();
        }

        // Find previous reading before the new reading date (excluding this reading itself)
        java.util.Optional<WaterUsage> prevOpt = waterUsageRepository.findFirstByWaterMeterIdAndReadingDateLessThanOrderByReadingDateDescIdDesc(meter.getId(), request.getReadingDate());
        double previousReading = prevOpt.isPresent() && !prevOpt.get().getId().equals(readingId) ? prevOpt.get().getCurrentReading() : meter.getInitialReading();

        if (request.getCurrentReading() < previousReading) {
            triggerInvalidReadingAlert(meter, previousReading, request.getCurrentReading(), request.getReadingDate());
            throw new InvalidMeterReadingException();
        }

        // Find next reading after the new reading date (excluding this reading itself)
        java.util.Optional<WaterUsage> nextOpt = waterUsageRepository.findFirstByWaterMeterIdAndReadingDateGreaterThanOrderByReadingDateAscIdAsc(meter.getId(), request.getReadingDate());
        if (nextOpt.isPresent() && !nextOpt.get().getId().equals(readingId)) {
            if (nextOpt.get().getCurrentReading() < request.getCurrentReading()) {
                triggerInvalidReadingAlert(meter, request.getCurrentReading(), nextOpt.get().getCurrentReading(), request.getReadingDate());
                throw new InvalidMeterReadingException();
            }
        }

        usage.setCurrentReading(request.getCurrentReading());
        usage.setReadingDate(request.getReadingDate());
        waterUsageRepository.save(usage);

        recalculateMeterReadings(meter);
        triggerManualTamperingCheck(meter);

        return mapToResponse(usage);
    }

    private void triggerInvalidReadingAlert(WaterMeter meter, double previousReading, double currentReading, LocalDate readingDate) {
        try {
            ResidentProfile resident = meter.getResidentProfile();
            String randomDigits = String.format("%06d", new java.util.Random().nextInt(1000000));
            com.water.monitoring_and_billing_platform.entity.Alert alert = com.water.monitoring_and_billing_platform.entity.Alert.builder()
                    .alertNumber("ALT-INV-" + randomDigits)
                    .alertType(com.water.monitoring_and_billing_platform.enums.AlertType.INVALID_READING)
                    .severity(com.water.monitoring_and_billing_platform.enums.AlertSeverity.CRITICAL)
                    .title("Invalid Meter Reading Attempted")
                    .message("Current reading (" + currentReading + " L) is less than previous meter reading (" + previousReading + " L) on date " + readingDate + ".")
                    .resident(resident)
                    .community(resident != null ? resident.getCommunity() : null)
                    .waterMeter(meter)
                    .status(com.water.monitoring_and_billing_platform.enums.AlertStatus.ACTIVE)
                    .createdDate(java.time.LocalDateTime.now())
                    .build();
            alertRepository.save(alert);

            if (resident != null && resident.getUser() != null && resident.getUser().getEmail() != null) {
                emailNotificationService.sendAlertEmail(resident.getUser().getEmail(), alert.getTitle(), alert.getMessage());
            }
        } catch (Exception e) {
            // Ignore failure saving alert
        }
    }

    private void triggerManualTamperingCheck(WaterMeter meter) {
        try {
            ResidentProfile resident = meter.getResidentProfile();
            String randomDigits = String.format("%06d", new java.util.Random().nextInt(1000000));
            com.water.monitoring_and_billing_platform.entity.Alert alert = com.water.monitoring_and_billing_platform.entity.Alert.builder()
                    .alertNumber("ALT-TMP-" + randomDigits)
                    .alertType(com.water.monitoring_and_billing_platform.enums.AlertType.MANUAL_TAMPERING)
                    .severity(com.water.monitoring_and_billing_platform.enums.AlertSeverity.CRITICAL)
                    .title("Potential Manual Tampering Detected")
                    .message("Manual reading correction/override submitted for meter " + meter.getMeterNumber() + ".")
                    .resident(resident)
                    .community(resident != null ? resident.getCommunity() : null)
                    .waterMeter(meter)
                    .status(com.water.monitoring_and_billing_platform.enums.AlertStatus.ACTIVE)
                    .createdDate(java.time.LocalDateTime.now())
                    .build();
            alertRepository.save(alert);

            if (resident != null && resident.getUser() != null && resident.getUser().getEmail() != null) {
                emailNotificationService.sendAlertEmail(resident.getUser().getEmail(), alert.getTitle(), alert.getMessage());
            }
        } catch (Exception e) {
            // Ignore failure saving alert
        }
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void deleteReading(String adminEmail, Long readingId) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);
        WaterUsage usage = waterUsageRepository.findById(readingId)
                .orElseThrow(com.water.monitoring_and_billing_platform.exception.WaterUsageNotFoundException::new);

        WaterMeter meter = usage.getWaterMeter();
        if (!meter.getResidentProfile().getCommunity().getId().equals(adminProfile.getCommunity().getId())) {
            throw new WaterMeterNotFoundException();
        }

        waterUsageRepository.delete(usage);

        recalculateMeterReadings(meter);
    }

    @Override
    public List<WaterUsageResponse> getReadingsByBillingCycle(String adminEmail, Long billingCycleId) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);
        BillingCycle cycle = billingCycleRepository.findById(billingCycleId)
                .orElseThrow(() -> new IllegalArgumentException("Billing cycle not found"));

        return waterUsageRepository.findByWaterMeterResidentProfileCommunityIdAndReadingDateBetween(
                adminProfile.getCommunity().getId(),
                cycle.getPeriodStart(),
                cycle.getPeriodEnd()
        ).stream()
                .map(this::mapToResponse)
                .toList();
    }

    private void recalculateMeterReadings(WaterMeter meter) {
        List<WaterUsage> readings = waterUsageRepository.findByWaterMeterId(meter.getId()).stream()
                .sorted(java.util.Comparator.comparing(WaterUsage::getReadingDate).thenComparing(WaterUsage::getId))
                .toList();

        double currentPrev = meter.getInitialReading();
        for (WaterUsage u : readings) {
            u.setPreviousReading(currentPrev);
            u.setUnitsConsumed(u.getCurrentReading() - currentPrev);
            waterUsageRepository.save(u);
            currentPrev = u.getCurrentReading();
        }

        meter.setCurrentReading(currentPrev);
        waterMeterRepository.save(meter);
    }

    private WaterUsageResponse mapToResponse(WaterUsage usage) {
        return WaterUsageResponse.builder()
                .id(usage.getId())
                .meterNumber(usage.getWaterMeter().getMeterNumber())
                .officialUserId(usage.getWaterMeter().getResidentProfile().getOfficialUserId())
                .previousReading(usage.getPreviousReading())
                .currentReading(usage.getCurrentReading())
                .unitsConsumed(usage.getUnitsConsumed())
                .readingDate(usage.getReadingDate())
                .build();
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public boolean isResetAllowed(String adminEmail) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);
        Long communityId = adminProfile.getCommunity().getId();

        BillingCycle activeCycle = billingCycleRepository.findAll().stream()
                .filter(c -> c.isActive())
                .findFirst()
                .orElse(null);

        if (activeCycle == null) {
            return true;
        }

        List<ResidentProfile> residents = residentProfileRepository.findByCommunityId(communityId);
        if (residents.isEmpty()) return true;

        for (ResidentProfile resident : residents) {
            WaterMeter meter = waterMeterRepository.findByResidentProfileId(resident.getId()).orElse(null);
            if (meter != null) {
                boolean hasBill = billRepository.existsByResidentProfileIdAndBillingCycleId(resident.getId(), activeCycle.getId());
                if (!hasBill) {
                    return false;
                }
            }
        }
        return true;
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public com.water.monitoring_and_billing_platform.dto.MeterResetLogResponse resetMeterReading(String adminEmail, com.water.monitoring_and_billing_platform.dto.MeterResetRequest request) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);
        User adminUser = userRepository.findByEmail(adminEmail).orElseThrow(UserNotFoundException::new);
        Long communityId = adminProfile.getCommunity().getId();

        if (!isResetAllowed(adminEmail)) {
            throw new IllegalStateException("Software Reading Reset rejected: Active billing cycle bills are not fully generated.");
        }

        ResidentProfile resident = residentProfileRepository.findById(request.getResidentProfileId())
                .orElseThrow(() -> new IllegalArgumentException("Resident profile not found"));

        if (!communityId.equals(resident.getCommunity().getId())) {
            throw new IllegalArgumentException("Resident does not belong to your community.");
        }

        WaterMeter meter = waterMeterRepository.findByResidentProfileId(resident.getId())
                .orElseThrow(WaterMeterNotFoundException::new);

        BillingCycle activeCycle = billingCycleRepository.findAll().stream()
                .filter(c -> c.isActive())
                .findFirst()
                .orElse(null);

        Double prevReading = meter.getCurrentReading() != null ? meter.getCurrentReading() : 0.0;

        meter.setInitialReading(0.0);
        meter.setCurrentReading(0.0);
        waterMeterRepository.save(meter);

        com.water.monitoring_and_billing_platform.entity.MeterResetLog resetLog = com.water.monitoring_and_billing_platform.entity.MeterResetLog.builder()
                .waterMeter(meter)
                .residentProfile(resident)
                .community(adminProfile.getCommunity())
                .billingCycle(activeCycle)
                .resetBy(adminUser)
                .previousReading(prevReading)
                .newReading(0.0)
                .resetDate(java.time.LocalDateTime.now())
                .reason(request.getReason() != null && !request.getReason().isBlank() ? request.getReason() : "Individual Software Baseline Reset after Bill Generation")
                .resetType("INDIVIDUAL")
                .build();

        resetLog = meterResetLogRepository.save(resetLog);

        return mapToResetLogResponse(resetLog);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public List<com.water.monitoring_and_billing_platform.dto.MeterResetLogResponse> bulkResetMeterReadings(String adminEmail, com.water.monitoring_and_billing_platform.dto.BulkMeterResetRequest request) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);
        User adminUser = userRepository.findByEmail(adminEmail).orElseThrow(UserNotFoundException::new);
        Long communityId = adminProfile.getCommunity().getId();

        if (!isResetAllowed(adminEmail)) {
            throw new IllegalStateException("Bulk Software Reading Reset rejected: Active billing cycle bills are not fully generated.");
        }

        List<ResidentProfile> residents = residentProfileRepository.findByCommunityId(communityId);
        BillingCycle activeCycle = billingCycleRepository.findAll().stream()
                .filter(c -> c.isActive())
                .findFirst()
                .orElse(null);

        List<com.water.monitoring_and_billing_platform.dto.MeterResetLogResponse> responses = new ArrayList<>();

        for (ResidentProfile resident : residents) {
            WaterMeter meter = waterMeterRepository.findByResidentProfileId(resident.getId()).orElse(null);
            if (meter != null && (meter.getCurrentReading() > 0 || meter.getInitialReading() > 0)) {
                Double prevReading = meter.getCurrentReading() != null ? meter.getCurrentReading() : 0.0;

                meter.setInitialReading(0.0);
                meter.setCurrentReading(0.0);
                waterMeterRepository.save(meter);

                com.water.monitoring_and_billing_platform.entity.MeterResetLog resetLog = com.water.monitoring_and_billing_platform.entity.MeterResetLog.builder()
                        .waterMeter(meter)
                        .residentProfile(resident)
                        .community(adminProfile.getCommunity())
                        .billingCycle(activeCycle)
                        .resetBy(adminUser)
                        .previousReading(prevReading)
                        .newReading(0.0)
                        .resetDate(java.time.LocalDateTime.now())
                        .reason(request.getReason() != null && !request.getReason().isBlank() ? request.getReason() : "Bulk Software Baseline Reset after Bill Generation")
                        .resetType("BULK")
                        .build();

                resetLog = meterResetLogRepository.save(resetLog);
                responses.add(mapToResetLogResponse(resetLog));
            }
        }

        return responses;
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<com.water.monitoring_and_billing_platform.dto.MeterResetLogResponse> getResetLogs(String adminEmail) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);
        return meterResetLogRepository.findByCommunityIdOrderByResetDateDesc(adminProfile.getCommunity().getId()).stream()
                .map(this::mapToResetLogResponse)
                .toList();
    }

    private com.water.monitoring_and_billing_platform.dto.MeterResetLogResponse mapToResetLogResponse(com.water.monitoring_and_billing_platform.entity.MeterResetLog log) {
        return com.water.monitoring_and_billing_platform.dto.MeterResetLogResponse.builder()
                .id(log.getId())
                .meterId(log.getWaterMeter().getId())
                .meterNumber(log.getWaterMeter().getMeterNumber())
                .residentId(log.getResidentProfile().getId())
                .residentName(log.getResidentProfile().getUser().getFullName())
                .unitNumber(log.getResidentProfile().getUnit() != null ? log.getResidentProfile().getUnit().getUnitNumber() : "N/A")
                .previousReading(log.getPreviousReading())
                .newReading(log.getNewReading())
                .resetDate(log.getResetDate())
                .resetBy(log.getResetBy().getFullName())
                .billingCycleName(log.getBillingCycle() != null ? log.getBillingCycle().getName() : "N/A")
                .reason(log.getReason())
                .resetType(log.getResetType())
                .build();
    }
}

