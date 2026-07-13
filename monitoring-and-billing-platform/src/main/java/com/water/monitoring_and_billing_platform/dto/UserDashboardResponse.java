package com.water.monitoring_and_billing_platform.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDashboardResponse {

    private String officialUserId;

    private String residentName;

    private String meterNumber;

    private Double currentReading;

    private Double lastUnitsConsumed;

    private String meterStatus;

}
