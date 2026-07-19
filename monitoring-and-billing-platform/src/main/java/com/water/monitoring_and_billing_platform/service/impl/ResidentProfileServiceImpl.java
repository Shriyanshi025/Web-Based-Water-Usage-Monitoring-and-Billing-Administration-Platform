package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.enums.ApprovalStatus;
import com.water.monitoring_and_billing_platform.dto.ResidentProfileRequest;
import com.water.monitoring_and_billing_platform.dto.ResidentProfileUpdateRequest;
import com.water.monitoring_and_billing_platform.dto.ResidentSelfProfileUpdateRequest;
import com.water.monitoring_and_billing_platform.dto.ResidentProfileResponse;
import com.water.monitoring_and_billing_platform.entity.*;
import com.water.monitoring_and_billing_platform.exception.*;
import com.water.monitoring_and_billing_platform.repository.*;
import com.water.monitoring_and_billing_platform.service.AlertService;
import com.water.monitoring_and_billing_platform.service.ResidentProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResidentProfileServiceImpl implements ResidentProfileService {

    private final ResidentProfileRepository residentProfileRepository;

    private final UserRepository userRepository;

    private final CommunityRepository communityRepository;

    private final BlockRepository blockRepository;

    private final UnitRepository unitRepository;
    
    private final CommunityAdminProfileRepository communityAdminProfileRepository;

    private final WaterMeterRepository waterMeterRepository;

    private final BillRepository billRepository;
    
    private final ActivityLogRepository activityLogRepository;

    private final WaterUsageRepository waterUsageRepository;

    private final AlertService alertService;

    private final PaymentRepository paymentRepository;

    private final InvoiceRepository invoiceRepository;

    private final AlertRepository alertRepository;

    private final ComplaintRepository complaintRepository;

    private final NotificationRepository notificationRepository;

    private final InvitationRepository invitationRepository;

    private CommunityAdminProfile getAdminProfile(String adminEmail) {
        User user = userRepository.findByEmail(adminEmail)
                .orElseThrow(UserNotFoundException::new);
        return communityAdminProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Community Admin profile not found."));
    }

    @Override
    public ResidentProfileResponse createResidentProfile(String adminEmail, ResidentProfileRequest request) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);
        
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(UserNotFoundException::new);

        Community community = communityRepository.findById(request.getCommunityId())
                .orElseThrow(CommunityNotFoundException::new);

        if (!community.getId().equals(adminProfile.getCommunity().getId())) {
            throw new RuntimeException("Not authorized to create resident for this community.");
        }

        Block block = blockRepository.findById(request.getBlockId())
                .orElseThrow(BlockNotFoundException::new);

        Unit unit = unitRepository.findById(request.getUnitId())
                .orElseThrow(UnitNotFoundException::new);

        if (residentProfileRepository.existsByUserId(user.getId())) {
            throw new ResidentAlreadyExistsException();
        }

        if (!block.getCommunity().getId().equals(community.getId())) {
            throw new RuntimeException(
                    "Selected block does not belong to selected community."
            );
        }

        if (!unit.getBlock().getId().equals(block.getId())) {
            throw new RuntimeException(
                    "Selected unit does not belong to selected block."
            );
        }

        ResidentProfile resident = ResidentProfile.builder()
                .user(user)
                .community(community)
                .block(block)
                .unit(unit)
                .phoneNumber(request.getPhoneNumber())
                .verified(false)
                .active(true)
                .build();

        resident.setOfficialUserId("PENDING");

        resident = residentProfileRepository.save(resident);
        
        activityLogRepository.save(ActivityLog.builder()
                .title("Resident Registered")
                .description("New resident profile created for " + user.getFullName())
                .timestamp(java.time.LocalDateTime.now())
                .icon("PersonAdd")
                .color("info.main")
                .community(community)
                .user(user)
                .build());

        return mapToResponse(resident);
    }

    @Override
    @Transactional(readOnly = true)
    public ResidentProfileResponse getResidentById(String adminEmail, Long id) {
        if (id == null) {
            throw new ResidentProfileNotFoundException();
        }
        
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);
        
        ResidentProfile resident = residentProfileRepository.findById(id)
                .orElseThrow(ResidentProfileNotFoundException::new);

        if (!resident.getCommunity().getId().equals(adminProfile.getCommunity().getId())) {
            throw new ResidentProfileNotFoundException();
        }

        return mapToResponse(resident);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResidentProfileResponse> getAllResidents(String adminEmail) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);
        
        return residentProfileRepository.findByCommunityId(adminProfile.getCommunity().getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private ResidentProfileResponse mapToResponse(ResidentProfile resident) {
        var user = resident.getUser();
        var community = resident.getCommunity();
        var block = resident.getBlock();
        var unit = resident.getUnit();

        String meterSerial = null;
        // meterSerial = waterMeterRepository.findByResidentProfileId(resident.getId()).map(WaterMeter::getSerialNumber).orElse(null);
        // We will just leave it null for now since it's not easily accessible without repository injection here.

        return ResidentProfileResponse.builder()
                .id(resident.getId())
                .userId(resident.getUser().getId())
                .officialUserId(resident.getOfficialUserId())
                .fullName(user != null ? user.getFullName() : null)
                .email(user != null ? user.getEmail() : null)
                .phoneNumber(resident.getPhoneNumber())
                .communityName(community != null ? community.getCommunityName() : null)
                .blockName(block != null ? block.getBlockName() : null)
                .unitNumber(unit != null ? unit.getUnitNumber() : null)
                .approvalStatus(user != null && user.getApprovalStatus() != null ? user.getApprovalStatus().name() : null)
                .meterSerialNumber(meterSerial)
                .verified(resident.isVerified())
                .active(resident.isActive())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ResidentProfileResponse getSelfProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(UserNotFoundException::new);

        ResidentProfile resident = residentProfileRepository.findByUserId(user.getId())
                .orElseThrow(ResidentProfileNotFoundException::new);

        return mapToResponse(resident);
    }

    @Override
    @Transactional
    public ResidentProfileResponse updateSelfProfile(String email, ResidentSelfProfileUpdateRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(UserNotFoundException::new);

        ResidentProfile resident = residentProfileRepository.findByUserId(user.getId())
                .orElseThrow(ResidentProfileNotFoundException::new);

        user.setFullName(request.getFullName());
        resident.setPhoneNumber(request.getPhoneNumber());

        userRepository.save(user);
        resident = residentProfileRepository.save(resident);

        return mapToResponse(resident);
    }

    @Override
    @Transactional
    public ResidentProfileResponse updateResident(String adminEmail, Long residentId, ResidentProfileUpdateRequest request) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);

        ResidentProfile resident = residentProfileRepository.findById(residentId)
                .orElseThrow(ResidentProfileNotFoundException::new);

        if (!resident.getCommunity().getId().equals(adminProfile.getCommunity().getId())) {
            throw new ResidentProfileNotFoundException();
        }

        if (request.getPhoneNumber() != null) {
            resident.setPhoneNumber(request.getPhoneNumber());
        }

        if (request.getVerified() != null) {
            resident.setVerified(request.getVerified());
            if (resident.getUser() != null) {
                resident.getUser().setApprovalStatus(request.getVerified() ? ApprovalStatus.APPROVED : ApprovalStatus.PENDING);
                userRepository.save(resident.getUser());
            }
        }

        if (request.getActive() != null) {
            resident.setActive(request.getActive());
            if (resident.getUser() != null) {
                resident.getUser().setActive(request.getActive());
                userRepository.save(resident.getUser());
            }
        }

        if (request.getOfficialUserId() != null && !request.getOfficialUserId().isBlank()) {
            resident.setOfficialUserId(request.getOfficialUserId());
        }

        resident = residentProfileRepository.save(resident);
        return mapToResponse(resident);
    }

    @Override
    @Transactional
    public void deleteResident(String adminEmail, Long id) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);
        ResidentProfile resident = residentProfileRepository.findById(id)
                .orElseThrow(ResidentProfileNotFoundException::new);
        if (!resident.getCommunity().getId().equals(adminProfile.getCommunity().getId())) {
            throw new ResidentProfileNotFoundException();
        }
        
        User residentUser = resident.getUser();
        
        // 1. Delete Payments
        List<Payment> payments = paymentRepository.findByResidentId(id);
        paymentRepository.deleteAll(payments);
        
        // 2. Delete Invoices linked to Resident's Bills
        List<Bill> bills = billRepository.findByResidentProfileId(id);
        for (Bill bill : bills) {
            invoiceRepository.findByBillId(bill.getId()).ifPresent(invoiceRepository::delete);
        }
        
        // 3. Delete Alerts linked to Resident Profile or Recipient User
        alertRepository.deleteAll(alertRepository.findByResidentId(id));
        if (residentUser != null) {
            alertRepository.deleteAll(alertRepository.findByRecipientIdOrderByCreatedDateDesc(residentUser.getId()));
        }
        
        // 4. Delete Bills
        billRepository.deleteAll(bills);
        
        // 5. Delete WaterUsage and WaterMeter
        java.util.Optional<WaterMeter> waterMeterOpt = waterMeterRepository.findByResidentProfileId(id);
        if (waterMeterOpt.isPresent()) {
            WaterMeter meter = waterMeterOpt.get();
            List<WaterUsage> usages = waterUsageRepository.findByWaterMeterId(meter.getId());
            waterUsageRepository.deleteAll(usages);
            waterMeterRepository.delete(meter);
        }
        
        // 6. Delete Complaints created by Resident or nullify assigned/updated links
        complaintRepository.deleteAll(complaintRepository.findByResidentIdOrderByCreatedAtDesc(id));
        if (residentUser != null) {
            List<Complaint> assignedComplaints = complaintRepository.findByAssignedToId(residentUser.getId());
            for (Complaint c : assignedComplaints) {
                c.setAssignedTo(null);
                complaintRepository.save(c);
            }
            List<Complaint> updatedComplaints = complaintRepository.findByLastUpdatedById(residentUser.getId());
            for (Complaint c : updatedComplaints) {
                c.setLastUpdatedBy(null);
                complaintRepository.save(c);
            }
        }
        
        // 7. Delete Notifications & Invitations
        if (residentUser != null) {
            if (residentUser.getEmail() != null) {
                notificationRepository.deleteAll(notificationRepository.findByRecipient(residentUser.getEmail()));
                invitationRepository.deleteAll(invitationRepository.findByEmail(residentUser.getEmail()));
            }
            if (resident.getPhoneNumber() != null) {
                notificationRepository.deleteAll(notificationRepository.findByRecipient(resident.getPhoneNumber()));
            }
        }
        
        // 8. Delete Activity Logs
        if (residentUser != null) {
            activityLogRepository.deleteByUserId(residentUser.getId());
        }
        
        // 9. Delete Resident Profile
        residentProfileRepository.delete(resident);
        
        // 10. Delete User account
        if (residentUser != null) {
            userRepository.delete(residentUser);
        }
    }

    @Override
    public List<com.water.monitoring_and_billing_platform.dto.HouseholdDirectoryResponse> getHouseholdDirectory(String adminEmail) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);
        
        return residentProfileRepository.findByCommunityIdAndActiveTrue(adminProfile.getCommunity().getId()).stream()
                .map(resident -> {
                    com.water.monitoring_and_billing_platform.entity.WaterMeter meter = waterMeterRepository.findByResidentProfileId(resident.getId()).orElse(null);
                    List<com.water.monitoring_and_billing_platform.entity.Bill> bills = billRepository.findByResidentProfileId(resident.getId()).stream()
                            .filter(b -> b.getStatus() == com.water.monitoring_and_billing_platform.enums.BillStatus.UNPAID)
                            .toList();
                    
                    int pendingCount = bills.size();
                    java.math.BigDecimal pendingAmount = bills.stream()
                            .map(com.water.monitoring_and_billing_platform.entity.Bill::getAmount)
                            .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

                    return com.water.monitoring_and_billing_platform.dto.HouseholdDirectoryResponse.builder()
                            .residentId(resident.getId())
                            .residentName(resident.getUser() != null ? resident.getUser().getFullName() : null)
                            .unitNumber(resident.getUnit() != null ? resident.getUnit().getUnitNumber() : null)
                            .meterNumber(meter != null ? meter.getMeterNumber() : "No Meter")
                            .currentReading(meter != null ? meter.getCurrentReading() : 0.0)
                            .pendingBillsCount(pendingCount)
                            .pendingBillsAmount(pendingAmount)
                            .build();
                })
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResidentProfileResponse> getPendingResidents(String adminEmail) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);
        return residentProfileRepository.findByCommunityIdAndVerifiedFalseAndUserApprovalStatus(adminProfile.getCommunity().getId(), ApprovalStatus.PENDING)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public void approveResident(String adminEmail, Long userId, com.water.monitoring_and_billing_platform.dto.ApprovalRequest request) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.water.monitoring_and_billing_platform.exception.UserNotFoundException());

        ResidentProfile profile = residentProfileRepository.findByUserId(userId)
                .orElseThrow(ResidentProfileNotFoundException::new);
                
        if (!profile.getCommunity().getId().equals(adminProfile.getCommunity().getId())) {
            throw new ResidentProfileNotFoundException(); // Using existing exception as shorthand for Unauthorized
        }

        if (user.getApprovalStatus() != ApprovalStatus.PENDING) {
            throw new IllegalStateException("User is not in PENDING status.");
        }

        if (request.getApprovalStatus() == ApprovalStatus.REJECTED) {
            user.setApprovalStatus(ApprovalStatus.REJECTED);
            userRepository.save(user);
            
            activityLogRepository.save(ActivityLog.builder()
                .title("Resident Rejected")
                .description("Resident profile rejected for " + user.getFullName())
                .timestamp(java.time.LocalDateTime.now())
                .icon("Cancel")
                .color("error.main")
                .community(profile.getCommunity())
                .user(user)
                .build());
                
            return;
        }

        if (request.getApprovalStatus() == ApprovalStatus.APPROVED) {
            long verifiedCount = residentProfileRepository.countByCommunityIdAndVerifiedTrue(profile.getCommunity().getId());
            long sequence = verifiedCount + 1;

            String officialUserId = com.water.monitoring_and_billing_platform.util.IdGenerator.generateOfficialResidentId(
                    profile.getCommunity().getCommunityCode(),
                    profile.getBlock().getBlockName(),
                    profile.getUnit().getUnitNumber(),
                    sequence
            );

            profile.setVerified(true);
            profile.setOfficialUserId(officialUserId);

            user.setApprovalStatus(ApprovalStatus.APPROVED);

            userRepository.save(user);
            ResidentProfile savedProfile = residentProfileRepository.save(profile);
            
            // Assign a UNIQUE Water Meter automatically
            if (waterMeterRepository.findByResidentProfileId(savedProfile.getId()).isEmpty()) {
                long totalMeters = waterMeterRepository.count();
                String meterNumber = String.format("WM-%06d", totalMeters + 1);
                WaterMeter meter = WaterMeter.builder()
                        .meterNumber(meterNumber)
                        .residentProfile(savedProfile)
                        .meterStatus(com.water.monitoring_and_billing_platform.enums.MeterStatus.ACTIVE)
                        .initialReading(0.0)
                        .currentReading(0.0)
                        .installationDate(java.time.LocalDate.now())
                        .active(true)
                        .build();
                waterMeterRepository.save(meter);
            }
            
            alertService.createInAppNotification(
                    user,
                    savedProfile,
                    savedProfile.getCommunity(),
                    "Registration Approved",
                    "Your registration has been approved. Your Resident ID is " + officialUserId,
                    com.water.monitoring_and_billing_platform.enums.AlertType.REGISTRATION_APPROVED,
                    com.water.monitoring_and_billing_platform.enums.AlertSeverity.LOW,
                    null
            );

            activityLogRepository.save(ActivityLog.builder()
                .title("Resident Approved")
                .description("Resident profile approved for " + user.getFullName() + ". Assigned ID: " + officialUserId)
                .timestamp(java.time.LocalDateTime.now())
                .icon("CheckCircle")
                .color("success.main")
                .community(profile.getCommunity())
                .user(user)
                .build());
        }
    }
}
