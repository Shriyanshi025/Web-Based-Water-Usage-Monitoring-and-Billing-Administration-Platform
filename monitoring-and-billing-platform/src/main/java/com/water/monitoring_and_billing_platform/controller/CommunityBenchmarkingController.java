package com.water.monitoring_and_billing_platform.controller;

import com.water.monitoring_and_billing_platform.dto.*;
import com.water.monitoring_and_billing_platform.enums.UnitType;
import com.water.monitoring_and_billing_platform.service.CommunityBenchmarkingService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/community-benchmarking")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CommunityBenchmarkingController {

    private final CommunityBenchmarkingService benchmarkingService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ApiResponse<CommunityBenchmarkingDto>> getDashboard(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String timeWindow,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long billingCycleId,
            @RequestParam(required = false) String blockName,
            @RequestParam(required = false) UnitType unitType,
            @RequestParam(required = false) String badge,
            @RequestParam(required = false) String billStatus,
            @RequestParam(required = false) Double minEfficiency,
            @RequestParam(required = false) Double maxEfficiency,
            @RequestParam(required = false) Boolean leakSuspectedOnly,
            @RequestParam(required = false) Long householdAId,
            @RequestParam(required = false) Long householdBId,
            @RequestParam(required = false) String snapshotId
    ) {
        CommunityBenchmarkingFilterDto filter = CommunityBenchmarkingFilterDto.builder()
                .timeWindow(timeWindow)
                .month(month)
                .year(year)
                .startDate(startDate)
                .endDate(endDate)
                .billingCycleId(billingCycleId)
                .blockName(blockName)
                .unitType(unitType)
                .badge(badge)
                .billStatus(billStatus)
                .minEfficiency(minEfficiency)
                .maxEfficiency(maxEfficiency)
                .leakSuspectedOnly(leakSuspectedOnly)
                .householdAId(householdAId)
                .householdBId(householdBId)
                .snapshotId(snapshotId)
                .build();

        CommunityBenchmarkingDto data = benchmarkingService.getBenchmarkingDashboard(userDetails.getUsername(), filter);

        return ResponseEntity.ok(
                ApiResponse.<CommunityBenchmarkingDto>builder()
                        .success(true)
                        .message("Community Benchmarking analytics fetched successfully.")
                        .data(data)
                        .build()
        );
    }

    @GetMapping("/household/{id}")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ApiResponse<HouseholdDetailDrawerDto>> getHouseholdDetails(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        CommunityBenchmarkingFilterDto filter = CommunityBenchmarkingFilterDto.builder()
                .endDate(endDate)
                .build();

        HouseholdDetailDrawerDto data = benchmarkingService.getHouseholdDetails(userDetails.getUsername(), id, filter);

        return ResponseEntity.ok(
                ApiResponse.<HouseholdDetailDrawerDto>builder()
                        .success(true)
                        .message("Household details snapshot fetched successfully.")
                        .data(data)
                        .build()
        );
    }

    @GetMapping("/comparison")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ApiResponse<java.util.Map<String, HouseholdComparisonDto>>> getComparison(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam Long householdAId,
            @RequestParam Long householdBId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        System.out.println("DEBUG: getComparison endpoint hit with A: " + householdAId + ", B: " + householdBId);
        CommunityBenchmarkingFilterDto filter = CommunityBenchmarkingFilterDto.builder()
                .householdAId(householdAId)
                .householdBId(householdBId)
                .endDate(endDate)
                .build();

        HouseholdComparisonDto compA = benchmarkingService.getHouseholdComparison(userDetails.getUsername(), householdAId, householdBId, filter);
        HouseholdComparisonDto compB = benchmarkingService.getHouseholdComparison(userDetails.getUsername(), householdBId, householdAId, filter);
        System.out.println("DEBUG: compA: " + (compA != null ? compA.getFlatNumber() + " - " + compA.getResidentName() : "NULL"));
        System.out.println("DEBUG: compB: " + (compB != null ? compB.getFlatNumber() + " - " + compB.getResidentName() : "NULL"));

        java.util.Map<String, HouseholdComparisonDto> data = new java.util.HashMap<>();
        data.put("householdA", compA);
        data.put("householdB", compB);

        return ResponseEntity.ok(
                ApiResponse.<java.util.Map<String, HouseholdComparisonDto>>builder()
                        .success(true)
                        .message("Household comparison fetched successfully.")
                        .data(data)
                        .build()
        );
    }

    // ==========================================
    // AI CHATBOT DIRECT REUSE ENDPOINTS
    // ==========================================

    @GetMapping("/top-consumers")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ApiResponse<List<HouseholdRankingDto>>> getTopConsumers(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(
                ApiResponse.<List<HouseholdRankingDto>>builder()
                        .success(true)
                        .message("Top consumers fetched successfully.")
                        .data(benchmarkingService.getTopConsumers(userDetails.getUsername(), limit))
                        .build()
        );
    }

    @GetMapping("/lowest-consumers")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ApiResponse<List<HouseholdRankingDto>>> getLowestConsumers(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(
                ApiResponse.<List<HouseholdRankingDto>>builder()
                        .success(true)
                        .message("Lowest consumers fetched successfully.")
                        .data(benchmarkingService.getLowestConsumers(userDetails.getUsername(), limit))
                        .build()
        );
    }

    @GetMapping("/insights")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ApiResponse<List<BenchmarkInsightDto>>> getInsights(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(
                ApiResponse.<List<BenchmarkInsightDto>>builder()
                        .success(true)
                        .message("Benchmark insights fetched successfully.")
                        .data(benchmarkingService.getBenchmarkInsights(userDetails.getUsername()))
                        .build()
        );
    }

    @GetMapping("/block-summary")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ApiResponse<List<BlockBenchmarkDto>>> getBlockSummary(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(
                ApiResponse.<List<BlockBenchmarkDto>>builder()
                        .success(true)
                        .message("Block benchmarking summary fetched successfully.")
                        .data(benchmarkingService.getBlockSummary(userDetails.getUsername()))
                        .build()
        );
    }
}
