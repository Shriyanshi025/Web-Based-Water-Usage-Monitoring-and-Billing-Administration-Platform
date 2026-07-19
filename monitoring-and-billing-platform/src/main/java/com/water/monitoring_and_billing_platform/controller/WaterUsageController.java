package com.water.monitoring_and_billing_platform.controller;

import com.water.monitoring_and_billing_platform.dto.WaterUsageRequest;
import com.water.monitoring_and_billing_platform.dto.WaterUsageResponse;
import com.water.monitoring_and_billing_platform.service.WaterUsageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/water-usage")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class WaterUsageController {

    private final WaterUsageService waterUsageService;

    @PostMapping
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<WaterUsageResponse> addReading(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails,
            @Valid @RequestBody WaterUsageRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(waterUsageService.addReading(userDetails.getUsername(), request));
    }

    @GetMapping
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<List<WaterUsageResponse>> getAllReadings(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {

        return ResponseEntity.ok(
                waterUsageService.getAllReadings(userDetails.getUsername())
        );
    }

    @GetMapping("/meter/{meterId}")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<List<WaterUsageResponse>> getReadingsByMeter(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails,
            @PathVariable Long meterId) {

        return ResponseEntity.ok(
                waterUsageService.getReadingsByMeter(userDetails.getUsername(), meterId)
        );
    }

    @PostMapping("/upload")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<List<WaterUsageResponse>> uploadCsv(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails,
            @RequestParam("file") MultipartFile file) throws IOException {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(waterUsageService.uploadCsv(userDetails.getUsername(), file.getInputStream()));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<WaterUsageResponse>> getMyReadings(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        return ResponseEntity.ok(
                waterUsageService.getMyReadings(userDetails.getUsername())
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<WaterUsageResponse> updateReading(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody WaterUsageRequest request) {
        return ResponseEntity.ok(
                waterUsageService.updateReading(userDetails.getUsername(), id, request)
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<Void> deleteReading(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails,
            @PathVariable Long id) {
        waterUsageService.deleteReading(userDetails.getUsername(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/billing-cycle/{billingCycleId}")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<List<WaterUsageResponse>> getReadingsByBillingCycle(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails,
            @PathVariable Long billingCycleId) {
        return ResponseEntity.ok(
                waterUsageService.getReadingsByBillingCycle(userDetails.getUsername(), billingCycleId)
        );
    }
}
