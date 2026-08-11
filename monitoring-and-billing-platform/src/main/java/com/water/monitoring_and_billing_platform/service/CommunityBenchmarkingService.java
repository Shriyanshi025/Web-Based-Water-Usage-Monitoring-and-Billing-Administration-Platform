package com.water.monitoring_and_billing_platform.service;

import com.water.monitoring_and_billing_platform.dto.*;

import java.util.List;

public interface CommunityBenchmarkingService {

    CommunityBenchmarkingDto getBenchmarkingDashboard(String adminEmail, CommunityBenchmarkingFilterDto filter);

    HouseholdDetailDrawerDto getHouseholdDetails(String adminEmail, Long residentProfileId, CommunityBenchmarkingFilterDto filter);

    HouseholdComparisonDto getHouseholdComparison(String adminEmail, Long householdAId, Long householdBId, CommunityBenchmarkingFilterDto filter);

    // AI Chatbot Direct Query Endpoints
    List<HouseholdRankingDto> getTopConsumers(String adminEmail, int limit);

    List<HouseholdRankingDto> getLowestConsumers(String adminEmail, int limit);

    List<BenchmarkInsightDto> getBenchmarkInsights(String adminEmail);

    List<BlockBenchmarkDto> getBlockSummary(String adminEmail);
}
