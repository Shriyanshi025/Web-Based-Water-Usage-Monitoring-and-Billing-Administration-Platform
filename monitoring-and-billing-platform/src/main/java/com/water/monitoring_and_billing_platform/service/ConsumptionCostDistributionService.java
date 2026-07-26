package com.water.monitoring_and_billing_platform.service;

import com.water.monitoring_and_billing_platform.dto.ConsumptionCostDistributionResponse;
import com.water.monitoring_and_billing_platform.entity.ResidentProfile;

import java.math.BigDecimal;

public interface ConsumptionCostDistributionService {
    ConsumptionCostDistributionResponse calculateDistribution(String adminEmail, Long billingCycleId);
    ConsumptionCostDistributionResponse calculateDistribution(Long communityId, Long billingCycleId);
    BigDecimal calculateSharedCostForResident(ResidentProfile resident, Long billingCycleId);
}
