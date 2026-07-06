package com.water.monitoring_and_billing_platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ResidentProfileRequest {

    @NotNull(message = "User Id is required")
    private Long userId;

    @NotNull(message = "Community Id is required")
    private Long communityId;

    @NotNull(message = "Block Id is required")
    private Long blockId;

    @NotNull(message = "Unit Id is required")
    private Long unitId;

    @NotBlank(message = "Phone Number is required")
    private String phoneNumber;

}