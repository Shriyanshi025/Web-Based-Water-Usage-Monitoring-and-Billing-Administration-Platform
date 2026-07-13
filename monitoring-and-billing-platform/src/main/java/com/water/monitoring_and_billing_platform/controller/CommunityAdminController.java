package com.water.monitoring_and_billing_platform.controller;

import com.water.monitoring_and_billing_platform.dto.*;
import com.water.monitoring_and_billing_platform.service.CommunityAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/community-admins")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CommunityAdminController {

    private final CommunityAdminService service;

    @PostMapping
    @PreAuthorize("hasRole('MAIN_ADMIN')")
    public ResponseEntity<ApiResponse<CommunityAdminResponse>> create(
            @Valid @RequestBody CommunityAdminRequest request) {

        return ResponseEntity.ok(
                ApiResponse.<CommunityAdminResponse>builder()
                        .success(true)
                        .message("Community Admin created successfully.")
                        .data(service.createAdmin(request))
                        .build()
        );

    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('MAIN_ADMIN')")
    public ResponseEntity<ApiResponse<CommunityAdminProfileResponse>> get(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ApiResponse.<CommunityAdminProfileResponse>builder()
                        .success(true)
                        .message("Community Admin fetched successfully.")
                        .data(service.getAdmin(id))
                        .build()
        );

    }

    @GetMapping
    @PreAuthorize("hasRole('MAIN_ADMIN')")
    public ResponseEntity<ApiResponse<List<CommunityAdminProfileResponse>>> getAll() {

        return ResponseEntity.ok(
                ApiResponse.<List<CommunityAdminProfileResponse>>builder()
                        .success(true)
                        .message("Community Admin list fetched successfully.")
                        .data(service.getAllAdmins())
                        .build()
        );

    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MAIN_ADMIN')")
    public ResponseEntity<ApiResponse<CommunityAdminProfileResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody CommunityAdminUpdateRequest request) {

        return ResponseEntity.ok(
                ApiResponse.<CommunityAdminProfileResponse>builder()
                        .success(true)
                        .message("Community Admin updated successfully.")
                        .data(service.updateAdmin(id, request))
                        .build()
        );

    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('MAIN_ADMIN')")
    public ResponseEntity<ApiResponse<CommunityAdminProfileResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody CommunityAdminStatusUpdateRequest request) {

        return ResponseEntity.ok(
                ApiResponse.<CommunityAdminProfileResponse>builder()
                        .success(true)
                        .message("Community Admin status updated successfully.")
                        .data(service.updateAdminStatus(id, request))
                        .build()
        );

    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ApiResponse<CommunityAdminProfileResponse>> getSelfProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        return ResponseEntity.ok(
                ApiResponse.<CommunityAdminProfileResponse>builder()
                        .success(true)
                        .message("Self profile fetched successfully.")
                        .data(service.getSelfProfile(userDetails.getUsername()))
                        .build()
        );
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ApiResponse<CommunityAdminProfileResponse>> updateSelfProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CommunityAdminSelfProfileUpdateRequest request) {
        
        return ResponseEntity.ok(
                ApiResponse.<CommunityAdminProfileResponse>builder()
                        .success(true)
                        .message("Self profile updated successfully.")
                        .data(service.updateSelfProfile(userDetails.getUsername(), request))
                        .build()
        );
    }

}
