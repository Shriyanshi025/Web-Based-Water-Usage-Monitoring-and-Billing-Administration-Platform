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
        if (waterUsageRepository.existsByWaterMeterIdAndReadingDateAndCurrentReading(request.getWaterMeterId(), request.getReadingDate(), request.getCurrentReading())) {
            throw new DuplicateWaterUsageException();
        }

        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);

        WaterMeter meter = waterMeterRepository.findById(request.getWaterMeterId())
                .orElseThrow(WaterMeterNotFoundException::new);

        if (!meter.getResidentProfile().getCommunity().getId().equals(adminProfile.getCommunity().getId())) {
            throw new WaterMeterNotFoundException();
        }

        double previousReading = meter.getCurrentReading();
        if (request.getCurrentReading() < previousReading) {
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
        meter.setCurrentReading(request.getCurrentReading());
        waterMeterRepository.save(meter);

        billingService.generateBillForReading(usage);

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
                if (waterUsageRepository.existsByWaterMeterIdAndReadingDateAndCurrentReading(meterId, readingDate, currentReading)) {
                    continue;
                }

                double previousReading = meter.getCurrentReading();
                if (currentReading < previousReading) {
                    throw new InvalidMeterReadingException();
                }

                WaterUsage usage = WaterUsage.builder()
                        .waterMeter(meter)
                        .previousReading(previousReading)
                        .currentReading(currentReading)
                        .unitsConsumed(currentReading - previousReading)
                        .readingDate(readingDate)
                        .billed(false)
                        .build();

                usage = waterUsageRepository.save(usage);
                meter.setCurrentReading(currentReading);
                waterMeterRepository.save(meter);
                
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

        return waterUsageRepository.findAll()
                .stream()
                .filter(usage -> usage.getWaterMeter().getResidentProfile().getCommunity().getId().equals(adminProfile.getCommunity().getId()))
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
}
