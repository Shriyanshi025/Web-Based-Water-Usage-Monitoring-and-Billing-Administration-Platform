package com.water.monitoring_and_billing_platform.service;

import java.util.List;

import com.water.monitoring_and_billing_platform.dto.ResidentProfileRequest;
import com.water.monitoring_and_billing_platform.dto.ResidentProfileResponse;
import com.water.monitoring_and_billing_platform.dto.ResidentProfileUpdateRequest;
import com.water.monitoring_and_billing_platform.dto.ResidentSelfProfileUpdateRequest;

public interface ResidentProfileService {

    ResidentProfileResponse createResidentProfile(
            String adminEmail,
            ResidentProfileRequest request
    );

    ResidentProfileResponse getResidentById(String adminEmail, Long id);

    List<ResidentProfileResponse> getAllResidents(String adminEmail);

    ResidentProfileResponse getSelfProfile(String email);

    ResidentProfileResponse updateSelfProfile(String email, ResidentSelfProfileUpdateRequest request);

    ResidentProfileResponse updateResident(String adminEmail, Long residentId, ResidentProfileUpdateRequest request);

    void deleteResident(String adminEmail, Long id);

    List<com.water.monitoring_and_billing_platform.dto.HouseholdDirectoryResponse> getHouseholdDirectory(String adminEmail);

    List<ResidentProfileResponse> getPendingResidents(String adminEmail);

    void approveResident(String adminEmail, Long userId, com.water.monitoring_and_billing_platform.dto.ApprovalRequest request);
}
