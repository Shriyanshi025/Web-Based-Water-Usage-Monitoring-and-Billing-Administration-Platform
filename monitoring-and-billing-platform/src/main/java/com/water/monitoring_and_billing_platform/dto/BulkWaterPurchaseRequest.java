package com.water.monitoring_and_billing_platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class BulkWaterPurchaseRequest {

    @NotBlank(message = "Source is required.")
    private String source;

    @NotNull(message = "Purchased volume is required.")
    @Positive(message = "Purchased volume must be positive.")
    private Double purchasedVolume;

    @NotNull(message = "Total cost is required.")
    @Positive(message = "Total cost must be positive.")
    private BigDecimal totalCost;

    @NotNull(message = "Purchase date is required.")
    private LocalDate purchaseDate;

    @NotNull(message = "Billing cycle ID is required.")
    private Long billingCycleId;
}
