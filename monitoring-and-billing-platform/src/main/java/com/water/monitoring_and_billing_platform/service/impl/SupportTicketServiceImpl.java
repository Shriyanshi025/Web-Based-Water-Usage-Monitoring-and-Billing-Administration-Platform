package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.dto.*;
import com.water.monitoring_and_billing_platform.entity.*;
import com.water.monitoring_and_billing_platform.enums.*;
import com.water.monitoring_and_billing_platform.repository.*;
import com.water.monitoring_and_billing_platform.service.AlertService;
import com.water.monitoring_and_billing_platform.service.SupportTicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class SupportTicketServiceImpl implements SupportTicketService {

    private final SupportTicketRepository supportTicketRepository;
    private final SupportTicketReplyRepository supportTicketReplyRepository;
    private final SupportTicketSequenceRepository supportTicketSequenceRepository;
    private final UserRepository userRepository;
    private final ResidentProfileRepository residentProfileRepository;
    private final CommunityAdminProfileRepository communityAdminProfileRepository;
    private final AlertService alertService;

    private User getUserOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
    }

    private ResidentProfile getResidentProfileOptional(User user) {
        return residentProfileRepository.findByUserId(user.getId()).orElse(null);
    }

    private CommunityAdminProfile getCommunityAdminProfileOptional(User user) {
        return communityAdminProfileRepository.findByUserId(user.getId()).orElse(null);
    }

    private synchronized String generateUniqueTicketNumber() {
        int year = LocalDate.now().getYear();
        String yearKey = String.valueOf(year);

        SupportTicketSequence seq = supportTicketSequenceRepository.findByYearKeyForUpdate(yearKey)
                .orElseGet(() -> {
                    long initialCount = supportTicketRepository.countByYear(year);
                    SupportTicketSequence newSeq = SupportTicketSequence.builder()
                            .yearKey(yearKey)
                            .currentSequence(initialCount)
                            .build();
                    return supportTicketSequenceRepository.saveAndFlush(newSeq);
                });

        long nextSeq = seq.getCurrentSequence() + 1;
        seq.setCurrentSequence(nextSeq);
        supportTicketSequenceRepository.save(seq);

        return String.format("SUP-%d-%06d", year, nextSeq);
    }

    @Override
    @Transactional
    public SupportTicketResponse createTicket(String userEmail, SupportTicketRequest request) {
        User creator = getUserOrThrow(userEmail);
        Role role = creator.getRole();

        // Enforce role rules
        RecipientType recipientType = request.getRecipientType();
        if (role == Role.COMMUNITY_ADMIN && recipientType == RecipientType.COMMUNITY_ADMIN) {
            throw new IllegalArgumentException("Community Admins can only submit tickets to Main Admin.");
        }

        Community targetCommunity = null;
        if (role == Role.USER) {
            ResidentProfile resident = getResidentProfileOptional(creator);
            if (resident != null) {
                targetCommunity = resident.getCommunity();
            }
        } else if (role == Role.COMMUNITY_ADMIN) {
            CommunityAdminProfile adminProfile = getCommunityAdminProfileOptional(creator);
            if (adminProfile != null) {
                targetCommunity = adminProfile.getCommunity();
            }
        }

        String ticketNumber = generateUniqueTicketNumber();

        SupportTicket ticket = SupportTicket.builder()
                .ticketNumber(ticketNumber)
                .title(request.getTitle().trim())
                .description(request.getDescription().trim())
                .category(request.getCategory())
                .priority(request.getPriority())
                .recipientType(recipientType)
                .status(TicketStatus.OPEN)
                .createdBy(creator)
                .community(targetCommunity)
                .build();

        SupportTicket saved = supportTicketRepository.save(ticket);

        // Notify recipient admins
        if (recipientType == RecipientType.COMMUNITY_ADMIN && targetCommunity != null) {
            List<CommunityAdminProfile> admins = communityAdminProfileRepository.findByCommunityIdAndActiveTrue(targetCommunity.getId());
            for (CommunityAdminProfile admin : admins) {
                alertService.createInAppNotification(
                        admin.getUser(),
                        getResidentProfileOptional(creator),
                        targetCommunity,
                        "New Support Ticket Raised",
                        String.format("Ticket %s (%s) raised by %s.", ticketNumber, saved.getTitle(), creator.getFullName()),
                        AlertType.SUPPORT_TICKET_CREATED,
                        AlertSeverity.MEDIUM,
                        null
                );
            }
        } else if (recipientType == RecipientType.MAIN_ADMIN) {
            List<User> mainAdmins = userRepository.findByRole(Role.MAIN_ADMIN);
            for (User mainAdmin : mainAdmins) {
                alertService.createInAppNotification(
                        mainAdmin,
                        null,
                        targetCommunity,
                        "New Support Ticket Raised",
                        String.format("Ticket %s (%s) raised by %s.", ticketNumber, saved.getTitle(), creator.getFullName()),
                        AlertType.SUPPORT_TICKET_CREATED,
                        AlertSeverity.HIGH,
                        null
                );
            }
        }

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupportTicketResponse> getMySubmittedTickets(String userEmail) {
        User creator = getUserOrThrow(userEmail);
        return supportTicketRepository.findByCreatedByIdOrderByCreatedAtDesc(creator.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupportTicketResponse> getCommunityInboxTickets(String userEmail) {
        User user = getUserOrThrow(userEmail);
        if (user.getRole() != Role.COMMUNITY_ADMIN) {
            throw new SecurityException("Access denied. Only Community Admins can view the community ticket inbox.");
        }
        CommunityAdminProfile adminProfile = getCommunityAdminProfileOptional(user);
        if (adminProfile == null || adminProfile.getCommunity() == null) {
            return List.of();
        }

        return supportTicketRepository.findByCommunityIdAndRecipientTypeOrderByCreatedAtDesc(
                adminProfile.getCommunity().getId(), RecipientType.COMMUNITY_ADMIN
        ).stream().map(this::mapToResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupportTicketResponse> getMainAdminTickets(String userEmail) {
        User user = getUserOrThrow(userEmail);
        if (user.getRole() != Role.MAIN_ADMIN) {
            throw new SecurityException("Access denied. Only Main Admins can view the Support Center.");
        }
        return supportTicketRepository.findByRecipientTypeOrderByCreatedAtDesc(RecipientType.MAIN_ADMIN)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SupportTicketResponse getTicketDetails(String userEmail, Long ticketId) {
        User user = getUserOrThrow(userEmail);
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Support ticket not found: " + ticketId));

        validateAccessToTicket(user, ticket);
        return mapToResponse(ticket);
    }

    @Override
    @Transactional
    public SupportTicketReplyResponse addReply(String userEmail, Long ticketId, SupportTicketReplyRequest request) {
        User sender = getUserOrThrow(userEmail);
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Support ticket not found: " + ticketId));

        validateAccessToTicket(sender, ticket);

        SupportTicketReply reply = SupportTicketReply.builder()
                .ticket(ticket)
                .sender(sender)
                .message(request.getMessage().trim())
                .build();

        SupportTicketReply savedReply = supportTicketReplyRepository.save(reply);

        // Update ticket's timestamp & status if appropriate
        ticket.setUpdatedAt(LocalDateTime.now());
        if (ticket.getStatus() == TicketStatus.OPEN && !Objects.equals(ticket.getCreatedBy().getId(), sender.getId())) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
        }
        supportTicketRepository.save(ticket);

        // Send notification to the ticket creator if reply is from admin, or to assigned admin if reply is from creator
        if (!Objects.equals(ticket.getCreatedBy().getId(), sender.getId())) {
            alertService.createInAppNotification(
                    ticket.getCreatedBy(),
                    null,
                    ticket.getCommunity(),
                    "Reply Received on Ticket " + ticket.getTicketNumber(),
                    String.format("%s replied: %s", sender.getFullName(), request.getMessage()),
                    AlertType.SUPPORT_TICKET_REPLY,
                    AlertSeverity.MEDIUM,
                    null
            );
        }

        return mapToReplyResponse(savedReply);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupportTicketReplyResponse> getTicketReplies(String userEmail, Long ticketId) {
        User user = getUserOrThrow(userEmail);
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Support ticket not found: " + ticketId));

        validateAccessToTicket(user, ticket);

        return supportTicketReplyRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
                .stream()
                .map(this::mapToReplyResponse)
                .toList();
    }

    @Override
    @Transactional
    public SupportTicketResponse updateTicketStatus(String userEmail, Long ticketId, SupportTicketStatusUpdateRequest request) {
        User updater = getUserOrThrow(userEmail);
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Support ticket not found: " + ticketId));

        if (updater.getRole() == Role.USER) {
            throw new SecurityException("Residents cannot update status directly; use close action instead.");
        }

        validateAccessToTicket(updater, ticket);

        if (request.getStatus() != null) {
            ticket.setStatus(request.getStatus());
            if (request.getStatus() == TicketStatus.RESOLVED || request.getStatus() == TicketStatus.CLOSED) {
                ticket.setResolvedAt(LocalDateTime.now());
            }
        }

        if (request.getResolutionNotes() != null) {
            ticket.setResolutionNotes(request.getResolutionNotes().trim());
        }

        if (request.getAssignedToUserId() != null) {
            User assignedAdmin = userRepository.findById(request.getAssignedToUserId())
                    .orElseThrow(() -> new IllegalArgumentException("Assigned user not found: " + request.getAssignedToUserId()));
            ticket.setAssignedTo(assignedAdmin);
        }

        SupportTicket updated = supportTicketRepository.save(ticket);

        // Notify ticket creator
        alertService.createInAppNotification(
                ticket.getCreatedBy(),
                null,
                ticket.getCommunity(),
                "Support Ticket Updated",
                String.format("Status of ticket %s changed to %s.", ticket.getTicketNumber(), ticket.getStatus()),
                AlertType.SUPPORT_TICKET_UPDATED,
                AlertSeverity.MEDIUM,
                null
        );

        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public SupportTicketResponse closeTicket(String userEmail, Long ticketId) {
        User user = getUserOrThrow(userEmail);
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Support ticket not found: " + ticketId));

        validateAccessToTicket(user, ticket);

        ticket.setStatus(TicketStatus.CLOSED);
        ticket.setResolvedAt(LocalDateTime.now());
        SupportTicket updated = supportTicketRepository.save(ticket);

        return mapToResponse(updated);
    }

    private void validateAccessToTicket(User user, SupportTicket ticket) {
        if (user.getRole() == Role.MAIN_ADMIN) {
            return; // Main Admin has global access to all support tickets
        }
        if (Objects.equals(ticket.getCreatedBy().getId(), user.getId())) {
            return; // Creator has access to own ticket
        }
        if (user.getRole() == Role.COMMUNITY_ADMIN) {
            CommunityAdminProfile adminProfile = getCommunityAdminProfileOptional(user);
            if (adminProfile != null && adminProfile.getCommunity() != null &&
                ticket.getCommunity() != null &&
                Objects.equals(ticket.getCommunity().getId(), adminProfile.getCommunity().getId()) &&
                ticket.getRecipientType() == RecipientType.COMMUNITY_ADMIN) {
                return; // Community Admin has access to tickets directed to Community Admin in their community
            }
        }
        throw new SecurityException("Access denied to support ticket: " + ticket.getTicketNumber());
    }

    private SupportTicketResponse mapToResponse(SupportTicket ticket) {
        return SupportTicketResponse.builder()
                .id(ticket.getId())
                .ticketNumber(ticket.getTicketNumber())
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .category(ticket.getCategory())
                .priority(ticket.getPriority())
                .recipientType(ticket.getRecipientType())
                .status(ticket.getStatus())
                .createdById(ticket.getCreatedBy().getId())
                .createdByName(ticket.getCreatedBy().getFullName())
                .createdByEmail(ticket.getCreatedBy().getEmail())
                .createdByRole(ticket.getCreatedBy().getRole().name())
                .assignedToId(ticket.getAssignedTo() != null ? ticket.getAssignedTo().getId() : null)
                .assignedToName(ticket.getAssignedTo() != null ? ticket.getAssignedTo().getFullName() : null)
                .communityId(ticket.getCommunity() != null ? ticket.getCommunity().getId() : null)
                .communityName(ticket.getCommunity() != null ? ticket.getCommunity().getCommunityName() : null)
                .resolutionNotes(ticket.getResolutionNotes())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .resolvedAt(ticket.getResolvedAt())
                .build();
    }

    private SupportTicketReplyResponse mapToReplyResponse(SupportTicketReply reply) {
        return SupportTicketReplyResponse.builder()
                .id(reply.getId())
                .ticketId(reply.getTicket().getId())
                .senderId(reply.getSender().getId())
                .senderName(reply.getSender().getFullName())
                .senderRole(reply.getSender().getRole().name())
                .message(reply.getMessage())
                .createdAt(reply.getCreatedAt())
                .build();
    }
}
