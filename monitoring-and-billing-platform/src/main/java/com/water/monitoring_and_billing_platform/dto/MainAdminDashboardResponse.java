package com.water.monitoring_and_billing_platform.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MainAdminDashboardResponse {
    private Long totalCommunities;
    private Long totalCommunityAdmins;
    private Long pendingCommunityAdmins;
    private Long totalResidents;
    private Double totalWaterConsumption;
    private Double totalRevenue;
    private java.util.List<MonthlyUsageDto> monthlyWaterConsumptionChart;
    private java.util.List<ActivityLogDto> recentActivities;
    private java.util.List<ChartDataDto> communityGrowth;
    private java.util.List<CommunityAdminProfileResponse> pendingApprovals;
}
