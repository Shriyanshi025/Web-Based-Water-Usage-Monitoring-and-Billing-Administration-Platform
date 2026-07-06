package com.water.monitoring_and_billing_platform.repository;

import com.water.monitoring_and_billing_platform.entity.Unit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UnitRepository extends JpaRepository<Unit, Long> {

    List<Unit> findByBlockId(Long blockId);

    boolean existsByBlockIdAndUnitNumber(
            Long blockId,
            String unitNumber
    );

    long count();

    long countByCommunityId(Long communityId);
}