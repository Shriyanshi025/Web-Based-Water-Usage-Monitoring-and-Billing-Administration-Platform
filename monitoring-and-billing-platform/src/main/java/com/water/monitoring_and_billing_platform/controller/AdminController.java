package com.water.monitoring_and_billing_platform.controller;

import com.water.monitoring_and_billing_platform.dto.ApiResponse;
import com.water.monitoring_and_billing_platform.dto.ApprovalRequest;
import com.water.monitoring_and_billing_platform.entity.User;
import com.water.monitoring_and_billing_platform.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
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

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<User>>> getPendingUsers() {

        return ResponseEntity.ok(
                ApiResponse.<List<User>>builder()
                        .success(true)
                        .message("Pending users fetched successfully.")
                        .data(adminService.getPendingUsers())
                        .build()
        );

    }

    @GetMapping("/approved")
    public ResponseEntity<ApiResponse<List<User>>> getApprovedUsers() {

        return ResponseEntity.ok(
                ApiResponse.<List<User>>builder()
                        .success(true)
                        .message("Approved users fetched successfully.")
                        .data(adminService.getApprovedUsers())
                        .build()
        );

    }

    @GetMapping("/rejected")
    public ResponseEntity<ApiResponse<List<User>>> getRejectedUsers() {

        return ResponseEntity.ok(
                ApiResponse.<List<User>>builder()
                        .success(true)
                        .message("Rejected users fetched successfully.")
                        .data(adminService.getRejectedUsers())
                        .build()
        );

    }

}