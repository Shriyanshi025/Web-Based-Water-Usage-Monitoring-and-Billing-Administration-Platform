package com.water.monitoring_and_billing_platform.repository;

import com.water.monitoring_and_billing_platform.entity.CommunityAdminProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommunityAdminProfileRepository
        extends JpaRepository<CommunityAdminProfile, Long> {

    boolean existsByUserId(Long userId);

    boolean existsByCommunity_IdAndActiveTrue(Long communityId);

}