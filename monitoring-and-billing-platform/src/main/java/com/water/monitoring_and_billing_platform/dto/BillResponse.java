package com.water.monitoring_and_billing_platform.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class BillResponse {
    private Long id;
    private Long residentProfileId;
    private String residentName;
    private String unitNumber;
    private Long billingCycleId;
    private String billingCycleName;
    private Long tariffPlanId;
    private String tariffPlanName;
    private Double unitsConsumed;
    private BigDecimal amount;
    private LocalDate billDate;
    private String status;
}
