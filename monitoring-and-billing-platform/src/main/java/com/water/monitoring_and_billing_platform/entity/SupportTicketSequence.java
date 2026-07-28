package com.water.monitoring_and_billing_platform.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "support_ticket_sequences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportTicketSequence {

    @Id
    @Column(name = "year_key", length = 10, nullable = false)
    private String yearKey;

    @Column(name = "current_sequence", nullable = false)
    private Long currentSequence;
}
