package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.dto.ApprovalRequest;
import java.util.Objects;
import com.water.monitoring_and_billing_platform.entity.CommunityAdminProfile;
import com.water.monitoring_and_billing_platform.entity.ResidentProfile;
import com.water.monitoring_and_billing_platform.entity.User;
import com.water.monitoring_and_billing_platform.enums.ApprovalStatus;
import com.water.monitoring_and_billing_platform.enums.Role;
import com.water.monitoring_and_billing_platform.exception.ResidentProfileNotFoundException;
import com.water.monitoring_and_billing_platform.exception.UserNotFoundException;
import com.water.monitoring_and_billing_platform.repository.CommunityAdminProfileRepository;
import com.water.monitoring_and_billing_platform.repository.ResidentProfileRepository;
import com.water.monitoring_and_billing_platform.repository.UserRepository;
import com.water.monitoring_and_billing_platform.service.AdminService;
import com.water.monitoring_and_billing_platform.util.IdGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final ResidentProfileRepository residentProfileRepository;
    private final CommunityAdminProfileRepository communityAdminProfileRepository;

    @Override
    @Transactional
    public void approveUser(
            Long userId,
            ApprovalRequest request
    ){

        User user = userRepository.findById(userId)
                .orElseThrow(UserNotFoundException::new);

        if (user.getApprovalStatus() != ApprovalStatus.PENDING) {
            throw new IllegalStateException("User is not in PENDING status.");
        }

        if (request.getApprovalStatus() == ApprovalStatus.REJECTED) {
            user.setApprovalStatus(ApprovalStatus.REJECTED);
            userRepository.save(user);
            return;
        }

        if (request.getApprovalStatus() == ApprovalStatus.APPROVED) {
            if (user.getRole() == Role.USER) {
                ResidentProfile profile = residentProfileRepository.findByUserId(user.getId())
                        .orElseThrow(ResidentProfileNotFoundException::new);

                long verifiedCount = residentProfileRepository.countByCommunityIdAndVerifiedTrue(profile.getCommunity().getId());
                long sequence = verifiedCount + 1;

                String officialUserId = IdGenerator.generateOfficialResidentId(
                        profile.getCommunity().getCommunityCode(),
                        profile.getBlock().getBlockName(),
                        profile.getUnit().getUnitNumber(),
                        sequence
                );

                profile.setVerified(true);
                profile.setOfficialUserId(officialUserId);

                user.setApprovalStatus(ApprovalStatus.APPROVED);

                userRepository.save(user);
                residentProfileRepository.save(profile);

            } else if (user.getRole() == Role.COMMUNITY_ADMIN) {
                CommunityAdminProfile profile = communityAdminProfileRepository.findByUserId(user.getId())
                        .orElseThrow(() -> new RuntimeException("Community Admin profile not found."));

                long verifiedCount = communityAdminProfileRepository.countByCommunityIdAndVerifiedTrue(profile.getCommunity().getId());
                long sequence = verifiedCount + 1;

                String officialAdminId = IdGenerator.generateOfficialCommunityAdminId(
                        profile.getCommunity().getCommunityCode(),
                        sequence
                );

                profile.setVerified(true);
                profile.setOfficialAdminId(officialAdminId);

                user.setApprovalStatus(ApprovalStatus.APPROVED);

                userRepository.save(user);
                communityAdminProfileRepository.save(profile);
            } else {
                user.setApprovalStatus(ApprovalStatus.APPROVED);
                userRepository.save(user);
            }
        } else {
            user.setApprovalStatus(request.getApprovalStatus());
            userRepository.save(user);
        }

    }

    @Override
    public List<User> getPendingUsers() {

        return userRepository.findByApprovalStatus(
                ApprovalStatus.PENDING
        );

    }

    @Override
    public List<User> getApprovedUsers() {

        return userRepository.findByApprovalStatus(
                ApprovalStatus.APPROVED
        );

    }

    @Override
    public List<User> getRejectedUsers() {

        return userRepository.findByApprovalStatus(
                ApprovalStatus.REJECTED
        );

    }

    @Override
    public List<ResidentProfile> getPendingResidents() {
        return residentProfileRepository.findByVerifiedFalseAndUserApprovalStatus(ApprovalStatus.PENDING);
    }

    @Override
    public List<CommunityAdminProfile> getPendingCommunityAdmins() {
        return communityAdminProfileRepository.findByVerifiedFalseAndUserApprovalStatus(ApprovalStatus.PENDING);
    }

}