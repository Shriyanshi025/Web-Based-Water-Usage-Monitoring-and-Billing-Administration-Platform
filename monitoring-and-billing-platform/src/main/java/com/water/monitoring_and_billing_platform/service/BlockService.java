package com.water.monitoring_and_billing_platform.service;

import com.water.monitoring_and_billing_platform.dto.BlockRequest;
import com.water.monitoring_and_billing_platform.entity.Block;

import java.util.List;

public interface BlockService {

    Block createBlock(BlockRequest request);

    List<Block> getBlocksByCommunity(Long communityId);

    Block getBlockById(Long id);

}