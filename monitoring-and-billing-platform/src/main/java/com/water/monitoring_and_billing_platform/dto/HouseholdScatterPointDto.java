package com.water.monitoring_and_billing_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HouseholdScatterPointDto {
    private Long residentProfileId;
    private String flatNumber;
    private String blockName;
    private int occupancy;
    private double consumption;
    private double efficiencyScore;
    private boolean leakSuspected;
}
