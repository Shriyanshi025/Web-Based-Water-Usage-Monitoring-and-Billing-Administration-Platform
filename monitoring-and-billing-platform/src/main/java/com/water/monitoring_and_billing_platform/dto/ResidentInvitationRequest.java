package com.water.monitoring_and_billing_platform.dto;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class ResidentInvitationRequest {
    @Email
    private String email;
    
    private String mobileNumber;
}
