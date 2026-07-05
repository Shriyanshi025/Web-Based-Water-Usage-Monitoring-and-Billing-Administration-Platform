package com.water.monitoring_and_billing_platform.service;

import com.water.monitoring_and_billing_platform.dto.CommunityRequest;
import com.water.monitoring_and_billing_platform.entity.Community;

import java.util.List;

public interface CommunityService {

    Community createCommunity(CommunityRequest request);

    List<Community> getAllCommunities();

    Community getCommunityById(Long id);

}