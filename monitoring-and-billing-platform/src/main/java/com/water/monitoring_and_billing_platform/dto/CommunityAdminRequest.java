package com.water.monitoring_and_billing_platform.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CommunityAdminRequest {

    @NotBlank(message = "Community Name is required")
    private String communityName;

    @NotBlank(message = "Community Code is required")
    private String communityCode;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "Pincode is required")
    private String pincode;

}