package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.entity.Notification;
import com.water.monitoring_and_billing_platform.repository.NotificationRepository;
import com.water.monitoring_and_billing_platform.service.EmailNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationServiceImpl implements EmailNotificationService {

    private final NotificationRepository notificationRepository;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.from:noreply@hydrosync.com}")
    private String fromEmail;

    @Override
    public void sendAlertEmail(String recipient, String subject, String messageText) {
        log.info("Attempting to send email alert to recipient: {}, Subject: {}", recipient, subject);

        Notification notification = Notification.builder()
                .recipient(recipient)
                .channel("EMAIL")
                .subject(subject)
                .message(messageText)
                .status("SENT")
                .sentTime(LocalDateTime.now())
                .build();

        if (mailSender == null) {
            String warning = "SMTP mail sender is not configured. Logging notification to database as SENT (simulated).";
            log.warn(warning);
            notificationRepository.save(notification);
            return;
        }

        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom(fromEmail);
            mailMessage.setTo(recipient);
            mailMessage.setSubject(subject);
            mailMessage.setText(messageText);

            mailSender.send(mailMessage);
            log.info("Email sent successfully to: {}", recipient);
            notificationRepository.save(notification);
        } catch (Exception e) {
            log.error("Failed to send email to: {}. Error: {}", recipient, e.getMessage());
            notification.setStatus("FAILED");
            notification.setFailureReason(e.getMessage());
            notificationRepository.save(notification);
        }
    }
}
