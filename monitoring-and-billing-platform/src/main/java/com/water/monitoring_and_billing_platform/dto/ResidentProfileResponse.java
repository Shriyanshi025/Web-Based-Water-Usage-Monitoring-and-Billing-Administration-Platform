package com.water.monitoring_and_billing_platform.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResidentProfileResponse {

    private Long id;

    private Long userId;

    private String officialUserId;

    private String fullName;

    private String email;

    private String phoneNumber;

    private String communityName;

    private String blockName;

    private String unitNumber;

    private String approvalStatus;

    private String meterSerialNumber;

    private boolean verified;

    private boolean active;
}
