package com.water.monitoring_and_billing_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopPerformersDto {
    private List<HouseholdRankingDto> topSavers;
    private List<HouseholdRankingDto> topHighConsumers;
}
