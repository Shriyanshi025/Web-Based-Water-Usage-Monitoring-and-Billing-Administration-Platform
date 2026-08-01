package com.water.monitoring_and_billing_platform.repository;

import com.water.monitoring_and_billing_platform.entity.Community;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommunityRepository extends JpaRepository<Community, Long> {

    boolean existsByCommunityName(String communityName);

    boolean existsByCommunityCode(String communityCode);

    long count();

    @org.springframework.data.jpa.repository.Query("SELECT c.id, " +
            "(SELECT COUNT(ca) FROM CommunityAdminProfile ca WHERE ca.community.id = c.id), " +
            "(SELECT COUNT(r) FROM ResidentProfile r WHERE r.community.id = c.id), " +
            "(SELECT COUNT(b) FROM Block b WHERE b.community.id = c.id), " +
            "(SELECT COUNT(u) FROM Unit u WHERE u.block.community.id = c.id) " +
            "FROM Community c")
    java.util.List<Object[]> fetchCommunityStats();

}
