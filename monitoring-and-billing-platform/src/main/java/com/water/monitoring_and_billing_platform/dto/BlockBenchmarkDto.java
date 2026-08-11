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
public class BlockBenchmarkDto {
    private Long blockId;
    private String blockName;
    private int totalHouseholds;
    private int activeMetersCount;
    private double totalConsumption;
    private double avgConsumptionPerHousehold;
    private double waterLossVolume;
    private double waterLossPercentage;
    private double blockEfficiencyScore;
    private double collectionRate;
    private BigDecimal avgBillAmount;
    private BigDecimal totalBilledAmount;
    private BigDecimal totalPaidAmount;
    private int complaintCount;
    private int leakCount;
}
