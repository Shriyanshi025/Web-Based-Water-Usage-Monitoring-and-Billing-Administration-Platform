package com.water.monitoring_and_billing_platform.controller;

import com.water.monitoring_and_billing_platform.dto.ApiResponse;
import com.water.monitoring_and_billing_platform.dto.ApprovalRequest;
import com.water.monitoring_and_billing_platform.dto.CommunityAdminProfileResponse;
import com.water.monitoring_and_billing_platform.dto.ResidentProfileResponse;
import com.water.monitoring_and_billing_platform.dto.UserMeResponse;
import com.water.monitoring_and_billing_platform.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('MAIN_ADMIN')")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final AdminService adminService;

    @PutMapping("/approve/{userId}")
    public ResponseEntity<ApiResponse<Void>> approveUser(
            @PathVariable Long userId,
            @RequestBody ApprovalRequest request){

        adminService.approveUser(userId, request);

        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("User status updated successfully.")
                        .data(null)
                        .build()
        );

    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("User deleted successfully.")
                        .data(null)
                        .build()
        );
    }

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<UserMeResponse>>> getPendingUsers() {

        return ResponseEntity.ok(
                ApiResponse.<List<UserMeResponse>>builder()
                        .success(true)
                        .message("Pending users fetched successfully.")
                        .data(adminService.getPendingUsers())
                        .build()
        );

    }

    @GetMapping("/approved")
    public ResponseEntity<ApiResponse<List<UserMeResponse>>> getApprovedUsers() {

        return ResponseEntity.ok(
                ApiResponse.<List<UserMeResponse>>builder()
                        .success(true)
                        .message("Approved users fetched successfully.")
                        .data(adminService.getApprovedUsers())
                        .build()
        );

    }

    @GetMapping("/rejected")
    public ResponseEntity<ApiResponse<List<UserMeResponse>>> getRejectedUsers() {

        return ResponseEntity.ok(
                ApiResponse.<List<UserMeResponse>>builder()
                        .success(true)
                        .message("Rejected users fetched successfully.")
                        .data(adminService.getRejectedUsers())
                        .build()
        );

    }

    @GetMapping("/pending-residents")
    public ResponseEntity<ApiResponse<List<ResidentProfileResponse>>> getPendingResidents() {
        return ResponseEntity.ok(
                ApiResponse.<List<ResidentProfileResponse>>builder()
                        .success(true)
                        .message("Pending residents fetched successfully.")
                        .data(adminService.getPendingResidents())
                        .build()
        );
    }

    @GetMapping("/pending-community-admins")
    public ResponseEntity<ApiResponse<List<CommunityAdminProfileResponse>>> getPendingCommunityAdmins() {
        return ResponseEntity.ok(
                ApiResponse.<List<CommunityAdminProfileResponse>>builder()
                        .success(true)
                        .message("Pending community admins fetched successfully.")
                        .data(adminService.getPendingCommunityAdmins())
                        .build()
        );
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserMeResponse>> getSelfProfile(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        return ResponseEntity.ok(
                ApiResponse.<UserMeResponse>builder()
                        .success(true)
                        .message("Self profile fetched successfully.")
                        .data(adminService.getSelfProfile(userDetails.getUsername()))
                        .build()
        );
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserMeResponse>> updateSelfProfile(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails,
            @RequestBody java.util.Map<String, String> request) {
        String fullName = request.get("fullName");
        if (fullName == null || fullName.trim().isEmpty()) {
            throw new IllegalArgumentException("Full Name cannot be blank");
        }
        return ResponseEntity.ok(
                ApiResponse.<UserMeResponse>builder()
                        .success(true)
                        .message("Self profile updated successfully.")
                        .data(adminService.updateSelfProfile(userDetails.getUsername(), fullName))
                        .build()
        );
    }

}
