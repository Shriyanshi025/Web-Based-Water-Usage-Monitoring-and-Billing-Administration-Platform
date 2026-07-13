package com.water.monitoring_and_billing_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunityAdminProfileResponse {

    private Long id;
    private Long userId;
    private String officialAdminId;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String officeAddress;
    private String communityName;
    private boolean verified;
    private boolean active;

}
