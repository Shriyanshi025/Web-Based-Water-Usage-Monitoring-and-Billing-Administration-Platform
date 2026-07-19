package com.water.monitoring_and_billing_platform.service;

import java.io.InputStream;
import java.util.List;

import com.water.monitoring_and_billing_platform.dto.WaterUsageRequest;
import com.water.monitoring_and_billing_platform.dto.WaterUsageResponse;

public interface WaterUsageService {

    WaterUsageResponse addReading(String adminEmail, WaterUsageRequest request);

    List<WaterUsageResponse> getAllReadings(String adminEmail);

    List<WaterUsageResponse> getReadingsByMeter(String adminEmail, Long meterId);

    List<WaterUsageResponse> uploadCsv(String adminEmail, InputStream inputStream);

    List<WaterUsageResponse> getMyReadings(String userEmail);

    WaterUsageResponse updateReading(String adminEmail, Long readingId, WaterUsageRequest request);

    void deleteReading(String adminEmail, Long readingId);

    List<WaterUsageResponse> getReadingsByBillingCycle(String adminEmail, Long billingCycleId);

}
