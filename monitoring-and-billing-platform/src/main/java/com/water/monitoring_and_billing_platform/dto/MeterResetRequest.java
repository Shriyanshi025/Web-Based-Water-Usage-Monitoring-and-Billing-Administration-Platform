package com.water.monitoring_and_billing_platform.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MeterResetRequest {

    @NotNull(message = "Resident Profile ID is required")
    private Long residentProfileId;

    private String reason;
}
