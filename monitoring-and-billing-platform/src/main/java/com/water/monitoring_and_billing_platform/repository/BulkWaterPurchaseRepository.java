package com.water.monitoring_and_billing_platform.repository;

import com.water.monitoring_and_billing_platform.entity.BulkWaterPurchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BulkWaterPurchaseRepository extends JpaRepository<BulkWaterPurchase, Long> {

    List<BulkWaterPurchase> findByBillingCycleIdAndCommunityId(Long billingCycleId, Long communityId);

    List<BulkWaterPurchase> findByBillingCycleId(Long billingCycleId);

    boolean existsByCommunityIdAndBillingCycleIdAndSourceIgnoreCaseAndPurchaseDate(
            Long communityId,
            Long billingCycleId,
            String source,
            LocalDate purchaseDate
    );
}
