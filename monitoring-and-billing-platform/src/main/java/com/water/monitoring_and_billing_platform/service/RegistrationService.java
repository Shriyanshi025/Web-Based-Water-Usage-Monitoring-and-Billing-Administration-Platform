package com.water.monitoring_and_billing_platform.service;

import com.water.monitoring_and_billing_platform.dto.AuthResponse;
import com.water.monitoring_and_billing_platform.dto.CommunityAdminRegistrationRequest;
import com.water.monitoring_and_billing_platform.dto.ResidentRegistrationRequest;

public interface RegistrationService {

    AuthResponse registerResident(
            ResidentRegistrationRequest request
    );

    AuthResponse registerCommunityAdmin(
            CommunityAdminRegistrationRequest request
    );

}
