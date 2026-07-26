package com.water.monitoring_and_billing_platform.repository;

import com.water.monitoring_and_billing_platform.entity.BillingCycle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BillingCycleRepository extends JpaRepository<BillingCycle, Long> {
    Optional<BillingCycle> findFirstByActiveTrueOrderByPeriodStartDesc();
    List<BillingCycle> findByActiveTrue();
    boolean existsByPeriodStartLessThanEqualAndPeriodEndGreaterThanEqual(LocalDate end, LocalDate start);
    boolean existsByIdNotAndPeriodStartLessThanEqualAndPeriodEndGreaterThanEqual(Long id, LocalDate end, LocalDate start);
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE BillingCycle b SET b.active = :active, b.status = :status WHERE b.id = :id")
    void updateStatusAndActive(@org.springframework.data.repository.query.Param("id") Long id, @org.springframework.data.repository.query.Param("active") boolean active, @org.springframework.data.repository.query.Param("status") com.water.monitoring_and_billing_platform.enums.BillingCycleStatus status);
}
