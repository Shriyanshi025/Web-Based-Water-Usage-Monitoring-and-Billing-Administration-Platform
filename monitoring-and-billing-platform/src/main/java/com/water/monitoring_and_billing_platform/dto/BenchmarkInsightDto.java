package com.water.monitoring_and_billing_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BenchmarkInsightDto {
    private String id;
    private String category; // EFFICIENCY, BLOCK, LEAK, COLLECTION, TREND
    private String severity; // EXCELLENT (green), NOTICE (yellow), ALERT (red)
    private String title;
    private String message;
    private boolean actionable;
}
