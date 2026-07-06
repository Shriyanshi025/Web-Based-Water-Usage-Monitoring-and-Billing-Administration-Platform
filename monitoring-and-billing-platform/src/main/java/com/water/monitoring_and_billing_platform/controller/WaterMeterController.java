package com.water.monitoring_and_billing_platform.controller;

import com.water.monitoring_and_billing_platform.dto.WaterMeterRequest;
import com.water.monitoring_and_billing_platform.dto.WaterMeterResponse;
import com.water.monitoring_and_billing_platform.service.WaterMeterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/water-meters")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class WaterMeterController {

    private final WaterMeterService waterMeterService;

    @PostMapping
    public ResponseEntity<WaterMeterResponse> createWaterMeter(
            @Valid @RequestBody WaterMeterRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(waterMeterService.createWaterMeter(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WaterMeterResponse> getWaterMeterById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                waterMeterService.getWaterMeterById(id)
        );
    }

    @GetMapping
    public ResponseEntity<List<WaterMeterResponse>> getAllWaterMeters() {

        return ResponseEntity.ok(
                waterMeterService.getAllWaterMeters()
        );
    }
}