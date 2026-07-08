package com.water.monitoring_and_billing_platform.service;

import com.water.monitoring_and_billing_platform.dto.CommunityAdminProfileResponse;
import com.water.monitoring_and_billing_platform.dto.CommunityAdminRequest;
import com.water.monitoring_and_billing_platform.dto.CommunityAdminResponse;
import com.water.monitoring_and_billing_platform.dto.CommunityAdminSelfProfileUpdateRequest;

import java.util.List;

public interface CommunityAdminService {

    CommunityAdminResponse createAdmin(
            CommunityAdminRequest request
    );

    CommunityAdminResponse getAdmin(
            Long id
    );

    List<CommunityAdminResponse> getAllAdmins();

    CommunityAdminProfileResponse getSelfProfile(String email);

    CommunityAdminProfileResponse updateSelfProfile(String email, CommunityAdminSelfProfileUpdateRequest request);

}