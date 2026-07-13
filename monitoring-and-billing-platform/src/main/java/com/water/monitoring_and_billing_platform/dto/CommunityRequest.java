package com.water.monitoring_and_billing_platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityRequest {

    @NotBlank(message = "Community name is required")
    @Size(min = 3, max = 150, message = "Community name must be between 3 and 150 characters")
    private String communityName;

    @NotBlank(message = "Community code is required")
    @Size(min = 2, max = 10, message = "Community code must be between 2 and 10 characters")
    @Pattern(regexp = "^[A-Z0-9]+$", message = "Community code must contain only uppercase letters and numbers")
    private String communityCode;

    @NotBlank(message = "Address is required")
    @Size(max = 250, message = "Address cannot exceed 250 characters")
    private String address;

    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City cannot exceed 100 characters")
    private String city;

    @NotBlank(message = "State is required")
    @Size(max = 100, message = "State cannot exceed 100 characters")
    private String state;

    @NotBlank(message = "Pincode is required")
    @Size(min = 5, max = 10, message = "Pincode must be between 5 and 10 characters")
    private String pincode;

}
