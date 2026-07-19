package com.water.monitoring_and_billing_platform.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class AlertStatisticsResponse {
    private long totalAlerts;
    private long activeAlerts;
    private long resolvedAlerts;
    private Map<String, Long> alertsByType;
    private Map<String, Long> alertsBySeverity;
    private long alertsToday;
}
