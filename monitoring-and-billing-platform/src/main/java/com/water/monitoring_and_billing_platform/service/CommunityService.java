package com.water.monitoring_and_billing_platform.service;

import com.water.monitoring_and_billing_platform.dto.CommunityRequest;
import com.water.monitoring_and_billing_platform.dto.CommunityResponse;
import com.water.monitoring_and_billing_platform.dto.CommunityStatusUpdateRequest;

import java.util.List;

public interface CommunityService {

    CommunityResponse createCommunity(CommunityRequest request);

    CommunityResponse updateCommunity(Long id, CommunityRequest request);

    CommunityResponse getCommunity(Long id);

    List<CommunityResponse> getAllCommunities();

    CommunityResponse updateCommunityStatus(Long id, CommunityStatusUpdateRequest request);

    void deleteCommunity(Long id);

}
