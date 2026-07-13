package com.water.monitoring_and_billing_platform.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.water.monitoring_and_billing_platform.entity.WaterUsage;

public interface WaterUsageRepository extends JpaRepository<WaterUsage, Long> {

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"waterMeter", "waterMeter.residentProfile", "waterMeter.residentProfile.user"})
    @org.springframework.lang.NonNull
    List<WaterUsage> findAll();

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"waterMeter", "waterMeter.residentProfile", "waterMeter.residentProfile.user"})
    List<WaterUsage> findByWaterMeterId(Long waterMeterId);

    long count();

    long countByWaterMeterResidentProfileCommunityId(Long communityId);

    List<WaterUsage> findByWaterMeterResidentProfileCommunityId(Long communityId);

    boolean existsByWaterMeterIdAndReadingDateAndCurrentReading(Long waterMeterId, LocalDate readingDate, Double currentReading);

}
