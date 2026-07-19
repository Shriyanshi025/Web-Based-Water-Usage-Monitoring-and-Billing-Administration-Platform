package com.water.monitoring_and_billing_platform.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class TariffSlabResponse {
    private Long id;
    private Double minUnits;
    private Double maxUnits;
    private BigDecimal ratePerUnit;
}
