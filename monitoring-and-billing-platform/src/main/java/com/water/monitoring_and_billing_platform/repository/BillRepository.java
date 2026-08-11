package com.water.monitoring_and_billing_platform.repository;

import com.water.monitoring_and_billing_platform.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    List<Bill> findByResidentProfileId(Long residentProfileId);
    boolean existsByBillNumber(String billNumber);
    long countByBillNumberStartingWith(String prefix);
    boolean existsByResidentProfileIdAndBillingMonthAndBillingYear(Long residentProfileId, int billingMonth, int billingYear);
    Optional<Bill> findFirstByResidentProfileIdOrderByBillDateDescIdDesc(Long residentProfileId);
    Optional<Bill> findByResidentProfileIdAndBillingMonthAndBillingYear(Long residentProfileId, int billingMonth, int billingYear);
    List<Bill> findByResidentProfileCommunityId(Long communityId);
    List<Bill> findByResidentProfileCommunityIdAndBillingMonthAndBillingYear(Long communityId, int billingMonth, int billingYear);
    boolean existsByTariffPlanId(Long tariffPlanId);
    long countByTariffPlanId(Long tariffPlanId);
    Optional<Bill> findTopByTariffPlanIdOrderByCreatedAtDesc(Long tariffPlanId);
    boolean existsByResidentProfileIdAndBillingCycleId(Long residentProfileId, Long billingCycleId);
    Optional<Bill> findByResidentProfileIdAndBillingCycleId(Long residentProfileId, Long billingCycleId);
    List<Bill> findByResidentProfileCommunityIdAndBillingCycleId(Long communityId, Long billingCycleId);
    List<Bill> findByResidentProfileIdInAndStatus(java.util.Collection<Long> residentProfileIds, com.water.monitoring_and_billing_platform.enums.BillStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(b) FROM Bill b WHERE b.residentProfile.community.id = :communityId AND b.status <> com.water.monitoring_and_billing_platform.enums.BillStatus.PAID")
    long countUnpaidByCommunityId(@Param("communityId") Long communityId);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Bill b WHERE b.residentProfile.community.id = :communityId AND b.status <> com.water.monitoring_and_billing_platform.enums.BillStatus.PAID")
    Double sumOutstandingByCommunityId(@Param("communityId") Long communityId);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Bill b WHERE b.status <> com.water.monitoring_and_billing_platform.enums.BillStatus.PAID")
    Double sumGlobalOutstanding();
}
