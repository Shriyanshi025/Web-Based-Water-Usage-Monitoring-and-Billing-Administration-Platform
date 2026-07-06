package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.dto.BlockRequest;
import com.water.monitoring_and_billing_platform.entity.Block;
import com.water.monitoring_and_billing_platform.entity.Community;
import com.water.monitoring_and_billing_platform.exception.BlockAlreadyExistsException;
import com.water.monitoring_and_billing_platform.exception.BlockNotFoundException;
import com.water.monitoring_and_billing_platform.exception.CommunityNotFoundException;
import com.water.monitoring_and_billing_platform.repository.BlockRepository;
import com.water.monitoring_and_billing_platform.repository.CommunityRepository;
import com.water.monitoring_and_billing_platform.service.BlockService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BlockServiceImpl implements BlockService {

    private final BlockRepository blockRepository;
    private final CommunityRepository communityRepository;

    @Override
    public Block createBlock(BlockRequest request) {

        Community community = communityRepository.findById(request.getCommunityId())
                .orElseThrow(CommunityNotFoundException::new);

        if (blockRepository.existsByCommunityIdAndBlockName(
                request.getCommunityId(),
                request.getBlockName())) {

            throw new BlockAlreadyExistsException();
        }

        Block block = Block.builder()
                .blockName(request.getBlockName())
                .community(community)
                .active(true)
                .build();

        return blockRepository.save(block);
    }

    @Override
    public List<Block> getBlocksByCommunity(Long communityId) {
        return blockRepository.findByCommunityId(communityId);
    }

    @Override
    public Block getBlockById(Long id) {
        return blockRepository.findById(id)
                .orElseThrow(BlockNotFoundException::new);
    }
}