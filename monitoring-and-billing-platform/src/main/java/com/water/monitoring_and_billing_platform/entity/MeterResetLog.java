package com.water.monitoring_and_billing_platform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "meter_reset_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeterResetLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "water_meter_id", nullable = false)
    private WaterMeter waterMeter;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "resident_profile_id", nullable = false)
    private ResidentProfile residentProfile;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "community_id", nullable = false)
    private Community community;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "billing_cycle_id")
    private BillingCycle billingCycle;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reset_by_user_id", nullable = false)
    private User resetBy;

    @Column(nullable = false)
    private Double previousReading;

    @Column(nullable = false)
    private Double newReading;

    @Column(nullable = false)
    private LocalDateTime resetDate;

    private String reason;

    @Column(nullable = false)
    private String resetType; // "INDIVIDUAL" or "BULK"

    @PrePersist
    public void onCreate() {
        if (resetDate == null) {
            resetDate = LocalDateTime.now();
        }
    }
}
