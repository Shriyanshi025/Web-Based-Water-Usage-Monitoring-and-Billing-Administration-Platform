package com.water.monitoring_and_billing_platform.dto;

import com.water.monitoring_and_billing_platform.enums.ApprovalStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ApprovalRequest {

    @NotNull
    private ApprovalStatus approvalStatus;

}