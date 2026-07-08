package com.water.monitoring_and_billing_platform.repository;

import com.water.monitoring_and_billing_platform.entity.WaterMeter;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WaterMeterRepository extends JpaRepository<WaterMeter, Long> {

    boolean existsByMeterNumber(String meterNumber);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"residentProfile", "residentProfile.user"})
    java.util.List<WaterMeter> findAll();

    boolean existsByResidentProfileId(Long residentProfileId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"residentProfile", "residentProfile.user"})
    Optional<WaterMeter> findByResidentProfileId(Long residentProfileId);

    Optional<WaterMeter> findByMeterNumber(String meterNumber);

    long count();

    long countByResidentProfileCommunityId(Long communityId);

    long countByResidentProfileCommunityIdAndActiveTrue(Long communityId);

}