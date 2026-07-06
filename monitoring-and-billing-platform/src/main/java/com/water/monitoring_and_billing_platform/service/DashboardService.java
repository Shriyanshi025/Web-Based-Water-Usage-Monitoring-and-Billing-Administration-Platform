package com.water.monitoring_and_billing_platform.service;

import com.water.monitoring_and_billing_platform.dto.*;

public interface DashboardService {

    DashboardResponse getMainAdminDashboard();

    CommunityDashboardResponse getCommunityDashboard(Long communityId);

    UserDashboardResponse getUserDashboard(Long residentId);

}