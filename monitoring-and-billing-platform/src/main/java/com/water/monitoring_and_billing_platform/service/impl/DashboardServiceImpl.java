package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.dto.CommunityDashboardResponse;
import com.water.monitoring_and_billing_platform.dto.DashboardResponse;
import com.water.monitoring_and_billing_platform.dto.UserDashboardResponse;
import com.water.monitoring_and_billing_platform.entity.Community;
import com.water.monitoring_and_billing_platform.entity.ResidentProfile;
import com.water.monitoring_and_billing_platform.entity.WaterMeter;
import com.water.monitoring_and_billing_platform.entity.WaterUsage;
import com.water.monitoring_and_billing_platform.exception.CommunityNotFoundException;
import com.water.monitoring_and_billing_platform.exception.ResidentProfileNotFoundException;
import com.water.monitoring_and_billing_platform.exception.WaterMeterNotFoundException;
import com.water.monitoring_and_billing_platform.repository.*;
import com.water.monitoring_and_billing_platform.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final CommunityRepository communityRepository;
    private final BlockRepository blockRepository;
    private final UnitRepository unitRepository;
    private final ResidentProfileRepository residentProfileRepository;
    private final WaterMeterRepository waterMeterRepository;
    private final WaterUsageRepository waterUsageRepository;

    @Override
    public DashboardResponse getMainAdminDashboard() {

        return DashboardResponse.builder()
                .totalCommunities(communityRepository.count())
                .totalBlocks(blockRepository.count())
                .totalUnits(unitRepository.count())
                .totalResidents(residentProfileRepository.count())
                .totalWaterMeters(waterMeterRepository.count())
                .totalWaterReadings(waterUsageRepository.count())
                .build();
    }

    @Override
    public CommunityDashboardResponse getCommunityDashboard(Long communityId) {

        Community community = communityRepository.findById(communityId)
                .orElseThrow(CommunityNotFoundException::new);

        return CommunityDashboardResponse.builder()
                .communityName(community.getCommunityName())
                .totalBlocks(blockRepository.countByCommunityId(communityId))
                .totalUnits(unitRepository.countByCommunityId(communityId))
                .totalResidents(residentProfileRepository.countByCommunityId(communityId))
                .totalWaterMeters(
                        waterMeterRepository.countByResidentProfileCommunityId(communityId)
                )
                .totalWaterReadings(
                        waterUsageRepository.countByWaterMeterResidentProfileCommunityId(communityId)
                )
                .build();
    }

    @Override
    public UserDashboardResponse getUserDashboard(Long residentId) {

        ResidentProfile resident = residentProfileRepository.findById(residentId)
                .orElseThrow(ResidentProfileNotFoundException::new);

        WaterMeter meter = waterMeterRepository.findAll()
                .stream()
                .filter(m -> m.getResidentProfile().getId().equals(residentId))
                .findFirst()
                .orElseThrow(WaterMeterNotFoundException::new);

        Double lastUnits = waterUsageRepository.findByWaterMeterId(meter.getId())
                .stream()
                .reduce((first, second) -> second)
                .map(WaterUsage::getUnitsConsumed)
                .orElse(0.0);

        return UserDashboardResponse.builder()
                .officialUserId(resident.getOfficialUserId())
                .residentName(resident.getUser().getFullName())
                .meterNumber(meter.getMeterNumber())
                .currentReading(meter.getCurrentReading())
                .lastUnitsConsumed(lastUnits)
                .meterStatus(meter.getMeterStatus().name())
                .build();
    }
}