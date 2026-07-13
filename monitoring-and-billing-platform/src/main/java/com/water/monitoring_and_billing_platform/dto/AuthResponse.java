package com.water.monitoring_and_billing_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {

    private String message;

    private String token;

    private Long userId;

    private String fullName;

    private String email;

    private String role;

    private String approvalStatus;

}
