package com.water.monitoring_and_billing_platform.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResidentDashboardResponse {
    private String fullName;
    private String officialUserId;
    private String communityName;
    private String blockName;
    private String unitNumber;
    private Double currentMonthWaterUsage;
    private Double currentBill;
    private String meterStatus;
    private String meterNumber;
    private java.util.List<ActivityLogDto> recentActivities;
}
