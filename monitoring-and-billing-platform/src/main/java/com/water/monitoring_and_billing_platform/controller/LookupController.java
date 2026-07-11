package com.water.monitoring_and_billing_platform.controller;

import com.water.monitoring_and_billing_platform.dto.BlockLookupResponse;
import com.water.monitoring_and_billing_platform.dto.CommunityLookupResponse;
import com.water.monitoring_and_billing_platform.dto.UnitLookupResponse;
import com.water.monitoring_and_billing_platform.repository.BlockRepository;
import com.water.monitoring_and_billing_platform.repository.CommunityRepository;
import com.water.monitoring_and_billing_platform.repository.UnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/lookups")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class LookupController {

    private final CommunityRepository communityRepository;
    private final BlockRepository blockRepository;
    private final UnitRepository unitRepository;

    @GetMapping("/communities")
    public ResponseEntity<List<CommunityLookupResponse>> getCommunities() {
        List<CommunityLookupResponse> response = communityRepository.findAll().stream()
                .filter(c -> c.isActive())
                .map(c -> CommunityLookupResponse.builder()
                        .id(c.getId())
                        .communityName(c.getCommunityName())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/blocks/{communityId}")
    public ResponseEntity<List<BlockLookupResponse>> getBlocks(@PathVariable Long communityId) {
        List<BlockLookupResponse> response = blockRepository.findByCommunityId(communityId).stream()
                .filter(b -> b.isActive())
                .map(b -> BlockLookupResponse.builder()
                        .id(b.getId())
                        .blockName(b.getBlockName())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/units/{blockId}")
    public ResponseEntity<List<UnitLookupResponse>> getUnits(@PathVariable Long blockId) {
        List<UnitLookupResponse> response = unitRepository.findByBlockId(blockId).stream()
                .filter(u -> u.isActive())
                .map(u -> UnitLookupResponse.builder()
                        .id(u.getId())
                        .unitNumber(u.getUnitNumber())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
}
