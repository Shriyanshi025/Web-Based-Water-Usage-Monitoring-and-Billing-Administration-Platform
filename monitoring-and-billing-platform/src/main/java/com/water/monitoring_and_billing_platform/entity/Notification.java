package com.water.monitoring_and_billing_platform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String recipient;

    @Column(nullable = false)
    private String channel; // "EMAIL"

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false, length = 2000)
    private String message;

    @Column(nullable = false)
    private String status; // "SENT", "FAILED"

    @Column(nullable = false)
    private LocalDateTime sentTime;

    @Column(length = 2000)
    private String failureReason;

    @PrePersist
    public void onCreate() {
        if (sentTime == null) {
            sentTime = LocalDateTime.now();
        }
        if (channel == null) {
            channel = "EMAIL";
        }
    }
}
