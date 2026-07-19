package com.water.monitoring_and_billing_platform.repository;

import com.water.monitoring_and_billing_platform.entity.Payment;
import com.water.monitoring_and_billing_platform.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);

    List<Payment> findByPaymentNumber(String paymentNumber);

    Optional<Payment> findByPaymentNumberAndAttemptNumber(String paymentNumber, Integer attemptNumber);

    List<Payment> findByResidentId(Long residentId);

    List<Payment> findByBillResidentProfileCommunityId(Long communityId);

    boolean existsByBillIdAndPaymentStatus(Long billId, PaymentStatus paymentStatus);

    long countByBillId(Long billId);
}
