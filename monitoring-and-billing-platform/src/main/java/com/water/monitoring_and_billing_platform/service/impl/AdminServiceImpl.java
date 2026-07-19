package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.dto.ApprovalRequest;
import com.water.monitoring_and_billing_platform.dto.CommunityAdminProfileResponse;
import com.water.monitoring_and_billing_platform.dto.ResidentProfileResponse;
import com.water.monitoring_and_billing_platform.dto.UserMeResponse;
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

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final ResidentProfileRepository residentProfileRepository;
    private final CommunityAdminProfileRepository communityAdminProfileRepository;
    private final com.water.monitoring_and_billing_platform.repository.WaterMeterRepository waterMeterRepository;
    private final com.water.monitoring_and_billing_platform.service.AlertService alertService;

    @PersistenceContext
    private EntityManager entityManager;

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
            alertService.createInAppNotification(
                    user,
                    null,
                    null,
                    "Registration Rejected",
                    "Your registration request has been rejected by the administrator.",
                    com.water.monitoring_and_billing_platform.enums.AlertType.REGISTRATION_REJECTED,
                    com.water.monitoring_and_billing_platform.enums.AlertSeverity.HIGH,
                    null
            );
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
                ResidentProfile savedProfile = residentProfileRepository.save(profile);
                
                // Assign a UNIQUE Water Meter automatically
                if (waterMeterRepository.findByResidentProfileId(savedProfile.getId()).isEmpty()) {
                    long totalMeters = waterMeterRepository.count();
                    String meterNumber = String.format("WM-%06d", totalMeters + 1);
                    com.water.monitoring_and_billing_platform.entity.WaterMeter meter = com.water.monitoring_and_billing_platform.entity.WaterMeter.builder()
                            .meterNumber(meterNumber)
                            .residentProfile(savedProfile)
                            .meterStatus(com.water.monitoring_and_billing_platform.enums.MeterStatus.ACTIVE)
                            .initialReading(0.0)
                            .currentReading(0.0)
                            .installationDate(java.time.LocalDate.now())
                            .active(true)
                            .build();
                    waterMeterRepository.save(meter);
                }

                alertService.createInAppNotification(
                        user,
                        savedProfile,
                        savedProfile.getCommunity(),
                        "Registration Approved",
                        "Your registration request has been approved by the administrator. Welcome to HydroSync!",
                        com.water.monitoring_and_billing_platform.enums.AlertType.REGISTRATION_APPROVED,
                        com.water.monitoring_and_billing_platform.enums.AlertSeverity.LOW,
                        null
                );

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

                alertService.createInAppNotification(
                        user,
                        null,
                        profile.getCommunity(),
                        "Registration Approved",
                        "Your community administrator registration request has been approved. Welcome to HydroSync!",
                        com.water.monitoring_and_billing_platform.enums.AlertType.REGISTRATION_APPROVED,
                        com.water.monitoring_and_billing_platform.enums.AlertSeverity.LOW,
                        null
                );
            } else {
                user.setApprovalStatus(ApprovalStatus.APPROVED);
                userRepository.save(user);
            }
        } else {
            user.setApprovalStatus(request.getApprovalStatus());
            userRepository.save(user);
        }

    }

    private UserMeResponse mapToUserMeResponse(User user) {
        return UserMeResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .approvalStatus(user.getApprovalStatus().name())
                .build();
    }

    private ResidentProfileResponse mapToResidentProfileResponse(ResidentProfile resident) {
        return ResidentProfileResponse.builder()
                .id(resident.getId())
                .userId(resident.getUser().getId())
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

    private CommunityAdminProfileResponse mapToCommunityAdminProfileResponse(CommunityAdminProfile admin) {
        return CommunityAdminProfileResponse.builder()
                .id(admin.getId())
                .userId(admin.getUser().getId())
                .officialAdminId(admin.getOfficialAdminId())
                .fullName(admin.getUser().getFullName())
                .email(admin.getUser().getEmail())
                .phoneNumber(admin.getPhoneNumber())
                .communityName(admin.getCommunity().getCommunityName())
                .verified(admin.isVerified())
                .build();
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(UserNotFoundException::new);
        
        entityManager.createQuery("DELETE FROM ActivityLog a WHERE a.user.id = :userId")
                .setParameter("userId", userId)
                .executeUpdate();

        if (user.getRole() == Role.USER) {
            ResidentProfile profile = residentProfileRepository.findByUserId(userId).orElse(null);
            if (profile != null) {
                entityManager.createQuery("DELETE FROM Bill b WHERE b.residentProfile.id = :profileId")
                        .setParameter("profileId", profile.getId())
                        .executeUpdate();
                
                List<com.water.monitoring_and_billing_platform.entity.WaterMeter> meters = entityManager.createQuery(
                        "SELECT wm FROM WaterMeter wm WHERE wm.residentProfile.id = :profileId", 
                        com.water.monitoring_and_billing_platform.entity.WaterMeter.class)
                        .setParameter("profileId", profile.getId())
                        .getResultList();
                
                for (com.water.monitoring_and_billing_platform.entity.WaterMeter meter : meters) {
                    entityManager.createQuery("DELETE FROM WaterUsage wu WHERE wu.waterMeter.id = :meterId")
                            .setParameter("meterId", meter.getId())
                            .executeUpdate();
                    entityManager.remove(meter);
                }
                
                residentProfileRepository.delete(profile);
            }
        } else if (user.getRole() == Role.COMMUNITY_ADMIN) {
            CommunityAdminProfile profile = communityAdminProfileRepository.findByUserId(userId).orElse(null);
            if (profile != null) {
                // Invitations are strongly tied to the Community Admin who created them (nullable = false).
                // Existing business logic requires their deletion to prevent foreign key constraint violations.
                entityManager.createQuery("DELETE FROM Invitation i WHERE i.admin.id = :adminId")
                        .setParameter("adminId", profile.getId())
                        .executeUpdate();
                
                communityAdminProfileRepository.delete(profile);
            }
        }

        userRepository.delete(user);
    }

    @Override
    public List<UserMeResponse> getPendingUsers() {
        return userRepository.findByApprovalStatus(ApprovalStatus.PENDING).stream()
                .map(this::mapToUserMeResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserMeResponse> getApprovedUsers() {
        return userRepository.findByApprovalStatus(ApprovalStatus.APPROVED).stream()
                .map(this::mapToUserMeResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserMeResponse> getRejectedUsers() {
        return userRepository.findByApprovalStatus(ApprovalStatus.REJECTED).stream()
                .map(this::mapToUserMeResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ResidentProfileResponse> getPendingResidents() {
        return residentProfileRepository.findByVerifiedFalseAndUserApprovalStatus(ApprovalStatus.PENDING).stream()
                .map(this::mapToResidentProfileResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<CommunityAdminProfileResponse> getPendingCommunityAdmins() {
        return communityAdminProfileRepository.findByVerifiedFalseAndUserApprovalStatus(ApprovalStatus.PENDING).stream()
                .map(this::mapToCommunityAdminProfileResponse)
                .collect(Collectors.toList());
    }

    @Override
    public UserMeResponse getSelfProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(UserNotFoundException::new);
        return mapToUserMeResponse(user);
    }

    @Override
    @Transactional
    public UserMeResponse updateSelfProfile(String email, String fullName) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(UserNotFoundException::new);
        user.setFullName(fullName);
        User savedUser = userRepository.save(user);
        return mapToUserMeResponse(savedUser);
    }

}
