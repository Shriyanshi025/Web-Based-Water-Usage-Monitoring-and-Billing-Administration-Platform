package com.water.monitoring_and_billing_platform.controller;

import com.water.monitoring_and_billing_platform.dto.AuthResponse;
import com.water.monitoring_and_billing_platform.dto.CommunityAdminRegistrationRequest;
import com.water.monitoring_and_billing_platform.dto.ResidentRegistrationRequest;
import com.water.monitoring_and_billing_platform.service.RegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/register")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class RegistrationController {

    private final RegistrationService registrationService;

    @PostMapping("/resident")
    public ResponseEntity<AuthResponse> registerResident(
            @Valid @RequestBody ResidentRegistrationRequest request) {
        AuthResponse response = registrationService.registerResident(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/community-admin")
    public ResponseEntity<AuthResponse> registerCommunityAdmin(
            @Valid @RequestBody CommunityAdminRegistrationRequest request) {
        AuthResponse response = registrationService.registerCommunityAdmin(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
