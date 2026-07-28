package com.water.monitoring_and_billing_platform.repository;

import com.water.monitoring_and_billing_platform.entity.SupportTicketSequence;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SupportTicketSequenceRepository extends JpaRepository<SupportTicketSequence, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM SupportTicketSequence s WHERE s.yearKey = :yearKey")
    Optional<SupportTicketSequence> findByYearKeyForUpdate(@Param("yearKey") String yearKey);
}
