package com.water.monitoring_and_billing_platform.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class BillResponse {
    private Long id;
    private String billNumber;
    private Long residentProfileId;
    private String residentName;
    private String unitNumber;
    private Long billingCycleId;
    private String billingCycleName;
    private Integer billingMonth;
    private Integer billingYear;
    private Long tariffPlanId;
    private String tariffPlanName;
    private Double unitsConsumed;
    private Double previousReading;
    private Double currentReading;
    private BigDecimal ratePerUnit;
    private BigDecimal fixedCharge;
    private BigDecimal additionalCharge;
    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal amount;
    private BigDecimal totalAmount;
    private BigDecimal sharedWaterCost;
    private String distributionStrategy;
    private LocalDate billDate;
    private LocalDate generatedDate;
    private LocalDate dueDate;
    private String status;
    private String billStatus;
    private String paymentStatus;
    private String remarks;
}
