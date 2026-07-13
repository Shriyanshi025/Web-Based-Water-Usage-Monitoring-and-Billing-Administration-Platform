package com.water.monitoring_and_billing_platform.service;

import com.water.monitoring_and_billing_platform.dto.InvitationDetailsResponse;
import com.water.monitoring_and_billing_platform.dto.InvitationHistoryResponse;
import com.water.monitoring_and_billing_platform.dto.ResidentInvitationRequest;
import com.water.monitoring_and_billing_platform.dto.ResidentInvitationResponse;

import java.util.List;

public interface InvitationService {
    ResidentInvitationResponse inviteResident(String email, ResidentInvitationRequest request);
    
    List<InvitationHistoryResponse> getAdminInvitations(String email);
    
    InvitationDetailsResponse validateToken(String token);
}
