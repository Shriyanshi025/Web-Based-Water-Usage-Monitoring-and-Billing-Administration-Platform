package com.water.monitoring_and_billing_platform.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

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

    long countByWaterMeterResidentProfileIdAndReadingDateBetween(Long residentProfileId, LocalDate start, LocalDate end);
    long countByWaterMeterResidentProfileCommunityIdAndReadingDateBetween(Long communityId, LocalDate start, LocalDate end);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(wu.unitsConsumed), 0.0) FROM WaterUsage wu")
    Double sumTotalUnitsConsumed();

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(wu.unitsConsumed), 0.0) FROM WaterUsage wu WHERE wu.billed = true")
    Double sumBilledUnitsConsumed();

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(wu.unitsConsumed), 0.0) FROM WaterUsage wu WHERE wu.waterMeter.residentProfile.community.id = :communityId")
    Double sumTotalUnitsConsumedByCommunityId(@Param("communityId") Long communityId);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(wu.unitsConsumed), 0.0) FROM WaterUsage wu WHERE wu.waterMeter.residentProfile.community.id = :communityId AND wu.billed = false")
    Double sumUnbilledUnitsConsumedByCommunityId(@Param("communityId") Long communityId);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(wu.unitsConsumed), 0.0) FROM WaterUsage wu WHERE wu.waterMeter.residentProfile.community.id = :communityId AND wu.billed = true")
    Double sumBilledUnitsConsumedByCommunityId(@Param("communityId") Long communityId);

    @org.springframework.data.jpa.repository.Query("SELECT wu.waterMeter.residentProfile.block.blockName, COALESCE(SUM(wu.unitsConsumed), 0.0) FROM WaterUsage wu WHERE wu.waterMeter.residentProfile.community.id = :communityId GROUP BY wu.waterMeter.residentProfile.block.blockName ORDER BY SUM(wu.unitsConsumed) DESC")
    List<Object[]> findBlockConsumptionByCommunityId(@Param("communityId") Long communityId);

    @org.springframework.data.jpa.repository.Query("SELECT wu.waterMeter.residentProfile.block.blockName, COALESCE(SUM(wu.unitsConsumed), 0.0) FROM WaterUsage wu WHERE wu.waterMeter.residentProfile.community.id = :communityId AND wu.readingDate BETWEEN :start AND :end GROUP BY wu.waterMeter.residentProfile.block.blockName ORDER BY SUM(wu.unitsConsumed) DESC")
    List<Object[]> findBlockConsumptionByCommunityIdAndPeriod(@Param("communityId") Long communityId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(wu.unitsConsumed), 0.0) FROM WaterUsage wu WHERE wu.waterMeter.residentProfile.community.id = :communityId AND wu.readingDate BETWEEN :start AND :end")
    Double sumUnitsByCommunityAndPeriod(@Param("communityId") Long communityId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(wu.unitsConsumed), 0.0) FROM WaterUsage wu WHERE wu.readingDate BETWEEN :start AND :end")
    Double sumGlobalUnitsByPeriod(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(wu.unitsConsumed), 0.0) FROM WaterUsage wu WHERE wu.waterMeter.residentProfile.id = :residentId AND wu.readingDate BETWEEN :start AND :end")
    Double sumUnitsByResidentAndPeriod(@Param("residentId") Long residentId, @Param("start") LocalDate start, @Param("end") LocalDate end);
}
