package com.water.monitoring_and_billing_platform.entity;

import com.water.monitoring_and_billing_platform.enums.MeterStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "water_meters")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WaterMeter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String meterNumber;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "resident_profile_id", nullable = false)
    private ResidentProfile residentProfile;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MeterStatus meterStatus;

    @Column(nullable = false)
    private Double initialReading;

    @Column(nullable = false)
    private Double currentReading;

    @Column(nullable = false)
    private LocalDate installationDate;

    @Column(nullable = false)
    private boolean active;

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