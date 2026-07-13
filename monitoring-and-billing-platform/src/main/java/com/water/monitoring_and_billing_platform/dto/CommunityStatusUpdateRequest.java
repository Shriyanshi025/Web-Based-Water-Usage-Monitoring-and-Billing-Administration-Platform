package com.water.monitoring_and_billing_platform.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommunityStatusUpdateRequest {

    @NotNull(message = "Active status is required")
    private Boolean active;

}
