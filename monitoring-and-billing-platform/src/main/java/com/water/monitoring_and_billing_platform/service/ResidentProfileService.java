package com.water.monitoring_and_billing_platform.service;

import com.water.monitoring_and_billing_platform.dto.ResidentProfileRequest;
import com.water.monitoring_and_billing_platform.dto.ResidentProfileResponse;
import com.water.monitoring_and_billing_platform.dto.ResidentSelfProfileUpdateRequest;

import java.util.List;

public interface ResidentProfileService {

    ResidentProfileResponse createResidentProfile(
            ResidentProfileRequest request
    );

    ResidentProfileResponse getResidentById(Long id);

    List<ResidentProfileResponse> getAllResidents();

    ResidentProfileResponse getSelfProfile(String email);

    ResidentProfileResponse updateSelfProfile(String email, ResidentSelfProfileUpdateRequest request);

}