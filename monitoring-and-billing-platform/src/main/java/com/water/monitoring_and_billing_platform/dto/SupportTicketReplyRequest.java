package com.water.monitoring_and_billing_platform.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupportTicketReplyRequest {

    @NotBlank(message = "Reply message cannot be empty")
    private String message;
}
