package com.water.monitoring_and_billing_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResidentInvitationResponse {
    private Long invitationId;
    private String token;
    private String status;
    private String registrationLink;
    private String whatsappShareLink;
    private String residentName;
    private String email;
    private String mobileNumber;
    private java.time.LocalDateTime expiresAt;
}
