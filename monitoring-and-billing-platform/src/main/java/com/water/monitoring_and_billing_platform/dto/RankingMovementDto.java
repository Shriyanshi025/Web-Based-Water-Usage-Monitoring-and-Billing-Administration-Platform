package com.water.monitoring_and_billing_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RankingMovementDto {
    private Long residentProfileId;
    private String flatNumber;
    private String residentName;
    private String blockName;
    private int previousRank;
    private int currentRank;
    private int rankChange; // e.g. +4, -3
    private String movement; // UP, DOWN, NO_CHANGE
}
