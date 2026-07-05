package com.water.monitoring_and_billing_platform.controller;

import com.water.monitoring_and_billing_platform.dto.CommunityRequest;
import com.water.monitoring_and_billing_platform.entity.Community;
import com.water.monitoring_and_billing_platform.service.CommunityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/communities")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CommunityController {

    private final CommunityService communityService;

    @PostMapping
    public ResponseEntity<Community> createCommunity(
            @Valid @RequestBody CommunityRequest request) {

        Community community = communityService.createCommunity(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(community);
    }

    @GetMapping
    public ResponseEntity<List<Community>> getAllCommunities() {

        return ResponseEntity.ok(
                communityService.getAllCommunities()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Community> getCommunityById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                communityService.getCommunityById(id)
        );
    }

}