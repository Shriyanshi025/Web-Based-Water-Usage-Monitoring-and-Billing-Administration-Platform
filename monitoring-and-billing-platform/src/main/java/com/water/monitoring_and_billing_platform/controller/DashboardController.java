package com.water.monitoring_and_billing_platform.controller;

import com.water.monitoring_and_billing_platform.dto.*;
import com.water.monitoring_and_billing_platform.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/main-admin")
    public ResponseEntity<MainAdminDashboardResponse> getDashboard() {

        return ResponseEntity.ok(
                dashboardService.getMainAdminDashboardData()
        );
    }

    @GetMapping("/community-admin/{communityId}")
    public ResponseEntity<CommunityAdminResponse> getCommunityDashboard(
            @PathVariable Long communityId) {

        return ResponseEntity.ok(
                dashboardService.getCommunityDashboard(communityId)
        );
    }

    @GetMapping("/user/{residentId}")
    public ResponseEntity<UserDashboardResponse> getUserDashboard(
            @PathVariable Long residentId) {

        return ResponseEntity.ok(
                dashboardService.getUserDashboard(residentId)
        );
    }

    @GetMapping("/resident")
    public ResponseEntity<ResidentDashboardResponse> getResidentDashboard(Principal principal) {
        return ResponseEntity.ok(
                dashboardService.getResidentDashboard(principal.getName())
        );
    }

    @GetMapping("/community-admin")
    public ResponseEntity<CommunityAdminDashboardResponse> getCommunityAdminDashboard(Principal principal) {
        return ResponseEntity.ok(
                dashboardService.getCommunityAdminDashboard(principal.getName())
        );
    }

}