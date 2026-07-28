package com.water.monitoring_and_billing_platform.dto;

import com.water.monitoring_and_billing_platform.enums.RecipientType;
import com.water.monitoring_and_billing_platform.enums.TicketCategory;
import com.water.monitoring_and_billing_platform.enums.TicketPriority;
import com.water.monitoring_and_billing_platform.enums.TicketStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupportTicketResponse {

    private Long id;
    private String ticketNumber;
    private String title;
    private String description;
    private TicketCategory category;
    private TicketPriority priority;
    private RecipientType recipientType;
    private TicketStatus status;

    private Long createdById;
    private String createdByName;
    private String createdByEmail;
    private String createdByRole;

    private Long assignedToId;
    private String assignedToName;

    private Long communityId;
    private String communityName;

    private String resolutionNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
}
