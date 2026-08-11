package com.water.monitoring_and_billing_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HouseholdOptionDto {
    private Long residentProfileId;
    private String flatNumber; // e.g. "Block A - Unit 101"
    private String residentName;
    private String blockName;
}
