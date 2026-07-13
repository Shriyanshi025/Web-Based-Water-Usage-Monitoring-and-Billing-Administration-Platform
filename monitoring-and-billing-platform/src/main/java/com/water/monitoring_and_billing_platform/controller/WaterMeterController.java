package com.water.monitoring_and_billing_platform.controller;

import com.water.monitoring_and_billing_platform.dto.WaterMeterRequest;
import com.water.monitoring_and_billing_platform.dto.WaterMeterResponse;
import com.water.monitoring_and_billing_platform.dto.WaterMeterUpdateRequest;
import com.water.monitoring_and_billing_platform.service.WaterMeterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/water-meters")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class WaterMeterController {

    private final WaterMeterService waterMeterService;

    @PostMapping
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<WaterMeterResponse> createWaterMeter(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails,
            @Valid @RequestBody WaterMeterRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(waterMeterService.createWaterMeter(userDetails.getUsername(), request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<WaterMeterResponse> getWaterMeterById(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails,
            @PathVariable Long id) {

        return ResponseEntity.ok(
                waterMeterService.getWaterMeterById(userDetails.getUsername(), id)
        );
    }

    @GetMapping
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<List<WaterMeterResponse>> getAllWaterMeters(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {

        return ResponseEntity.ok(
                waterMeterService.getAllWaterMeters(userDetails.getUsername())
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<WaterMeterResponse> updateWaterMeter(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody WaterMeterUpdateRequest request) {

        return ResponseEntity.ok(
                waterMeterService.updateWaterMeter(userDetails.getUsername(), id, request)
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<Void> deleteWaterMeter(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails,
            @PathVariable Long id) {
        waterMeterService.deleteWaterMeter(userDetails.getUsername(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<WaterMeterResponse> getMyMeter(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        return ResponseEntity.ok(
                waterMeterService.getMyMeter(userDetails.getUsername())
        );
    }
}
