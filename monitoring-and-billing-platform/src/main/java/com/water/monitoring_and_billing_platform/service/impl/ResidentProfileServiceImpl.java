package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.dto.ResidentProfileRequest;
import com.water.monitoring_and_billing_platform.dto.ResidentProfileResponse;
import com.water.monitoring_and_billing_platform.entity.*;
import com.water.monitoring_and_billing_platform.exception.*;
import com.water.monitoring_and_billing_platform.repository.*;
import com.water.monitoring_and_billing_platform.service.ResidentProfileService;
import com.water.monitoring_and_billing_platform.util.IdGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResidentProfileServiceImpl implements ResidentProfileService {

    private final ResidentProfileRepository residentProfileRepository;

    private final UserRepository userRepository;

    private final CommunityRepository communityRepository;

    private final BlockRepository blockRepository;

    private final UnitRepository unitRepository;

    @Override
    public ResidentProfileResponse createResidentProfile(ResidentProfileRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(UserNotFoundException::new);

        Community community = communityRepository.findById(request.getCommunityId())
                .orElseThrow(CommunityNotFoundException::new);

        Block block = blockRepository.findById(request.getBlockId())
                .orElseThrow(BlockNotFoundException::new);

        Unit unit = unitRepository.findById(request.getUnitId())
                .orElseThrow(UnitNotFoundException::new);

        if (residentProfileRepository.existsByUserId(user.getId())) {
            throw new ResidentAlreadyExistsException();
        }

        if (!block.getCommunity().getId().equals(community.getId())) {
            throw new RuntimeException(
                    "Selected block does not belong to selected community."
            );
        }

        if (!unit.getBlock().getId().equals(block.getId())) {
            throw new RuntimeException(
                    "Selected unit does not belong to selected block."
            );
        }

        ResidentProfile resident = ResidentProfile.builder()
                .user(user)
                .community(community)
                .block(block)
                .unit(unit)
                .phoneNumber(request.getPhoneNumber())
                .verified(false)
                .active(true)
                .build();

        resident.setOfficialUserId(
                IdGenerator.generateOfficialUserId(
                        community.getCommunityCode(),
                        block.getBlockName(),
                        unit.getUnitNumber()
                )
        );

        resident = residentProfileRepository.save(resident);

        return ResidentProfileResponse.builder()
                .id(resident.getId())
                .officialUserId(resident.getOfficialUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(resident.getPhoneNumber())
                .communityName(community.getCommunityName())
                .blockName(block.getBlockName())
                .unitNumber(unit.getUnitNumber())
                .verified(resident.isVerified())
                .build();
    }

    @Override
    public ResidentProfileResponse getResidentById(Long id) {
        ResidentProfile resident = residentProfileRepository.findById(id)
                .orElseThrow(ResidentProfileNotFoundException::new);

        return mapToResponse(resident);
    }

    @Override
    public List<ResidentProfileResponse> getAllResidents() {
        return residentProfileRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private ResidentProfileResponse mapToResponse(ResidentProfile resident) {

        return ResidentProfileResponse.builder()
                .id(resident.getId())
                .officialUserId(resident.getOfficialUserId())
                .fullName(resident.getUser().getFullName())
                .email(resident.getUser().getEmail())
                .phoneNumber(resident.getPhoneNumber())
                .communityName(resident.getCommunity().getCommunityName())
                .blockName(resident.getBlock().getBlockName())
                .unitNumber(resident.getUnit().getUnitNumber())
                .verified(resident.isVerified())
                .build();
    }
}