package com.water.monitoring_and_billing_platform.service;

import com.water.monitoring_and_billing_platform.dto.*;

public interface DashboardService {

    DashboardResponse getMainAdminDashboard();

    CommunityAdminResponse getCommunityDashboard(Long communityId);

    UserDashboardResponse getUserDashboard(Long residentId);

    ResidentDashboardResponse getResidentDashboard(String email);

    CommunityAdminDashboardResponse getCommunityAdminDashboard(String email);

    MainAdminDashboardResponse getMainAdminDashboardData();

}