package com.water.monitoring_and_billing_platform.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class BulkWaterPurchaseResponse {
    private Long id;
    private String supplierName;
    private Double purchasedVolume;
    private BigDecimal unitCost;
    private BigDecimal totalCost;
    private LocalDate purchaseDate;
    private String notes;
    private String createdBy;
    private Long billingCycleId;
    private String billingCycleName;
    private Long communityId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
