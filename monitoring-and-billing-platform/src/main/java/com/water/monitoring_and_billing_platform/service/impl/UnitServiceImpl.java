package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.dto.UnitRequest;
import java.util.Objects;
import com.water.monitoring_and_billing_platform.dto.UnitResponse;
import com.water.monitoring_and_billing_platform.entity.Block;
import com.water.monitoring_and_billing_platform.entity.Community;
import com.water.monitoring_and_billing_platform.entity.Unit;
import com.water.monitoring_and_billing_platform.exception.BlockNotFoundException;
import com.water.monitoring_and_billing_platform.exception.CommunityNotFoundException;
import com.water.monitoring_and_billing_platform.exception.UnitAlreadyExistsException;
import com.water.monitoring_and_billing_platform.exception.UnitNotFoundException;
import com.water.monitoring_and_billing_platform.repository.BlockRepository;
import com.water.monitoring_and_billing_platform.repository.CommunityRepository;
import com.water.monitoring_and_billing_platform.repository.UnitRepository;
import com.water.monitoring_and_billing_platform.service.UnitService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UnitServiceImpl implements UnitService {

    private final UnitRepository unitRepository;
    private final CommunityRepository communityRepository;
    private final BlockRepository blockRepository;

    @Override
    @org.springframework.transaction.annotation.Transactional
    public UnitResponse createUnit(UnitRequest request) {

        // next message

        Community community = communityRepository.findById(Objects.requireNonNull(request.getCommunityId()))
                .orElseThrow(CommunityNotFoundException::new);

        Block block = blockRepository.findById(Objects.requireNonNull(request.getBlockId()))
                .orElseThrow(BlockNotFoundException::new);

        if (!block.getCommunity().getId().equals(community.getId())) {
            throw new RuntimeException(
                    "Selected block does not belong to selected community."
            );
        }

        if (unitRepository.existsByBlockIdAndUnitNumber(
                block.getId(),
                request.getUnitNumber())) {

            throw new UnitAlreadyExistsException();
        }

        Unit unit = Unit.builder()
                .unitNumber(request.getUnitNumber())
                .unitType(request.getUnitType())
                .floorNumber(request.getFloorNumber())
                .community(community)
                .block(block)
                .active(true)
                .build();

        unit = unitRepository.save(Objects.requireNonNull(unit));

        return UnitResponse.builder()
                .id(unit.getId())
                .unitNumber(unit.getUnitNumber())
                .unitType(unit.getUnitType().name())
                .floorNumber(unit.getFloorNumber())
                .communityName(community.getCommunityName())
                .blockName(block.getBlockName())
                .active(unit.isActive())
                .build();
    }

    @Override
    public UnitResponse getUnitById(Long id) {
        Unit unit = unitRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(UnitNotFoundException::new);

        return UnitResponse.builder()
                .id(unit.getId())
                .unitNumber(unit.getUnitNumber())
                .unitType(unit.getUnitType().name())
                .floorNumber(unit.getFloorNumber())
                .communityName(unit.getCommunity().getCommunityName())
                .blockName(unit.getBlock().getBlockName())
                .active(unit.isActive())
                .build();
    }

    @Override
    public List<UnitResponse> getAllUnits() {
        return unitRepository.findAll()
                .stream()
                .map(unit -> UnitResponse.builder()
                        .id(unit.getId())
                        .unitNumber(unit.getUnitNumber())
                        .unitType(unit.getUnitType().name())
                        .floorNumber(unit.getFloorNumber())
                        .communityName(unit.getCommunity().getCommunityName())
                        .blockName(unit.getBlock().getBlockName())
                        .active(unit.isActive())
                        .build())
                .toList();
    }
}