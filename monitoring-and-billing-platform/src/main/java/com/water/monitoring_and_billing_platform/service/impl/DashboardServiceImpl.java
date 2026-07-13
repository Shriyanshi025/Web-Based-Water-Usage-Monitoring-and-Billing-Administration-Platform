package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.dto.*;
import com.water.monitoring_and_billing_platform.entity.*;
import com.water.monitoring_and_billing_platform.enums.ApprovalStatus;
import com.water.monitoring_and_billing_platform.enums.Role;
import com.water.monitoring_and_billing_platform.exception.*;
import com.water.monitoring_and_billing_platform.repository.*;
import com.water.monitoring_and_billing_platform.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.LinkedHashMap;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final CommunityRepository communityRepository;
    private final BlockRepository blockRepository;
    private final UnitRepository unitRepository;
    private final ResidentProfileRepository residentProfileRepository;
    private final WaterMeterRepository waterMeterRepository;
    private final WaterUsageRepository waterUsageRepository;
    private final UserRepository userRepository;
    private final CommunityAdminProfileRepository communityAdminProfileRepository;
    private final ActivityLogRepository activityLogRepository;

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
    public CommunityAdminResponse getCommunityDashboard(Long communityId) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(CommunityNotFoundException::new);

        return CommunityAdminResponse.builder()
                .communityName(community.getCommunityName())
                .totalBlocks(blockRepository.countByCommunityId(communityId))
                .totalUnits(unitRepository.countByCommunityId(communityId))
                .totalResidents(residentProfileRepository.countByCommunityId(communityId))
                .totalWaterMeters(waterMeterRepository.countByResidentProfileCommunityId(communityId))
                .totalWaterReadings(waterUsageRepository.countByWaterMeterResidentProfileCommunityId(communityId))
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

    @Override
    public ResidentDashboardResponse getResidentDashboard(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(UserNotFoundException::new);

        ResidentProfile profile = residentProfileRepository.findByUserId(user.getId())
                .orElseThrow(ResidentProfileNotFoundException::new);

        Optional<WaterMeter> meterOpt = waterMeterRepository.findByResidentProfileId(profile.getId());

        double currentMonthUsage = 0.0;
        double currentBill = 0.0;
        String meterStatus = "NOT_INSTALLED";
        String meterNumber = null;

        if (meterOpt.isPresent()) {
            WaterMeter meter = meterOpt.get();
            meterStatus = meter.getMeterStatus().name();
            meterNumber = meter.getMeterNumber();

            List<WaterUsage> usageList = waterUsageRepository.findByWaterMeterId(meter.getId());
            LocalDate now = LocalDate.now();
            currentMonthUsage = usageList.stream()
                    .filter(u -> u.getReadingDate().getMonth() == now.getMonth() && u.getReadingDate().getYear() == now.getYear())
                    .mapToDouble(WaterUsage::getUnitsConsumed)
                    .sum();

            double unbilledUnits = usageList.stream()
                    .filter(u -> !u.isBilled())
                    .mapToDouble(WaterUsage::getUnitsConsumed)
                    .sum();
            currentBill = unbilledUnits * 15.0;

        }

        List<ActivityLogDto> recentActivities = activityLogRepository.findTop5ByUserIdOrCommunityIdOrderByTimestampDesc(user.getId(), profile.getCommunity().getId())
            .stream().map(this::mapActivity).collect(Collectors.toList());

        return ResidentDashboardResponse.builder()
                .fullName(user.getFullName())
                .officialUserId(profile.getOfficialUserId())
                .communityName(profile.getCommunity().getCommunityName())
                .blockName(profile.getBlock().getBlockName())
                .unitNumber(profile.getUnit().getUnitNumber())
                .currentMonthWaterUsage(currentMonthUsage)
                .currentBill(currentBill)
                .meterStatus(meterStatus)
                .meterNumber(meterNumber)
                .recentActivities(recentActivities)
                .build();
    }

    @Override
    public CommunityAdminDashboardResponse getCommunityAdminDashboard(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(UserNotFoundException::new);

        CommunityAdminProfile adminProfile = communityAdminProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Community Admin profile not found."));

        Community community = adminProfile.getCommunity();

        long totalResidents = residentProfileRepository.countByCommunityId(community.getId());
        long pendingResidents = residentProfileRepository.countByCommunityIdAndVerifiedFalseAndUserApprovalStatus(community.getId(), ApprovalStatus.PENDING);
        long totalWaterMeters = waterMeterRepository.countByResidentProfileCommunityId(community.getId());
        long activeWaterMeters = waterMeterRepository.countByResidentProfileCommunityIdAndActiveTrue(community.getId());

        List<WaterUsage> usages = waterUsageRepository.findByWaterMeterResidentProfileCommunityId(community.getId());
        double totalWaterUsage = usages.stream().mapToDouble(WaterUsage::getUnitsConsumed).sum();
        double pendingBills = usages.stream().filter(u -> !u.isBilled()).mapToDouble(WaterUsage::getUnitsConsumed).sum() * 15.0;
        double totalRevenue = usages.stream().filter(WaterUsage::isBilled).mapToDouble(WaterUsage::getUnitsConsumed).sum() * 15.0;

        List<MonthlyUsageDto> monthlyUsage = usages.stream()
            .collect(Collectors.groupingBy(
                u -> u.getReadingDate().format(DateTimeFormatter.ofPattern("MMM")),
                LinkedHashMap::new,
                Collectors.summingDouble(WaterUsage::getUnitsConsumed)
            ))
            .entrySet().stream()
            .map(e -> new MonthlyUsageDto(e.getKey(), e.getValue()))
            .collect(Collectors.toList());

        List<ActivityLogDto> recentActivities = activityLogRepository.findTop5ByCommunityIdOrderByTimestampDesc(community.getId())
            .stream().map(this::mapActivity).collect(Collectors.toList());

        List<ResidentProfileResponse> pendingResidentsList = residentProfileRepository.findByCommunityIdAndVerifiedFalseAndUserApprovalStatus(community.getId(), ApprovalStatus.PENDING)
            .stream().map(p -> ResidentProfileResponse.builder()
                .id(p.getId())
                .userId(p.getUser().getId())
                .officialUserId(p.getOfficialUserId())
                .fullName(p.getUser().getFullName())
                .email(p.getUser().getEmail())
                .blockName(p.getBlock().getBlockName())
                .unitNumber(p.getUnit().getUnitNumber())
                .build()
            ).collect(Collectors.toList());

        List<WaterMeter> meters = waterMeterRepository.findAll().stream()
            .filter(m -> m.getResidentProfile().getCommunity().getId().equals(community.getId())).toList();

        Map<String, Long> meterCounts = meters.stream().collect(Collectors.groupingBy(m -> m.getMeterStatus().name(), Collectors.counting()));
        List<ChartDataDto> meterStatusData = meterCounts.entrySet().stream()
            .map(e -> new ChartDataDto(e.getKey(), e.getValue()))
            .collect(Collectors.toList());

        return CommunityAdminDashboardResponse.builder()
                .communityName(community.getCommunityName())
                .totalResidents(totalResidents)
                .pendingResidents(pendingResidents)
                .totalWaterMeters(totalWaterMeters)
                .activeWaterMeters(activeWaterMeters)
                .totalWaterUsage(totalWaterUsage)
                .pendingBills(pendingBills)
                .totalRevenue(totalRevenue)
                .monthlyWaterUsage(monthlyUsage)
                .recentActivities(recentActivities)
                .pendingResidentsList(pendingResidentsList)
                .meterStatusData(meterStatusData)
                .build();
    }

    @Override
    public MainAdminDashboardResponse getMainAdminDashboardData() {
        long totalCommunities = communityRepository.count();
        long totalCommunityAdmins = userRepository.countByRole(Role.COMMUNITY_ADMIN);
        long pendingUsers = userRepository.countByApprovalStatus(ApprovalStatus.PENDING);
        long totalResidents = residentProfileRepository.count();

        List<WaterUsage> allUsages = waterUsageRepository.findAll();
        double totalWaterConsumption = allUsages.stream().mapToDouble(WaterUsage::getUnitsConsumed).sum();
        double totalRevenue = allUsages.stream().filter(WaterUsage::isBilled).mapToDouble(WaterUsage::getUnitsConsumed).sum() * 15.0;

        List<MonthlyUsageDto> monthlyWaterConsumptionChart = allUsages.stream()
            .collect(Collectors.groupingBy(
                u -> u.getReadingDate().format(DateTimeFormatter.ofPattern("MMM")),
                LinkedHashMap::new,
                Collectors.summingDouble(WaterUsage::getUnitsConsumed)
            ))
            .entrySet().stream()
            .map(e -> new MonthlyUsageDto(e.getKey(), e.getValue()))
            .collect(Collectors.toList());

        List<ActivityLogDto> recentActivities = activityLogRepository.findTop5ByOrderByTimestampDesc()
            .stream().map(this::mapActivity).collect(Collectors.toList());

        List<ChartDataDto> communityGrowth = communityRepository.findAll().stream()
            .collect(Collectors.groupingBy(
                c -> c.getCreatedAt() != null ? c.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM")) : "Jan",
                LinkedHashMap::new,
                Collectors.counting()
            ))
            .entrySet().stream()
            .map(e -> new ChartDataDto(e.getKey(), e.getValue()))
            .collect(Collectors.toList());

        List<CommunityAdminProfileResponse> pendingApprovals = communityAdminProfileRepository.findAll().stream()
            .filter(p -> p.getUser().getApprovalStatus() == ApprovalStatus.PENDING)
            .map(p -> CommunityAdminProfileResponse.builder()
                .id(p.getId())
                .userId(p.getUser().getId())
                .fullName(p.getUser().getFullName())
                .email(p.getUser().getEmail())
                .communityName(p.getCommunity().getCommunityName())
                .build())
            .collect(Collectors.toList());

        return MainAdminDashboardResponse.builder()
                .totalCommunities(totalCommunities)
                .totalCommunityAdmins(totalCommunityAdmins)
                .pendingCommunityAdmins(pendingUsers)
                .totalResidents(totalResidents)
                .totalWaterConsumption(totalWaterConsumption)
                .totalRevenue(totalRevenue)
                .monthlyWaterConsumptionChart(monthlyWaterConsumptionChart)
                .recentActivities(recentActivities)
                .communityGrowth(communityGrowth)
                .pendingApprovals(pendingApprovals)
                .build();
    }

    private ActivityLogDto mapActivity(ActivityLog a) {
        return ActivityLogDto.builder()
            .id(a.getId())
            .title(a.getTitle())
            .description(a.getDescription())
            .time(a.getTimestamp().toString())
            .icon(a.getIcon())
            .color(a.getColor())
            .build();
    }
}
