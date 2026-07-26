package com.water.monitoring_and_billing_platform.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "email_preferences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Builder.Default
    @Column(nullable = false)
    private boolean billEmails = true;

    @Builder.Default
    @Column(nullable = false)
    private boolean alertEmails = true;

    @Builder.Default
    @Column(nullable = false)
    private boolean reminderEmails = true;

    @Builder.Default
    @Column(nullable = false)
    private boolean announcementEmails = true;
}
