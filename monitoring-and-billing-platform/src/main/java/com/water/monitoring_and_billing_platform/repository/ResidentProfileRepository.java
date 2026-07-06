package com.water.monitoring_and_billing_platform.repository;

import com.water.monitoring_and_billing_platform.entity.ResidentProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ResidentProfileRepository
        extends JpaRepository<ResidentProfile, Long> {

    boolean existsByUserId(Long userId);

    Optional<ResidentProfile> findByOfficialUserId(String officialUserId);

    long count();

    long countByCommunityId(Long communityId);

}