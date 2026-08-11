package com.water.monitoring_and_billing_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityTrendDto {
    private List<MonthlyUsageDto> monthlyCommunityAvg;
    private List<MonthlyUsageDto> monthlyHighest;
    private List<MonthlyUsageDto> monthlyLowest;
    private List<AvgVsMedianPointDto> avgVsMedian;
    private List<MonthlyUsageDto> seasonalTrend;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AvgVsMedianPointDto {
        private String label;
        private double average;
        private double median;
    }
}
