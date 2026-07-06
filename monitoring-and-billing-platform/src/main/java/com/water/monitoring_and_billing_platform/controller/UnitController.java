package com.water.monitoring_and_billing_platform.controller;

import com.water.monitoring_and_billing_platform.dto.UnitRequest;
import com.water.monitoring_and_billing_platform.dto.UnitResponse;
import com.water.monitoring_and_billing_platform.service.UnitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/units")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class UnitController {

    private final UnitService unitService;

    @PostMapping
    public ResponseEntity<UnitResponse> createUnit(
            @Valid @RequestBody UnitRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(unitService.createUnit(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UnitResponse> getUnitById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                unitService.getUnitById(id)
        );
    }

    @GetMapping
    public ResponseEntity<List<UnitResponse>> getAllUnits() {

        return ResponseEntity.ok(
                unitService.getAllUnits()
        );
    }
}