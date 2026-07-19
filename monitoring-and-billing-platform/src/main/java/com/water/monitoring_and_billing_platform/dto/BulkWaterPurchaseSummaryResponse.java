package com.water.monitoring_and_billing_platform.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class BulkWaterPurchaseSummaryResponse {
    private Long billingCycleId;
    private String billingCycleName;
    private Double totalVolume;
    private BigDecimal totalCost;
    private List<BulkWaterPurchaseResponse> purchases;
}
