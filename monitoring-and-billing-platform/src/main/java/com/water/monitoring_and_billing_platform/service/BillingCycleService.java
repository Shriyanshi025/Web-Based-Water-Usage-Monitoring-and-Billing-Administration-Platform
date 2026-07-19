package com.water.monitoring_and_billing_platform.service;

import com.water.monitoring_and_billing_platform.dto.BillingCycleRequest;
import com.water.monitoring_and_billing_platform.dto.BillingCycleResponse;

import java.util.List;

public interface BillingCycleService {

    BillingCycleResponse createBillingCycle(String adminEmail, BillingCycleRequest request);

    BillingCycleResponse updateBillingCycle(String adminEmail, Long id, BillingCycleRequest request);

    BillingCycleResponse openBillingCycle(String adminEmail, Long id);

    BillingCycleResponse closeBillingCycle(String adminEmail, Long id);

    BillingCycleResponse archiveBillingCycle(String adminEmail, Long id);

    BillingCycleResponse getActiveBillingCycle(String adminEmail);

    BillingCycleResponse getBillingCycleById(String adminEmail, Long id);

    List<BillingCycleResponse> getAllBillingCycles(String adminEmail);
}
