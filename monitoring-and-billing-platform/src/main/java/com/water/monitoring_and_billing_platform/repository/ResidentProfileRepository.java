package com.water.monitoring_and_billing_platform.repository;

import com.water.monitoring_and_billing_platform.entity.ResidentProfile;
import com.water.monitoring_and_billing_platform.enums.ApprovalStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ResidentProfileRepository
        extends JpaRepository<ResidentProfile, Long> {

    boolean existsByUserId(Long userId);

    Optional<ResidentProfile> findByUserId(Long userId);

    Optional<ResidentProfile> findByOfficialUserId(String officialUserId);

    long count();

    long countByCommunityId(Long communityId);

    long countByCommunityIdAndVerifiedTrue(Long communityId);

    List<ResidentProfile> findByVerifiedFalseAndUserApprovalStatus(ApprovalStatus approvalStatus);
    
    List<ResidentProfile> findByCommunityIdAndVerifiedFalseAndUserApprovalStatus(Long communityId, ApprovalStatus approvalStatus);

    long countByCommunityIdAndVerifiedFalseAndUserApprovalStatus(Long communityId, ApprovalStatus approvalStatus);

}
