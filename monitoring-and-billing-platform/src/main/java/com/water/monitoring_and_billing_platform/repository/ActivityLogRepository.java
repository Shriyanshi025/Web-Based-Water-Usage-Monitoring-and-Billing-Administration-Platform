package com.water.monitoring_and_billing_platform.repository;

import com.water.monitoring_and_billing_platform.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findTop5ByOrderByTimestampDesc();
    List<ActivityLog> findTop5ByCommunityIdOrderByTimestampDesc(Long communityId);
    List<ActivityLog> findTop5ByUserIdOrderByTimestampDesc(Long userId);
    List<ActivityLog> findTop5ByUserIdOrCommunityIdOrderByTimestampDesc(Long userId, Long communityId);
}
