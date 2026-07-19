package com.water.monitoring_and_billing_platform.repository;

import com.water.monitoring_and_billing_platform.entity.Alert;
import com.water.monitoring_and_billing_platform.enums.AlertStatus;
import com.water.monitoring_and_billing_platform.enums.AlertType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {

    Optional<Alert> findByAlertNumber(String alertNumber);

    List<Alert> findByResidentId(Long residentId);

    List<Alert> findByCommunityId(Long communityId);

    boolean existsByResidentIdAndBillingCycleIdAndAlertTypeAndStatus(
            Long residentId,
            Long billingCycleId,
            AlertType alertType,
            AlertStatus status
    );

    boolean existsByResidentIdAndAlertTypeAndStatus(
            Long residentId,
            AlertType alertType,
            AlertStatus status
    );

    boolean existsByRecipientIdAndAlertTypeAndMessageAndStatus(
            Long recipientId,
            AlertType alertType,
            String message,
            AlertStatus status
    );

    boolean existsByRecipientIsNullAndCommunityIdAndAlertTypeAndMessageAndStatus(
            Long communityId,
            AlertType alertType,
            String message,
            AlertStatus status
    );

    List<Alert> findByCommunityIdAndStatus(Long communityId, AlertStatus status);

    List<Alert> findByResidentIdAndStatus(Long residentId, AlertStatus status);

    List<Alert> findByRecipientIdOrderByCreatedDateDesc(Long recipientId);

    List<Alert> findByResidentIdOrderByCreatedDateDesc(Long residentId);

    List<Alert> findByCommunityIdOrderByCreatedDateDesc(Long communityId);

    List<Alert> findByRecipientIdOrResidentIdOrderByCreatedDateDesc(Long recipientId, Long residentId);

    List<Alert> findByRecipientIdOrCommunityIdOrderByCreatedDateDesc(Long recipientId, Long communityId);
}
