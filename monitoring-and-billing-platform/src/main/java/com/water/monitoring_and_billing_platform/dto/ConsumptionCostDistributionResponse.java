package com.water.monitoring_and_billing_platform.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class ConsumptionCostDistributionResponse {
    private Long billingCycleId;
    private String billingCycleName;
    private BigDecimal totalBulkCost;
    private Double totalCommunityConsumption;
    private BigDecimal costPerKl;
    private List<HouseholdCostDistributionResponse> distributions;
}
