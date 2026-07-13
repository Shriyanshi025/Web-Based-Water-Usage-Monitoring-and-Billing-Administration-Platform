package com.water.monitoring_and_billing_platform.dto;

import lombok.Data;

@Data
public class ResidentProfileUpdateRequest {

    private String phoneNumber;

    private Boolean verified;

    private Boolean active;

    private String officialUserId;
}
