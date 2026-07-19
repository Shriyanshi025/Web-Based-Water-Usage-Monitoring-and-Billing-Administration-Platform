package com.water.monitoring_and_billing_platform.controller;

import com.water.monitoring_and_billing_platform.dto.ApiResponse;
import com.water.monitoring_and_billing_platform.dto.BulkWaterPurchaseRequest;
import com.water.monitoring_and_billing_platform.dto.BulkWaterPurchaseResponse;
import com.water.monitoring_and_billing_platform.dto.BulkWaterPurchaseSummaryResponse;
import com.water.monitoring_and_billing_platform.service.BulkWaterPurchaseService;
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
@RequestMapping("/api/bulk-purchases")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class BulkWaterPurchaseController {

    private final BulkWaterPurchaseService bulkWaterPurchaseService;

    @PostMapping
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ApiResponse<BulkWaterPurchaseResponse>> recordPurchase(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody BulkWaterPurchaseRequest request
    ) {
        BulkWaterPurchaseResponse response = bulkWaterPurchaseService.recordPurchase(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<BulkWaterPurchaseResponse>builder()
                .success(true)
                .message("Bulk water purchase recorded successfully")
                .data(response)
                .build());
    }

    @GetMapping("/cycle/{cycleId}")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ApiResponse<List<BulkWaterPurchaseResponse>>> getPurchasesForCycle(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long cycleId
    ) {
        List<BulkWaterPurchaseResponse> response = bulkWaterPurchaseService.getPurchasesForCycle(userDetails.getUsername(), cycleId);
        return ResponseEntity.ok(ApiResponse.<List<BulkWaterPurchaseResponse>>builder()
                .success(true)
                .message("Bulk water purchases retrieved successfully")
                .data(response)
                .build());
    }

    @GetMapping("/cycle/{cycleId}/summary")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ApiResponse<BulkWaterPurchaseSummaryResponse>> getSummaryForCycle(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long cycleId
    ) {
        BulkWaterPurchaseSummaryResponse response = bulkWaterPurchaseService.getSummaryForCycle(userDetails.getUsername(), cycleId);
        return ResponseEntity.ok(ApiResponse.<BulkWaterPurchaseSummaryResponse>builder()
                .success(true)
                .message("Bulk water purchase summary retrieved successfully")
                .data(response)
                .build());
    }
}
