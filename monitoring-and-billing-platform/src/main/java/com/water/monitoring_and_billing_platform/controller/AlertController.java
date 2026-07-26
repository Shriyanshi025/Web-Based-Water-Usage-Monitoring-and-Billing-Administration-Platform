package com.water.monitoring_and_billing_platform.controller;

import com.water.monitoring_and_billing_platform.dto.ApiResponse;
import com.water.monitoring_and_billing_platform.dto.AlertResponse;
import com.water.monitoring_and_billing_platform.dto.AlertStatisticsResponse;
import com.water.monitoring_and_billing_platform.dto.SystemAnnouncementRequest;
import com.water.monitoring_and_billing_platform.service.AlertService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AlertController {

    private final AlertService alertService;

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<AlertResponse>>> getMyAlerts(@AuthenticationPrincipal UserDetails userDetails) {
        List<AlertResponse> alerts = alertService.getMyAlerts(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.<List<AlertResponse>>builder()
                .success(true)
                .message("My alerts retrieved successfully")
                .data(alerts)
                .build());
    }

    @PostMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(@AuthenticationPrincipal UserDetails userDetails) {
        alertService.markAllAsRead(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("All alerts marked as read")
                .build());
    }

    @GetMapping("/community/me")
    @PreAuthorize("hasAnyRole('COMMUNITY_ADMIN', 'MAIN_ADMIN')")
    public ResponseEntity<ApiResponse<List<AlertResponse>>> getMyCommunityAlerts(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        List<AlertResponse> alerts = alertService.getCommunityAlerts(userDetails.getUsername(), null);
        return ResponseEntity.ok(ApiResponse.<List<AlertResponse>>builder()
                .success(true)
                .message("Community alerts retrieved successfully")
                .data(alerts)
                .build());
    }

    @GetMapping("/community/{communityId}")
    @PreAuthorize("hasAnyRole('COMMUNITY_ADMIN', 'MAIN_ADMIN')")
    public ResponseEntity<ApiResponse<List<AlertResponse>>> getCommunityAlerts(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String communityId
    ) {
        Long id = null;
        if (communityId != null && !"me".equalsIgnoreCase(communityId)) {
            try {
                id = Long.parseLong(communityId);
            } catch (NumberFormatException ignored) {}
        }
        List<AlertResponse> alerts = alertService.getCommunityAlerts(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.<List<AlertResponse>>builder()
                .success(true)
                .message("Community alerts retrieved successfully")
                .data(alerts)
                .build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<AlertResponse>> getAlertById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        AlertResponse alert = alertService.getAlertById(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.<AlertResponse>builder()
                .success(true)
                .message("Alert retrieved successfully")
                .data(alert)
                .build());
    }

    @PostMapping("/{id}/read")
    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<AlertResponse>> markAsRead(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        AlertResponse alert = alertService.markAsRead(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.<AlertResponse>builder()
                .success(true)
                .message("Alert marked as read")
                .data(alert)
                .build());
    }

    @PostMapping("/{id}/acknowledge")
    @PutMapping("/{id}/acknowledge")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<AlertResponse>> acknowledgeAlert(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        AlertResponse alert = alertService.acknowledgeAlert(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.<AlertResponse>builder()
                .success(true)
                .message("Alert acknowledged successfully")
                .data(alert)
                .build());
    }

    @PostMapping("/{id}/resolve")
    @PutMapping("/{id}/resolve")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<AlertResponse>> resolveAlert(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        AlertResponse alert = alertService.resolveAlert(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.<AlertResponse>builder()
                .success(true)
                .message("Alert marked as resolved")
                .data(alert)
                .build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteAlert(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        alertService.deleteAlert(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Alert deleted successfully")
                .build());
    }

    @PostMapping("/bulk-read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> bulkMarkAsRead(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody List<Long> ids
    ) {
        alertService.bulkMarkAsRead(userDetails.getUsername(), ids);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Selected alerts marked as read")
                .build());
    }

    @PostMapping("/bulk-delete")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> bulkDelete(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody List<Long> ids
    ) {
        alertService.bulkDelete(userDetails.getUsername(), ids);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Selected alerts deleted successfully")
                .build());
    }

    @PostMapping("/announcement")
    @PreAuthorize("hasAnyRole('COMMUNITY_ADMIN', 'MAIN_ADMIN')")
    public ResponseEntity<ApiResponse<AlertResponse>> createSystemAnnouncement(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody SystemAnnouncementRequest request
    ) {
        AlertResponse announcement = alertService.createSystemAnnouncement(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<AlertResponse>builder()
                .success(true)
                .message("System announcement created successfully")
                .data(announcement)
                .build());
    }

    @GetMapping("/statistics")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<AlertStatisticsResponse>> getStatistics(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        AlertStatisticsResponse stats = alertService.getStatistics(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.<AlertStatisticsResponse>builder()
                .success(true)
                .message("Alert statistics retrieved successfully")
                .data(stats)
                .build());
    }
}
