package com.water.monitoring_and_billing_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvitationDetailsResponse {
    private Long communityId;
    private String communityName;
    private String communityCode;
    private String invitedBy;
    private String residentName;
    private java.time.LocalDateTime expiresAt;
}
