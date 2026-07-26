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
    List<BulkWaterPurchase> findByCommunityId(Long communityId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(b) > 0 FROM BulkWaterPurchase b WHERE b.community.id = :communityId AND b.billingCycle.id = :billingCycleId AND LOWER(b.source) = LOWER(:source) AND b.purchaseDate = :purchaseDate AND b.id != :id")
    boolean existsDuplicateForUpdate(
            @org.springframework.data.repository.query.Param("communityId") Long communityId,
            @org.springframework.data.repository.query.Param("billingCycleId") Long billingCycleId,
            @org.springframework.data.repository.query.Param("source") String source,
            @org.springframework.data.repository.query.Param("purchaseDate") LocalDate purchaseDate,
            @org.springframework.data.repository.query.Param("id") Long id
    );
}
