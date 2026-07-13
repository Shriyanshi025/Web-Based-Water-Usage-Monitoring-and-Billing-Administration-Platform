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
    private Double totalRevenue;
    private java.util.List<MonthlyUsageDto> monthlyWaterUsage;
    private java.util.List<ActivityLogDto> recentActivities;
    private java.util.List<ResidentProfileResponse> pendingResidentsList;
    private java.util.List<ChartDataDto> meterStatusData;
}
