package com.water.monitoring_and_billing_platform.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupportTicketReplyResponse {

    private Long id;
    private Long ticketId;
    private Long senderId;
    private String senderName;
    private String senderRole;
    private String message;
    private LocalDateTime createdAt;
}
