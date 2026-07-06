package com.water.monitoring_and_billing_platform.service;

import com.water.monitoring_and_billing_platform.dto.UnitRequest;
import com.water.monitoring_and_billing_platform.dto.UnitResponse;

import java.util.List;

public interface UnitService {

    UnitResponse createUnit(UnitRequest request);

    UnitResponse getUnitById(Long id);

    List<UnitResponse> getAllUnits();

}