package com.water.monitoring_and_billing_platform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "alert_configurations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertConfiguration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long communityId;

    @Column(nullable = false)
    private Double highUsagePercentage; // e.g. 150.0

    @Column(nullable = false)
    private Double leakDetectionThreshold; // e.g. 0.05 (daily volume or minimum consumption to check)

    @Column(nullable = false)
    private Integer meterOfflineDurationHours; // e.g. 24

    @Column(nullable = false)
    private Integer overdueReminderDays; // e.g. 5

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (highUsagePercentage == null) highUsagePercentage = 150.0;
        if (leakDetectionThreshold == null) leakDetectionThreshold = 0.01;
        if (meterOfflineDurationHours == null) meterOfflineDurationHours = 24;
        if (overdueReminderDays == null) overdueReminderDays = 5;
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
