package com.water.monitoring_and_billing_platform.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class PaymentStatisticsResponse {
    private long totalPayments;
    private long successfulPayments;
    private long failedPayments;
    private long pendingPayments;
    private BigDecimal totalRevenueCollected;
    private Double successRate;
    private Double failureRate;
    private BigDecimal todaysCollection;
    private BigDecimal monthlyCollection;
}
