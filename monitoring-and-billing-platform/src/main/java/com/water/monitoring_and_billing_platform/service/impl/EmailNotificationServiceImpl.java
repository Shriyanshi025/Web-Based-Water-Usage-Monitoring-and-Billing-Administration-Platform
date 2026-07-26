package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.entity.Notification;
import com.water.monitoring_and_billing_platform.repository.NotificationRepository;
import com.water.monitoring_and_billing_platform.service.EmailNotificationService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationServiceImpl implements EmailNotificationService {

    private final NotificationRepository notificationRepository;
    private final com.water.monitoring_and_billing_platform.repository.EmailPreferenceRepository emailPreferenceRepository;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.from:noreply@hydrosync.com}")
    private String fromEmail;

    @Value("${app.email.enabled:true}")
    private boolean emailEnabled;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    // Rate Limiting & Duplicate Protection: In-memory sliding window cache (Recipient + Key -> Expiry Epoch MS)
    private final Map<String, Long> duplicateProtectionCache = new ConcurrentHashMap<>();
    private static final long DUP_WINDOW_MS = 5 * 60 * 1000; // 5 minutes duplicate protection

    private boolean isDuplicateEvent(String recipient, String emailType, String eventKey) {
        String cacheKey = recipient + ":" + emailType + ":" + eventKey;
        long now = System.currentTimeMillis();

        if (duplicateProtectionCache.size() > 500) {
            duplicateProtectionCache.entrySet().removeIf(e -> e.getValue() < now);
        }

        Long lastSent = duplicateProtectionCache.get(cacheKey);
        if (lastSent != null && (now - lastSent) < DUP_WINDOW_MS) {
            log.warn("Duplicate email suppressed for recipient: {}, EmailType: {}, Key: {}", recipient, emailType, eventKey);
            return true;
        }

        duplicateProtectionCache.put(cacheKey, now);
        return false;
    }

    private boolean isEmailAllowed(String recipient, String emailType, String eventKey, String subject, String messageText) {
        Optional<com.water.monitoring_and_billing_platform.entity.EmailPreference> prefOpt = emailPreferenceRepository.findByUserEmail(recipient);
        if (prefOpt.isPresent()) {
            com.water.monitoring_and_billing_platform.entity.EmailPreference pref = prefOpt.get();
            boolean allowed = true;
            if (("BILL_GENERATED".equals(emailType) || "PAYMENT_SUCCESS".equals(emailType) || "PAYMENT_FAILED".equals(emailType)) && !pref.isBillEmails()) {
                allowed = false;
            } else if (("LEAK_ALERT".equals(emailType) || "METER_ALERT".equals(emailType) || "GENERIC_ALERT".equals(emailType) || "HIGH_CONSUMPTION".equals(emailType)) && !pref.isAlertEmails()) {
                allowed = false;
            } else if ("DUE_REMINDER".equals(emailType) && !pref.isReminderEmails()) {
                allowed = false;
            } else if ("ANNOUNCEMENT".equals(emailType) && !pref.isAnnouncementEmails()) {
                allowed = false;
            }

            if (!allowed) {
                log.info("Email suppressed by user preference for recipient: {}, EmailType: {}", recipient, emailType);
                notificationRepository.save(Notification.builder()
                        .recipient(recipient)
                        .channel("EMAIL")
                        .emailType(emailType)
                        .subject(subject != null ? subject : emailType)
                        .message(messageText != null ? messageText : emailType)
                        .status("DISABLED_BY_USER")
                        .sentTime(LocalDateTime.now())
                        .failureReason("Suppressed by user email preferences")
                        .build());
                return false;
            }
        }

        if (isDuplicateEvent(recipient, emailType, eventKey)) {
            notificationRepository.save(Notification.builder()
                    .recipient(recipient)
                    .channel("EMAIL")
                    .emailType(emailType)
                    .subject(subject != null ? subject : emailType)
                    .message(messageText != null ? messageText : emailType)
                    .status("SUPPRESSED")
                    .sentTime(LocalDateTime.now())
                    .failureReason("Suppressed by duplicate event protection window")
                    .build());
            return false;
        }

        return true;
    }

    @Override
    @Async
    @Transactional
    public void sendAlertEmail(String recipient, String subject, String messageText) {
        if (!isEmailAllowed(recipient, "GENERIC_ALERT", subject, subject, messageText)) return;
        String htmlBody = buildHtmlContainer("System Alert Notification", subject,
                "<p style='font-size:15px; color:#334155; line-height:1.6;'>" + messageText + "</p>",
                "View Notification", frontendUrl + "/user/notifications");
        dispatchEmail(recipient, subject, messageText, htmlBody, "GENERIC_ALERT");
    }

    @Override
    @Async
    @Transactional
    public void sendBillGeneratedEmail(String recipient, String residentName, String billNumber, String billingCycleName, Double unitsConsumed, BigDecimal totalAmount, LocalDate dueDate) {
        String subject = "New Water Bill Generated - #" + billNumber;
        String body = "Dear " + (residentName != null ? residentName : "Resident") + ",\n\n" +
                "Your water usage bill for " + billingCycleName + " has been generated.\n" +
                "Bill Number: " + billNumber + "\n" +
                "Units Consumed: " + unitsConsumed + " kL\n" +
                "Total Amount: ₹" + totalAmount + "\n" +
                "Due Date: " + dueDate + "\n\n" +
                "Please pay before the due date to avoid overdue charges.";

        if (!isEmailAllowed(recipient, "BILL_GENERATED", billNumber, subject, body)) return;

        String cardHtml = "<table style='width:100%; border-collapse:collapse; margin:20px 0; background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0; font-size:14px;'>" +
                "<tr><td style='padding:12px; border-bottom:1px solid #e2e8f0; color:#64748b;'>Bill Number</td><td style='padding:12px; border-bottom:1px solid #e2e8f0; font-weight:bold; color:#0f172a;'>" + billNumber + "</td></tr>" +
                "<tr><td style='padding:12px; border-bottom:1px solid #e2e8f0; color:#64748b;'>Billing Period</td><td style='padding:12px; border-bottom:1px solid #e2e8f0; font-weight:bold; color:#0f172a;'>" + billingCycleName + "</td></tr>" +
                "<tr><td style='padding:12px; border-bottom:1px solid #e2e8f0; color:#64748b;'>Water Consumption</td><td style='padding:12px; border-bottom:1px solid #e2e8f0; font-weight:bold; color:#0284c7;'>" + unitsConsumed + " kL</td></tr>" +
                "<tr><td style='padding:12px; border-bottom:1px solid #e2e8f0; color:#64748b;'>Total Payable</td><td style='padding:12px; border-bottom:1px solid #e2e8f0; font-weight:bold; color:#16a34a; font-size:16px;'>₹" + totalAmount + "</td></tr>" +
                "<tr><td style='padding:12px; color:#64748b;'>Due Date</td><td style='padding:12px; font-weight:bold; color:#dc2626;'>" + dueDate + "</td></tr>" +
                "</table>";

        String htmlBody = buildHtmlContainer("Water Bill Statement", "Bill Generated for " + billingCycleName,
                "<p style='font-size:15px; color:#334155;'>Dear <strong>" + (residentName != null ? residentName : "Resident") + "</strong>,</p>" +
                        "<p style='font-size:14px; color:#475569;'>Your water bill for cycle <strong>" + billingCycleName + "</strong> is ready. Please find the statement details below:</p>" +
                        cardHtml, "Pay Bill Now", frontendUrl + "/user/bills");

        dispatchEmail(recipient, subject, body, htmlBody, "BILL_GENERATED");
    }

    @Override
    @Async
    @Transactional
    public void sendPaymentSuccessEmail(String recipient, String residentName, String billNumber, String transactionId, BigDecimal amountPaid, String paymentDate) {
        String subject = "Payment Receipt - Bill #" + billNumber;
        String body = "Dear " + (residentName != null ? residentName : "Resident") + ",\n\n" +
                "Payment received successfully for Bill #" + billNumber + ".\n" +
                "Amount Paid: ₹" + amountPaid + "\n" +
                "Transaction Reference: " + transactionId + "\n" +
                "Payment Date: " + paymentDate + "\n\nThank you!";

        if (!isEmailAllowed(recipient, "PAYMENT_SUCCESS", billNumber + ":" + transactionId, subject, body)) return;

        String cardHtml = "<table style='width:100%; border-collapse:collapse; margin:20px 0; background:#f0fdf4; border-radius:8px; border:1px solid #bbf7d0; font-size:14px;'>" +
                "<tr><td style='padding:12px; border-bottom:1px solid #bbf7d0; color:#166534;'>Bill Number</td><td style='padding:12px; border-bottom:1px solid #bbf7d0; font-weight:bold; color:#14532d;'>" + billNumber + "</td></tr>" +
                "<tr><td style='padding:12px; border-bottom:1px solid #bbf7d0; color:#166534;'>Amount Paid</td><td style='padding:12px; border-bottom:1px solid #bbf7d0; font-weight:bold; color:#16a34a; font-size:16px;'>₹" + amountPaid + "</td></tr>" +
                "<tr><td style='padding:12px; border-bottom:1px solid #bbf7d0; color:#166534;'>Txn Reference</td><td style='padding:12px; border-bottom:1px solid #bbf7d0; font-weight:bold; color:#0f172a; font-family:monospace;'>" + transactionId + "</td></tr>" +
                "<tr><td style='padding:12px; color:#166534;'>Date Paid</td><td style='padding:12px; font-weight:bold; color:#0f172a;'>" + paymentDate + "</td></tr>" +
                "</table>";

        String htmlBody = buildHtmlContainer("Payment Confirmation", "Payment Received Successfully",
                "<p style='font-size:15px; color:#334155;'>Dear <strong>" + (residentName != null ? residentName : "Resident") + "</strong>,</p>" +
                        "<p style='font-size:14px; color:#475569;'>We have successfully processed your payment for Bill <strong>#" + billNumber + "</strong>.</p>" +
                        cardHtml, "View Payment History", frontendUrl + "/user/payments");

        dispatchEmail(recipient, subject, body, htmlBody, "PAYMENT_SUCCESS");
    }

    @Override
    @Async
    @Transactional
    public void sendPaymentFailedEmail(String recipient, String residentName, String billNumber, BigDecimal amount, String failureReason) {
        String subject = "Payment Failure Notification - Bill #" + billNumber;
        String body = "Dear " + (residentName != null ? residentName : "Resident") + ",\n\n" +
                "Your payment attempt for Bill #" + billNumber + " (₹" + amount + ") was unsuccessful.\n" +
                "Reason: " + failureReason + "\n\nPlease try again.";

        if (!isEmailAllowed(recipient, "PAYMENT_FAILED", billNumber, subject, body)) return;

        String cardHtml = "<table style='width:100%; border-collapse:collapse; margin:20px 0; background:#fef2f2; border-radius:8px; border:1px solid #fecaca; font-size:14px;'>" +
                "<tr><td style='padding:12px; border-bottom:1px solid #fecaca; color:#991b1b;'>Bill Number</td><td style='padding:12px; border-bottom:1px solid #fecaca; font-weight:bold; color:#7f1d1d;'>" + billNumber + "</td></tr>" +
                "<tr><td style='padding:12px; border-bottom:1px solid #fecaca; color:#991b1b;'>Attempted Amount</td><td style='padding:12px; border-bottom:1px solid #fecaca; font-weight:bold; color:#dc2626;'>₹" + amount + "</td></tr>" +
                "<tr><td style='padding:12px; color:#991b1b;'>Failure Reason</td><td style='padding:12px; font-weight:bold; color:#dc2626;'>" + failureReason + "</td></tr>" +
                "</table>";

        String htmlBody = buildHtmlContainer("Payment Notice", "Payment Attempt Failed",
                "<p style='font-size:15px; color:#334155;'>Dear <strong>" + (residentName != null ? residentName : "Resident") + "</strong>,</p>" +
                        "<p style='font-size:14px; color:#475569;'>Your recent payment attempt for Bill <strong>#" + billNumber + "</strong> could not be completed.</p>" +
                        cardHtml, "Retry Payment", frontendUrl + "/user/bills");

        dispatchEmail(recipient, subject, body, htmlBody, "PAYMENT_FAILED");
    }

    @Override
    @Async
    @Transactional
    public void sendBillDueReminderEmail(String recipient, String residentName, String billNumber, BigDecimal totalAmount, LocalDate dueDate, long daysDifference) {
        String statusText = daysDifference > 0 ? "is OVERDUE by " + daysDifference + " days" : "is due on " + dueDate;
        String subject = "Water Bill Reminder - #" + billNumber;
        String body = "Dear " + (residentName != null ? residentName : "Resident") + ",\n\n" +
                "This is a reminder that your bill #" + billNumber + " (₹" + totalAmount + ") " + statusText + ".\n" +
                "Please submit payment promptly.";

        if (!isEmailAllowed(recipient, "DUE_REMINDER", billNumber + ":" + dueDate, subject, body)) return;

        String htmlBody = buildHtmlContainer("Bill Due Reminder", "Water Bill Payment Reminder",
                "<p style='font-size:15px; color:#334155;'>Dear <strong>" + (residentName != null ? residentName : "Resident") + "</strong>,</p>" +
                        "<p style='font-size:14px; color:#475569;'>Your water bill <strong>#" + billNumber + "</strong> for amount <strong>₹" + totalAmount + "</strong> " + statusText + ".</p>",
                "Pay Bill", frontendUrl + "/user/bills");

        dispatchEmail(recipient, subject, body, htmlBody, "DUE_REMINDER");
    }

    @Override
    @Async
    @Transactional
    public void sendLeakAlertEmail(String recipient, String residentName, String meterNumber, String unitNumber, Double consumptionKL, Double thresholdKL) {
        String subject = "URGENT: Suspected Water Leak Detected - Meter #" + meterNumber;
        String body = "URGENT ALERT\n\nContinuous continuous consumption has been detected on water meter " + meterNumber + " (Unit " + unitNumber + ").\n" +
                "Current Flow Rate: " + consumptionKL + " kL (Threshold: " + thresholdKL + " kL).\n" +
                "Please inspect your plumbing fixtures immediately.";

        if (!isEmailAllowed(recipient, "LEAK_ALERT", meterNumber, subject, body)) return;

        String htmlBody = buildHtmlContainer("Urgent Water Alert", "Suspected Water Leak Detected",
                "<p style='font-size:15px; color:#334155;'>Dear <strong>" + (residentName != null ? residentName : "Resident") + "</strong>,</p>" +
                        "<p style='font-size:14px; color:#dc2626; font-weight:bold;'>Continuous abnormal water consumption has been detected on your meter <strong>" + meterNumber + "</strong> (Unit " + unitNumber + ").</p>" +
                        "<p style='font-size:14px; color:#475569;'>Recorded flow: <strong>" + consumptionKL + " kL</strong> (Threshold: " + thresholdKL + " kL). Please check all open taps, toilets, and pipelines immediately.</p>",
                "Check Meter Usage", frontendUrl + "/user/usage");

        dispatchEmail(recipient, subject, body, htmlBody, "LEAK_ALERT");
    }

    @Override
    @Async
    @Transactional
    public void sendMeterAlertEmail(String recipient, String residentName, String meterNumber, String alertType, String severity, String messageText) {
        String subject = "Water Meter Incident: " + alertType.replace("_", " ") + " - Meter #" + meterNumber;
        String body = "Meter Alert: " + alertType + "\nSeverity: " + severity + "\nMeter: " + meterNumber + "\nMessage: " + messageText;

        if (!isEmailAllowed(recipient, "METER_ALERT", meterNumber + ":" + alertType, subject, body)) return;

        String htmlBody = buildHtmlContainer("Meter System Alert", alertType.replace("_", " "),
                "<p style='font-size:15px; color:#334155;'>Dear <strong>" + (residentName != null ? residentName : "Resident") + "</strong>,</p>" +
                        "<p style='font-size:14px; color:#475569;'>An incident has been logged for meter <strong>" + meterNumber + "</strong>:</p>" +
                        "<p style='font-size:14px; color:#0f172a; font-weight:bold; background:#f1f5f9; padding:12px; border-radius:6px;'>" + messageText + "</p>",
                "Inspect Meter Details", frontendUrl + "/user/meter");

        dispatchEmail(recipient, subject, body, htmlBody, "METER_ALERT");
    }

    @Override
    @Async
    @Transactional
    public void sendCommunityAnnouncementEmail(String recipient, String residentName, String communityName, String announcementTitle, String messageText) {
        String subject = communityName + " Announcement: " + announcementTitle;
        String body = "Community Announcement from " + communityName + "\n\n" + announcementTitle + "\n\n" + messageText;

        if (!isEmailAllowed(recipient, "ANNOUNCEMENT", announcementTitle, subject, body)) return;

        String htmlBody = buildHtmlContainer("Community Notice", announcementTitle,
                "<p style='font-size:15px; color:#334155;'>Dear <strong>" + (residentName != null ? residentName : "Resident") + "</strong>,</p>" +
                        "<p style='font-size:14px; color:#475569;'>" + messageText + "</p>",
                "Open HydroSync Dashboard", frontendUrl + "/user");

        dispatchEmail(recipient, subject, body, htmlBody, "ANNOUNCEMENT");
    }

    // Master dispatcher handling MIME HTML + Plain Text, error logging, and Notification persistence
    public void dispatchEmail(String recipient, String subject, String plainText, String htmlText, String emailType) {
        log.info("Dispatching email notification to: {}, Type: {}, Subject: {}", recipient, emailType, subject);

        Notification notification = Notification.builder()
                .recipient(recipient)
                .channel("EMAIL")
                .emailType(emailType)
                .subject(subject)
                .message(plainText)
                .status("SENT")
                .sentTime(LocalDateTime.now())
                .build();

        if (!emailEnabled) {
            log.info("Email delivery is dormant (app.email.enabled=false). Persisting notification record to DB.");
            notificationRepository.save(notification);
            return;
        }

        if (mailSender == null) {
            log.warn("SMTP JavaMailSender bean is not active. Persisting notification record to DB.");
            notificationRepository.save(notification);
            return;
        }

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(recipient);
            helper.setSubject(subject);
            helper.setText(plainText, htmlText);

            mailSender.send(mimeMessage);
            log.info("HTML Email dispatched successfully to: {}", recipient);
            notificationRepository.save(notification);
        } catch (Exception e) {
            log.error("Failed to deliver email to: {}. Error: {}", recipient, e.getMessage());
            notification.setStatus("FAILED");
            notification.setFailureReason(e.getMessage());
            notificationRepository.save(notification);
        }
    }

    // Shared HydroSync branded HTML Email Builder
    private String buildHtmlContainer(String badgeTitle, String headerTitle, String contentBodyHtml, String ctaText, String ctaUrl) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'></head>" +
                "<body style='font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif; background-color:#f1f5f9; margin:0; padding:20px;'>" +
                "<table style='max-width:600px; margin:0 auto; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 15px rgba(0,0,0,0.08); border-collapse:collapse;'>" +
                "<tr><td style='background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding:28px; text-align:left; border-bottom:3px solid #0284c7;'>" +
                "<table style='width:100%;'><tr>" +
                "<td><span style='color:#38bdf8; font-weight:800; font-size:22px; letter-spacing:-0.5px;'>HydroSync</span><span style='color:#94a3b8; font-size:12px; display:block; margin-top:2px;'>Water Usage Administration</span></td>" +
                "<td style='text-align:right;'><span style='background:rgba(2, 132, 199, 0.2); color:#38bdf8; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; border:1px solid rgba(56, 189, 248, 0.3);'>" + badgeTitle + "</span></td>" +
                "</tr></table>" +
                "</td></tr>" +
                "<tr><td style='padding:32px; color:#334155;'>" +
                "<h2 style='color:#0f172a; font-size:20px; font-weight:700; margin-top:0; margin-bottom:16px;'>" + headerTitle + "</h2>" +
                contentBodyHtml +
                (ctaText != null && ctaUrl != null ?
                        "<div style='margin-top:28px; margin-bottom:12px; text-align:center;'>" +
                                "<a href='" + ctaUrl + "' style='background-color:#0284c7; color:#ffffff; padding:12px 26px; border-radius:8px; text-decoration:none; font-weight:600; font-size:14px; display:inline-block; box-shadow:0 2px 6px rgba(2,132,199,0.3);'> " + ctaText + " →</a>" +
                                "</div>" : "") +
                "</td></tr>" +
                "<tr><td style='background-color:#f8fafc; padding:20px; text-align:center; border-top:1px solid #e2e8f0; font-size:12px; color:#94a3b8;'>" +
                "<p style='margin:0 0 6px 0;'>HydroSync Billing Platform • Automated System Notification</p>" +
                "<p style='margin:0;'>Please do not reply directly to this automated email.</p>" +
                "</td></tr>" +
                "</table>" +
                "</body>" +
                "</html>";
    }
}
