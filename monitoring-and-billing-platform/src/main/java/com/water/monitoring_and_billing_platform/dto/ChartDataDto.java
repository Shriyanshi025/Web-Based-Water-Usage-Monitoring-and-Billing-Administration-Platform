package com.water.monitoring_and_billing_platform.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChartDataDto {
    private String name;
    private Long value;
}
