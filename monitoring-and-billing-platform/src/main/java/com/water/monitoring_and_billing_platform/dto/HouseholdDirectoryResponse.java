package com.water.monitoring_and_billing_platform.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HouseholdDirectoryResponse {
    private Long residentId;
    private String residentName;
    private String unitNumber;
    private String meterNumber;
    private Double currentReading;
    private int pendingBillsCount;
    private BigDecimal pendingBillsAmount;
}
