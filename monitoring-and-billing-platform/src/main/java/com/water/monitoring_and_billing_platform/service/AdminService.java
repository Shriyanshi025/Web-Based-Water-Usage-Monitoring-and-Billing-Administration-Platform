package com.water.monitoring_and_billing_platform.service;

import com.water.monitoring_and_billing_platform.dto.ApprovalRequest;
import com.water.monitoring_and_billing_platform.entity.CommunityAdminProfile;
import com.water.monitoring_and_billing_platform.entity.ResidentProfile;
import com.water.monitoring_and_billing_platform.entity.User;

import java.util.List;

public interface AdminService {

    void approveUser(
            Long userId,
            ApprovalRequest request
    );

    List<User> getPendingUsers();

    List<User> getApprovedUsers();

    List<User> getRejectedUsers();

    List<ResidentProfile> getPendingResidents();

    List<CommunityAdminProfile> getPendingCommunityAdmins();

}