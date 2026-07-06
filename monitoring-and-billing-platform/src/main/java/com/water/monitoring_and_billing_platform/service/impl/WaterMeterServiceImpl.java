package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.dto.WaterMeterRequest;
import com.water.monitoring_and_billing_platform.dto.WaterMeterResponse;
import com.water.monitoring_and_billing_platform.entity.ResidentProfile;
import com.water.monitoring_and_billing_platform.entity.WaterMeter;
import com.water.monitoring_and_billing_platform.enums.MeterStatus;
import com.water.monitoring_and_billing_platform.exception.ResidentProfileNotFoundException;
import com.water.monitoring_and_billing_platform.exception.WaterMeterAlreadyExistsException;
import com.water.monitoring_and_billing_platform.exception.WaterMeterNotFoundException;
import com.water.monitoring_and_billing_platform.repository.ResidentProfileRepository;
import com.water.monitoring_and_billing_platform.repository.WaterMeterRepository;
import com.water.monitoring_and_billing_platform.service.WaterMeterService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WaterMeterServiceImpl implements WaterMeterService {

    private final WaterMeterRepository waterMeterRepository;
    private final ResidentProfileRepository residentProfileRepository;

    @Override
    public WaterMeterResponse createWaterMeter(WaterMeterRequest request) {

        ResidentProfile resident = residentProfileRepository
                .findById(request.getResidentProfileId())
                .orElseThrow(ResidentProfileNotFoundException::new);

        if (waterMeterRepository.existsByMeterNumber(request.getMeterNumber())
                || waterMeterRepository.existsByResidentProfileId(resident.getId())) {

            throw new WaterMeterAlreadyExistsException();
        }

        WaterMeter meter = WaterMeter.builder()
                .meterNumber(request.getMeterNumber())
                .residentProfile(resident)
                .meterStatus(MeterStatus.ACTIVE)
                .installationDate(request.getInstallationDate())
                .initialReading(request.getInitialReading())
                .currentReading(request.getInitialReading())
                .active(true)
                .build();

        meter = waterMeterRepository.save(meter);

        return WaterMeterResponse.builder()
                .id(meter.getId())
                .meterNumber(meter.getMeterNumber())
                .officialUserId(resident.getOfficialUserId())
                .residentName(resident.getUser().getFullName())
                .initialReading(meter.getInitialReading())
                .currentReading(meter.getCurrentReading())
                .meterStatus(meter.getMeterStatus().name())
                .installationDate(meter.getInstallationDate())
                .build();
    }

    @Override
    public WaterMeterResponse getWaterMeterById(Long id) {

        WaterMeter meter = waterMeterRepository.findById(id)
                .orElseThrow(WaterMeterNotFoundException::new);

        return WaterMeterResponse.builder()
                .id(meter.getId())
                .meterNumber(meter.getMeterNumber())
                .officialUserId(meter.getResidentProfile().getOfficialUserId())
                .residentName(meter.getResidentProfile().getUser().getFullName())
                .initialReading(meter.getInitialReading())
                .currentReading(meter.getCurrentReading())
                .meterStatus(meter.getMeterStatus().name())
                .installationDate(meter.getInstallationDate())
                .build();
    }

    @Override
    public List<WaterMeterResponse> getAllWaterMeters() {

        return waterMeterRepository.findAll()
                .stream()
                .map(meter -> WaterMeterResponse.builder()
                        .id(meter.getId())
                        .meterNumber(meter.getMeterNumber())
                        .officialUserId(meter.getResidentProfile().getOfficialUserId())
                        .residentName(meter.getResidentProfile().getUser().getFullName())
                        .initialReading(meter.getInitialReading())
                        .currentReading(meter.getCurrentReading())
                        .meterStatus(meter.getMeterStatus().name())
                        .installationDate(meter.getInstallationDate())
                        .build())
                .toList();
    }
}