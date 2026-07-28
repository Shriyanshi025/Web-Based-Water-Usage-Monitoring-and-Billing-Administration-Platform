package com.water.monitoring_and_billing_platform.controller;

import com.water.monitoring_and_billing_platform.dto.*;
import com.water.monitoring_and_billing_platform.service.SupportTicketService;
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
@RequestMapping("/api/support-tickets")
@RequiredArgsConstructor
public class SupportTicketController {

    private final SupportTicketService supportTicketService;

    @PostMapping
    public ResponseEntity<ApiResponse<SupportTicketResponse>> createTicket(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody SupportTicketRequest request
    ) {
        SupportTicketResponse response = supportTicketService.createTicket(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<SupportTicketResponse>builder()
                        .success(true)
                        .message("Support ticket created successfully")
                        .data(response)
                        .build());
    }

    @GetMapping("/my-tickets")
    public ResponseEntity<ApiResponse<List<SupportTicketResponse>>> getMySubmittedTickets(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        List<SupportTicketResponse> response = supportTicketService.getMySubmittedTickets(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.<List<SupportTicketResponse>>builder()
                .success(true)
                .message("Fetched user submitted tickets")
                .data(response)
                .build());
    }

    @GetMapping("/community-inbox")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ApiResponse<List<SupportTicketResponse>>> getCommunityInboxTickets(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        List<SupportTicketResponse> response = supportTicketService.getCommunityInboxTickets(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.<List<SupportTicketResponse>>builder()
                .success(true)
                .message("Fetched community ticket inbox")
                .data(response)
                .build());
    }

    @GetMapping("/main-admin-inbox")
    @PreAuthorize("hasRole('MAIN_ADMIN')")
    public ResponseEntity<ApiResponse<List<SupportTicketResponse>>> getMainAdminTickets(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        List<SupportTicketResponse> response = supportTicketService.getMainAdminTickets(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.<List<SupportTicketResponse>>builder()
                .success(true)
                .message("Fetched Main Admin ticket inbox")
                .data(response)
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SupportTicketResponse>> getTicketDetails(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        SupportTicketResponse response = supportTicketService.getTicketDetails(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.<SupportTicketResponse>builder()
                .success(true)
                .message("Fetched ticket details")
                .data(response)
                .build());
    }

    @PostMapping("/{id}/replies")
    public ResponseEntity<ApiResponse<SupportTicketReplyResponse>> addReply(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody SupportTicketReplyRequest request
    ) {
        SupportTicketReplyResponse response = supportTicketService.addReply(userDetails.getUsername(), id, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<SupportTicketReplyResponse>builder()
                        .success(true)
                        .message("Reply added successfully")
                        .data(response)
                        .build());
    }

    @GetMapping("/{id}/replies")
    public ResponseEntity<ApiResponse<List<SupportTicketReplyResponse>>> getTicketReplies(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        List<SupportTicketReplyResponse> response = supportTicketService.getTicketReplies(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.<List<SupportTicketReplyResponse>>builder()
                .success(true)
                .message("Fetched ticket replies")
                .data(response)
                .build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<SupportTicketResponse>> updateTicketStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody SupportTicketStatusUpdateRequest request
    ) {
        SupportTicketResponse response = supportTicketService.updateTicketStatus(userDetails.getUsername(), id, request);
        return ResponseEntity.ok(ApiResponse.<SupportTicketResponse>builder()
                .success(true)
                .message("Ticket status updated successfully")
                .data(response)
                .build());
    }

    @PutMapping("/{id}/close")
    public ResponseEntity<ApiResponse<SupportTicketResponse>> closeTicket(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        SupportTicketResponse response = supportTicketService.closeTicket(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.<SupportTicketResponse>builder()
                .success(true)
                .message("Ticket closed successfully")
                .data(response)
                .build());
    }
}
