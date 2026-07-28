package com.water.monitoring_and_billing_platform.dto;

import com.water.monitoring_and_billing_platform.enums.TicketStatus;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupportTicketStatusUpdateRequest {

    private TicketStatus status;
    private String resolutionNotes;
    private Long assignedToUserId;
}
