package com.water.monitoring_and_billing_platform.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AlertResponse {
    private Long id;
    private String alertNumber;
    private String alertType;
    private String severity;
    private String title;
    private String message;
    private Long residentId;
    private String residentName;
    private Long communityId;
    private String communityName;
    private Long waterMeterId;
    private Long billingCycleId;
    private Long relatedBillId;
    private String status;
    private LocalDateTime createdDate;
    private LocalDateTime resolvedDate;
    private Long recipientId;
    private String targetRoute;
}
