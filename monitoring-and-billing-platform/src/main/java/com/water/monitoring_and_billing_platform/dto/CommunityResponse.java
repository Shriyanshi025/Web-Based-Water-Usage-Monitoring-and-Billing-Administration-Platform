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
public class CommunityResponse {

    private Long id;
    private String communityName;
    private String communityCode;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
