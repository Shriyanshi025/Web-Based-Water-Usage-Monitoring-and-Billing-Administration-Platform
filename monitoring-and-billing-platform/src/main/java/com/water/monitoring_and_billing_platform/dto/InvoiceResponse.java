package com.water.monitoring_and_billing_platform.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class InvoiceResponse {
    private Long id;
    private String invoiceNumber;
    private Long billId;
    private String residentName;
    private String unitNumber;
    private String blockName;
    private String communityName;
    private String billingCycleName;
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private Double previousReading;
    private Double currentReading;
    private Double unitsConsumed;
    private BigDecimal fixedCharge;
    private BigDecimal variableCharge;
    private BigDecimal sharedWaterCost;
    private String distributionStrategy;
    private BigDecimal totalAmount;
    private String billStatus;
    private String paymentStatus;
    private LocalDate generatedDate;
    private LocalDate dueDate;
}
