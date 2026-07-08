package com.water.monitoring_and_billing_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvitationHistoryResponse {
    private Long invitationId;
    private String email;
    private String mobileNumber;
    private String status;
    private String communityName;
    private String registrationLink;
    private String whatsappShareLink;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
}
