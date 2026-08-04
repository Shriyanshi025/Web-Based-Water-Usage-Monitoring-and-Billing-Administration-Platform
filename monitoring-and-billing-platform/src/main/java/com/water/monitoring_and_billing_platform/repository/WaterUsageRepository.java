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

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"waterMeter", "waterMeter.residentProfile", "waterMeter.residentProfile.user"})
    List<WaterUsage> findByWaterMeterResidentProfileCommunityId(Long communityId);

    boolean existsByWaterMeterIdAndReadingDateAndCurrentReading(Long waterMeterId, LocalDate readingDate, Double currentReading);
    boolean existsByWaterMeterIdAndReadingDate(Long waterMeterId, LocalDate readingDate);
    java.util.Optional<WaterUsage> findByWaterMeterIdAndReadingDate(Long waterMeterId, LocalDate readingDate);
    
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"waterMeter", "waterMeter.residentProfile", "waterMeter.residentProfile.user"})
    List<WaterUsage> findByWaterMeterResidentProfileCommunityIdAndReadingDateBetween(Long communityId, LocalDate start, LocalDate end);

    java.util.Optional<WaterUsage> findFirstByWaterMeterResidentProfileCommunityIdOrderByReadingDateDescIdDesc(Long communityId);
    java.util.Optional<WaterUsage> findFirstByWaterMeterResidentProfileIdOrderByReadingDateDescIdDesc(Long residentProfileId);
    java.util.Optional<WaterUsage> findFirstByWaterMeterIdOrderByReadingDateDescIdDesc(Long waterMeterId);
    java.util.Optional<WaterUsage> findFirstByWaterMeterIdAndReadingDateLessThanOrderByReadingDateDescIdDesc(Long waterMeterId, LocalDate readingDate);
    java.util.Optional<WaterUsage> findFirstByWaterMeterIdAndReadingDateGreaterThanOrderByReadingDateAscIdAsc(Long waterMeterId, LocalDate readingDate);
    List<WaterUsage> findByWaterMeterIdAndReadingDateBetween(Long waterMeterId, LocalDate start, LocalDate end);
    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(wu.unitsConsumed), 0.0) FROM WaterUsage wu")
    Double sumTotalUnitsConsumed();

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(wu.unitsConsumed), 0.0) FROM WaterUsage wu WHERE wu.billed = true")
    Double sumBilledUnitsConsumed();

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(wu.unitsConsumed), 0.0) FROM WaterUsage wu WHERE wu.waterMeter.residentProfile.community.id = :communityId")
    Double sumTotalUnitsConsumedByCommunityId(@org.springframework.data.repository.query.Param("communityId") Long communityId);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(wu.unitsConsumed), 0.0) FROM WaterUsage wu WHERE wu.waterMeter.residentProfile.community.id = :communityId AND wu.billed = false")
    Double sumUnbilledUnitsConsumedByCommunityId(@org.springframework.data.repository.query.Param("communityId") Long communityId);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(wu.unitsConsumed), 0.0) FROM WaterUsage wu WHERE wu.waterMeter.residentProfile.community.id = :communityId AND wu.billed = true")
    Double sumBilledUnitsConsumedByCommunityId(@org.springframework.data.repository.query.Param("communityId") Long communityId);
}
