package com.water.monitoring_and_billing_platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class WaterMeterRequest {

    @NotBlank(message = "Meter Number is required")
    private String meterNumber;

    @NotNull(message = "Resident Id is required")
    private Long residentProfileId;

    @NotNull(message = "Installation Date is required")
    private LocalDate installationDate;

    @NotNull(message = "Initial Reading is required")
    private Double initialReading;

}
