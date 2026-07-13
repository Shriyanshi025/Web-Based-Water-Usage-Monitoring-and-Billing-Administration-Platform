package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.dto.CommunityRequest;
import com.water.monitoring_and_billing_platform.dto.CommunityResponse;
import com.water.monitoring_and_billing_platform.dto.CommunityStatusUpdateRequest;
import com.water.monitoring_and_billing_platform.entity.Community;
import com.water.monitoring_and_billing_platform.exception.CommunityAlreadyExistsException;
import com.water.monitoring_and_billing_platform.exception.CommunityNotFoundException;
import com.water.monitoring_and_billing_platform.repository.CommunityRepository;
import com.water.monitoring_and_billing_platform.service.CommunityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommunityServiceImpl implements CommunityService {

    private final CommunityRepository communityRepository;
    private final com.water.monitoring_and_billing_platform.repository.ActivityLogRepository activityLogRepository;

    @Override
    @Transactional
    public CommunityResponse createCommunity(CommunityRequest request) {
        if (communityRepository.existsByCommunityName(request.getCommunityName())) {
            throw new CommunityAlreadyExistsException();
        }
        
        if (communityRepository.existsByCommunityCode(request.getCommunityCode())) {
            throw new CommunityAlreadyExistsException();
        }

        Community community = Community.builder()
                .communityName(request.getCommunityName())
                .communityCode(request.getCommunityCode())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .active(true)
                .build();

        community = communityRepository.save(community);

        activityLogRepository.save(com.water.monitoring_and_billing_platform.entity.ActivityLog.builder()
                .title("Community Created")
                .description("New community added: " + community.getCommunityName())
                .timestamp(java.time.LocalDateTime.now())
                .icon("DomainAdd")
                .color("success.main")
                .community(community)
                .build());

        return mapToResponse(community);
    }

    @Override
    @Transactional
    public CommunityResponse updateCommunity(Long id, CommunityRequest request) {
        Community community = communityRepository.findById(id)
                .orElseThrow(() -> new CommunityNotFoundException());

        if (!community.getCommunityName().equals(request.getCommunityName()) &&
                communityRepository.existsByCommunityName(request.getCommunityName())) {
            throw new CommunityAlreadyExistsException();
        }

        if (!community.getCommunityCode().equals(request.getCommunityCode()) &&
                communityRepository.existsByCommunityCode(request.getCommunityCode())) {
            throw new CommunityAlreadyExistsException();
        }

        community.setCommunityName(request.getCommunityName());
        community.setCommunityCode(request.getCommunityCode());
        community.setAddress(request.getAddress());
        community.setCity(request.getCity());
        community.setState(request.getState());
        community.setPincode(request.getPincode());

        community = communityRepository.save(community);

        activityLogRepository.save(com.water.monitoring_and_billing_platform.entity.ActivityLog.builder()
                .title("Community Updated")
                .description("Community details updated: " + community.getCommunityName())
                .timestamp(java.time.LocalDateTime.now())
                .icon("Domain")
                .color("info.main")
                .community(community)
                .build());

        return mapToResponse(community);
    }

    @Override
    @Transactional(readOnly = true)
    public CommunityResponse getCommunity(Long id) {
        Community community = communityRepository.findById(id)
                .orElseThrow(() -> new CommunityNotFoundException());
        return mapToResponse(community);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommunityResponse> getAllCommunities() {
        return communityRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CommunityResponse updateCommunityStatus(Long id, CommunityStatusUpdateRequest request) {
        Community community = communityRepository.findById(id)
                .orElseThrow(() -> new CommunityNotFoundException());

        community.setActive(request.getActive());
        community = communityRepository.save(community);

        return mapToResponse(community);
    }

    @Override
    @Transactional
    public void deleteCommunity(Long id) {
        Community community = communityRepository.findById(id)
                .orElseThrow(() -> new CommunityNotFoundException());
        community.setActive(false);
        communityRepository.save(community);
        
        activityLogRepository.save(com.water.monitoring_and_billing_platform.entity.ActivityLog.builder()
                .title("Community Deleted")
                .description("Community deactivated: " + community.getCommunityName())
                .timestamp(java.time.LocalDateTime.now())
                .icon("DomainDisabled")
                .color("error.main")
                .community(community)
                .build());
    }

    private CommunityResponse mapToResponse(Community community) {
        return CommunityResponse.builder()
                .id(community.getId())
                .communityName(community.getCommunityName())
                .communityCode(community.getCommunityCode())
                .address(community.getAddress())
                .city(community.getCity())
                .state(community.getState())
                .pincode(community.getPincode())
                .active(community.isActive())
                .createdAt(community.getCreatedAt())
                .updatedAt(community.getUpdatedAt())
                .build();
    }
}
