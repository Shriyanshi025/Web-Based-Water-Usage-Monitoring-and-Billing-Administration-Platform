package com.water.monitoring_and_billing_platform.controller;

import com.water.monitoring_and_billing_platform.dto.ApiResponse;
import com.water.monitoring_and_billing_platform.dto.TariffPlanRequest;
import com.water.monitoring_and_billing_platform.dto.TariffPlanResponse;
import com.water.monitoring_and_billing_platform.service.TariffPlanService;
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
@RequestMapping("/api/tariff-plans")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class TariffPlanController {

    private final TariffPlanService tariffPlanService;

    @PostMapping
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ApiResponse<TariffPlanResponse>> createTariffPlan(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody TariffPlanRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<TariffPlanResponse>builder()
                .success(true)
                .message("Tariff plan created successfully")
                .data(tariffPlanService.createTariffPlan(userDetails.getUsername(), request))
                .build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ApiResponse<TariffPlanResponse>> updateTariffPlan(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody TariffPlanRequest request) {
        return ResponseEntity.ok(ApiResponse.<TariffPlanResponse>builder()
                .success(true)
                .message("Tariff plan updated successfully")
                .data(tariffPlanService.updateTariffPlan(userDetails.getUsername(), id, request))
                .build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTariffPlan(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        tariffPlanService.deleteTariffPlan(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Tariff plan deleted successfully")
                .build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ApiResponse<TariffPlanResponse>> getTariffPlanById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<TariffPlanResponse>builder()
                .success(true)
                .message("Tariff plan retrieved successfully")
                .data(tariffPlanService.getTariffPlanById(userDetails.getUsername(), id))
                .build());
    }

    @GetMapping
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ApiResponse<List<TariffPlanResponse>>> getTariffPlans(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.<List<TariffPlanResponse>>builder()
                .success(true)
                .message("Tariff plans retrieved successfully")
                .data(tariffPlanService.getTariffPlansByCommunity(userDetails.getUsername()))
                .build());
    }

    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ApiResponse<TariffPlanResponse>> activateTariffPlan(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<TariffPlanResponse>builder()
                .success(true)
                .message("Tariff plan activated successfully")
                .data(tariffPlanService.activateTariffPlan(userDetails.getUsername(), id))
                .build());
    }

    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ApiResponse<TariffPlanResponse>> deactivateTariffPlan(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<TariffPlanResponse>builder()
                .success(true)
                .message("Tariff plan deactivated successfully")
                .data(tariffPlanService.deactivateTariffPlan(userDetails.getUsername(), id))
                .build());
    }
}
