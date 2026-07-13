package com.water.monitoring_and_billing_platform.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CommunityAdminStatusUpdateRequest {

    @NotNull(message = "Active status is required")
    private Boolean active;

}
