package com.water.monitoring_and_billing_platform.controller;

import com.water.monitoring_and_billing_platform.dto.*;
import com.water.monitoring_and_billing_platform.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    private final PaymentService paymentService;

    @Value("${razorpay.key-id}")
    private String keyId;

    @GetMapping("/key")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> getRazorpayKey() {
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(true)
                .message("Razorpay key retrieved successfully")
                .data(keyId)
                .build());
    }

    @PostMapping("/order")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<PaymentResponse>> createOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody PaymentRequest request
    ) {
        PaymentResponse response = paymentService.createOrder(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<PaymentResponse>builder()
                .success(true)
                .message("Razorpay payment order created successfully")
                .data(response)
                .build());
    }

    @PostMapping("/verify")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<PaymentResponse>> verifyPayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody PaymentVerificationRequest request
    ) {
        PaymentResponse response = paymentService.verifyPayment(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.<PaymentResponse>builder()
                .success(true)
                .message("Payment verified successfully")
                .data(response)
                .build());
    }

    @PostMapping("/demo-pay")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<PaymentResponse>> demoPay(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody java.util.Map<String, Object> payload
    ) {
        Long billId = Long.valueOf(payload.get("billId").toString());
        String method = payload.getOrDefault("method", "UPI").toString();
        PaymentResponse response = paymentService.processDemoPayment(userDetails.getUsername(), billId, method);
        return ResponseEntity.ok(ApiResponse.<PaymentResponse>builder()
                .success(true)
                .message("Demo payment processed successfully")
                .data(response)
                .build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        PaymentResponse response = paymentService.getPaymentById(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.<PaymentResponse>builder()
                .success(true)
                .message("Payment details retrieved successfully")
                .data(response)
                .build());
    }

    @GetMapping("/number/{paymentNumber}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentByPaymentNumber(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String paymentNumber
    ) {
        PaymentResponse response = paymentService.getPaymentByPaymentNumber(userDetails.getUsername(), paymentNumber);
        return ResponseEntity.ok(ApiResponse.<PaymentResponse>builder()
                .success(true)
                .message("Payment details retrieved successfully")
                .data(response)
                .build());
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getMyPayments(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        List<PaymentResponse> response = paymentService.getMyPayments(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.<List<PaymentResponse>>builder()
                .success(true)
                .message("My payments retrieved successfully")
                .data(response)
                .build());
    }

    @GetMapping("/community/{communityId}")
    @PreAuthorize("hasAnyRole('COMMUNITY_ADMIN', 'MAIN_ADMIN')")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getCommunityPayments(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long communityId
    ) {
        List<PaymentResponse> response = paymentService.getCommunityPayments(userDetails.getUsername(), communityId);
        return ResponseEntity.ok(ApiResponse.<List<PaymentResponse>>builder()
                .success(true)
                .message("Community payments retrieved successfully")
                .data(response)
                .build());
    }

    @PostMapping("/{id}/retry")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<PaymentResponse>> retryFailedPayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        PaymentResponse response = paymentService.retryFailedPayment(userDetails.getUsername(), id);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<PaymentResponse>builder()
                .success(true)
                .message("Retried payment order created successfully")
                .data(response)
                .build());
    }

    @GetMapping("/statistics")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PaymentStatisticsResponse>> getStatistics(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        PaymentStatisticsResponse response = paymentService.getStatistics(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.<PaymentStatisticsResponse>builder()
                .success(true)
                .message("Payment statistics retrieved successfully")
                .data(response)
                .build());
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> processWebhook(
            @RequestBody String payload,
            @RequestHeader("X-Razorpay-Signature") String signature
    ) {
        paymentService.processWebhook(payload, signature);
        return ResponseEntity.ok().build();
    }
}
