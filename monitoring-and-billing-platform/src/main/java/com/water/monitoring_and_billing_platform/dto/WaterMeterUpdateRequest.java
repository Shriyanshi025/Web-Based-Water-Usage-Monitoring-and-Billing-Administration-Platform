package com.water.monitoring_and_billing_platform.dto;

import lombok.Data;

@Data
public class WaterMeterUpdateRequest {

    private Long residentProfileId;

    private String meterStatus;

    private Double currentReading;

    private Boolean active;

    private String meterNumber;
}
