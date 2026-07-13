package com.water.monitoring_and_billing_platform.controller;

import com.water.monitoring_and_billing_platform.dto.ApiResponse;
import com.water.monitoring_and_billing_platform.dto.BillResponse;
import com.water.monitoring_and_billing_platform.dto.BillingCycleResponse;
import com.water.monitoring_and_billing_platform.dto.GenerateBillRequest;
import com.water.monitoring_and_billing_platform.dto.TariffPlanResponse;
import com.water.monitoring_and_billing_platform.service.BillingService;
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
@RequestMapping("/api/billing")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class BillingController {

    private final BillingService billingService;

    @GetMapping("/bills")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ApiResponse<List<BillResponse>>> getBills(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.<List<BillResponse>>builder()
                .success(true)
                .message("Bills retrieved successfully")
                .data(billingService.getBills(userDetails.getUsername()))
                .build());
    }

    @GetMapping("/bills/{id}")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ApiResponse<BillResponse>> getBillById(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<BillResponse>builder()
                .success(true)
                .message("Bill retrieved successfully")
                .data(billingService.getBillById(userDetails.getUsername(), id))
                .build());
    }

    @PostMapping("/generate")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ApiResponse<List<BillResponse>>> generateBills(@AuthenticationPrincipal UserDetails userDetails, @Valid @RequestBody GenerateBillRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<List<BillResponse>>builder()
                .success(true)
                .message("Bills generated successfully")
                .data(billingService.generateBills(userDetails.getUsername(), request))
                .build());
    }

    @GetMapping("/billing-cycle/active")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ApiResponse<BillingCycleResponse>> getActiveBillingCycle(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.<BillingCycleResponse>builder()
                .success(true)
                .message("Active billing cycle retrieved successfully")
                .data(billingService.getActiveBillingCycle(userDetails.getUsername()))
                .build());
    }

    @GetMapping("/tariff-plans")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ApiResponse<List<TariffPlanResponse>>> getTariffPlans(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.<List<TariffPlanResponse>>builder()
                .success(true)
                .message("Tariff plans retrieved successfully")
                .data(billingService.getTariffPlans(userDetails.getUsername()))
                .build());
    }

    @GetMapping("/me/bills")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<List<BillResponse>>> getMyBills(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.<List<BillResponse>>builder()
                .success(true)
                .message("My bills retrieved successfully")
                .data(billingService.getMyBills(userDetails.getUsername()))
                .build());
    }

    @GetMapping("/me/bills/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<BillResponse>> getMyBillById(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<BillResponse>builder()
                .success(true)
                .message("My bill retrieved successfully")
                .data(billingService.getMyBillById(userDetails.getUsername(), id))
                .build());
    }

    @PostMapping("/me/bills/{id}/pay")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<BillResponse>> payMyBill(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<BillResponse>builder()
                .success(true)
                .message("Bill paid successfully")
                .data(billingService.payMyBill(userDetails.getUsername(), id))
                .build());
    }
}
