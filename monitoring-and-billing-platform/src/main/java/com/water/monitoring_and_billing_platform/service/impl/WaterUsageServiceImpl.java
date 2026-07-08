package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.dto.WaterUsageRequest;
import com.water.monitoring_and_billing_platform.dto.WaterUsageResponse;
import com.water.monitoring_and_billing_platform.entity.CommunityAdminProfile;
import com.water.monitoring_and_billing_platform.entity.User;
import com.water.monitoring_and_billing_platform.entity.WaterMeter;
import com.water.monitoring_and_billing_platform.entity.WaterUsage;
import com.water.monitoring_and_billing_platform.exception.InvalidMeterReadingException;
import com.water.monitoring_and_billing_platform.exception.UserNotFoundException;
import com.water.monitoring_and_billing_platform.exception.WaterMeterNotFoundException;
import com.water.monitoring_and_billing_platform.repository.CommunityAdminProfileRepository;
import com.water.monitoring_and_billing_platform.repository.UserRepository;
import com.water.monitoring_and_billing_platform.repository.WaterMeterRepository;
import com.water.monitoring_and_billing_platform.repository.WaterUsageRepository;
import com.water.monitoring_and_billing_platform.service.WaterUsageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WaterUsageServiceImpl implements WaterUsageService {

    private final WaterUsageRepository waterUsageRepository;
    private final WaterMeterRepository waterMeterRepository;
    private final UserRepository userRepository;
    private final CommunityAdminProfileRepository communityAdminProfileRepository;

    private CommunityAdminProfile getAdminProfile(String adminEmail) {
        User user = userRepository.findByEmail(adminEmail)
                .orElseThrow(UserNotFoundException::new);
        return communityAdminProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Community Admin profile not found."));
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public WaterUsageResponse addReading(String adminEmail, WaterUsageRequest request) {
        if (request.getWaterMeterId() == null) {
            throw new WaterMeterNotFoundException();
        }

        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);

        WaterMeter meter = waterMeterRepository.findById(request.getWaterMeterId())
                .orElseThrow(WaterMeterNotFoundException::new);

        if (!meter.getResidentProfile().getCommunity().getId().equals(adminProfile.getCommunity().getId())) {
            throw new WaterMeterNotFoundException(); // 404 to avoid enumeration
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

        return mapToResponse(usage);
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