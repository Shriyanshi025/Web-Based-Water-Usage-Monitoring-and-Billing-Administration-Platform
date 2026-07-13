package com.water.monitoring_and_billing_platform.dto;

import com.water.monitoring_and_billing_platform.enums.UnitType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UnitRequest {

    @NotBlank(message = "Unit Number is required")
    private String unitNumber;

    @NotNull(message = "Unit Type is required")
    private UnitType unitType;

    @NotNull(message = "Floor Number is required")
    private Integer floorNumber;

    @NotNull(message = "Community Id is required")
    private Long communityId;

    @NotNull(message = "Block Id is required")
    private Long blockId;
}
