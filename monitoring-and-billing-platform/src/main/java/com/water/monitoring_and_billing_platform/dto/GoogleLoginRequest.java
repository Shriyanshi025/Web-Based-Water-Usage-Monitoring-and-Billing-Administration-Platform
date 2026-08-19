package com.water.monitoring_and_billing_platform.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GoogleLoginRequest {

    @NotBlank(message = "Google ID Token is required")
    private String idToken;
}
