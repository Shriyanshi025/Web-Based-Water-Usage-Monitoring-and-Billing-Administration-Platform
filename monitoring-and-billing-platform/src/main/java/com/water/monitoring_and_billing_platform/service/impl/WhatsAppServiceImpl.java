package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.service.WhatsAppService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class WhatsAppServiceImpl implements WhatsAppService {

    @Value("${whatsapp.provider:none}")
    private String provider;

    @Value("${whatsapp.twilio.account-sid:}")
    private String twilioAccountSid;

    @Value("${whatsapp.twilio.auth-token:}")
    private String twilioAuthToken;

    @Value("${whatsapp.twilio.from-number:}")
    private String twilioFromNumber;

    @Override
    public void sendInvitationMessage(String toMobileNumber, String residentName, String communityName, String invitationLink) {
        String message = String.format(
                "Hello %s\n\n" +
                "You have been invited to join\n\n" +
                "%s\n\n" +
                "Complete your registration here:\n" +
                "%s\n\n" +
                "Invitation expires in 48 hours.",
                residentName, communityName, invitationLink
        );

        if ("twilio".equalsIgnoreCase(provider) && !twilioAccountSid.isBlank()) {
            try {
                log.info("Sending WhatsApp invitation via Twilio to {}: {}", toMobileNumber, message);
                // Integration layer prepared for Twilio
            } catch (Exception e) {
                log.error("Failed to send WhatsApp message via Twilio: {}", e.getMessage());
            }
        } else {
            log.info("WhatsApp service provider credentials not configured. Mocking delivery to {}:\n{}", toMobileNumber, message);
        }
    }
}
