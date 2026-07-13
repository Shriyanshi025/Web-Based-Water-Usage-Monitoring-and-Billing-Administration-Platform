package com.water.monitoring_and_billing_platform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "water_usage")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WaterUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "water_meter_id", nullable = false)
    private WaterMeter waterMeter;

    @Column(nullable = false)
    private Double previousReading;

    @Column(nullable = false)
    private Double currentReading;

    @Column(nullable = false)
    private Double unitsConsumed;

    @Column(nullable = false)
    private LocalDate readingDate;

    @Column(nullable = false)
    private boolean billed;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
