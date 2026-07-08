package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.dto.InvitationDetailsResponse;
import com.water.monitoring_and_billing_platform.dto.InvitationHistoryResponse;
import com.water.monitoring_and_billing_platform.dto.ResidentInvitationRequest;
import com.water.monitoring_and_billing_platform.dto.ResidentInvitationResponse;
import com.water.monitoring_and_billing_platform.entity.CommunityAdminProfile;
import com.water.monitoring_and_billing_platform.entity.Invitation;
import com.water.monitoring_and_billing_platform.entity.User;
import com.water.monitoring_and_billing_platform.enums.InvitationStatus;
import com.water.monitoring_and_billing_platform.exception.CommunityAdminProfileNotFoundException;
import com.water.monitoring_and_billing_platform.exception.DuplicateInvitationException;
import com.water.monitoring_and_billing_platform.exception.InvalidInvitationTokenException;
import com.water.monitoring_and_billing_platform.exception.InvitationExpiredException;
import com.water.monitoring_and_billing_platform.exception.UserNotFoundException;
import com.water.monitoring_and_billing_platform.repository.CommunityAdminProfileRepository;
import com.water.monitoring_and_billing_platform.repository.InvitationRepository;
import com.water.monitoring_and_billing_platform.repository.UserRepository;
import com.water.monitoring_and_billing_platform.service.InvitationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvitationServiceImpl implements InvitationService {

    private final InvitationRepository invitationRepository;
    private final UserRepository userRepository;
    private final CommunityAdminProfileRepository communityAdminProfileRepository;

    @Value("${frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    @Value("${invitation.expiry-days:7}")
    private int invitationExpiryDays;

    @Override
    @Transactional
    public ResidentInvitationResponse inviteResident(String email, ResidentInvitationRequest request) {
        if (!StringUtils.hasText(request.getEmail()) && !StringUtils.hasText(request.getMobileNumber())) {
            throw new IllegalArgumentException("Either email or mobile number must be provided");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(UserNotFoundException::new);

        CommunityAdminProfile adminProfile = communityAdminProfileRepository.findByUserId(user.getId())
                .orElseThrow(CommunityAdminProfileNotFoundException::new);

        List<InvitationStatus> activeStatuses = Arrays.asList(InvitationStatus.CREATED, InvitationStatus.SENT);
        Long communityId = adminProfile.getCommunity().getId();

        if (StringUtils.hasText(request.getEmail())) {
            if (invitationRepository.existsByEmailAndCommunityIdAndStatusIn(request.getEmail(), communityId, activeStatuses) ||
                userRepository.existsByEmail(request.getEmail())) {
                throw new DuplicateInvitationException();
            }
        }

        if (StringUtils.hasText(request.getMobileNumber())) {
            if (invitationRepository.existsByMobileNumberAndCommunityIdAndStatusIn(request.getMobileNumber(), communityId, activeStatuses)) {
                throw new DuplicateInvitationException();
            }
        }

        String token = UUID.randomUUID().toString();

        Invitation invitation = Invitation.builder()
                .token(token)
                .community(adminProfile.getCommunity())
                .admin(adminProfile)
                .email(request.getEmail())
                .mobileNumber(request.getMobileNumber())
                .status(InvitationStatus.SENT)
                .expiresAt(LocalDateTime.now().plusDays(invitationExpiryDays))
                .build();

        invitation = invitationRepository.save(invitation);

        String registrationLink = generateRegistrationLink(token);
        String message = generateInvitationMessage(adminProfile.getCommunity().getCommunityName(), adminProfile.getUser().getFullName(), registrationLink);
        String whatsappShareLink = "https://wa.me/?text=" + URLEncoder.encode(message, StandardCharsets.UTF_8);

        return ResidentInvitationResponse.builder()
                .invitationId(invitation.getId())
                .status(invitation.getStatus().name())
                .registrationLink(registrationLink)
                .whatsappShareLink(whatsappShareLink)
                .email(invitation.getEmail())
                .mobileNumber(invitation.getMobileNumber())
                .expiresAt(invitation.getExpiresAt())
                .build();
    }

    @Override
    public List<InvitationHistoryResponse> getAdminInvitations(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(UserNotFoundException::new);
        CommunityAdminProfile adminProfile = communityAdminProfileRepository.findByUserId(user.getId())
                .orElseThrow(CommunityAdminProfileNotFoundException::new);
                
        List<Invitation> invitations = invitationRepository.findByAdminIdOrderByCreatedAtDesc(adminProfile.getId());
        
        return invitations.stream().map(invitation -> {
            String registrationLink = generateRegistrationLink(invitation.getToken());
            String message = generateInvitationMessage(invitation.getCommunity().getCommunityName(), adminProfile.getUser().getFullName(), registrationLink);
            String whatsappShareLink = "https://wa.me/?text=" + URLEncoder.encode(message, StandardCharsets.UTF_8);
            
            return InvitationHistoryResponse.builder()
                    .invitationId(invitation.getId())
                    .email(invitation.getEmail())
                    .mobileNumber(invitation.getMobileNumber())
                    .status(invitation.getStatus().name())
                    .communityName(invitation.getCommunity().getCommunityName())
                    .registrationLink(registrationLink)
                    .whatsappShareLink(whatsappShareLink)
                    .createdAt(invitation.getCreatedAt())
                    .expiresAt(invitation.getExpiresAt())
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public InvitationDetailsResponse validateToken(String token) {
        Invitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(InvalidInvitationTokenException::new);

        if (invitation.getStatus() == InvitationStatus.EXPIRED || 
            invitation.getStatus() == InvitationStatus.REGISTERED ||
            invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            
            if (invitation.getStatus() != InvitationStatus.EXPIRED && invitation.getStatus() != InvitationStatus.REGISTERED) {
                invitation.setStatus(InvitationStatus.EXPIRED);
                invitationRepository.save(invitation);
            }
            throw new InvitationExpiredException();
        }

        return InvitationDetailsResponse.builder()
                .communityName(invitation.getCommunity().getCommunityName())
                .communityCode(invitation.getCommunity().getCommunityCode())
                .invitedBy(invitation.getAdmin().getUser().getFullName())
                .expiresAt(invitation.getExpiresAt())
                .build();
    }
    
    private String generateRegistrationLink(String token) {
        return frontendBaseUrl + "/register?invite=" + token;
    }
    
    private String generateInvitationMessage(String communityName, String adminName, String link) {
        return "Hello,\n\n" +
               "You have been invited to join " + communityName + " on the Web Based Water Usage Monitoring and Billing Administration Platform.\n\n" +
               "Please complete your registration using the secure registration link below.\n\n" +
               link + "\n\n" +
               "Regards,\n" +
               adminName;
    }
}
