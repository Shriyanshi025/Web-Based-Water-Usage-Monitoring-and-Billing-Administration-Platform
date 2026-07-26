package com.water.monitoring_and_billing_platform.repository;

import com.water.monitoring_and_billing_platform.entity.TariffPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TariffPlanRepository extends JpaRepository<TariffPlan, Long> {
    List<TariffPlan> findByActiveTrue();
    List<TariffPlan> findByCommunityId(Long communityId);
    List<TariffPlan> findByCommunityIdAndActiveTrue(Long communityId);
    Optional<TariffPlan> findFirstByCommunityIdAndActiveTrue(Long communityId);
    long countByCommunityIdAndActiveTrue(Long communityId);
    boolean existsByCommunityIdAndActiveTrue(Long communityId);
    boolean existsByCommunityId(Long communityId);
    boolean existsByCommunityIdAndNameIgnoreCase(Long communityId, String name);
    boolean existsByCommunityIdAndNameIgnoreCaseAndIdNot(Long communityId, String name, Long id);
    void deleteByCommunityId(Long communityId);
}
