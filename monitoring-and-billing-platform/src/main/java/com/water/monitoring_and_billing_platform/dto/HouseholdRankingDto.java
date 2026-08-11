package com.water.monitoring_and_billing_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HouseholdRankingDto {
    private int rank;
    private Long residentProfileId;
    private String blockName;
    private String unitNumber;
    private String flatNumber;
    private String residentName;
    private int occupancy;
    private double currentMonthUsage;
    private double communityAvg;
    private double communityAvgDiffPercent;
    private double efficiencyScore;
    private String badge; // TOP_SAVER, AVERAGE, HIGH_CONSUMER
    private String billStatus; // PAID, UNPAID, OVERDUE, PARTIAL
    private String trend; // UP, DOWN, STABLE
    private double trendChangePercent;
    private boolean leakSuspected;
}
