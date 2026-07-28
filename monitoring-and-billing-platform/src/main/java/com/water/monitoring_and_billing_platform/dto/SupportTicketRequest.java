package com.water.monitoring_and_billing_platform.dto;

import com.water.monitoring_and_billing_platform.enums.RecipientType;
import com.water.monitoring_and_billing_platform.enums.TicketCategory;
import com.water.monitoring_and_billing_platform.enums.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupportTicketRequest {

    @NotBlank(message = "Ticket title is required")
    private String title;

    @NotBlank(message = "Ticket description is required")
    private String description;

    @NotNull(message = "Ticket category is required")
    private TicketCategory category;

    @NotNull(message = "Ticket priority is required")
    private TicketPriority priority;

    @NotNull(message = "Recipient type is required")
    private RecipientType recipientType;
}
