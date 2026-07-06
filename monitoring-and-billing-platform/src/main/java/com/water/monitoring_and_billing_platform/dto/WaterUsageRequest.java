package com.water.monitoring_and_billing_platform.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class WaterUsageRequest {

    @NotNull
    private Long waterMeterId;

    @NotNull
    private Double currentReading;

    @NotNull
    private LocalDate readingDate;

}