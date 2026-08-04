package com.water.monitoring_and_billing_platform.service;

import com.water.monitoring_and_billing_platform.dto.ReportAnalyticsDto;

import java.time.LocalDate;

public interface ReportsService {
    ReportAnalyticsDto getCommunityReportAnalytics(
            String adminEmail,
            Long billingCycleId,
            Integer month,
            Integer year,
            LocalDate startDate,
            LocalDate endDate,
            String reportType
    );
}
