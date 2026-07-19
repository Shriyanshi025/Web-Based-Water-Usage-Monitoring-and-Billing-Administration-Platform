package com.water.monitoring_and_billing_platform.service;

public interface EmailNotificationService {
    void sendAlertEmail(String recipient, String subject, String messageText);
}
