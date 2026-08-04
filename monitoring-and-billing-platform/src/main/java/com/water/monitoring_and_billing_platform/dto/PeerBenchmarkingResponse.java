package com.water.monitoring_and_billing_platform.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PeerBenchmarkingResponse {

    private boolean sufficientData; // true if household has recorded meter readings for benchmarking
    private String statusMessage;   // e.g. "Benchmark will be available after sufficient meter readings are recorded."

    private Double currentMonthUsage;
    private Double communityAverageUsage;
    private Double similarHouseholdAverageUsage;
    private String similarHouseholdBasis; // e.g. "Occupancy (3 persons)", "Flat Type (FLAT)", "Community Average"
    
    private Double communityDiffPercentage;
    private String communityComparisonStatus; // "BELOW_AVERAGE", "ABOVE_AVERAGE", "EQUAL"

    private Double previousMonthUsage;
    private Double previousMonthDiffPercentage;
    private String previousMonthComparisonStatus; // "DECREASED", "INCREASED", "NO_CHANGE"

    private Integer communityRank;
    private Integer totalHouseholdsInCommunity;

    private Integer waterEfficiencyScore; // 0 to 100
    private String badgeName; // 🌱 Water Saver, 💧 Efficient User, ⚠ Above Average Usage, 🚨 High Consumption
    private String badgeColor; // hex or theme color token
    private String badgeDescription;

    private List<MonthlyUsageDTO> monthlyTrend;
    private List<String> dynamicConservationTips;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthlyUsageDTO {
        private String monthName; // e.g. "Jan 2026"
        private Double residentUsage;
        private Double communityAverage;
    }
}
