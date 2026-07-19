package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.dto.ComplaintRequest;
import com.water.monitoring_and_billing_platform.dto.ComplaintResponse;
import com.water.monitoring_and_billing_platform.entity.CommunityAdminProfile;
import com.water.monitoring_and_billing_platform.entity.Complaint;
import com.water.monitoring_and_billing_platform.entity.ResidentProfile;
import com.water.monitoring_and_billing_platform.entity.User;
import com.water.monitoring_and_billing_platform.enums.AlertSeverity;
import com.water.monitoring_and_billing_platform.enums.AlertType;
import com.water.monitoring_and_billing_platform.enums.ComplaintCategory;
import com.water.monitoring_and_billing_platform.enums.ComplaintPriority;
import com.water.monitoring_and_billing_platform.enums.ComplaintStatus;
import com.water.monitoring_and_billing_platform.repository.CommunityAdminProfileRepository;
import com.water.monitoring_and_billing_platform.repository.ComplaintRepository;
import com.water.monitoring_and_billing_platform.repository.ResidentProfileRepository;
import com.water.monitoring_and_billing_platform.repository.UserRepository;
import com.water.monitoring_and_billing_platform.service.AlertService;
import com.water.monitoring_and_billing_platform.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ComplaintServiceImpl implements ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final ResidentProfileRepository residentProfileRepository;
    private final CommunityAdminProfileRepository communityAdminProfileRepository;
    private final UserRepository userRepository;
    private final AlertService alertService;

    private User getUserOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
    }

    private ResidentProfile getResidentProfileOrThrow(User user) {
        return residentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Resident profile not found for user: " + user.getEmail()));
    }

    private CommunityAdminProfile getCommunityAdminProfileOrThrow(User user) {
        return communityAdminProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Community admin profile not found for user: " + user.getEmail()));
    }

    @Override
    @Transactional
    public ComplaintResponse raiseComplaint(String email, ComplaintRequest request) {
        User user = getUserOrThrow(email);
        ResidentProfile resident = getResidentProfileOrThrow(user);

        int year = LocalDate.now().getYear();
        long count = complaintRepository.countByYear(year);
        String ticketNumber = "CMP-" + year + "-" + String.format("%06d", count + 1);

        Complaint complaint = Complaint.builder()
                .ticketNumber(ticketNumber)
                .resident(resident)
                .community(resident.getCommunity())
                .category(request.getCategory())
                .priority(request.getPriority())
                .status(ComplaintStatus.OPEN)
                .description(request.getDescription())
                .build();

        Complaint saved = complaintRepository.save(complaint);

        // Notify community admins
        List<CommunityAdminProfile> admins = communityAdminProfileRepository.findByCommunityIdAndActiveTrue(resident.getCommunity().getId());
        for (CommunityAdminProfile admin : admins) {
            alertService.createInAppNotification(
                    admin.getUser(),
                    resident,
                    resident.getCommunity(),
                    "New Complaint Raised",
                    "A new complaint " + ticketNumber + " has been raised by " + user.getFullName() + ".",
                    AlertType.COMPLAINT_CREATED,
                    AlertSeverity.MEDIUM,
                    null
            );
        }

        return mapToResponse(saved);
    }

    @Override
    public List<ComplaintResponse> getMyComplaints(String email) {
        User user = getUserOrThrow(email);
        ResidentProfile resident = getResidentProfileOrThrow(user);
        return complaintRepository.findByResidentIdOrderByCreatedAtDesc(resident.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public ComplaintResponse getComplaintById(String email, Long id) {
        User user = getUserOrThrow(email);
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found with id: " + id));

        // Validate access: resident must own it, or admin must belong to the same community
        if (user.getRole() == com.water.monitoring_and_billing_platform.enums.Role.USER) {
            ResidentProfile resident = getResidentProfileOrThrow(user);
            if (!Objects.equals(complaint.getResident().getId(), resident.getId())) {
                throw new SecurityException("Access denied to this complaint.");
            }
        } else if (user.getRole() == com.water.monitoring_and_billing_platform.enums.Role.COMMUNITY_ADMIN) {
            CommunityAdminProfile admin = getCommunityAdminProfileOrThrow(user);
            if (!Objects.equals(complaint.getCommunity().getId(), admin.getCommunity().getId())) {
                throw new SecurityException("Access denied to this community's complaints.");
            }
        }

        return mapToResponse(complaint);
    }

    @Override
    public List<ComplaintResponse> getCommunityComplaints(String email) {
        User user = getUserOrThrow(email);
        CommunityAdminProfile admin = getCommunityAdminProfileOrThrow(user);
        return complaintRepository.findByCommunityIdOrderByCreatedAtDesc(admin.getCommunity().getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<ComplaintResponse> searchCommunityComplaints(
            String email,
            ComplaintStatus status,
            ComplaintPriority priority,
            ComplaintCategory category,
            String search
    ) {
        User user = getUserOrThrow(email);
        CommunityAdminProfile admin = getCommunityAdminProfileOrThrow(user);
        return complaintRepository.searchComplaints(admin.getCommunity().getId(), status, priority, category, search)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public ComplaintResponse updateComplaint(
            String email,
            Long id,
            ComplaintStatus status,
            String remarks,
            Long assignedToUserId
    ) {
        User updater = getUserOrThrow(email);
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found with id: " + id));

        if (updater.getRole() != com.water.monitoring_and_billing_platform.enums.Role.COMMUNITY_ADMIN) {
            throw new SecurityException("Only community admins can update complaints.");
        }

        CommunityAdminProfile admin = getCommunityAdminProfileOrThrow(updater);
        if (!Objects.equals(complaint.getCommunity().getId(), admin.getCommunity().getId())) {
            throw new SecurityException("Access denied to this community's complaints.");
        }

        if (status != null) {
            complaint.setStatus(status);
            if (status == ComplaintStatus.RESOLVED || status == ComplaintStatus.REJECTED) {
                complaint.setResolvedAt(LocalDateTime.now());
            }
        }

        if (remarks != null) {
            complaint.setRemarks(remarks);
        }

        if (assignedToUserId != null) {
            User assignedTo = userRepository.findById(assignedToUserId)
                    .orElseThrow(() -> new IllegalArgumentException("Assigned user not found with id: " + assignedToUserId));
            complaint.setAssignedTo(assignedTo);
        }

        complaint.setLastUpdatedBy(updater);
        Complaint saved = complaintRepository.save(complaint);

        // Notify the resident
        alertService.createInAppNotification(
                complaint.getResident().getUser(),
                complaint.getResident(),
                complaint.getCommunity(),
                "Complaint Status Updated",
                "Your complaint " + complaint.getTicketNumber() + " status has been updated to " + complaint.getStatus() + ".",
                AlertType.COMPLAINT_STATUS_UPDATED,
                AlertSeverity.MEDIUM,
                null
        );

        return mapToResponse(saved);
    }

    private ComplaintResponse mapToResponse(Complaint complaint) {
        return ComplaintResponse.builder()
                .id(complaint.getId())
                .ticketNumber(complaint.getTicketNumber())
                .residentId(complaint.getResident().getId())
                .residentName(complaint.getResident().getUser().getFullName())
                .communityId(complaint.getCommunity().getId())
                .communityName(complaint.getCommunity().getCommunityName())
                .category(complaint.getCategory())
                .priority(complaint.getPriority())
                .status(complaint.getStatus())
                .description(complaint.getDescription())
                .remarks(complaint.getRemarks())
                .assignedToId(complaint.getAssignedTo() != null ? complaint.getAssignedTo().getId() : null)
                .assignedToName(complaint.getAssignedTo() != null ? complaint.getAssignedTo().getFullName() : null)
                .createdAt(complaint.getCreatedAt())
                .updatedAt(complaint.getUpdatedAt())
                .resolvedAt(complaint.getResolvedAt())
                .lastUpdatedById(complaint.getLastUpdatedBy() != null ? complaint.getLastUpdatedBy().getId() : null)
                .lastUpdatedByName(complaint.getLastUpdatedBy() != null ? complaint.getLastUpdatedBy().getFullName() : null)
                .build();
    }
}
