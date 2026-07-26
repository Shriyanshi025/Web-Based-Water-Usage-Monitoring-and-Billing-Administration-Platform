package com.water.monitoring_and_billing_platform.controller;

import com.water.monitoring_and_billing_platform.entity.Notification;
import com.water.monitoring_and_billing_platform.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/email-history")
@RequiredArgsConstructor
public class EmailHistoryController {

    private final NotificationRepository notificationRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('COMMUNITY_ADMIN', 'MAIN_ADMIN')")
    public ResponseEntity<?> getEmailHistory() {
        List<Notification> history = notificationRepository.findAllByOrderBySentTimeDesc();
        return ResponseEntity.ok(Map.of("success", true, "data", history));
    }
}
