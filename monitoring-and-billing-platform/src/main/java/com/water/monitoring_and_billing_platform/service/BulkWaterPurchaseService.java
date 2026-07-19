package com.water.monitoring_and_billing_platform.service;

import com.water.monitoring_and_billing_platform.dto.BulkWaterPurchaseRequest;
import com.water.monitoring_and_billing_platform.dto.BulkWaterPurchaseResponse;
import com.water.monitoring_and_billing_platform.dto.BulkWaterPurchaseSummaryResponse;

import java.util.List;

public interface BulkWaterPurchaseService {
    BulkWaterPurchaseResponse recordPurchase(String adminEmail, BulkWaterPurchaseRequest request);
    List<BulkWaterPurchaseResponse> getPurchasesForCycle(String adminEmail, Long billingCycleId);
    BulkWaterPurchaseSummaryResponse getSummaryForCycle(String adminEmail, Long billingCycleId);
}
