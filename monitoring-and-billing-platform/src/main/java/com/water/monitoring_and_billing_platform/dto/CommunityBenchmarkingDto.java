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
public class CommunityBenchmarkingDto {
    private String benchmarkSnapshotId;
    private String benchmarkPeriodLabel;
    private String benchmarkGeneratedAt;
    private String analyticsConfidence; // HIGH, MEDIUM, LOW
    private String confidenceLabel;

    private BenchmarkSummaryDto summary;
    private List<BlockBenchmarkDto> blockBenchmarking;
    private List<HouseholdRankingDto> rankings;
    private List<RankingMovementDto> rankingMovements;
    private List<HouseholdScatterPointDto> scatterPoints;
    private TopPerformersDto topPerformers;
    private HouseholdComparisonDto comparisonA;
    private HouseholdComparisonDto comparisonB;
    private CommunityTrendDto trendAnalysis;
    private List<BenchmarkInsightDto> insights;
    private List<HouseholdOptionDto> householdDropdownOptions;
}
