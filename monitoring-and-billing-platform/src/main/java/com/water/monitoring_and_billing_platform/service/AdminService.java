package com.water.monitoring_and_billing_platform.service;

import com.water.monitoring_and_billing_platform.dto.ApprovalRequest;
import com.water.monitoring_and_billing_platform.dto.CommunityAdminProfileResponse;
import com.water.monitoring_and_billing_platform.dto.ResidentProfileResponse;
import com.water.monitoring_and_billing_platform.dto.UserMeResponse;

import java.util.List;

public interface AdminService {

    void approveUser(
            Long userId,
            ApprovalRequest request
    );

    void deleteUser(Long userId);

    List<UserMeResponse> getPendingUsers();

    List<UserMeResponse> getApprovedUsers();

    List<UserMeResponse> getRejectedUsers();

    List<ResidentProfileResponse> getPendingResidents();

    List<CommunityAdminProfileResponse> getPendingCommunityAdmins();

}
