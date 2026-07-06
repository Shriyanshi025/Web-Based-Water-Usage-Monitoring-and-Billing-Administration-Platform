package com.water.monitoring_and_billing_platform.service;

import com.water.monitoring_and_billing_platform.dto.WaterUsageRequest;
import com.water.monitoring_and_billing_platform.dto.WaterUsageResponse;

import java.util.List;

public interface WaterUsageService {

    WaterUsageResponse addReading(WaterUsageRequest request);

    List<WaterUsageResponse> getAllReadings();

    List<WaterUsageResponse> getReadingsByMeter(Long meterId);

}