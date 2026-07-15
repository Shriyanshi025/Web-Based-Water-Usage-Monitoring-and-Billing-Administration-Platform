package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailServiceImpl implements EmailService {

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.from}")
    private String fromEmail;

    @Override
    public void sendInvitationEmail(String toEmail, String residentName, String communityName, String invitationLink) {
        if (mailSender == null) {
            String errorMsg = "SMTP mail sender is not configured (mailSender bean is null).";
            log.error(errorMsg);
            throw new IllegalStateException(errorMsg);
        }

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail, "HydroSync Platform");
            helper.setTo(toEmail);
            helper.setSubject("Invitation to Join " + communityName + " on HydroSync");

            String htmlName = (residentName != null && !residentName.trim().isEmpty()) ? residentName : "Resident";

            String htmlContent = "<!DOCTYPE html>\n" +
                    "<html>\n" +
                    "<head>\n" +
                    "    <meta charset=\"utf-8\">\n" +
                    "    <title>Invitation to Join HydroSync</title>\n" +
                    "</head>\n" +
                    "<body style=\"font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #333;\">\n" +
                    "    <table align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"600\" style=\"background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.08); overflow: hidden; border: 1px solid #e1e4e8;\">\n" +
                    "        <!-- Header -->\n" +
                    "        <tr>\n" +
                    "            <td style=\"background-color: #2563EB; padding: 30px; text-align: center; color: #ffffff;\">\n" +
                    "                <h1 style=\"margin: 0; font-size: 24px; font-weight: 600;\">HydroSync</h1>\n" +
                    "                <p style=\"margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;\">Water Monitoring & Billing Platform</p>\n" +
                    "            </td>\n" +
                    "        </tr>\n" +
                    "        <!-- Content -->\n" +
                    "        <tr>\n" +
                    "            <td style=\"padding: 40px 30px;\">\n" +
                    "                <p style=\"font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;\">Hello <strong>" + htmlName + "</strong>,</p>\n" +
                    "                <p style=\"font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;\">You have been invited to join the community <strong>" + communityName + "</strong> on the <strong>HydroSync</strong> Water Monitoring Platform.</p>\n" +
                    "                <p style=\"font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;\">Please click the button below to register your account and set up your profile. This invitation will expire in 48 hours.</p>\n" +
                    "                \n" +
                    "                <!-- Action Button -->\n" +
                    "                <table align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin: 0 auto 30px auto;\">\n" +
                    "                    <tr>\n" +
                    "                        <td align=\"center\" style=\"background-color: #2563EB; border-radius: 4px;\">\n" +
                    "                            <a href=\"" + invitationLink + "\" target=\"_blank\" style=\"display: inline-block; padding: 12px 24px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 4px; border: 1px solid #2563EB;\">Register Now</a>\n" +
                    "                        </td>\n" +
                    "                    </tr>\n" +
                    "                </table>\n" +
                    "\n" +
                    "                <hr style=\"border: 0; border-top: 1px solid #e1e4e8; margin: 30px 0;\">\n" +
                    "\n" +
                    "                <p style=\"font-size: 14px; color: #666; margin: 0 0 10px 0;\">If the button above does not work, you can copy and paste the following link directly into your browser:</p>\n" +
                    "                <p style=\"font-size: 14px; word-break: break-all; margin: 0; color: #2563EB;\"><a href=\"" + invitationLink + "\" target=\"_blank\" style=\"color: #2563EB; text-decoration: underline;\">" + invitationLink + "</a></p>\n" +
                    "            </td>\n" +
                    "        </tr>\n" +
                    "        <!-- Footer -->\n" +
                    "        <tr>\n" +
                    "            <td style=\"background-color: #f8fafc; padding: 20px 30px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e1e4e8;\">\n" +
                    "                <p style=\"margin: 0 0 5px 0;\">&copy; 2026 HydroSync Water Monitoring Platform. All rights reserved.</p>\n" +
                    "            </td>\n" +
                    "        </tr>\n" +
                    "    </table>\n" +
                    "</body>\n" +
                    "</html>";

            helper.setText(htmlContent, true);
            mailSender.send(mimeMessage);
            log.info("Invitation HTML email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send invitation HTML email to: {}. Error: {}", toEmail, e.getMessage());
            throw new RuntimeException("Email delivery failed: " + e.getMessage(), e);
        }
    }
}
