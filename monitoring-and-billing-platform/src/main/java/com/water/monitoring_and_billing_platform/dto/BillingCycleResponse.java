package com.water.monitoring_and_billing_platform.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class BillingCycleResponse {
    private Long id;
    private String name;
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private boolean active;
    private LocalDate generatedAt;
}
