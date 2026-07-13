package com.water.monitoring_and_billing_platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BlockRequest {

    @NotBlank(message = "Block name is required")
    private String blockName;

    @NotNull(message = "Community Id is required")
    private Long communityId;

}
