package com.water.monitoring_and_billing_platform.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TariffSlabRequest {

    @NotNull(message = "Minimum units is required.")
    @PositiveOrZero(message = "Minimum units must be non-negative.")
    private Double minUnits;

    private Double maxUnits;

    @NotNull(message = "Rate per unit is required.")
    private BigDecimal ratePerUnit;
}
