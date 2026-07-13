package com.water.monitoring_and_billing_platform.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class GenerateBillRequest {
    @NotNull(message = "Billing cycle id is required")
    private Long billingCycleId;

    @NotNull(message = "Tariff plan id is required")
    private Long tariffPlanId;
}
