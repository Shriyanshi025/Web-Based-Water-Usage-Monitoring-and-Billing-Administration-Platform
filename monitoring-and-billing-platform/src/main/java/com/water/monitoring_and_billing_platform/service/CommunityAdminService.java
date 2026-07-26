package com.water.monitoring_and_billing_platform.service;

import com.water.monitoring_and_billing_platform.dto.*;

import java.util.List;

public interface CommunityAdminService {

    CommunityAdminProfileResponse createAdmin(
            CommunityAdminRegistrationRequest request
    );

    CommunityAdminProfileResponse getAdmin(
            Long id
    );

    List<CommunityAdminProfileResponse> getAllAdmins();

    CommunityAdminProfileResponse updateAdmin(
            Long id,
            CommunityAdminUpdateRequest request
    );

    CommunityAdminProfileResponse updateAdminStatus(
            Long id,
            CommunityAdminStatusUpdateRequest request
    );

    CommunityAdminProfileResponse getSelfProfile(String email);

    CommunityAdminProfileResponse updateSelfProfile(String email, CommunityAdminSelfProfileUpdateRequest request);

}
