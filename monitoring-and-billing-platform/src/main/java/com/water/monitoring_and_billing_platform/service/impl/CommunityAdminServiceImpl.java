package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.dto.CommunityAdminProfileResponse;
import com.water.monitoring_and_billing_platform.dto.CommunityAdminRequest;
import com.water.monitoring_and_billing_platform.dto.CommunityAdminResponse;
import com.water.monitoring_and_billing_platform.dto.CommunityAdminSelfProfileUpdateRequest;
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

@Service
@RequiredArgsConstructor
public class CommunityAdminServiceImpl implements CommunityAdminService {

    private final UserRepository userRepository;
    private final CommunityAdminProfileRepository communityAdminProfileRepository;

    @Override
    public CommunityAdminResponse createAdmin(CommunityAdminRequest request) {
        throw new UnsupportedOperationException(
                "Community Admin module is under implementation."
        );
    }

    @Override
    public CommunityAdminResponse getAdmin(Long id) {
        throw new UnsupportedOperationException(
                "Community Admin module is under implementation."
        );
    }

    @Override
    public List<CommunityAdminResponse> getAllAdmins() {
        return List.of();
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
        return CommunityAdminProfileResponse.builder()
                .id(profile.getId())
                .officialAdminId(profile.getOfficialAdminId())
                .fullName(profile.getUser().getFullName())
                .email(profile.getUser().getEmail())
                .phoneNumber(profile.getPhoneNumber())
                .officeAddress(profile.getOfficeAddress())
                .communityName(profile.getCommunity().getCommunityName())
                .verified(profile.isVerified())
                .build();
    }
}