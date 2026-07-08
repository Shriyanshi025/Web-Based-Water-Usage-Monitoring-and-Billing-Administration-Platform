package com.water.monitoring_and_billing_platform.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResidentRegistrationRequest {

    @NotBlank
    private String fullName;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    @Size(min = 8, max = 20)
    private String password;

    @NotBlank
    private String phoneNumber;

    @NotNull
    private Long communityId;

    @NotNull
    private Long blockId;

    @NotNull
    private Long unitId;
}