package com.water.monitoring_and_billing_platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class BillingCycleRequest {

    @NotBlank(message = "Billing cycle name is required.")
    private String name;

    @NotNull(message = "Period start date is required.")
    private LocalDate periodStart;

    @NotNull(message = "Period end date is required.")
    private LocalDate periodEnd;
}
