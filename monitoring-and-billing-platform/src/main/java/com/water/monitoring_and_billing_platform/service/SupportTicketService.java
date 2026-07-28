package com.water.monitoring_and_billing_platform.service;

import com.water.monitoring_and_billing_platform.dto.*;

import java.util.List;

public interface SupportTicketService {

    SupportTicketResponse createTicket(String userEmail, SupportTicketRequest request);

    List<SupportTicketResponse> getMySubmittedTickets(String userEmail);

    List<SupportTicketResponse> getCommunityInboxTickets(String userEmail);

    List<SupportTicketResponse> getMainAdminTickets(String userEmail);

    SupportTicketResponse getTicketDetails(String userEmail, Long ticketId);

    SupportTicketReplyResponse addReply(String userEmail, Long ticketId, SupportTicketReplyRequest request);

    List<SupportTicketReplyResponse> getTicketReplies(String userEmail, Long ticketId);

    SupportTicketResponse updateTicketStatus(String userEmail, Long ticketId, SupportTicketStatusUpdateRequest request);

    SupportTicketResponse closeTicket(String userEmail, Long ticketId);
}
