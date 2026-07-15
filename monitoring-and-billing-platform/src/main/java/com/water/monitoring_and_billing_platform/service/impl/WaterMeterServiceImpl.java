package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.dto.WaterMeterRequest;
import com.water.monitoring_and_billing_platform.dto.WaterMeterResponse;
import com.water.monitoring_and_billing_platform.dto.WaterMeterUpdateRequest;
import com.water.monitoring_and_billing_platform.entity.CommunityAdminProfile;
import com.water.monitoring_and_billing_platform.entity.ResidentProfile;
import com.water.monitoring_and_billing_platform.entity.User;
import com.water.monitoring_and_billing_platform.entity.WaterMeter;
import com.water.monitoring_and_billing_platform.enums.MeterStatus;
import com.water.monitoring_and_billing_platform.exception.ResidentProfileNotFoundException;
import com.water.monitoring_and_billing_platform.exception.UserNotFoundException;
import com.water.monitoring_and_billing_platform.exception.WaterMeterAlreadyExistsException;
import com.water.monitoring_and_billing_platform.exception.WaterMeterNotFoundException;
import com.water.monitoring_and_billing_platform.repository.CommunityAdminProfileRepository;
import com.water.monitoring_and_billing_platform.repository.ResidentProfileRepository;
import com.water.monitoring_and_billing_platform.repository.UserRepository;
import com.water.monitoring_and_billing_platform.repository.WaterMeterRepository;
import com.water.monitoring_and_billing_platform.service.WaterMeterService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WaterMeterServiceImpl implements WaterMeterService {

    private final WaterMeterRepository waterMeterRepository;
    private final ResidentProfileRepository residentProfileRepository;
    private final UserRepository userRepository;
    private final CommunityAdminProfileRepository communityAdminProfileRepository;
    private final com.water.monitoring_and_billing_platform.repository.ActivityLogRepository activityLogRepository;

    private CommunityAdminProfile getAdminProfile(String adminEmail) {
        User user = userRepository.findByEmail(adminEmail)
                .orElseThrow(UserNotFoundException::new);
        return communityAdminProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Community Admin profile not found."));
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public WaterMeterResponse createWaterMeter(String adminEmail, WaterMeterRequest request) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);

        ResidentProfile resident = residentProfileRepository
                .findById(request.getResidentProfileId())
                .orElseThrow(ResidentProfileNotFoundException::new);

        if (!resident.getCommunity().getId().equals(adminProfile.getCommunity().getId())) {
            throw new ResidentProfileNotFoundException(); // 404 to avoid enumeration
        }

        if (waterMeterRepository.existsByMeterNumber(request.getMeterNumber())
                || waterMeterRepository.existsByResidentProfileId(resident.getId())) {

            throw new WaterMeterAlreadyExistsException();
        }

        WaterMeter meter = WaterMeter.builder()
                .meterNumber(request.getMeterNumber())
                .residentProfile(resident)
                .meterStatus(MeterStatus.ACTIVE)
                .installationDate(request.getInstallationDate())
                .initialReading(request.getInitialReading())
                .currentReading(request.getInitialReading())
                .active(true)
                .build();

        meter = waterMeterRepository.save(meter);

        activityLogRepository.save(com.water.monitoring_and_billing_platform.entity.ActivityLog.builder()
                .title("Water Meter Assigned")
                .description("Meter " + meter.getMeterNumber() + " assigned to " + resident.getUser().getFullName())
                .timestamp(java.time.LocalDateTime.now())
                .icon("WaterDrop")
                .color("primary.main")
                .community(resident.getCommunity())
                .user(resident.getUser())
                .build());

        return mapToResponse(meter);
    }

    @Override
    public WaterMeterResponse getWaterMeterById(String adminEmail, Long id) {
        if (id == null) {
            throw new WaterMeterNotFoundException();
        }

        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);

        WaterMeter meter = waterMeterRepository.findById(id)
                .orElseThrow(WaterMeterNotFoundException::new);

        if (!meter.getResidentProfile().getCommunity().getId().equals(adminProfile.getCommunity().getId())) {
            throw new WaterMeterNotFoundException(); // 404 to avoid enumeration
        }

        return mapToResponse(meter);
    }

    @Override
    public List<WaterMeterResponse> getAllWaterMeters(String adminEmail) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);

        return waterMeterRepository.findByResidentProfileCommunityId(adminProfile.getCommunity().getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public WaterMeterResponse getMyMeter(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        ResidentProfile profile = residentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Resident profile not found"));

        return waterMeterRepository.findByResidentProfileId(profile.getId())
                .map(this::mapToResponse)
                .orElseThrow(() -> new IllegalArgumentException("Water meter not found for this resident"));
    }

    private WaterMeterResponse mapToResponse(WaterMeter meter) {
        return WaterMeterResponse.builder()
                .id(meter.getId())
                .meterNumber(meter.getMeterNumber())
                .officialUserId(meter.getResidentProfile().getOfficialUserId())
                .residentName(meter.getResidentProfile().getUser().getFullName())
                .initialReading(meter.getInitialReading())
                .currentReading(meter.getCurrentReading())
                .meterStatus(meter.getMeterStatus().name())
                .installationDate(meter.getInstallationDate())
                .active(meter.isActive())
                .build();
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public WaterMeterResponse updateWaterMeter(String adminEmail, Long meterId, WaterMeterUpdateRequest request) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);

        WaterMeter meter = waterMeterRepository.findById(meterId)
                .orElseThrow(WaterMeterNotFoundException::new);

        if (!meter.getResidentProfile().getCommunity().getId().equals(adminProfile.getCommunity().getId())) {
            throw new WaterMeterNotFoundException();
        }

        if (request.getMeterNumber() != null && !request.getMeterNumber().isBlank()) {
            if (waterMeterRepository.existsByMeterNumber(request.getMeterNumber())
                    && !request.getMeterNumber().equals(meter.getMeterNumber())) {
                throw new WaterMeterAlreadyExistsException();
            }
            meter.setMeterNumber(request.getMeterNumber());
        }

        if (request.getResidentProfileId() != null) {
            ResidentProfile resident = residentProfileRepository.findById(request.getResidentProfileId())
                    .orElseThrow(ResidentProfileNotFoundException::new);

            if (!resident.getCommunity().getId().equals(adminProfile.getCommunity().getId())) {
                throw new ResidentProfileNotFoundException();
            }

            if (waterMeterRepository.existsByResidentProfileId(resident.getId())
                    && !resident.getId().equals(meter.getResidentProfile().getId())) {
                throw new WaterMeterAlreadyExistsException();
            }

            meter.setResidentProfile(resident);
        }

        if (request.getCurrentReading() != null) {
            meter.setCurrentReading(request.getCurrentReading());
        }

        if (request.getMeterStatus() != null && !request.getMeterStatus().isBlank()) {
            MeterStatus newStatus = MeterStatus.valueOf(request.getMeterStatus().toUpperCase());
            if (meter.getMeterStatus() != newStatus) {
                meter.setMeterStatus(newStatus);
                activityLogRepository.save(com.water.monitoring_and_billing_platform.entity.ActivityLog.builder()
                    .title("Water Meter Status Changed")
                    .description("Meter " + meter.getMeterNumber() + " status changed to " + newStatus)
                    .timestamp(java.time.LocalDateTime.now())
                    .icon("SettingsBackupRestore")
                    .color("warning.main")
                    .community(meter.getResidentProfile().getCommunity())
                    .user(meter.getResidentProfile().getUser())
                    .build());
            }
        }

        if (request.getActive() != null) {
            meter.setActive(request.getActive());
        }

        meter = waterMeterRepository.save(meter);
        return mapToResponse(meter);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void deleteWaterMeter(String adminEmail, Long id) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);
        WaterMeter meter = waterMeterRepository.findById(id)
                .orElseThrow(WaterMeterNotFoundException::new);
        if (!meter.getResidentProfile().getCommunity().getId().equals(adminProfile.getCommunity().getId())) {
            throw new WaterMeterNotFoundException();
        }
        meter.setActive(false);
        waterMeterRepository.save(meter);
    }
}
