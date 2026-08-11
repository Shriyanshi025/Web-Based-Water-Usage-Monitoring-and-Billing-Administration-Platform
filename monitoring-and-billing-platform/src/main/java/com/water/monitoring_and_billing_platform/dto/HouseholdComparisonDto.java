package com.water.monitoring_and_billing_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HouseholdComparisonDto {
    private Long residentProfileId;
    private String flatNumber;
    private String residentName;
    private String blockName;
    private String unitType;
    private int occupancy;
    private double totalConsumption;
    private double avgMonthlyConsumption;
    private double efficiencyScore;
    private int communityRank;
    private BigDecimal totalBilled;
    private BigDecimal totalPaid;
    private String comparisonPeriodLabel;  // e.g. "Jun 2026" — the normalized period used for BOTH households
    private List<MonthlyUsageDto> monthlyUsage;
    private List<ChartDataDto> monthlyBills;
}
