package com.water.monitoring_and_billing_platform.controller;

import com.water.monitoring_and_billing_platform.dto.WaterUsageRequest;
import com.water.monitoring_and_billing_platform.dto.WaterUsageResponse;
import com.water.monitoring_and_billing_platform.service.WaterUsageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/water-usage")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class WaterUsageController {

    private final WaterUsageService waterUsageService;

    @PostMapping
    public ResponseEntity<WaterUsageResponse> addReading(
            @Valid @RequestBody WaterUsageRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(waterUsageService.addReading(request));
    }

    @GetMapping
    public ResponseEntity<List<WaterUsageResponse>> getAllReadings() {

        return ResponseEntity.ok(
                waterUsageService.getAllReadings()
        );
    }

    @GetMapping("/meter/{meterId}")
    public ResponseEntity<List<WaterUsageResponse>> getReadingsByMeter(
            @PathVariable Long meterId) {

        return ResponseEntity.ok(
                waterUsageService.getReadingsByMeter(meterId)
        );
    }
}