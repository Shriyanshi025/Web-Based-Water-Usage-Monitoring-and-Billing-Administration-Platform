package com.water.monitoring_and_billing_platform.service;

public interface EmailService {
    void sendInvitationEmail(String toEmail, String residentName, String communityName, String invitationLink);
}
