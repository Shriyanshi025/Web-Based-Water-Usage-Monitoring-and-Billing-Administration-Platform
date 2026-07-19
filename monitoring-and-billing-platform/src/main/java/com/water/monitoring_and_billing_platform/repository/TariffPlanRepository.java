package com.water.monitoring_and_billing_platform.repository;

import com.water.monitoring_and_billing_platform.entity.TariffPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TariffPlanRepository extends JpaRepository<TariffPlan, Long> {
    List<TariffPlan> findByActiveTrue();
    List<TariffPlan> findByCommunityId(Long communityId);
    java.util.Optional<TariffPlan> findFirstByCommunityIdAndActiveTrue(Long communityId);
    boolean existsByCommunityIdAndActiveTrue(Long communityId);
}
