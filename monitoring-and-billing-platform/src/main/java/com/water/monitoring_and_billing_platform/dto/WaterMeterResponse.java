package com.water.monitoring_and_billing_platform.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WaterMeterResponse {

    private Long id;

    private String meterNumber;

    private String officialUserId;

    private String residentName;

    private Double initialReading;

    private Double currentReading;

    private String meterStatus;

    private LocalDate installationDate;

    private boolean active;

}
