package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.dto.ConsumptionCostDistributionResponse;
import com.water.monitoring_and_billing_platform.dto.HouseholdCostDistributionResponse;
import com.water.monitoring_and_billing_platform.entity.*;
import com.water.monitoring_and_billing_platform.repository.*;
import com.water.monitoring_and_billing_platform.service.ConsumptionCostDistributionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConsumptionCostDistributionServiceImpl implements ConsumptionCostDistributionService {

    private final BulkWaterPurchaseRepository bulkWaterPurchaseRepository;
    private final BillingCycleRepository billingCycleRepository;
    private final ResidentProfileRepository residentProfileRepository;
    private final WaterMeterRepository waterMeterRepository;
    private final WaterUsageRepository waterUsageRepository;
    private final UserRepository userRepository;
    private final CommunityAdminProfileRepository communityAdminProfileRepository;

    private CommunityAdminProfile getAdminProfile(String adminEmail) {
        User user = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return communityAdminProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Community admin profile not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public ConsumptionCostDistributionResponse calculateDistribution(String adminEmail, Long billingCycleId) {
        CommunityAdminProfile admin = getAdminProfile(adminEmail);
        Long communityId = admin.getCommunity().getId();

        return calculateDistributionInternal(communityId, billingCycleId);
    }

    @Override
    @Transactional(readOnly = true)
    public ConsumptionCostDistributionResponse calculateDistribution(Long communityId, Long billingCycleId) {
        return calculateDistributionInternal(communityId, billingCycleId);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal calculateSharedCostForResident(ResidentProfile resident, Long billingCycleId) {
        if (resident == null || billingCycleId == null) {
            return BigDecimal.ZERO;
        }
        ConsumptionCostDistributionResponse response = calculateDistributionInternal(resident.getCommunity().getId(), billingCycleId);
        return response.getDistributions().stream()
                .filter(d -> d.getResidentProfileId().equals(resident.getId()))
                .map(HouseholdCostDistributionResponse::getDistributedCost)
                .findFirst()
                .orElse(BigDecimal.ZERO);
    }

    private ConsumptionCostDistributionResponse calculateDistributionInternal(Long communityId, Long billingCycleId) {
        BillingCycle cycle = billingCycleRepository.findById(billingCycleId)
                .orElseThrow(() -> new IllegalArgumentException("Billing cycle not found"));

        List<BulkWaterPurchase> purchases = bulkWaterPurchaseRepository.findByBillingCycleIdAndCommunityId(billingCycleId, communityId);
        BigDecimal totalBulkCost = purchases.stream()
                .map(BulkWaterPurchase::getTotalCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Batch load community residents
        List<ResidentProfile> residents = residentProfileRepository.findByCommunityIdAndActiveTrue(communityId);
        if (residents.isEmpty()) {
            return ConsumptionCostDistributionResponse.builder()
                    .billingCycleId(cycle.getId())
                    .billingCycleName(cycle.getName())
                    .totalBulkCost(totalBulkCost)
                    .totalCommunityConsumption(0.0)
                    .costPerKl(BigDecimal.ZERO)
                    .distributions(Collections.emptyList())
                    .build();
        }

        // Batch load water meters
        List<WaterMeter> meters = waterMeterRepository.findByResidentProfileCommunityId(communityId);
        Map<Long, WaterMeter> residentMeterMap = meters.stream()
                .filter(m -> m.getResidentProfile() != null)
                .collect(Collectors.toMap(m -> m.getResidentProfile().getId(), m -> m, (a, b) -> a));

        // Batch load water usages in cycle
        List<WaterUsage> usages = waterUsageRepository.findByWaterMeterResidentProfileCommunityIdAndReadingDateBetween(
                communityId, cycle.getPeriodStart(), cycle.getPeriodEnd()
        );
        Map<Long, List<WaterUsage>> meterUsageMap = usages.stream()
                .filter(u -> u.getWaterMeter() != null)
                .collect(Collectors.groupingBy(u -> u.getWaterMeter().getId()));

        List<HouseholdCostDistributionResponse> distributions = new ArrayList<>();
        List<HouseholdCostDistributionResponse> meteredDistributions = new ArrayList<>();

        double totalCommunityConsumption = 0.0;

        for (ResidentProfile resident : residents) {
            String residentName = resident.getUser() != null ? resident.getUser().getFullName() : "N/A";
            String unitNumber = resident.getUnit() != null ? resident.getUnit().getUnitNumber() : "N/A";

            WaterMeter meter = residentMeterMap.get(resident.getId());
            List<WaterUsage> meterUsages = meter != null ? meterUsageMap.get(meter.getId()) : null;

            if (meter != null && meterUsages != null && !meterUsages.isEmpty()) {
                double consumption = meterUsages.stream().mapToDouble(WaterUsage::getUnitsConsumed).sum();
                totalCommunityConsumption += consumption;

                HouseholdCostDistributionResponse dist = HouseholdCostDistributionResponse.builder()
                        .residentProfileId(resident.getId())
                        .residentName(residentName)
                        .unitNumber(unitNumber)
                        .consumption(consumption)
                        .distributedCost(BigDecimal.ZERO)
                        .status("Metered")
                        .build();

                distributions.add(dist);
                meteredDistributions.add(dist);
            } else {
                distributions.add(HouseholdCostDistributionResponse.builder()
                        .residentProfileId(resident.getId())
                        .residentName(residentName)
                        .unitNumber(unitNumber)
                        .consumption(0.0)
                        .distributedCost(BigDecimal.ZERO)
                        .status("No Reading (Excluded - No fallback policy configured)")
                        .build());
            }
        }

        BigDecimal costPerKl = BigDecimal.ZERO;
        if (totalCommunityConsumption > 0 && totalBulkCost.compareTo(BigDecimal.ZERO) > 0) {
            costPerKl = totalBulkCost.divide(BigDecimal.valueOf(totalCommunityConsumption), 4, RoundingMode.HALF_UP);

            BigDecimal sumOfDistributedCosts = BigDecimal.ZERO;
            for (HouseholdCostDistributionResponse dist : meteredDistributions) {
                BigDecimal cost = BigDecimal.valueOf(dist.getConsumption())
                        .multiply(costPerKl)
                        .setScale(2, RoundingMode.HALF_UP);
                dist.setDistributedCost(cost);
                sumOfDistributedCosts = sumOfDistributedCosts.add(cost);
            }

            // Remainder reconciliation adjustment
            BigDecimal remainder = totalBulkCost.subtract(sumOfDistributedCosts);
            if (remainder.compareTo(BigDecimal.ZERO) != 0 && !meteredDistributions.isEmpty()) {
                // Find highest consuming household deterministically
                HouseholdCostDistributionResponse highestConsumer = meteredDistributions.stream()
                        .min((a, b) -> {
                            int comp = Double.compare(b.getConsumption(), a.getConsumption());
                            if (comp != 0) return comp;
                            // Tie-breaker: lowest resident profile ID
                            return a.getResidentProfileId().compareTo(b.getResidentProfileId());
                        })
                        .orElse(null);

                if (highestConsumer != null) {
                    highestConsumer.setDistributedCost(highestConsumer.getDistributedCost().add(remainder));
                }
            }
        }

        return ConsumptionCostDistributionResponse.builder()
                .billingCycleId(cycle.getId())
                .billingCycleName(cycle.getName())
                .totalBulkCost(totalBulkCost)
                .totalCommunityConsumption(totalCommunityConsumption)
                .costPerKl(costPerKl)
                .distributions(distributions)
                .build();
    }
}
