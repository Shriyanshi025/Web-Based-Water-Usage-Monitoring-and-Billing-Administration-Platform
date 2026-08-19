package com.water.monitoring_and_billing_platform.controller;

import com.water.monitoring_and_billing_platform.dto.ApiResponse;
import com.water.monitoring_and_billing_platform.dto.ContactRequest;
import jakarta.mail.internet.MimeMessage;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ContactController {

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private final JavaMailSender mailSender;

    @Value("${spring.mail.from:noreply@hydrosync.com}")
    private String fromEmail;

    // Basic anti-spam rate limiting: Map of email address -> last submission timestamp
    private final Map<String, Long> rateLimitCache = new ConcurrentHashMap<>();
    private static final long RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute rate limit

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> sendContactMessage(@Valid @RequestBody ContactRequest request) {
        String senderEmail = request.getEmail().trim().toLowerCase();
        long now = System.currentTimeMillis();

        // Check rate limiting
        if (rateLimitCache.containsKey(senderEmail)) {
            long lastSent = rateLimitCache.get(senderEmail);
            if ((now - lastSent) < RATE_LIMIT_WINDOW_MS) {
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(
                        ApiResponse.<Void>builder()
                                .success(false)
                                .message("You are sending messages too quickly. Please wait 1 minute before trying again.")
                                .build()
                );
            }
        }

        if (mailSender == null) {
            log.warn("SMTP mail sender is not configured (mailSender is null). Message from: {}", senderEmail);
            // Even if SMTP is not configured, we simulate success in development, or throw.
            // As per requirements: "The submission should actually send an email...".
            // Let's log it clearly and return a 500 error if mailSender is missing, or save to logs.
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ApiResponse.<Void>builder()
                            .success(false)
                            .message("Email service is currently unavailable. Please try again later.")
                            .build()
            );
        }

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail, "HydroSync Contact Us Form");
            helper.setTo(fromEmail); // Sends to support/administrator
            helper.setReplyTo(request.getEmail());
            helper.setSubject("Contact Us: " + request.getSubject());

            String htmlBody = "<!DOCTYPE html>" +
                    "<html>" +
                    "<head><meta charset='UTF-8'></head>" +
                    "<body style='font-family: Arial, sans-serif; background-color: #f8fafc; padding: 20px; color: #334155;'>" +
                    "<table style='max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-collapse: collapse; border: 1px solid #e2e8f0;'>" +
                    "<tr><td style='background: #0f172a; padding: 20px; color: #38bdf8; font-weight: bold; font-size: 20px;'>HydroSync Contact Form Submission</td></tr>" +
                    "<tr><td style='padding: 24px;'>" +
                    "<p><strong>Name:</strong> " + request.getName() + "</p>" +
                    "<p><strong>Email:</strong> " + request.getEmail() + "</p>" +
                    "<p><strong>Subject:</strong> " + request.getSubject() + "</p>" +
                    "<hr style='border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;'/>" +
                    "<p><strong>Message:</strong></p>" +
                    "<p style='white-space: pre-wrap; background-color: #f1f5f9; padding: 15px; border-radius: 6px; font-size: 14px; line-height: 1.6;'>" + request.getMessage() + "</p>" +
                    "</td></tr>" +
                    "</table>" +
                    "</body>" +
                    "</html>";

            helper.setText(htmlBody, true);
            mailSender.send(mimeMessage);

            // Record submission time
            rateLimitCache.put(senderEmail, now);
            log.info("Contact form email sent successfully from: {}", senderEmail);

            return ResponseEntity.ok(
                    ApiResponse.<Void>builder()
                            .success(true)
                            .message("Your message has been sent successfully! We will get back to you soon.")
                            .build()
            );
        } catch (Exception e) {
            log.error("Failed to send contact form email from: {}. Error: {}", senderEmail, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ApiResponse.<Void>builder()
                            .success(false)
                            .message("Failed to send message: " + e.getMessage())
                            .build()
            );
        }
    }
}
