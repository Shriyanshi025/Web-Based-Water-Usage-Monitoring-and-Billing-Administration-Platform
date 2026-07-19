package com.water.monitoring_and_billing_platform.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PaymentResponse {
    private Long id;
    private String paymentNumber;
    private Integer attemptNumber;
    private Long billId;
    private String billNumber;
    private Long invoiceId;
    private String invoiceNumber;
    private String billingMonth;
    private Long residentId;
    private String residentName;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private BigDecimal amount;
    private String currency;
    private String paymentMethod;
    private String paymentStatus;
    private LocalDateTime transactionDate;
    private String failureReason;
    private String refundStatus;
    private BigDecimal refundAmount;
    private LocalDateTime refundDate;
    private LocalDateTime createdAt;
}
