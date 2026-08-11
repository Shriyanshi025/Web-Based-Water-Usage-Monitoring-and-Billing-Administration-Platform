package com.water.monitoring_and_billing_platform.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.water.monitoring_and_billing_platform.entity.WaterMeter;

@Repository
public interface WaterMeterRepository extends JpaRepository<WaterMeter, Long> {

    boolean existsByMeterNumber(String meterNumber);

    boolean existsByResidentProfileId(Long residentProfileId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"residentProfile", "residentProfile.user"})
    @org.springframework.lang.NonNull
    java.util.List<WaterMeter> findAll();

    java.util.Optional<WaterMeter> findByMeterNumber(String meterNumber);

    java.util.Optional<WaterMeter> findByResidentProfileId(Long residentProfileId);

    java.util.List<WaterMeter> findByResidentProfileIdIn(java.util.Collection<Long> residentProfileIds);

    java.util.Optional<WaterMeter> findFirstByResidentProfileIdOrderByIdDesc(Long residentProfileId);

    long countByResidentProfileCommunityId(Long communityId);

    long countByResidentProfileCommunityIdAndActiveTrue(Long communityId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"residentProfile", "residentProfile.user"})
    java.util.List<WaterMeter> findByResidentProfileCommunityId(Long communityId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"residentProfile"})
    java.util.List<WaterMeter> findByActiveTrue();
}
