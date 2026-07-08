package com.water.monitoring_and_billing_platform.service;

import com.water.monitoring_and_billing_platform.dto.WaterMeterRequest;
import com.water.monitoring_and_billing_platform.dto.WaterMeterResponse;

import java.util.List;

public interface WaterMeterService {

    WaterMeterResponse createWaterMeter(String adminEmail, WaterMeterRequest request);

    WaterMeterResponse getWaterMeterById(String adminEmail, Long id);

    List<WaterMeterResponse> getAllWaterMeters(String adminEmail);

}