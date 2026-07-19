package com.water.monitoring_and_billing_platform.repository;

import com.water.monitoring_and_billing_platform.entity.Complaint;
import com.water.monitoring_and_billing_platform.enums.ComplaintCategory;
import com.water.monitoring_and_billing_platform.enums.ComplaintPriority;
import com.water.monitoring_and_billing_platform.enums.ComplaintStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    List<Complaint> findByResidentIdOrderByCreatedAtDesc(Long residentId);

    List<Complaint> findByAssignedToId(Long userId);

    List<Complaint> findByLastUpdatedById(Long userId);

    List<Complaint> findByCommunityIdOrderByCreatedAtDesc(Long communityId);

    @Query("SELECT c FROM Complaint c WHERE c.community.id = :communityId " +
           "AND (:status IS NULL OR c.status = :status) " +
           "AND (:priority IS NULL OR c.priority = :priority) " +
           "AND (:category IS NULL OR c.category = :category) " +
           "AND (:search IS NULL OR LOWER(c.ticketNumber) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Complaint> searchComplaints(
            @Param("communityId") Long communityId,
            @Param("status") ComplaintStatus status,
            @Param("priority") ComplaintPriority priority,
            @Param("category") ComplaintCategory category,
            @Param("search") String search
    );

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.ticketNumber LIKE CONCAT('CMP-', :year, '-%')")
    long countByYear(@Param("year") int year);
}
