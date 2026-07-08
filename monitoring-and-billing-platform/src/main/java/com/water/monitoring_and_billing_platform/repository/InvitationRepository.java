package com.water.monitoring_and_billing_platform.repository;

import com.water.monitoring_and_billing_platform.entity.Invitation;
import com.water.monitoring_and_billing_platform.enums.InvitationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InvitationRepository extends JpaRepository<Invitation, Long> {

    Optional<Invitation> findByToken(String token);

    List<Invitation> findByAdminIdOrderByCreatedAtDesc(Long adminId);

    boolean existsByEmailAndCommunityIdAndStatusIn(String email, Long communityId, List<InvitationStatus> statuses);

    boolean existsByMobileNumberAndCommunityIdAndStatusIn(String mobileNumber, Long communityId, List<InvitationStatus> statuses);
}
