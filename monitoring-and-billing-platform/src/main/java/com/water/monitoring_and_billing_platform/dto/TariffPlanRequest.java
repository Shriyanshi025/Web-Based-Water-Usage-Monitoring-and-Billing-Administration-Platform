package com.water.monitoring_and_billing_platform.dto;

import com.water.monitoring_and_billing_platform.enums.TariffPolicyStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class TariffPlanRequest {

    @NotBlank(message = "Tariff plan name is required.")
    private String name;

    @NotNull(message = "Fixed charge is required.")
    @PositiveOrZero(message = "Fixed charge must be non-negative.")
    private BigDecimal fixedCharge;

    private BigDecimal ratePerUnit;

    /** Tax rate as decimal, e.g. 0.05 = 5% GST. Null uses system default 5%. */
    @PositiveOrZero
    private BigDecimal taxRate;

    /** Optional flat maintenance charge per bill. */
    @PositiveOrZero
    private BigDecimal maintenanceCharge;

    /** Optional flat service charge per bill. */
    @PositiveOrZero
    private BigDecimal serviceCharge;

    private String description;

    private TariffPolicyStatus policyStatus;

    private LocalDate effectiveFrom;

    private LocalDate effectiveTo;

    private List<TariffSlabRequest> slabs;
}
