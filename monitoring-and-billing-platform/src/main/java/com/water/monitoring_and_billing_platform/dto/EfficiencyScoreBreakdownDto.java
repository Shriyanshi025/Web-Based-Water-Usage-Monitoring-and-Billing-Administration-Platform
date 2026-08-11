package com.water.monitoring_and_billing_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EfficiencyScoreBreakdownDto {
    private double communityAvgScore;      // Max 40
    private double similarHouseholdScore;  // Max 25
    private double occupancyAdjustmentScore; // Max 15
    private double monthlyImprovementScore; // Max 10
    private double leakPenaltyScore;       // Max 10
    private double totalScore;             // Max 100
}
