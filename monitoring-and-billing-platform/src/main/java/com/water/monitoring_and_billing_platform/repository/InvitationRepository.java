package com.water.monitoring_and_billing_platform.repository;

import com.water.monitoring_and_billing_platform.entity.Invitation;
import com.water.monitoring_and_billing_platform.enums.InvitationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InvitationRepository extends JpaRepository<Invitation, Long> {

    Optional<Invitation> findByToken(String token);

    List<Invitation> findByAdminIdOrderByCreatedAtDesc(Long adminId);

    List<Invitation> findByEmail(String email);

    boolean existsByEmailAndStatusIn(String email, List<InvitationStatus> statuses);

    boolean existsByMobileNumberAndStatusIn(String mobileNumber, List<InvitationStatus> statuses);
}
