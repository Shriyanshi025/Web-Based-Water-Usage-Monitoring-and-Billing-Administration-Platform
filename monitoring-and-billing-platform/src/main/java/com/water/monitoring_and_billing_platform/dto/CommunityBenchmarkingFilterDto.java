package com.water.monitoring_and_billing_platform.dto;

import com.water.monitoring_and_billing_platform.enums.UnitType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityBenchmarkingFilterDto {
    private String timeWindow; // CURRENT_MONTH, PREVIOUS_MONTH, LAST_3_MONTHS, LAST_6_MONTHS, LAST_12_MONTHS, CUSTOM
    private Integer month;
    private Integer year;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long billingCycleId;
    private String blockName;
    private UnitType unitType;
    private String badge; // TOP_SAVER, AVERAGE, HIGH_CONSUMER
    private String billStatus; // PAID, UNPAID, OVERDUE
    private Double minEfficiency;
    private Double maxEfficiency;
    private Boolean leakSuspectedOnly;
    private Long householdAId;
    private Long householdBId;
    private String snapshotId;
}
