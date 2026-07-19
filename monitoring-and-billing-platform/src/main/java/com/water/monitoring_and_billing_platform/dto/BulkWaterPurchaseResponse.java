package com.water.monitoring_and_billing_platform.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class BulkWaterPurchaseResponse {
    private Long id;
    private String source;
    private Double purchasedVolume;
    private BigDecimal totalCost;
    private LocalDate purchaseDate;
    private Long billingCycleId;
    private String billingCycleName;
    private Long communityId;
}
