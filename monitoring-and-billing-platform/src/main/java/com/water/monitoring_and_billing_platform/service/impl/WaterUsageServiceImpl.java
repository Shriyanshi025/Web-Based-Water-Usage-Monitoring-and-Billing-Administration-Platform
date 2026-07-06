package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.dto.WaterUsageRequest;
import com.water.monitoring_and_billing_platform.dto.WaterUsageResponse;
import com.water.monitoring_and_billing_platform.entity.WaterMeter;
import com.water.monitoring_and_billing_platform.entity.WaterUsage;
import com.water.monitoring_and_billing_platform.exception.InvalidMeterReadingException;
import com.water.monitoring_and_billing_platform.exception.WaterMeterNotFoundException;
import com.water.monitoring_and_billing_platform.repository.WaterMeterRepository;
import com.water.monitoring_and_billing_platform.repository.WaterUsageRepository;
import com.water.monitoring_and_billing_platform.service.WaterUsageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WaterUsageServiceImpl implements WaterUsageService {

    private final WaterUsageRepository waterUsageRepository;
    private final WaterMeterRepository waterMeterRepository;

    @Override
    public WaterUsageResponse addReading(WaterUsageRequest request) {

        WaterMeter meter = waterMeterRepository.findById(request.getWaterMeterId())
                .orElseThrow(WaterMeterNotFoundException::new);

        double previousReading = meter.getCurrentReading();

        if (request.getCurrentReading() < previousReading) {
            throw new InvalidMeterReadingException();
        }

        double unitsConsumed =
                request.getCurrentReading() - previousReading;

        WaterUsage usage = WaterUsage.builder()
                .waterMeter(meter)
                .previousReading(previousReading)
                .currentReading(request.getCurrentReading())
                .unitsConsumed(unitsConsumed)
                .readingDate(request.getReadingDate())
                .billed(false)
                .build();

        usage = waterUsageRepository.save(usage);

        meter.setCurrentReading(request.getCurrentReading());
        waterMeterRepository.save(meter);

        return WaterUsageResponse.builder()
                .id(usage.getId())
                .meterNumber(meter.getMeterNumber())
                .officialUserId(
                        meter.getResidentProfile().getOfficialUserId()
                )
                .previousReading(previousReading)
                .currentReading(request.getCurrentReading())
                .unitsConsumed(unitsConsumed)
                .readingDate(request.getReadingDate())
                .build();
    }

    @Override
    public List<WaterUsageResponse> getAllReadings() {

        return waterUsageRepository.findAll()
                .stream()
                .map(usage -> WaterUsageResponse.builder()
                        .id(usage.getId())
                        .meterNumber(usage.getWaterMeter().getMeterNumber())
                        .officialUserId(
                                usage.getWaterMeter()
                                        .getResidentProfile()
                                        .getOfficialUserId()
                        )
                        .previousReading(usage.getPreviousReading())
                        .currentReading(usage.getCurrentReading())
                        .unitsConsumed(usage.getUnitsConsumed())
                        .readingDate(usage.getReadingDate())
                        .build())
                .toList();
    }

    @Override
    public List<WaterUsageResponse> getReadingsByMeter(Long meterId) {

        return waterUsageRepository.findByWaterMeterId(meterId)
                .stream()
                .map(usage -> WaterUsageResponse.builder()
                        .id(usage.getId())
                        .meterNumber(usage.getWaterMeter().getMeterNumber())
                        .officialUserId(
                                usage.getWaterMeter()
                                        .getResidentProfile()
                                        .getOfficialUserId()
                        )
                        .previousReading(usage.getPreviousReading())
                        .currentReading(usage.getCurrentReading())
                        .unitsConsumed(usage.getUnitsConsumed())
                        .readingDate(usage.getReadingDate())
                        .build())
                .toList();
    }
}