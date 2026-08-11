package com.water.monitoring_and_billing_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BenchmarkSummaryDto {
    private int totalActiveHouseholds;
    private double communityAvgConsumption;
    private double avgEfficiencyScore;
    private String bestBlock;
    private String worstBlock;
    private String mostImprovedHousehold;
    private String highestSpikeHousehold;
    private BigDecimal avgBillAmount;
    private double avgCollectionRate;
}
