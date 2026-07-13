package com.water.monitoring_and_billing_platform.controller;

import com.water.monitoring_and_billing_platform.dto.ApiResponse;
import com.water.monitoring_and_billing_platform.dto.CommunityRequest;
import com.water.monitoring_and_billing_platform.dto.CommunityResponse;
import com.water.monitoring_and_billing_platform.dto.CommunityStatusUpdateRequest;
import com.water.monitoring_and_billing_platform.service.CommunityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/communities")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@PreAuthorize("hasRole('MAIN_ADMIN')")
public class CommunityController {

    private final CommunityService communityService;

    @PostMapping
    public ResponseEntity<ApiResponse<CommunityResponse>> createCommunity(
            @Valid @RequestBody CommunityRequest request) {

        return ResponseEntity.ok(
                ApiResponse.<CommunityResponse>builder()
                        .success(true)
                        .message("Community created successfully.")
                        .data(communityService.createCommunity(request))
                        .build()
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CommunityResponse>> updateCommunity(
            @PathVariable Long id,
            @Valid @RequestBody CommunityRequest request) {

        return ResponseEntity.ok(
                ApiResponse.<CommunityResponse>builder()
                        .success(true)
                        .message("Community updated successfully.")
                        .data(communityService.updateCommunity(id, request))
                        .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CommunityResponse>> getCommunity(@PathVariable Long id) {

        return ResponseEntity.ok(
                ApiResponse.<CommunityResponse>builder()
                        .success(true)
                        .message("Community fetched successfully.")
                        .data(communityService.getCommunity(id))
                        .build()
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CommunityResponse>>> getAllCommunities() {

        return ResponseEntity.ok(
                ApiResponse.<List<CommunityResponse>>builder()
                        .success(true)
                        .message("Communities fetched successfully.")
                        .data(communityService.getAllCommunities())
                        .build()
        );
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<CommunityResponse>> updateCommunityStatus(
            @PathVariable Long id,
            @Valid @RequestBody CommunityStatusUpdateRequest request) {

        return ResponseEntity.ok(
                ApiResponse.<CommunityResponse>builder()
                        .success(true)
                        .message("Community status updated successfully.")
                        .data(communityService.updateCommunityStatus(id, request))
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCommunity(@PathVariable Long id) {
        communityService.deleteCommunity(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Community deleted successfully.")
                        .build()
        );
    }
}
