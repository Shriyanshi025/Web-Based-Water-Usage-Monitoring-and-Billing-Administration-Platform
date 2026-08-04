package com.water.monitoring_and_billing_platform.controller;

import com.water.monitoring_and_billing_platform.dto.PeerBenchmarkingResponse;
import com.water.monitoring_and_billing_platform.service.PeerBenchmarkingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/peer-benchmarking")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class PeerBenchmarkingController {

    private final PeerBenchmarkingService peerBenchmarkingService;

    @GetMapping("/me")
    public ResponseEntity<PeerBenchmarkingResponse> getMyPeerBenchmarking(Principal principal) {
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(
                peerBenchmarkingService.getResidentPeerBenchmarking(principal.getName())
        );
    }
}
