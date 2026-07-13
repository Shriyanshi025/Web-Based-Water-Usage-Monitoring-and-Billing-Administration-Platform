package com.water.monitoring_and_billing_platform.controller;

import com.water.monitoring_and_billing_platform.dto.BlockRequest;
import com.water.monitoring_and_billing_platform.entity.Block;
import com.water.monitoring_and_billing_platform.service.BlockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/blocks")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class BlockController {

    private final BlockService blockService;

    @PostMapping
    public ResponseEntity<Block> createBlock(
            @Valid @RequestBody BlockRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(blockService.createBlock(request));
    }

    @GetMapping("/community/{communityId}")
    public ResponseEntity<List<Block>> getBlocksByCommunity(
            @PathVariable Long communityId) {

        return ResponseEntity.ok(
                blockService.getBlocksByCommunity(communityId)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Block> getBlockById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                blockService.getBlockById(id)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBlock(@PathVariable Long id) {
        blockService.deleteBlock(id);
        return ResponseEntity.noContent().build();
    }
}
