package com.water.monitoring_and_billing_platform.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UnitResponse {

    private Long id;

    private String unitNumber;

    private String unitType;

    private Integer floorNumber;

    private String communityName;

    private String blockName;

    private boolean active;
}