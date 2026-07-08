package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.dto.ResidentProfileRequest;
import com.water.monitoring_and_billing_platform.dto.ResidentSelfProfileUpdateRequest;
import com.water.monitoring_and_billing_platform.dto.ResidentProfileResponse;
import com.water.monitoring_and_billing_platform.entity.*;
import com.water.monitoring_and_billing_platform.exception.*;
import com.water.monitoring_and_billing_platform.repository.*;
import com.water.monitoring_and_billing_platform.service.ResidentProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResidentProfileServiceImpl implements ResidentProfileService {

    private final ResidentProfileRepository residentProfileRepository;

    private final UserRepository userRepository;

    private final CommunityRepository communityRepository;

    private final BlockRepository blockRepository;

    private final UnitRepository unitRepository;
    
    private final CommunityAdminProfileRepository communityAdminProfileRepository;

    private CommunityAdminProfile getAdminProfile(String adminEmail) {
        User user = userRepository.findByEmail(adminEmail)
                .orElseThrow(UserNotFoundException::new);
        return communityAdminProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Community Admin profile not found."));
    }

    @Override
    public ResidentProfileResponse createResidentProfile(String adminEmail, ResidentProfileRequest request) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);
        
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(UserNotFoundException::new);

        Community community = communityRepository.findById(request.getCommunityId())
                .orElseThrow(CommunityNotFoundException::new);

        if (!community.getId().equals(adminProfile.getCommunity().getId())) {
            throw new RuntimeException("Not authorized to create resident for this community.");
        }

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

        resident.setOfficialUserId("PENDING");

        resident = residentProfileRepository.save(resident);

        return mapToResponse(resident);
    }

    @Override
    public ResidentProfileResponse getResidentById(String adminEmail, Long id) {
        if (id == null) {
            throw new ResidentProfileNotFoundException();
        }
        
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);
        
        ResidentProfile resident = residentProfileRepository.findById(id)
                .orElseThrow(ResidentProfileNotFoundException::new);

        if (!resident.getCommunity().getId().equals(adminProfile.getCommunity().getId())) {
            throw new ResidentProfileNotFoundException();
        }

        return mapToResponse(resident);
    }

    @Override
    public List<ResidentProfileResponse> getAllResidents(String adminEmail) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);
        
        return residentProfileRepository.findAll()
                .stream()
                .filter(resident -> resident.getCommunity().getId().equals(adminProfile.getCommunity().getId()))
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

    @Override
    public ResidentProfileResponse getSelfProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(UserNotFoundException::new);

        ResidentProfile resident = residentProfileRepository.findByUserId(user.getId())
                .orElseThrow(ResidentProfileNotFoundException::new);

        return mapToResponse(resident);
    }

    @Override
    @Transactional
    public ResidentProfileResponse updateSelfProfile(String email, ResidentSelfProfileUpdateRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(UserNotFoundException::new);

        ResidentProfile resident = residentProfileRepository.findByUserId(user.getId())
                .orElseThrow(ResidentProfileNotFoundException::new);

        user.setFullName(request.getFullName());
        resident.setPhoneNumber(request.getPhoneNumber());

        userRepository.save(user);
        resident = residentProfileRepository.save(resident);

        return mapToResponse(resident);
    }
}