package com.water.monitoring_and_billing_platform.controller;

import com.water.monitoring_and_billing_platform.dto.ResidentProfileRequest;
import com.water.monitoring_and_billing_platform.dto.ResidentProfileResponse;
import com.water.monitoring_and_billing_platform.dto.ResidentSelfProfileUpdateRequest;
import com.water.monitoring_and_billing_platform.service.ResidentProfileService;
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
@RequestMapping("/api/residents")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ResidentProfileController {

    private final ResidentProfileService residentProfileService;

    @PostMapping
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ResidentProfileResponse> createResident(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ResidentProfileRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(residentProfileService.createResidentProfile(userDetails.getUsername(), request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ResidentProfileResponse> getResidentById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        return ResponseEntity.ok(
                residentProfileService.getResidentById(userDetails.getUsername(), id)
        );
    }

    @GetMapping
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<List<ResidentProfileResponse>> getAllResidents(
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(
                residentProfileService.getAllResidents(userDetails.getUsername())
        );
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ResidentProfileResponse> getSelfProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                residentProfileService.getSelfProfile(userDetails.getUsername())
        );
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ResidentProfileResponse> updateSelfProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ResidentSelfProfileUpdateRequest request) {
        return ResponseEntity.ok(
                residentProfileService.updateSelfProfile(userDetails.getUsername(), request)
        );
    }
}