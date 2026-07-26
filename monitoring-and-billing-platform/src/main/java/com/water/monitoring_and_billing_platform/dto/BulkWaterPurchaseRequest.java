package com.water.monitoring_and_billing_platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class BulkWaterPurchaseRequest {

    @NotBlank(message = "Supplier name is required.")
    private String supplierName;

    @NotNull(message = "Purchased volume is required.")
    @Positive(message = "Purchased volume must be positive.")
    private Double purchasedVolume;

    @NotNull(message = "Unit cost is required.")
    @Positive(message = "Unit cost must be positive.")
    private BigDecimal unitCost;

    private String notes;

    @NotNull(message = "Purchase date is required.")
    private LocalDate purchaseDate;

    @NotNull(message = "Billing cycle ID is required.")
    private Long billingCycleId;
}
