package com.water.monitoring_and_billing_platform.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {

    private Long totalCommunities;

    private Long totalBlocks;

    private Long totalUnits;

    private Long totalResidents;

    private Long totalWaterMeters;

    private Long totalWaterReadings;

}
