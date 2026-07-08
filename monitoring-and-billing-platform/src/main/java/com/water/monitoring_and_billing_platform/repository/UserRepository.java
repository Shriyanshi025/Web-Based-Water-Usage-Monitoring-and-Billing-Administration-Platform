package com.water.monitoring_and_billing_platform.repository;

import com.water.monitoring_and_billing_platform.entity.User;
import com.water.monitoring_and_billing_platform.enums.ApprovalStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByApprovalStatus(ApprovalStatus approvalStatus);

    List<User> findByApprovalStatus(ApprovalStatus approvalStatus);
}