package com.water.monitoring_and_billing_platform.service;

import com.water.monitoring_and_billing_platform.dto.*;

import java.util.List;

public interface PaymentService {
    PaymentResponse createOrder(String email, PaymentRequest request);
    PaymentResponse verifyPayment(String email, PaymentVerificationRequest request);
    PaymentResponse getPaymentById(String email, Long id);
    PaymentResponse getPaymentByPaymentNumber(String email, String paymentNumber);
    List<PaymentResponse> getMyPayments(String email);
    List<PaymentResponse> getCommunityPayments(String email, Long communityId);
    List<PaymentResponse> getPaymentHistory(String email);
    PaymentResponse processDemoPayment(String email, Long billId, String method);
    PaymentResponse retryFailedPayment(String email, Long paymentId);
    PaymentStatisticsResponse getStatistics(String email);
    void processWebhook(String payload, String signature);
}
