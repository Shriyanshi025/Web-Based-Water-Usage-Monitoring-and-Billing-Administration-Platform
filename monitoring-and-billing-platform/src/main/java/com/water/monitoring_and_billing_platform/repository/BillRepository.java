package com.water.monitoring_and_billing_platform.repository;

import com.water.monitoring_and_billing_platform.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    List<Bill> findByResidentProfileId(Long residentProfileId);
    boolean existsByBillNumber(String billNumber);
    long countByBillNumberStartingWith(String prefix);
    boolean existsByResidentProfileIdAndBillingMonthAndBillingYear(Long residentProfileId, int billingMonth, int billingYear);
    java.util.Optional<Bill> findFirstByResidentProfileIdOrderByBillDateDescIdDesc(Long residentProfileId);
    List<Bill> findByResidentProfileCommunityId(Long communityId);
    boolean existsByTariffPlanId(Long tariffPlanId);
    boolean existsByResidentProfileIdAndBillingCycleId(Long residentProfileId, Long billingCycleId);
    java.util.Optional<Bill> findByResidentProfileIdAndBillingCycleId(Long residentProfileId, Long billingCycleId);
    List<Bill> findByResidentProfileCommunityIdAndBillingCycleId(Long communityId, Long billingCycleId);
}
