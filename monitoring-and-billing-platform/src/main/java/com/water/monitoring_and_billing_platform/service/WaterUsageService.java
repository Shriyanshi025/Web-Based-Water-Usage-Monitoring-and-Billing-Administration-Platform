package com.water.monitoring_and_billing_platform.service;

import com.water.monitoring_and_billing_platform.dto.WaterUsageRequest;
import com.water.monitoring_and_billing_platform.dto.WaterUsageResponse;

import java.util.List;

public interface WaterUsageService {

    WaterUsageResponse addReading(String adminEmail, WaterUsageRequest request);

    List<WaterUsageResponse> getAllReadings(String adminEmail);

    List<WaterUsageResponse> getReadingsByMeter(String adminEmail, Long meterId);

}