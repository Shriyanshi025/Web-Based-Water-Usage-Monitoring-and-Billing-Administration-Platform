package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.dto.*;
import com.water.monitoring_and_billing_platform.entity.CommunityAdminProfile;
import com.water.monitoring_and_billing_platform.entity.User;
import com.water.monitoring_and_billing_platform.exception.CommunityAdminProfileNotFoundException;
import com.water.monitoring_and_billing_platform.exception.UserNotFoundException;
import com.water.monitoring_and_billing_platform.repository.CommunityAdminProfileRepository;
import com.water.monitoring_and_billing_platform.repository.UserRepository;
import com.water.monitoring_and_billing_platform.service.CommunityAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommunityAdminServiceImpl implements CommunityAdminService {

    private final UserRepository userRepository;
    private final CommunityAdminProfileRepository communityAdminProfileRepository;
    private final com.water.monitoring_and_billing_platform.repository.CommunityRepository communityRepository;
    private final com.water.monitoring_and_billing_platform.repository.ResidentProfileRepository residentProfileRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public CommunityAdminProfileResponse createAdmin(CommunityAdminRegistrationRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase(java.util.Locale.ROOT);

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new com.water.monitoring_and_billing_platform.exception.EmailAlreadyExistsException();
        }

        Long communityId = request.getCommunityId();
        if (communityId == null) {
            throw new IllegalArgumentException("Community ID is required");
        }

        com.water.monitoring_and_billing_platform.entity.Community community = communityRepository.findById(communityId)
                .orElseThrow(com.water.monitoring_and_billing_platform.exception.CommunityNotFoundException::new);

        boolean hasActiveAdmin = communityAdminProfileRepository.existsByCommunity_IdAndActiveTrue(community.getId());
        if (hasActiveAdmin) {
            throw new IllegalStateException("Community already has an active Community Admin.");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(normalizedEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(com.water.monitoring_and_billing_platform.enums.Role.COMMUNITY_ADMIN)
                .active(true)
                .approvalStatus(com.water.monitoring_and_billing_platform.enums.ApprovalStatus.APPROVED)
                .build();

        User savedUser = userRepository.save(user);

        long verifiedCount = communityAdminProfileRepository.countByCommunityIdAndVerifiedTrue(community.getId());
        String officialAdminId = com.water.monitoring_and_billing_platform.util.IdGenerator.generateOfficialCommunityAdminId(
                community.getCommunityCode(),
                verifiedCount + 1
        );

        CommunityAdminProfile adminProfile = CommunityAdminProfile.builder()
                .user(savedUser)
                .community(community)
                .phoneNumber(request.getPhoneNumber())
                .officeAddress(request.getOfficeAddress())
                .verified(true)
                .active(true)
                .officialAdminId(officialAdminId)
                .build();

        CommunityAdminProfile savedProfile = communityAdminProfileRepository.save(adminProfile);

        return mapToResponse(savedProfile);
    }

    @Override
    @Transactional(readOnly = true)
    public CommunityAdminProfileResponse getAdmin(Long id) {
        CommunityAdminProfile profile = communityAdminProfileRepository.findById(id)
                .orElseThrow(CommunityAdminProfileNotFoundException::new);
        return mapToResponse(profile);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommunityAdminProfileResponse> getAllAdmins() {
        return communityAdminProfileRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CommunityAdminProfileResponse updateAdmin(Long id, CommunityAdminUpdateRequest request) {
        CommunityAdminProfile profile = communityAdminProfileRepository.findById(id)
                .orElseThrow(CommunityAdminProfileNotFoundException::new);

        User user = profile.getUser();
        user.setFullName(request.getFullName());
        
        profile.setPhoneNumber(request.getPhoneNumber());
        if (request.getOfficeAddress() != null) {
            profile.setOfficeAddress(request.getOfficeAddress());
        }

        userRepository.save(user);
        profile = communityAdminProfileRepository.save(profile);

        return mapToResponse(profile);
    }

    @Override
    @Transactional
    public CommunityAdminProfileResponse updateAdminStatus(Long id, CommunityAdminStatusUpdateRequest request) {
        CommunityAdminProfile profile = communityAdminProfileRepository.findById(id)
                .orElseThrow(CommunityAdminProfileNotFoundException::new);

        profile.setActive(request.getActive());
        profile = communityAdminProfileRepository.save(profile);

        return mapToResponse(profile);
    }

    @Override
    public CommunityAdminProfileResponse getSelfProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(UserNotFoundException::new);

        CommunityAdminProfile profile = communityAdminProfileRepository.findByUserId(user.getId())
                .orElseThrow(CommunityAdminProfileNotFoundException::new);

        return mapToResponse(profile);
    }

    @Override
    @Transactional
    public CommunityAdminProfileResponse updateSelfProfile(String email, CommunityAdminSelfProfileUpdateRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(UserNotFoundException::new);

        CommunityAdminProfile profile = communityAdminProfileRepository.findByUserId(user.getId())
                .orElseThrow(CommunityAdminProfileNotFoundException::new);

        user.setFullName(request.getFullName());
        profile.setPhoneNumber(request.getPhoneNumber());
        if (request.getOfficeAddress() != null) {
            profile.setOfficeAddress(request.getOfficeAddress());
        }

        userRepository.save(user);
        profile = communityAdminProfileRepository.save(profile);

        return mapToResponse(profile);
    }

    private CommunityAdminProfileResponse mapToResponse(CommunityAdminProfile profile) {
        String commAddr = null;
        Long totalRes = 0L;
        if (profile.getCommunity() != null) {
            var c = profile.getCommunity();
            commAddr = (c.getAddress() != null ? c.getAddress() : "") + 
                (c.getCity() != null ? ", " + c.getCity() : "") + 
                (c.getState() != null ? ", " + c.getState() : "") + 
                (c.getPincode() != null ? " - " + c.getPincode() : "");
            totalRes = residentProfileRepository.countByCommunityId(c.getId());
        }

        return CommunityAdminProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .officialAdminId(profile.getOfficialAdminId())
                .fullName(profile.getUser().getFullName())
                .email(profile.getUser().getEmail())
                .phoneNumber(profile.getPhoneNumber())
                .officeAddress(profile.getOfficeAddress())
                .communityId(profile.getCommunity() != null ? profile.getCommunity().getId() : null)
                .communityName(profile.getCommunity() != null ? profile.getCommunity().getCommunityName() : null)
                .verified(profile.isVerified())
                .active(profile.isActive())
                .createdAt(profile.getCreatedAt())
                .communityAddress(commAddr)
                .totalResidents(totalRes)
                .build();
    }
}
