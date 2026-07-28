package com.water.monitoring_and_billing_platform.repository;

import com.water.monitoring_and_billing_platform.entity.SupportTicket;
import com.water.monitoring_and_billing_platform.enums.RecipientType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {

    Optional<SupportTicket> findByTicketNumber(String ticketNumber);

    List<SupportTicket> findByCreatedByIdOrderByCreatedAtDesc(Long userId);

    List<SupportTicket> findByCommunityIdAndRecipientTypeOrderByCreatedAtDesc(Long communityId, RecipientType recipientType);

    List<SupportTicket> findByRecipientTypeOrderByCreatedAtDesc(RecipientType recipientType);

    List<SupportTicket> findByAssignedToIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT COUNT(t) FROM SupportTicket t WHERE YEAR(t.createdAt) = :year")
    long countByYear(@Param("year") int year);
}
