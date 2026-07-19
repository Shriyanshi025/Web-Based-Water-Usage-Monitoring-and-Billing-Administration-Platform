package com.water.monitoring_and_billing_platform.controller;

import com.water.monitoring_and_billing_platform.dto.ApiResponse;
import com.water.monitoring_and_billing_platform.dto.BillingCycleRequest;
import com.water.monitoring_and_billing_platform.dto.BillingCycleResponse;
import com.water.monitoring_and_billing_platform.service.BillingCycleService;
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
@RequestMapping("/api/billing-cycles")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class BillingCycleController {

    private final BillingCycleService billingCycleService;

    @PostMapping
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ApiResponse<BillingCycleResponse>> createBillingCycle(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody BillingCycleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<BillingCycleResponse>builder()
                .success(true)
                .message("Billing cycle created successfully")
                .data(billingCycleService.createBillingCycle(userDetails.getUsername(), request))
                .build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ApiResponse<BillingCycleResponse>> updateBillingCycle(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody BillingCycleRequest request) {
        return ResponseEntity.ok(ApiResponse.<BillingCycleResponse>builder()
                .success(true)
                .message("Billing cycle updated successfully")
                .data(billingCycleService.updateBillingCycle(userDetails.getUsername(), id, request))
                .build());
    }

    @PutMapping("/{id}/open")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ApiResponse<BillingCycleResponse>> openBillingCycle(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<BillingCycleResponse>builder()
                .success(true)
                .message("Billing cycle opened successfully")
                .data(billingCycleService.openBillingCycle(userDetails.getUsername(), id))
                .build());
    }

    @PutMapping("/{id}/close")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ApiResponse<BillingCycleResponse>> closeBillingCycle(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<BillingCycleResponse>builder()
                .success(true)
                .message("Billing cycle closed successfully")
                .data(billingCycleService.closeBillingCycle(userDetails.getUsername(), id))
                .build());
    }

    @PutMapping("/{id}/archive")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ApiResponse<BillingCycleResponse>> archiveBillingCycle(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<BillingCycleResponse>builder()
                .success(true)
                .message("Billing cycle archived successfully")
                .data(billingCycleService.archiveBillingCycle(userDetails.getUsername(), id))
                .build());
    }

    @GetMapping("/active")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ApiResponse<BillingCycleResponse>> getActiveBillingCycle(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.<BillingCycleResponse>builder()
                .success(true)
                .message("Active billing cycle retrieved successfully")
                .data(billingCycleService.getActiveBillingCycle(userDetails.getUsername()))
                .build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ApiResponse<BillingCycleResponse>> getBillingCycleById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<BillingCycleResponse>builder()
                .success(true)
                .message("Billing cycle retrieved successfully")
                .data(billingCycleService.getBillingCycleById(userDetails.getUsername(), id))
                .build());
    }

    @GetMapping
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ApiResponse<List<BillingCycleResponse>>> getAllBillingCycles(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.<List<BillingCycleResponse>>builder()
                .success(true)
                .message("Billing cycles retrieved successfully")
                .data(billingCycleService.getAllBillingCycles(userDetails.getUsername()))
                .build());
    }
}
