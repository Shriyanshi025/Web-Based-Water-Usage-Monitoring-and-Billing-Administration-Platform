package com.water.monitoring_and_billing_platform.controller;

import com.water.monitoring_and_billing_platform.dto.ApiResponse;
import com.water.monitoring_and_billing_platform.dto.CommunityAdminRequest;
import com.water.monitoring_and_billing_platform.dto.CommunityAdminResponse;
import com.water.monitoring_and_billing_platform.dto.CommunityAdminProfileResponse;
import com.water.monitoring_and_billing_platform.dto.CommunityAdminSelfProfileUpdateRequest;
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
    public ResponseEntity<ApiResponse<CommunityAdminResponse>> get(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ApiResponse.<CommunityAdminResponse>builder()
                        .success(true)
                        .message("Community Admin fetched successfully.")
                        .data(service.getAdmin(id))
                        .build()
        );

    }

    @GetMapping
    @PreAuthorize("hasRole('MAIN_ADMIN')")
    public ResponseEntity<ApiResponse<List<CommunityAdminResponse>>> getAll() {

        return ResponseEntity.ok(
                ApiResponse.<List<CommunityAdminResponse>>builder()
                        .success(true)
                        .message("Community Admin list fetched successfully.")
                        .data(service.getAllAdmins())
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