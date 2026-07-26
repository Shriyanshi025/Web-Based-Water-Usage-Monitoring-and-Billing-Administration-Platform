package com.water.monitoring_and_billing_platform.controller;

import com.water.monitoring_and_billing_platform.dto.EmailPreferenceDto;
import com.water.monitoring_and_billing_platform.entity.EmailPreference;
import com.water.monitoring_and_billing_platform.entity.User;
import com.water.monitoring_and_billing_platform.repository.EmailPreferenceRepository;
import com.water.monitoring_and_billing_platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/email-preferences")
@RequiredArgsConstructor
public class EmailPreferenceController {

    private final EmailPreferenceRepository emailPreferenceRepository;
    private final UserRepository userRepository;

    @GetMapping
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> getPreferences(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));

        EmailPreference pref = emailPreferenceRepository.findByUserId(user.getId())
                .orElseGet(() -> emailPreferenceRepository.save(EmailPreference.builder()
                        .user(user)
                        .billEmails(true)
                        .alertEmails(true)
                        .reminderEmails(true)
                        .announcementEmails(true)
                        .build()));

        EmailPreferenceDto dto = EmailPreferenceDto.builder()
                .billEmails(pref.isBillEmails())
                .alertEmails(pref.isAlertEmails())
                .reminderEmails(pref.isReminderEmails())
                .announcementEmails(pref.isAnnouncementEmails())
                .build();

        return ResponseEntity.ok(Map.of("success", true, "data", dto));
    }

    @PutMapping
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> updatePreferences(Authentication authentication, @RequestBody EmailPreferenceDto request) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));

        EmailPreference pref = emailPreferenceRepository.findByUserId(user.getId())
                .orElseGet(() -> EmailPreference.builder().user(user).build());

        pref.setBillEmails(request.isBillEmails());
        pref.setAlertEmails(request.isAlertEmails());
        pref.setReminderEmails(request.isReminderEmails());
        pref.setAnnouncementEmails(request.isAnnouncementEmails());

        pref = emailPreferenceRepository.save(pref);

        EmailPreferenceDto dto = EmailPreferenceDto.builder()
                .billEmails(pref.isBillEmails())
                .alertEmails(pref.isAlertEmails())
                .reminderEmails(pref.isReminderEmails())
                .announcementEmails(pref.isAnnouncementEmails())
                .build();

        return ResponseEntity.ok(Map.of("success", true, "message", "Email preferences updated successfully.", "data", dto));
    }
}
