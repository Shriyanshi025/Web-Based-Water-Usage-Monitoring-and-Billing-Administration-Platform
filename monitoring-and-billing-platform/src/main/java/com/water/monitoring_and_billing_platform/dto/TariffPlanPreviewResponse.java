package com.water.monitoring_and_billing_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TariffPlanPreviewResponse {
    private Long planId;
    private String planName;
    private String description;
    private BigDecimal fixedCharge;
    private BigDecimal taxRate;
    private List<PreviewItem> previews;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PreviewItem {
        private double unitsConsumed;
        private BigDecimal waterCharge;
        private BigDecimal fixedCharge;
        private BigDecimal maintenanceCharge;
        private BigDecimal serviceCharge;
        private BigDecimal subtotal;
        private BigDecimal taxRate;
        private BigDecimal taxAmount;
        private BigDecimal totalAmount;
        private String slabBreakdownJson;
    }
}
