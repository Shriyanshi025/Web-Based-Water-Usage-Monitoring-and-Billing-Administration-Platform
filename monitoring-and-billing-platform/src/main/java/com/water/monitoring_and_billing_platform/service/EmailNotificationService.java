package com.water.monitoring_and_billing_platform.service;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface EmailNotificationService {
    void sendAlertEmail(String recipient, String subject, String messageText);

    void sendBillGeneratedEmail(
            String recipient,
            String residentName,
            String billNumber,
            String billingCycleName,
            Double unitsConsumed,
            BigDecimal totalAmount,
            LocalDate dueDate
    );

    void sendPaymentSuccessEmail(
            String recipient,
            String residentName,
            String billNumber,
            String transactionId,
            BigDecimal amountPaid,
            String paymentDate
    );

    void sendPaymentFailedEmail(
            String recipient,
            String residentName,
            String billNumber,
            BigDecimal amount,
            String failureReason
    );

    void sendBillDueReminderEmail(
            String recipient,
            String residentName,
            String billNumber,
            BigDecimal totalAmount,
            LocalDate dueDate,
            long daysDifference
    );

    void sendLeakAlertEmail(
            String recipient,
            String residentName,
            String meterNumber,
            String unitNumber,
            Double consumptionKL,
            Double thresholdKL
    );

    void sendMeterAlertEmail(
            String recipient,
            String residentName,
            String meterNumber,
            String alertType,
            String severity,
            String messageText
    );

    void sendCommunityAnnouncementEmail(
            String recipient,
            String residentName,
            String communityName,
            String announcementTitle,
            String messageText
    );
}
