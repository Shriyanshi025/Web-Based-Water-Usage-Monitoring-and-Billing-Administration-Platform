package com.water.monitoring_and_billing_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportAnalyticsDto {

    private String communityName;
    private String generatedAt;

    // KPI Summary
    private Double totalWaterPurchased;
    private Double totalWaterConsumed;
    private Double totalWaterLoss;
    private Double collectionEfficiencyPercentage;
    private Double totalRevenueGenerated;
    private Double totalRevenueCollected;
    private Double totalRevenuePending;

    // Chart 1 & 2: Monthly Purchase vs Consumption & Water Loss Analysis
    private List<MonthlyWaterBalanceDto> waterBalanceTrend;

    // Chart 3: Revenue Collection Trend
    private List<MonthlyRevenueTrendDto> revenueTrend;

    // Chart 4: Bill Payment Status Breakdown
    private Map<String, Long> billPaymentStatusCounts;

    // Chart 5: Complaint Analytics
    private Map<String, Long> complaintStatusCounts;

    // Chart 6: Meter Reading Completion
    private MeterCompletionDto meterCompletion;

    // Chart 7 & 8: Top 10 Consumers
    private List<ConsumerUsageDto> topHighestConsumers;
    private List<ConsumerUsageDto> topLowestConsumers;

    // Chart 9: Community Benchmark Summary
    private BenchmarkSummaryDto benchmarkSummary;

    // Table Data
    private List<ResidentSummaryDto> residentSummaries;
    private List<BillSummaryDto> billSummaries;
    private List<ComplaintSummaryDto> complaintSummaries;
    private List<BlockPerformanceDto> blockPerformances;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthlyWaterBalanceDto {
        private String month;
        private Double purchased;
        private Double consumed;
        private Double loss;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthlyRevenueTrendDto {
        private String month;
        private Double generated;
        private Double collected;
        private Double pending;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MeterCompletionDto {
        private Long completedReadings;
        private Long pendingReadings;
        private Double completionPercentage;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ConsumerUsageDto {
        private String residentName;
        private String flatNumber;
        private Double unitsConsumed;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BenchmarkSummaryDto {
        private Double averageScore;
        private String bestPerformingBlock;
        private String worstPerformingBlock;
        private Double averageRank;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ResidentSummaryDto {
        private String officialUserId;
        private String name;
        private String email;
        private String block;
        private String unit;
        private String meterNumber;
        private Double currentReading;
        private String status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BillSummaryDto {
        private String billNumber;
        private String residentName;
        private String flatNumber;
        private String billingPeriod;
        private Double unitsConsumed;
        private Double totalAmount;
        private String status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ComplaintSummaryDto {
        private String ticketNumber;
        private String residentName;
        private String category;
        private String priority;
        private String status;
        private String createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BlockPerformanceDto {
        private String blockName;
        private Long totalUnitsCount;
        private Double totalConsumption;
        private Double averageConsumptionPerUnit;
    }
}
