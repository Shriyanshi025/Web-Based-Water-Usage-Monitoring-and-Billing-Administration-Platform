package com.water.monitoring_and_billing_platform.controller;

import com.water.monitoring_and_billing_platform.dto.CommunityDashboardResponse;
import com.water.monitoring_and_billing_platform.dto.DashboardResponse;
import com.water.monitoring_and_billing_platform.dto.UserDashboardResponse;
import com.water.monitoring_and_billing_platform.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/main-admin")
    public ResponseEntity<DashboardResponse> getDashboard() {

        return ResponseEntity.ok(
                dashboardService.getMainAdminDashboard()
        );
    }

    @GetMapping("/community-admin/{communityId}")
    public ResponseEntity<CommunityDashboardResponse> getCommunityDashboard(
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

}