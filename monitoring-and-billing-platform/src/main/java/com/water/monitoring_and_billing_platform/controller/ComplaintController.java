package com.water.monitoring_and_billing_platform.controller;

import com.water.monitoring_and_billing_platform.dto.ApiResponse;
import com.water.monitoring_and_billing_platform.dto.ComplaintRequest;
import com.water.monitoring_and_billing_platform.dto.ComplaintResponse;
import com.water.monitoring_and_billing_platform.enums.ComplaintCategory;
import com.water.monitoring_and_billing_platform.enums.ComplaintPriority;
import com.water.monitoring_and_billing_platform.enums.ComplaintStatus;
import com.water.monitoring_and_billing_platform.service.ComplaintService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174", "https://web-based-water-usage-monitoring-an.vercel.app"})
public class ComplaintController {

    private final ComplaintService complaintService;

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<ComplaintResponse>> raiseComplaint(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ComplaintRequest request
    ) {
        ComplaintResponse response = complaintService.raiseComplaint(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ComplaintResponse>builder()
                        .success(true)
                        .message("Complaint raised successfully")
                        .data(response)
                        .build()
        );
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<List<ComplaintResponse>>> getMyComplaints(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        List<ComplaintResponse> response = complaintService.getMyComplaints(userDetails.getUsername());
        return ResponseEntity.ok(
                ApiResponse.<List<ComplaintResponse>>builder()
                        .success(true)
                        .message("Your complaints retrieved successfully")
                        .data(response)
                        .build()
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ComplaintResponse>> getComplaintById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        ComplaintResponse response = complaintService.getComplaintById(userDetails.getUsername(), id);
        return ResponseEntity.ok(
                ApiResponse.<ComplaintResponse>builder()
                        .success(true)
                        .message("Complaint retrieved successfully")
                        .data(response)
                        .build()
        );
    }

    @GetMapping("/community")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ApiResponse<List<ComplaintResponse>>> getCommunityComplaints(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        List<ComplaintResponse> response = complaintService.getCommunityComplaints(userDetails.getUsername());
        return ResponseEntity.ok(
                ApiResponse.<List<ComplaintResponse>>builder()
                        .success(true)
                        .message("Community complaints retrieved successfully")
                        .data(response)
                        .build()
        );
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ApiResponse<List<ComplaintResponse>>> searchComplaints(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) ComplaintStatus status,
            @RequestParam(required = false) ComplaintPriority priority,
            @RequestParam(required = false) ComplaintCategory category,
            @RequestParam(required = false) String search
    ) {
        List<ComplaintResponse> response = complaintService.searchCommunityComplaints(
                userDetails.getUsername(), status, priority, category, search
        );
        return ResponseEntity.ok(
                ApiResponse.<List<ComplaintResponse>>builder()
                        .success(true)
                        .message("Search results retrieved successfully")
                        .data(response)
                        .build()
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ApiResponse<ComplaintResponse>> updateComplaint(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody UpdateComplaintRequest request
    ) {
        ComplaintResponse response = complaintService.updateComplaint(
                userDetails.getUsername(), id, request.getStatus(), request.getRemarks(), request.getAssignedToUserId()
        );
        return ResponseEntity.ok(
                ApiResponse.<ComplaintResponse>builder()
                        .success(true)
                        .message("Complaint updated successfully")
                        .data(response)
                        .build()
        );
    }

    @Getter
    @Setter
    public static class UpdateComplaintRequest {
        private ComplaintStatus status;
        private String remarks;
        private Long assignedToUserId;
    }
}
