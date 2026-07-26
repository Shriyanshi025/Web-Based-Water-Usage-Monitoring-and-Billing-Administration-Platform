package com.water.monitoring_and_billing_platform.repository;

import com.water.monitoring_and_billing_platform.entity.EmailPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmailPreferenceRepository extends JpaRepository<EmailPreference, Long> {

    Optional<EmailPreference> findByUserId(Long userId);

    Optional<EmailPreference> findByUserEmail(String email);
}
