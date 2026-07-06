package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.dto.CommunityRequest;
import com.water.monitoring_and_billing_platform.entity.Community;
import com.water.monitoring_and_billing_platform.exception.CommunityAlreadyExistsException;
import com.water.monitoring_and_billing_platform.exception.CommunityNotFoundException;
import com.water.monitoring_and_billing_platform.repository.CommunityRepository;
import com.water.monitoring_and_billing_platform.service.CommunityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommunityServiceImpl implements CommunityService {

    private final CommunityRepository communityRepository;

    @Override
    public Community createCommunity(CommunityRequest request) {

        if (communityRepository.existsByCommunityName(request.getCommunityName())
                || communityRepository.existsByCommunityCode(request.getCommunityCode())) {

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

        return communityRepository.save(community);
    }

    @Override
    public List<Community> getAllCommunities() {
        return communityRepository.findAll();
    }

    @Override
    public Community getCommunityById(Long id) {

        return communityRepository.findById(id)
                .orElseThrow(CommunityNotFoundException::new);

    }
}