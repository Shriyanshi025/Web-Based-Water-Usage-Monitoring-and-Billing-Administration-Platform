package com.water.monitoring_and_billing_platform.service;

public interface WhatsAppService {
    void sendInvitationMessage(String toMobileNumber, String residentName, String communityName, String invitationLink);
}
