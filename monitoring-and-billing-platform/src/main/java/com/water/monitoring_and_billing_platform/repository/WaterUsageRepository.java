package com.water.monitoring_and_billing_platform.repository;

import com.water.monitoring_and_billing_platform.entity.WaterUsage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WaterUsageRepository extends JpaRepository<WaterUsage, Long> {

    List<WaterUsage> findByWaterMeterId(Long waterMeterId);

    long count();

    long countByWaterMeterResidentProfileCommunityId(Long communityId);

    List<WaterUsage> findByWaterMeterResidentProfileCommunityId(Long communityId);

}