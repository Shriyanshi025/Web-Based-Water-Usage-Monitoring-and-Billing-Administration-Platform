package com.water.monitoring_and_billing_platform.entity;

import com.water.monitoring_and_billing_platform.enums.RecipientType;
import com.water.monitoring_and_billing_platform.enums.TicketCategory;
import com.water.monitoring_and_billing_platform.enums.TicketPriority;
import com.water.monitoring_and_billing_platform.enums.TicketStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "support_tickets",
    indexes = {
        @Index(name = "idx_sup_ticket_created_by", columnList = "created_by_user_id"),
        @Index(name = "idx_sup_ticket_community", columnList = "community_id"),
        @Index(name = "idx_sup_ticket_recipient_type", columnList = "recipient_type"),
        @Index(name = "idx_sup_ticket_status", columnList = "status"),
        @Index(name = "idx_sup_ticket_created_at", columnList = "created_at")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String ticketNumber;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, length = 3000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private TicketCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TicketPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(name = "recipient_type", nullable = false, length = 30)
    private RecipientType recipientType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TicketStatus status;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdBy;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_to_user_id")
    private User assignedTo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "community_id")
    private Community community;

    @Column(length = 2000)
    private String resolutionNotes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = TicketStatus.OPEN;
        }
        if (priority == null) {
            priority = TicketPriority.MEDIUM;
        }
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
