package com.water.monitoring_and_billing_platform.controller;

import com.water.monitoring_and_billing_platform.dto.ResidentProfileRequest;
import com.water.monitoring_and_billing_platform.dto.ResidentProfileResponse;
import com.water.monitoring_and_billing_platform.service.ResidentProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/residents")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ResidentProfileController {

    private final ResidentProfileService residentProfileService;

    @PostMapping
    public ResponseEntity<ResidentProfileResponse> createResident(
            @Valid @RequestBody ResidentProfileRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(residentProfileService.createResidentProfile(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResidentProfileResponse> getResidentById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                residentProfileService.getResidentById(id)
        );
    }

    @GetMapping
    public ResponseEntity<List<ResidentProfileResponse>> getAllResidents() {

        return ResponseEntity.ok(
                residentProfileService.getAllResidents()
        );
    }
}