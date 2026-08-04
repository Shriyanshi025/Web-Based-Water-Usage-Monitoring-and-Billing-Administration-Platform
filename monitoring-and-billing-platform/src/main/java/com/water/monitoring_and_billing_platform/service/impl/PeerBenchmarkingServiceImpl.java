package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.dto.PeerBenchmarkingResponse;
import com.water.monitoring_and_billing_platform.entity.*;
import com.water.monitoring_and_billing_platform.enums.UnitType;
import com.water.monitoring_and_billing_platform.exception.UserNotFoundException;
import com.water.monitoring_and_billing_platform.repository.*;
import com.water.monitoring_and_billing_platform.service.PeerBenchmarkingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PeerBenchmarkingServiceImpl implements PeerBenchmarkingService {

    private final UserRepository userRepository;
    private final ResidentProfileRepository residentProfileRepository;
    private final WaterMeterRepository waterMeterRepository;
    private final WaterUsageRepository waterUsageRepository;

    @Override
    public PeerBenchmarkingResponse getResidentPeerBenchmarking(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException());

        ResidentProfile residentProfile = residentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Resident profile not found for user: " + email));

        Community community = residentProfile.getCommunity();
        Long communityId = community.getId();

        // Dynamically locate the logged-in resident's latest recorded meter reading date as the primary anchor month.
        // If resident has no readings, fallback to community latest reading date or current calendar date.
        Optional<WaterUsage> latestResidentUsage = waterUsageRepository.findFirstByWaterMeterResidentProfileIdOrderByReadingDateDescIdDesc(residentProfile.getId());
        Optional<WaterUsage> latestCommunityUsage = waterUsageRepository.findFirstByWaterMeterResidentProfileCommunityIdOrderByReadingDateDescIdDesc(communityId);
        
        LocalDate anchorDate = latestResidentUsage.map(WaterUsage::getReadingDate)
                .orElseGet(() -> latestCommunityUsage.map(WaterUsage::getReadingDate).orElse(LocalDate.now()));
        
        YearMonth currentYearMonth = YearMonth.from(anchorDate);
        YearMonth prevYearMonth = currentYearMonth.minusMonths(1);

        // Fetch all active residents in the community
        List<ResidentProfile> communityResidents = residentProfileRepository.findByCommunityIdAndActiveTrue(communityId);

        // Compile 6-month historical trend anchored to latest available usage data month
        List<YearMonth> last6Months = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            last6Months.add(currentYearMonth.minusMonths(i));
        }

        Map<YearMonth, Map<Long, Double>> monthlyUsageByResidentMap = new HashMap<>();
        boolean residentHasAnyReadings = false;

        for (YearMonth ym : last6Months) {
            LocalDate monthStart = ym.atDay(1);
            LocalDate monthEnd = ym.atEndOfMonth();

            List<WaterUsage> usageRecords = waterUsageRepository.findByWaterMeterResidentProfileCommunityIdAndReadingDateBetween(
                    communityId, monthStart, monthEnd
            );

            Map<Long, Double> ymMap = new HashMap<>();
            for (WaterUsage wu : usageRecords) {
                if (wu.getWaterMeter() != null && wu.getWaterMeter().getResidentProfile() != null) {
                    Long resId = wu.getWaterMeter().getResidentProfile().getId();
                    ymMap.put(resId, ymMap.getOrDefault(resId, 0.0) + wu.getUnitsConsumed());
                    if (resId.equals(residentProfile.getId()) && wu.getUnitsConsumed() != null && wu.getUnitsConsumed() > 0) {
                        residentHasAnyReadings = true;
                    }
                }
            }
            monthlyUsageByResidentMap.put(ym, ymMap);
        }

        Map<Long, Double> currentMonthUsageMap = monthlyUsageByResidentMap.getOrDefault(currentYearMonth, new HashMap<>());
        Map<Long, Double> prevMonthUsageMap = monthlyUsageByResidentMap.getOrDefault(prevYearMonth, new HashMap<>());

        Double myCurrentUsage = currentMonthUsageMap.getOrDefault(residentProfile.getId(), 0.0);
        Double myPrevUsage = prevMonthUsageMap.getOrDefault(residentProfile.getId(), 0.0);

        // Monthly trend DTO formatting
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM yyyy");
        List<PeerBenchmarkingResponse.MonthlyUsageDTO> monthlyTrends = new ArrayList<>();
        for (YearMonth ym : last6Months) {
            Map<Long, Double> map = monthlyUsageByResidentMap.getOrDefault(ym, new HashMap<>());
            double resUsage = map.getOrDefault(residentProfile.getId(), 0.0);
            double commSum = map.values().stream().mapToDouble(Double::doubleValue).sum();
            double commAvg = map.isEmpty() ? 0.0 : commSum / Math.max(1, map.size());

            monthlyTrends.add(PeerBenchmarkingResponse.MonthlyUsageDTO.builder()
                    .monthName(ym.format(fmt))
                    .residentUsage(Math.round(resUsage * 10.0) / 10.0)
                    .communityAverage(Math.round(commAvg * 10.0) / 10.0)
                    .build());
        }

        // Check if resident has insufficient data or zero total usage across all months
        if (!residentHasAnyReadings || (myCurrentUsage == 0.0 && myPrevUsage == 0.0)) {
            List<String> defaultTips = Arrays.asList(
                    "💡 Regular water meter readings allow HydroSync to calculate personalized peer benchmark comparisons.",
                    "🚿 Ensure your smart water meter is active and recording daily consumption to unlock efficiency badges and community rankings."
            );

            return PeerBenchmarkingResponse.builder()
                    .sufficientData(false)
                    .statusMessage("Insufficient Benchmark Data — Benchmark will be available after sufficient meter readings are recorded.")
                    .currentMonthUsage(0.0)
                    .communityAverageUsage(0.0)
                    .similarHouseholdAverageUsage(0.0)
                    .similarHouseholdBasis("Community Average")
                    .communityDiffPercentage(0.0)
                    .communityComparisonStatus("EQUAL")
                    .previousMonthUsage(0.0)
                    .previousMonthDiffPercentage(0.0)
                    .previousMonthComparisonStatus("NO_CHANGE")
                    .communityRank(null)
                    .totalHouseholdsInCommunity(communityResidents.size())
                    .waterEfficiencyScore(null)
                    .badgeName(null)
                    .badgeColor(null)
                    .badgeDescription(null)
                    .monthlyTrend(monthlyTrends)
                    .dynamicConservationTips(defaultTips)
                    .build();
        }

        // Calculate Community Average for current month
        double totalCommunityUsage = currentMonthUsageMap.values().stream().mapToDouble(Double::doubleValue).sum();
        int activeMetersCount = Math.max(1, currentMonthUsageMap.size());
        double communityAvgUsage = totalCommunityUsage / activeMetersCount;

        // Deterministic Similar Household Comparison Priority
        SimilarHouseholdResult similarResult = calculateSimilarHouseholdAverage(
                residentProfile, communityResidents, currentMonthUsageMap, communityAvgUsage
        );

        // Percentage differences
        double communityDiffPct = communityAvgUsage > 0
                ? Math.round(((myCurrentUsage - communityAvgUsage) / communityAvgUsage * 100.0) * 10.0) / 10.0
                : 0.0;
        String communityStatus = myCurrentUsage > communityAvgUsage ? "ABOVE_AVERAGE"
                : (myCurrentUsage < communityAvgUsage ? "BELOW_AVERAGE" : "EQUAL");

        double prevMonthDiffPct = myPrevUsage > 0
                ? Math.round(((myCurrentUsage - myPrevUsage) / myPrevUsage * 100.0) * 10.0) / 10.0
                : 0.0;
        String prevMonthStatus = myCurrentUsage > myPrevUsage ? "INCREASED"
                : (myCurrentUsage < myPrevUsage ? "DECREASED" : "NO_CHANGE");

        // Multi-Factor Water Efficiency Score (0-100)
        int efficiencyScore = calculateEfficiencyScore(
                myCurrentUsage, communityAvgUsage, similarResult.averageUsage, myPrevUsage
        );

        // Community Ranking based on Efficiency Score (excluding residents with zero reading/insufficient data)
        Map<Long, Integer> residentScores = new HashMap<>();
        for (ResidentProfile rp : communityResidents) {
            double resCurrent = currentMonthUsageMap.getOrDefault(rp.getId(), 0.0);
            double resPrev = prevMonthUsageMap.getOrDefault(rp.getId(), 0.0);
            if (resCurrent > 0.0 || resPrev > 0.0) {
                SimilarHouseholdResult resSimilar = calculateSimilarHouseholdAverage(
                        rp, communityResidents, currentMonthUsageMap, communityAvgUsage
                );
                int score = calculateEfficiencyScore(resCurrent, communityAvgUsage, resSimilar.averageUsage, resPrev);
                residentScores.put(rp.getId(), score);
            }
        }

        List<Map.Entry<Long, Integer>> sortedByScore = residentScores.entrySet().stream()
                .sorted(Map.Entry.<Long, Integer>comparingByValue().reversed())
                .collect(Collectors.toList());

        Integer myRank = null;
        for (int i = 0; i < sortedByScore.size(); i++) {
            if (sortedByScore.get(i).getKey().equals(residentProfile.getId())) {
                myRank = i + 1;
                break;
            }
        }

        // Conservation Badge
        BadgeInfo badgeInfo = determineBadge(efficiencyScore, myCurrentUsage, communityAvgUsage);

        // Dynamic Conservation Tips
        List<String> dynamicTips = generateDynamicTips(
                efficiencyScore, myCurrentUsage, communityAvgUsage, similarResult.averageUsage, myPrevUsage, prevMonthDiffPct
        );

        return PeerBenchmarkingResponse.builder()
                .sufficientData(true)
                .statusMessage("Peer benchmarking active.")
                .currentMonthUsage(Math.round(myCurrentUsage * 10.0) / 10.0)
                .communityAverageUsage(Math.round(communityAvgUsage * 10.0) / 10.0)
                .similarHouseholdAverageUsage(Math.round(similarResult.averageUsage * 10.0) / 10.0)
                .similarHouseholdBasis(similarResult.basisDescription)
                .communityDiffPercentage(communityDiffPct)
                .communityComparisonStatus(communityStatus)
                .previousMonthUsage(Math.round(myPrevUsage * 10.0) / 10.0)
                .previousMonthDiffPercentage(prevMonthDiffPct)
                .previousMonthComparisonStatus(prevMonthStatus)
                .communityRank(myRank)
                .totalHouseholdsInCommunity(residentScores.size())
                .waterEfficiencyScore(efficiencyScore)
                .badgeName(badgeInfo.name)
                .badgeColor(badgeInfo.color)
                .badgeDescription(badgeInfo.description)
                .monthlyTrend(monthlyTrends)
                .dynamicConservationTips(dynamicTips)
                .build();
    }

    private static class SimilarHouseholdResult {
        double averageUsage;
        String basisDescription;

        SimilarHouseholdResult(double averageUsage, String basisDescription) {
            this.averageUsage = averageUsage;
            this.basisDescription = basisDescription;
        }
    }

    private SimilarHouseholdResult calculateSimilarHouseholdAverage(
            ResidentProfile resident,
            List<ResidentProfile> communityResidents,
            Map<Long, Double> currentMonthUsageMap,
            double fallbackCommunityAvg
    ) {
        Unit unit = resident.getUnit();
        if (unit != null) {
            // Priority 1: Occupancy
            if (unit.getOccupancy() != null && unit.getOccupancy() > 0) {
                int targetOccupancy = unit.getOccupancy();
                List<ResidentProfile> matchingOccupancy = communityResidents.stream()
                        .filter(r -> r.getUnit() != null && Objects.equals(r.getUnit().getOccupancy(), targetOccupancy))
                        .collect(Collectors.toList());

                if (!matchingOccupancy.isEmpty()) {
                    double sum = matchingOccupancy.stream()
                            .mapToDouble(r -> currentMonthUsageMap.getOrDefault(r.getId(), 0.0))
                            .sum();
                    return new SimilarHouseholdResult(
                            sum / matchingOccupancy.size(),
                            "Similar Occupancy (" + targetOccupancy + " person" + (targetOccupancy > 1 ? "s" : "") + ")"
                    );
                }
            }

            // Priority 2: Flat Type
            if (unit.getUnitType() != null) {
                UnitType targetType = unit.getUnitType();
                List<ResidentProfile> matchingType = communityResidents.stream()
                        .filter(r -> r.getUnit() != null && r.getUnit().getUnitType() == targetType)
                        .collect(Collectors.toList());

                if (!matchingType.isEmpty()) {
                    double sum = matchingType.stream()
                            .mapToDouble(r -> currentMonthUsageMap.getOrDefault(r.getId(), 0.0))
                            .sum();
                    return new SimilarHouseholdResult(
                            sum / matchingType.size(),
                            "Similar Flat Type (" + targetType.name().replace("_", " ") + ")"
                    );
                }
            }
        }

        // Priority 3: Community Average
        return new SimilarHouseholdResult(fallbackCommunityAvg, "Community Average");
    }

    private int calculateEfficiencyScore(
            double myUsage, double communityAvg, double similarAvg, double prevUsage
    ) {
        if (myUsage == 0.0 && communityAvg == 0.0) {
            return 100;
        }

        // Factor A: vs Community Avg (40%)
        double factorA;
        if (communityAvg <= 0) {
            factorA = 50.0;
        } else {
            double ratioA = myUsage / communityAvg;
            if (ratioA <= 0.7) factorA = 100.0;
            else if (ratioA >= 1.5) factorA = 20.0;
            else factorA = 100.0 - ((ratioA - 0.7) / (1.5 - 0.7)) * 80.0;
        }

        // Factor B: vs Similar Avg (40%)
        double factorB;
        if (similarAvg <= 0) {
            factorB = 50.0;
        } else {
            double ratioB = myUsage / similarAvg;
            if (ratioB <= 0.7) factorB = 100.0;
            else if (ratioB >= 1.5) factorB = 20.0;
            else factorB = 100.0 - ((ratioB - 0.7) / (1.5 - 0.7)) * 80.0;
        }

        // Factor C: MoM Improvement (20%)
        double factorC;
        if (prevUsage <= 0) {
            factorC = 50.0;
        } else {
            double diffRatio = (myUsage - prevUsage) / prevUsage;
            if (diffRatio <= -0.15) factorC = 100.0;
            else if (diffRatio >= 0.20) factorC = 20.0;
            else factorC = 70.0 - (diffRatio * 150.0);
        }

        double score = (factorA * 0.40) + (factorB * 0.40) + (factorC * 0.20);
        int finalScore = (int) Math.round(score);
        return Math.max(0, Math.min(100, finalScore));
    }

    private static class BadgeInfo {
        String name;
        String color;
        String description;

        BadgeInfo(String name, String color, String description) {
            this.name = name;
            this.color = color;
            this.description = description;
        }
    }

    private BadgeInfo determineBadge(int score, double myUsage, double communityAvg) {
        if (score >= 85) {
            return new BadgeInfo(
                    "🌱 Water Saver",
                    "#2e7d32",
                    "Outstanding conservation! Your water usage is significantly lower than average."
            );
        } else if (score >= 65) {
            return new BadgeInfo(
                    "💧 Efficient User",
                    "#0288d1",
                    "Great job! You maintain efficient water consumption habits."
            );
        } else if (score >= 40) {
            return new BadgeInfo(
                    "⚠ Above Average Usage",
                    "#ed6c02",
                    "Your water consumption is above average. Check for small leaks or optimize routines."
            );
        } else {
            return new BadgeInfo(
                    "🚨 High Consumption",
                    "#d32f2f",
                    "High water consumption detected! Inspect fixtures for potential leaks promptly."
            );
        }
    }

    private List<String> generateDynamicTips(
            int score, double myUsage, double communityAvg, double similarAvg, double prevUsage, double prevDiffPct
    ) {
        List<String> tips = new ArrayList<>();

        if (score >= 85) {
            tips.add("🌟 Excellent performance! Share your conservation habits with your community neighbors.");
            tips.add("💧 Maintain low flow aerators on faucets to sustain your top tier efficiency rank.");
        } else if (score >= 65) {
            tips.add("👍 You're doing well! Running full loads in washing machines can boost your score even higher.");
            if (prevDiffPct > 0) {
                tips.add("📈 Your usage slightly increased by " + Math.abs(prevDiffPct) + "% from last month. Consider inspecting shower durations.");
            }
        } else if (score >= 40) {
            tips.add("🚿 Showering for 2 minutes less can reduce your household consumption by up to 15%.");
            tips.add("🚰 Check toilet flapper valves and faucet washers for quiet leaks.");
        } else {
            tips.add("⚠️ High usage alert: Inspect all toilets, faucets, and outdoor spigots for continuous leaks.");
            tips.add("💡 Installing low-flow showerheads can immediately lower monthly consumption by 25%.");
        }

        if (myUsage > similarAvg && similarAvg > 0) {
            tips.add("🏡 Households similar to yours consume " + Math.round(similarAvg * 10.0) / 10.0 + " units on average. You are currently using " + Math.round(myUsage * 10.0) / 10.0 + " units.");
        }

        return tips;
    }
}
