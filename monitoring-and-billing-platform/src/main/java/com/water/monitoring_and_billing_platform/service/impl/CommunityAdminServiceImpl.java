package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.dto.CommunityAdminRequest;
import com.water.monitoring_and_billing_platform.dto.CommunityAdminResponse;
import com.water.monitoring_and_billing_platform.entity.Community;
import com.water.monitoring_and_billing_platform.entity.CommunityAdminProfile;
import com.water.monitoring_and_billing_platform.entity.User;
import com.water.monitoring_and_billing_platform.exception.CommunityNotFoundException;
import com.water.monitoring_and_billing_platform.exception.UserNotFoundException;
import com.water.monitoring_and_billing_platform.repository.CommunityAdminProfileRepository;
import com.water.monitoring_and_billing_platform.repository.CommunityRepository;
import com.water.monitoring_and_billing_platform.repository.UserRepository;
import com.water.monitoring_and_billing_platform.service.CommunityAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommunityAdminServiceImpl implements CommunityAdminService {

    private final CommunityAdminProfileRepository communityAdminRepository;
    private final UserRepository userRepository;
    private final CommunityRepository communityRepository;

    @Override
    public CommunityAdminResponse createAdmin(CommunityAdminRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(UserNotFoundException::new);

        Community community = communityRepository.findById(request.getCommunityId())
                .orElseThrow(CommunityNotFoundException::new);

        if (communityAdminRepository.existsByUserId(user.getId())) {
            throw new IllegalStateException("Community Admin already exists.");
        }

        CommunityAdminProfile admin = CommunityAdminProfile.builder()
                .user(user)
                .community(community)
                .phoneNumber(request.getPhoneNumber())
                .officeAddress(request.getOfficeAddress())
                .verified(false)
                .active(true)
                .build();

        // Temporary ID
        admin.setOfficialAdminId(
                "CA-" + community.getCommunityCode() + "-" + user.getId()
        );

        admin = communityAdminRepository.save(admin);

        return CommunityAdminResponse.builder()
                .id(admin.getId())
                .officialAdminId(admin.getOfficialAdminId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(admin.getPhoneNumber())
                .communityName(community.getCommunityName())
                .verified(admin.isVerified())
                .build();
    }

    @Override
    public CommunityAdminResponse getAdmin(Long id) {

        CommunityAdminProfile admin = communityAdminRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Community Admin not found"));

        return CommunityAdminResponse.builder()
                .id(admin.getId())
                .officialAdminId(admin.getOfficialAdminId())
                .fullName(admin.getUser().getFullName())
                .email(admin.getUser().getEmail())
                .phoneNumber(admin.getPhoneNumber())
                .communityName(admin.getCommunity().getCommunityName())
                .verified(admin.isVerified())
                .build();
    }

    @Override
    public List<CommunityAdminResponse> getAllAdmins() {

        return communityAdminRepository.findAll()
                .stream()
                .map(admin -> CommunityAdminResponse.builder()
                        .id(admin.getId())
                        .officialAdminId(admin.getOfficialAdminId())
                        .fullName(admin.getUser().getFullName())
                        .email(admin.getUser().getEmail())
                        .phoneNumber(admin.getPhoneNumber())
                        .communityName(admin.getCommunity().getCommunityName())
                        .verified(admin.isVerified())
                        .build())
                .toList();
    }
}