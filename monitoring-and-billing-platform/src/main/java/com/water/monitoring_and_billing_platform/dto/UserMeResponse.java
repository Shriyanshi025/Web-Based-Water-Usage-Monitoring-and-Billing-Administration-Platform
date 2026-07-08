package com.water.monitoring_and_billing_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserMeResponse {
    private Long id;
    private String fullName;
    private String email;
    private String role;
    private String approvalStatus;
    private boolean active;
    private LocalDateTime lastLogin;
}
