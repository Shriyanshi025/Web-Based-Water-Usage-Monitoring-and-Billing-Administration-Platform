package com.water.monitoring_and_billing_platform.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WaterUsageResponse {

    private Long id;

    private String meterNumber;

    private String officialUserId;

    private Double previousReading;

    private Double currentReading;

    private Double unitsConsumed;

    private LocalDate readingDate;

}