package com.water.monitoring_and_billing_platform.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MeterResetLogResponse {
    private Long id;
    private Long meterId;
    private String meterNumber;
    private Long residentId;
    private String residentName;
    private String unitNumber;
    private Double previousReading;
    private Double newReading;
    private LocalDateTime resetDate;
    private String resetBy;
    private String billingCycleName;
    private String reason;
    private String resetType;
}
