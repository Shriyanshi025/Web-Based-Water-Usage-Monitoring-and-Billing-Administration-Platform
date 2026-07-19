package com.water.monitoring_and_billing_platform.service;

import com.water.monitoring_and_billing_platform.entity.Bill;
import java.math.BigDecimal;
import java.util.List;

public interface BillService {
    Bill generateBillForResident(Long residentId);
    Bill getBillById(Long id);
    List<Bill> getBillsByResidentId(Long residentId);
    List<Bill> getBillsByCommunityId(Long communityId);
    BigDecimal estimateBillForResident(Long residentId, Long billingCycleId);
}
