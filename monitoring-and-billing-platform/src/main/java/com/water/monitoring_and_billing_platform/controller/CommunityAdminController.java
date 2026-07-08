package com.water.monitoring_and_billing_platform.controller;

import com.water.monitoring_and_billing_platform.dto.ApiResponse;
import com.water.monitoring_and_billing_platform.dto.CommunityAdminRequest;
import com.water.monitoring_and_billing_platform.dto.CommunityAdminResponse;
import com.water.monitoring_and_billing_platform.service.CommunityAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/community-admins")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CommunityAdminController {

    private final CommunityAdminService service;

    @PostMapping
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
    public ResponseEntity<ApiResponse<List<CommunityAdminResponse>>> getAll() {

        return ResponseEntity.ok(
                ApiResponse.<List<CommunityAdminResponse>>builder()
                        .success(true)
                        .message("Community Admin list fetched successfully.")
                        .data(service.getAllAdmins())
                        .build()
        );

    }

}