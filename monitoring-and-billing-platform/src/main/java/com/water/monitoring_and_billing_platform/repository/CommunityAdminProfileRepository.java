package com.water.monitoring_and_billing_platform.repository;

import com.water.monitoring_and_billing_platform.entity.CommunityAdminProfile;
import com.water.monitoring_and_billing_platform.enums.ApprovalStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CommunityAdminProfileRepository
        extends JpaRepository<CommunityAdminProfile, Long> {

    boolean existsByUserId(Long userId);

    Optional<CommunityAdminProfile> findByUserId(Long userId);

    boolean existsByCommunity_IdAndActiveTrue(Long communityId);

    long countByCommunityIdAndVerifiedTrue(Long communityId);

    List<CommunityAdminProfile> findByVerifiedFalseAndUserApprovalStatus(ApprovalStatus approvalStatus);
    long countByCommunityId(Long communityId);
}
