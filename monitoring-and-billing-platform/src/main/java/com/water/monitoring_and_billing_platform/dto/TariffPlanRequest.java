package com.water.monitoring_and_billing_platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class TariffPlanRequest {

    @NotBlank(message = "Tariff plan name is required.")
    private String name;

    @NotNull(message = "Fixed charge is required.")
    @PositiveOrZero(message = "Fixed charge must be non-negative.")
    private BigDecimal fixedCharge;

    private BigDecimal ratePerUnit;

    private List<TariffSlabRequest> slabs;
}
