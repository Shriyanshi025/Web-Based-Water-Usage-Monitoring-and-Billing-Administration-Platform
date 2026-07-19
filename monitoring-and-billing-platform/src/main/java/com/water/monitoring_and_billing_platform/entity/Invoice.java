package com.water.monitoring_and_billing_platform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String invoiceNumber;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "bill_id", nullable = true)
    private Bill bill;

    @Column(nullable = false)
    private String residentName;

    @Column(nullable = false)
    private String unitNumber;

    @Column(nullable = false)
    private String blockName;

    @Column(nullable = false)
    private String communityName;

    @Column(nullable = false)
    private String billingCycleName;

    private LocalDate periodStart;
    private LocalDate periodEnd;

    private Double previousReading;
    private Double currentReading;
    private Double unitsConsumed;

    @Column(precision = 10, scale = 2)
    private BigDecimal fixedCharge;

    @Column(precision = 10, scale = 2)
    private BigDecimal variableCharge;

    @Column(precision = 10, scale = 2)
    private BigDecimal sharedWaterCost;

    private String distributionStrategy;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(nullable = false)
    private String billStatus;

    @Column(nullable = false)
    private String paymentStatus;

    @Column(nullable = false)
    private LocalDate generatedDate;

    @Column(nullable = false)
    private LocalDate dueDate;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
