package com.water.monitoring_and_billing_platform.controller;

import com.water.monitoring_and_billing_platform.dto.ApiResponse;
import com.water.monitoring_and_billing_platform.dto.ConsumptionCostDistributionResponse;
import com.water.monitoring_and_billing_platform.service.ConsumptionCostDistributionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cost-distribution")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ConsumptionCostDistributionController {

    private final ConsumptionCostDistributionService consumptionCostDistributionService;

    @GetMapping("/cycle/{cycleId}")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ApiResponse<ConsumptionCostDistributionResponse>> getCostDistribution(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long cycleId
    ) {
        ConsumptionCostDistributionResponse response = consumptionCostDistributionService.calculateDistribution(
                userDetails.getUsername(), cycleId
        );
        return ResponseEntity.ok(ApiResponse.<ConsumptionCostDistributionResponse>builder()
                .success(true)
                .message("Consumption-based cost distribution calculated successfully")
                .data(response)
                .build());
    }
}
