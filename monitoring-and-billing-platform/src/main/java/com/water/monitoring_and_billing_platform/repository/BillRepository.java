package com.water.monitoring_and_billing_platform.repository;

import com.water.monitoring_and_billing_platform.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    List<Bill> findByResidentProfileId(Long residentProfileId);
}
