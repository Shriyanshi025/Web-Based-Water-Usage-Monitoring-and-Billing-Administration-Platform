package com.water.monitoring_and_billing_platform.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class HouseholdCostDistributionResponse {
    private Long residentProfileId;
    private String residentName;
    private String unitNumber;
    private Double consumption;
    private BigDecimal distributedCost;
    private String status;
}
