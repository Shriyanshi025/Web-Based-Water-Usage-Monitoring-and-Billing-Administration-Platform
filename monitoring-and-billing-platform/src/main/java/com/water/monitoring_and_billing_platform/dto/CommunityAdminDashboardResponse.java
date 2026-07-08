package com.water.monitoring_and_billing_platform.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunityAdminDashboardResponse {
    private String communityName;
    private Long totalResidents;
    private Long pendingResidents;
    private Long totalWaterMeters;
    private Long activeWaterMeters;
    private Double totalWaterUsage;
    private Double pendingBills;
}
