package com.water.monitoring_and_billing_platform.repository;

import com.water.monitoring_and_billing_platform.entity.BillingCycle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BillingCycleRepository extends JpaRepository<BillingCycle, Long> {
    Optional<BillingCycle> findFirstByActiveTrueOrderByPeriodStartDesc();
}
