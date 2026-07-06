package com.water.monitoring_and_billing_platform.repository;

import com.water.monitoring_and_billing_platform.entity.Block;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BlockRepository extends JpaRepository<Block, Long> {

    List<Block> findByCommunityId(Long communityId);

    boolean existsByCommunityIdAndBlockName(
            Long communityId,
            String blockName
    );

}