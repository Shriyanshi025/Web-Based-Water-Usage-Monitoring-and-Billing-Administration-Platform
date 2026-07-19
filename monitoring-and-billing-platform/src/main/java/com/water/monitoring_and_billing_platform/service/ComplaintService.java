package com.water.monitoring_and_billing_platform.service;

import com.water.monitoring_and_billing_platform.dto.ComplaintRequest;
import com.water.monitoring_and_billing_platform.dto.ComplaintResponse;
import com.water.monitoring_and_billing_platform.enums.ComplaintCategory;
import com.water.monitoring_and_billing_platform.enums.ComplaintPriority;
import com.water.monitoring_and_billing_platform.enums.ComplaintStatus;

import java.util.List;

public interface ComplaintService {
    ComplaintResponse raiseComplaint(String email, ComplaintRequest request);
    List<ComplaintResponse> getMyComplaints(String email);
    ComplaintResponse getComplaintById(String email, Long id);
    List<ComplaintResponse> getCommunityComplaints(String email);
    List<ComplaintResponse> searchCommunityComplaints(
            String email,
            ComplaintStatus status,
            ComplaintPriority priority,
            ComplaintCategory category,
            String search
    );
    ComplaintResponse updateComplaint(
            String email,
            Long id,
            ComplaintStatus status,
            String remarks,
            Long assignedToUserId
    );
}
