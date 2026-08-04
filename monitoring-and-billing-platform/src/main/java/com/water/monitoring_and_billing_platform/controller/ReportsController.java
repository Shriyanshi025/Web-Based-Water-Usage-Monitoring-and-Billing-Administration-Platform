package com.water.monitoring_and_billing_platform.controller;

import com.water.monitoring_and_billing_platform.dto.ApiResponse;
import com.water.monitoring_and_billing_platform.dto.ReportAnalyticsDto;
import com.water.monitoring_and_billing_platform.service.ReportsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ReportsController {

    private final ReportsService reportsService;

    @GetMapping("/analytics")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ApiResponse<ReportAnalyticsDto>> getCommunityReportAnalytics(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) Long billingCycleId,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false, defaultValue = "ALL") String reportType
    ) {
        ReportAnalyticsDto data = reportsService.getCommunityReportAnalytics(
                userDetails.getUsername(),
                billingCycleId,
                month,
                year,
                startDate,
                endDate,
                reportType
        );

        return ResponseEntity.ok(
                ApiResponse.<ReportAnalyticsDto>builder()
                        .success(true)
                        .message("Community Report Analytics fetched successfully.")
                        .data(data)
                        .build()
        );
    }
}
