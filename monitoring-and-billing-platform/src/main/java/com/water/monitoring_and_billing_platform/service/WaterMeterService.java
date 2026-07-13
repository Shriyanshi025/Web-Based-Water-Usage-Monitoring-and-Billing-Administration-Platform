package com.water.monitoring_and_billing_platform.service;

import com.water.monitoring_and_billing_platform.dto.WaterMeterRequest;
import com.water.monitoring_and_billing_platform.dto.WaterMeterResponse;
import com.water.monitoring_and_billing_platform.dto.WaterMeterUpdateRequest;

import java.util.List;

public interface WaterMeterService {

    WaterMeterResponse createWaterMeter(String adminEmail, WaterMeterRequest request);

    WaterMeterResponse getWaterMeterById(String adminEmail, Long id);

    List<WaterMeterResponse> getAllWaterMeters(String adminEmail);

    WaterMeterResponse updateWaterMeter(String adminEmail, Long meterId, WaterMeterUpdateRequest request);

    void deleteWaterMeter(String adminEmail, Long id);

    WaterMeterResponse getMyMeter(String userEmail);

}
