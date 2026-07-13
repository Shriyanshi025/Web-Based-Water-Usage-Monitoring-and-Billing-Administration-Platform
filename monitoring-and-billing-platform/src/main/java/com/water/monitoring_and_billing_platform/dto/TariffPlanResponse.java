package com.water.monitoring_and_billing_platform.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class TariffPlanResponse {
    private Long id;
    private String name;
    private BigDecimal ratePerUnit;
    private BigDecimal fixedCharge;
    private boolean active;
}
