package com.water.monitoring_and_billing_platform.service;

import com.water.monitoring_and_billing_platform.dto.TariffPlanPreviewResponse;
import com.water.monitoring_and_billing_platform.dto.TariffPlanRequest;
import com.water.monitoring_and_billing_platform.dto.TariffPlanResponse;
import com.water.monitoring_and_billing_platform.entity.Community;
import com.water.monitoring_and_billing_platform.entity.TariffPlan;

import java.util.List;

public interface TariffPlanService {

    TariffPlanResponse createTariffPlan(String adminEmail, TariffPlanRequest request);

    TariffPlanResponse updateTariffPlan(String adminEmail, Long id, TariffPlanRequest request);

    void deleteTariffPlan(String adminEmail, Long id);

    TariffPlanResponse getTariffPlanById(String adminEmail, Long id);

    List<TariffPlanResponse> getTariffPlansByCommunity(String adminEmail);

    TariffPlanResponse activateTariffPlan(String adminEmail, Long id);

    TariffPlanResponse deactivateTariffPlan(String adminEmail, Long id);

    TariffPlanResponse archiveTariffPlan(String adminEmail, Long id);

    TariffPlanResponse duplicateTariffPlan(String adminEmail, Long id);

    TariffPlanPreviewResponse previewTariffPlan(String adminEmail, Long id, List<Double> sampleUnits);

    TariffPlanPreviewResponse previewUnsavedTariffPlan(String adminEmail, TariffPlanRequest request, List<Double> sampleUnits);

    TariffPlan getActiveTariffPlan(Community community);
}
