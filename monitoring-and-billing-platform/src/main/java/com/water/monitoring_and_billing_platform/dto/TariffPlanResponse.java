package com.water.monitoring_and_billing_platform.dto;

import com.water.monitoring_and_billing_platform.enums.TariffPolicyStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class TariffPlanResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal ratePerUnit;
    private BigDecimal fixedCharge;
    private BigDecimal taxRate;
    private BigDecimal maintenanceCharge;
    private BigDecimal serviceCharge;
    private boolean active;
    private TariffPolicyStatus policyStatus;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
    private Integer versionNumber;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean usedInBills;
    private long billsCount;
    private LocalDateTime lastUsed;
    private List<TariffSlabResponse> slabs;
}
