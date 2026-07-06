package com.water.monitoring_and_billing_platform.repository;

import com.water.monitoring_and_billing_platform.entity.WaterMeter;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WaterMeterRepository extends JpaRepository<WaterMeter, Long> {

    boolean existsByMeterNumber(String meterNumber);

    boolean existsByResidentProfileId(Long residentProfileId);

    Optional<WaterMeter> findByMeterNumber(String meterNumber);

}