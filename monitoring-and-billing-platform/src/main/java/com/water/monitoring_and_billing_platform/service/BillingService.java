package com.water.monitoring_and_billing_platform.service;

import com.water.monitoring_and_billing_platform.dto.BillResponse;
import com.water.monitoring_and_billing_platform.dto.BillingCycleResponse;
import com.water.monitoring_and_billing_platform.dto.GenerateBillRequest;
import com.water.monitoring_and_billing_platform.dto.TariffPlanResponse;

import java.util.List;

public interface BillingService {
    List<BillResponse> getBills(String adminEmail);
    BillResponse getBillById(String adminEmail, Long billId);
    List<BillResponse> generateBills(String adminEmail, GenerateBillRequest request);
    BillingCycleResponse getActiveBillingCycle(String adminEmail);
    List<TariffPlanResponse> getTariffPlans(String adminEmail);
    BillResponse generateBillForReading(com.water.monitoring_and_billing_platform.entity.WaterUsage usage);
    List<BillResponse> getMyBills(String userEmail);
    BillResponse getMyBillById(String userEmail, Long billId);
    BillResponse payMyBill(String userEmail, Long billId);
}
