package com.water.monitoring_and_billing_platform.controller;

import com.water.monitoring_and_billing_platform.dto.InvitationDetailsResponse;
import com.water.monitoring_and_billing_platform.dto.ResidentInvitationRequest;
import com.water.monitoring_and_billing_platform.dto.ResidentInvitationResponse;
import com.water.monitoring_and_billing_platform.service.InvitationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class InvitationController {

    private final InvitationService invitationService;

    @PostMapping("/community-admins/me/invitations")
    public ResponseEntity<ResidentInvitationResponse> inviteResident(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ResidentInvitationRequest request) {
        ResidentInvitationResponse response = invitationService.inviteResident(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/community-admins/me/invitations")
    public ResponseEntity<List<com.water.monitoring_and_billing_platform.dto.InvitationHistoryResponse>> getAdminInvitations(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<com.water.monitoring_and_billing_platform.dto.InvitationHistoryResponse> invitations = invitationService.getAdminInvitations(userDetails.getUsername());
        return ResponseEntity.ok(invitations);
    }

    @GetMapping("/invitations/{token}")
    public ResponseEntity<InvitationDetailsResponse> validateToken(@PathVariable String token) {
        InvitationDetailsResponse response = invitationService.validateToken(token);
        return ResponseEntity.ok(response);
    }
}
