package com.water.monitoring_and_billing_platform.repository;

import com.water.monitoring_and_billing_platform.entity.AlertConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AlertConfigurationRepository extends JpaRepository<AlertConfiguration, Long> {
    Optional<AlertConfiguration> findByCommunityId(Long communityId);
    Optional<AlertConfiguration> findFirstByCommunityIdIsNull();
}
