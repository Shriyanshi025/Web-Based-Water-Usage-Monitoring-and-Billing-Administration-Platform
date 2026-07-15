package com.water.monitoring_and_billing_platform.dto;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class ResidentInvitationRequest {
    @jakarta.validation.constraints.NotBlank(message = "Resident name is required")
    private String residentName;

    @Email(message = "Invalid email format")
    private String email;
    
    private String mobileNumber;
}
