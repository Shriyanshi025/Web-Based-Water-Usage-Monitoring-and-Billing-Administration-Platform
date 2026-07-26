package com.water.monitoring_and_billing_platform.repository;

import com.water.monitoring_and_billing_platform.entity.MeterResetLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MeterResetLogRepository extends JpaRepository<MeterResetLog, Long> {
    List<MeterResetLog> findByCommunityIdOrderByResetDateDesc(Long communityId);
    List<MeterResetLog> findByResidentProfileIdOrderByResetDateDesc(Long residentProfileId);
}
