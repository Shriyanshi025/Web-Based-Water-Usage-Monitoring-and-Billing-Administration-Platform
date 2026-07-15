package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.dto.AuthResponse;
import com.water.monitoring_and_billing_platform.dto.CommunityAdminRegistrationRequest;
import com.water.monitoring_and_billing_platform.dto.ResidentRegistrationRequest;
import com.water.monitoring_and_billing_platform.entity.*;
import com.water.monitoring_and_billing_platform.enums.ApprovalStatus;
import com.water.monitoring_and_billing_platform.enums.Role;
import com.water.monitoring_and_billing_platform.exception.*;
import com.water.monitoring_and_billing_platform.repository.*;
import com.water.monitoring_and_billing_platform.service.RegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class RegistrationServiceImpl implements RegistrationService {

    private final UserRepository userRepository;
    private final CommunityRepository communityRepository;
    private final BlockRepository blockRepository;
    private final UnitRepository unitRepository;
    private final ResidentProfileRepository residentProfileRepository;
    private final CommunityAdminProfileRepository communityAdminProfileRepository;
    private final InvitationRepository invitationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public AuthResponse registerResident(ResidentRegistrationRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new EmailAlreadyExistsException();
        }

        Community community;
        Invitation invitation = null;
        Long communityId = request.getCommunityId();
        Long blockId = request.getBlockId();
        Long unitId = request.getUnitId();

        if (StringUtils.hasText(request.getInviteToken())) {
            invitation = invitationRepository.findByToken(request.getInviteToken())
                    .orElseThrow(InvalidInvitationTokenException::new);

            if (invitation.getStatus() == com.water.monitoring_and_billing_platform.enums.InvitationStatus.REVOKED) {
                throw new com.water.monitoring_and_billing_platform.exception.InvitationRevokedException();
            }

            if (invitation.getStatus() == com.water.monitoring_and_billing_platform.enums.InvitationStatus.EXPIRED ||
                invitation.getStatus() == com.water.monitoring_and_billing_platform.enums.InvitationStatus.REGISTERED ||
                invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
                
                if (invitation.getStatus() != com.water.monitoring_and_billing_platform.enums.InvitationStatus.EXPIRED &&
                    invitation.getStatus() != com.water.monitoring_and_billing_platform.enums.InvitationStatus.REGISTERED) {
                    invitation.setStatus(com.water.monitoring_and_billing_platform.enums.InvitationStatus.EXPIRED);
                    invitationRepository.save(invitation);
                }
                throw new InvitationExpiredException();
            }

            community = invitation.getCommunity();
        } else {
            if (communityId == null) {
                throw new IllegalArgumentException("Community ID is required");
            }
            community = communityRepository.findById(communityId)
                    .orElseThrow(CommunityNotFoundException::new);
        }

        if (blockId == null) {
            throw new IllegalArgumentException("Block ID is required");
        }
        Block block = blockRepository.findById(blockId)
                .orElseThrow(BlockNotFoundException::new);

        if (unitId == null) {
            throw new IllegalArgumentException("Unit ID is required");
        }
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(UnitNotFoundException::new);

        if (!block.getCommunity().getId().equals(community.getId())) {
            throw new IllegalArgumentException("Selected block does not belong to selected community.");
        }

        if (!unit.getBlock().getId().equals(block.getId())) {
            throw new IllegalArgumentException("Selected unit does not belong to selected block.");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(normalizedEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .active(true)
                .approvalStatus(ApprovalStatus.PENDING)
                .build();

        User savedUser = userRepository.save(user);

        ResidentProfile residentProfile = ResidentProfile.builder()
                .user(savedUser)
                .community(community)
                .block(block)
                .unit(unit)
                .phoneNumber(request.getPhoneNumber())
                .verified(false)
                .active(true)
                .officialUserId(null)
                .build();

        residentProfileRepository.save(residentProfile);

        if (invitation != null) {
            invitation.setStatus(com.water.monitoring_and_billing_platform.enums.InvitationStatus.REGISTERED);
            invitationRepository.save(invitation);
        }

        return new AuthResponse(
                "Registration Successful",
                null,
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getRole().name(),
                savedUser.getApprovalStatus().name()
        );
    }

    @Override
    @Transactional
    public AuthResponse registerCommunityAdmin(CommunityAdminRegistrationRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new EmailAlreadyExistsException();
        }

        Long communityId = request.getCommunityId();
        if (communityId == null) {
            throw new IllegalArgumentException("Community ID is required");
        }

        Community community = communityRepository.findById(communityId)
                .orElseThrow(CommunityNotFoundException::new);

        boolean hasActiveAdmin = communityAdminProfileRepository.existsByCommunity_IdAndActiveTrue(community.getId());

        if (hasActiveAdmin) {
            throw new RuntimeException("Community already has an active Community Admin.");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(normalizedEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.COMMUNITY_ADMIN)
                .active(true)
                .approvalStatus(ApprovalStatus.PENDING)
                .build();

        User savedUser = userRepository.save(user);

        CommunityAdminProfile adminProfile = CommunityAdminProfile.builder()
                .user(savedUser)
                .community(community)
                .phoneNumber(request.getPhoneNumber())
                .officeAddress(request.getOfficeAddress())
                .verified(false)
                .active(true)
                .officialAdminId(null)
                .build();

        communityAdminProfileRepository.save(adminProfile);

        return new AuthResponse(
                "Registration Successful",
                null,
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getRole().name(),
                savedUser.getApprovalStatus().name()
        );
    }
}
