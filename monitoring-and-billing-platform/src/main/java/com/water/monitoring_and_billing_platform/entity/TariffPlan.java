package com.water.monitoring_and_billing_platform.entity;

import com.water.monitoring_and_billing_platform.enums.TariffPolicyStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tariff_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TariffPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "community_id")
    private Community community;

    @OneToMany(mappedBy = "tariffPlan", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private java.util.List<TariffSlab> slabs;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(precision = 10, scale = 2)
    private BigDecimal ratePerUnit;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal fixedCharge;

    /** GST / Tax rate as a decimal fraction, e.g. 0.05 = 5%. Null means use system default (5%). */
    @Column(precision = 5, scale = 4)
    private BigDecimal taxRate;

    /** Optional flat maintenance charge per bill. */
    @Column(precision = 10, scale = 2)
    private BigDecimal maintenanceCharge;

    /** Optional flat service charge per bill. */
    @Column(precision = 10, scale = 2)
    private BigDecimal serviceCharge;

    @Column(nullable = false)
    private boolean active;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TariffPolicyStatus policyStatus;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDate effectiveFrom;

    private LocalDate effectiveTo;

    @Column(nullable = false)
    private Integer versionNumber;

    private String createdBy;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (policyStatus == null) {
            policyStatus = active ? TariffPolicyStatus.ACTIVE : TariffPolicyStatus.DRAFT;
        }
        active = (policyStatus == TariffPolicyStatus.ACTIVE);
        if (versionNumber == null) {
            versionNumber = 1;
        }
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (policyStatus == null) {
            policyStatus = active ? TariffPolicyStatus.ACTIVE : TariffPolicyStatus.INACTIVE;
        }
        active = (policyStatus == TariffPolicyStatus.ACTIVE);
    }
}
