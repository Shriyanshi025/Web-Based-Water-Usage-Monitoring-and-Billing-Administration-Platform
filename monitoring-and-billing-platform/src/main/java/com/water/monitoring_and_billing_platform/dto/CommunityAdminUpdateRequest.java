package com.water.monitoring_and_billing_platform.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CommunityAdminUpdateRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Phone number is required")
    private String phoneNumber;

    private String officeAddress;
}
