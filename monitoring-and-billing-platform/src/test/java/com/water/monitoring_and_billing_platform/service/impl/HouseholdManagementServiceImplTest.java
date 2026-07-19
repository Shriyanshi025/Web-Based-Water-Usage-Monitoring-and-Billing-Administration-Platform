package com.water.monitoring_and_billing_platform.service.impl;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.water.monitoring_and_billing_platform.dto.ResidentProfileUpdateRequest;
import com.water.monitoring_and_billing_platform.dto.WaterMeterUpdateRequest;
import com.water.monitoring_and_billing_platform.entity.*;
import com.water.monitoring_and_billing_platform.enums.*;
import com.water.monitoring_and_billing_platform.repository.*;

@ExtendWith(MockitoExtension.class)
class HouseholdManagementServiceImplTest {

    @Mock
    private ResidentProfileRepository residentProfileRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CommunityRepository communityRepository;

    @Mock
    private BlockRepository blockRepository;

    @Mock
    private UnitRepository unitRepository;

    @Mock
    private CommunityAdminProfileRepository communityAdminProfileRepository;

    @Mock
    private WaterMeterRepository waterMeterRepository;

    @Mock
    private BillRepository billRepository;

    @Mock
    private com.water.monitoring_and_billing_platform.repository.ActivityLogRepository activityLogRepository;

    @Mock
    private WaterUsageRepository waterUsageRepository;

    @Mock
    private com.water.monitoring_and_billing_platform.service.AlertService alertService;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private AlertRepository alertRepository;

    @Mock
    private ComplaintRepository complaintRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private InvitationRepository invitationRepository;

    @InjectMocks
    private ResidentProfileServiceImpl residentProfileService;

    @InjectMocks
    private WaterMeterServiceImpl waterMeterService;

    @Test
    void updateResident_shouldUpdatePhoneNumberAndActiveState() {
        String adminEmail = "admin@example.com";
        User adminUser = new User();
        adminUser.setId(10L);
        adminUser.setEmail(adminEmail);

        Community community = new Community();
        community.setId(99L);
        community.setCommunityName("Oakwood");

        CommunityAdminProfile adminProfile = new CommunityAdminProfile();
        adminProfile.setCommunity(community);

        ResidentProfile resident = new ResidentProfile();
        resident.setId(22L);
        resident.setCommunity(community);
        resident.setActive(true);
        resident.setVerified(false);
        resident.setPhoneNumber("1111111111");

        User residentUser = new User();
        residentUser.setId(11L);
        residentUser.setFullName("Jamie Doe");
        residentUser.setEmail("resident@example.com");
        resident.setUser(residentUser);

        ResidentProfileUpdateRequest request = new ResidentProfileUpdateRequest();
        request.setPhoneNumber("2222222222");
        request.setActive(false);
        request.setVerified(true);

        when(userRepository.findByEmail(adminEmail)).thenReturn(Optional.of(adminUser));
        when(communityAdminProfileRepository.findByUserId(10L)).thenReturn(Optional.of(adminProfile));
        when(residentProfileRepository.findById(22L)).thenReturn(Optional.of(resident));
        when(residentProfileRepository.save(resident)).thenReturn(resident);

        var response = residentProfileService.updateResident(adminEmail, 22L, request);

        assertEquals("2222222222", response.getPhoneNumber());
        assertEquals(false, response.isActive());
        assertEquals(true, response.isVerified());
    }

    @Test
    void updateWaterMeter_shouldUpdateAssignmentAndStatus() {
        String adminEmail = "admin@example.com";
        User adminUser = new User();
        adminUser.setId(10L);
        adminUser.setEmail(adminEmail);

        Community community = new Community();
        community.setId(99L);

        CommunityAdminProfile adminProfile = new CommunityAdminProfile();
        adminProfile.setCommunity(community);

        ResidentProfile resident = new ResidentProfile();
        resident.setId(5L);
        resident.setCommunity(community);
        resident.setOfficialUserId("R-100");
        User residentUser = new User();
        residentUser.setFullName("Alex Stone");
        resident.setUser(residentUser);

        WaterMeter meter = new WaterMeter();
        meter.setId(3L);
        meter.setMeterNumber("M-001");
        meter.setResidentProfile(resident);
        meter.setMeterStatus(MeterStatus.ACTIVE);
        meter.setInitialReading(10.0);
        meter.setCurrentReading(20.0);
        meter.setActive(true);

        WaterMeterUpdateRequest request = new WaterMeterUpdateRequest();
        request.setResidentProfileId(5L);
        request.setMeterStatus("INACTIVE");
        request.setCurrentReading(35.0);
        request.setActive(false);

        when(userRepository.findByEmail(adminEmail)).thenReturn(Optional.of(adminUser));
        when(communityAdminProfileRepository.findByUserId(10L)).thenReturn(Optional.of(adminProfile));
        when(waterMeterRepository.findById(3L)).thenReturn(Optional.of(meter));
        when(residentProfileRepository.findById(5L)).thenReturn(Optional.of(resident));
        when(waterMeterRepository.existsByResidentProfileId(5L)).thenReturn(false);
        when(waterMeterRepository.save(meter)).thenReturn(meter);

        var response = waterMeterService.updateWaterMeter(adminEmail, 3L, request);

        assertEquals("INACTIVE", response.getMeterStatus());
        assertEquals(35.0, response.getCurrentReading());
        assertEquals(false, response.isActive());
    }

    @Test
    void deleteResident_shouldPerformCompleteHardDelete() {
        String adminEmail = "admin@example.com";
        User adminUser = new User();
        adminUser.setId(10L);
        adminUser.setEmail(adminEmail);

        Community community = new Community();
        community.setId(99L);

        CommunityAdminProfile adminProfile = new CommunityAdminProfile();
        adminProfile.setCommunity(community);

        ResidentProfile resident = new ResidentProfile();
        resident.setId(22L);
        resident.setCommunity(community);
        resident.setPhoneNumber("1111111111");

        User residentUser = new User();
        residentUser.setId(11L);
        residentUser.setEmail("resident@example.com");
        resident.setUser(residentUser);

        WaterMeter meter = new WaterMeter();
        meter.setId(30L);
        meter.setResidentProfile(resident);

        Bill bill = new Bill();
        bill.setId(100L);
        bill.setResidentProfile(resident);

        Payment payment = new Payment();
        payment.setId(200L);
        payment.setResident(resident);

        Invoice invoice = new Invoice();
        invoice.setId(300L);
        invoice.setBill(bill);

        Alert alert1 = new Alert();
        alert1.setId(400L);
        alert1.setResident(resident);

        Alert alert2 = new Alert();
        alert2.setId(401L);
        alert2.setRecipient(residentUser);

        Complaint complaint = new Complaint();
        complaint.setId(500L);
        complaint.setResident(resident);

        Notification notification1 = new Notification();
        notification1.setId(600L);
        notification1.setRecipient("resident@example.com");

        Notification notification2 = new Notification();
        notification2.setId(601L);
        notification2.setRecipient("1111111111");

        Invitation invitation = new Invitation();
        invitation.setId(700L);
        invitation.setEmail("resident@example.com");

        // Stubbing repository and service calls
        when(userRepository.findByEmail(adminEmail)).thenReturn(Optional.of(adminUser));
        when(communityAdminProfileRepository.findByUserId(10L)).thenReturn(Optional.of(adminProfile));
        when(residentProfileRepository.findById(22L)).thenReturn(Optional.of(resident));

        when(paymentRepository.findByResidentId(22L)).thenReturn(java.util.List.of(payment));
        when(billRepository.findByResidentProfileId(22L)).thenReturn(java.util.List.of(bill));
        when(invoiceRepository.findByBillId(100L)).thenReturn(Optional.of(invoice));

        when(alertRepository.findByResidentId(22L)).thenReturn(java.util.List.of(alert1));
        when(alertRepository.findByRecipientIdOrderByCreatedDateDesc(11L)).thenReturn(java.util.List.of(alert2));

        when(waterMeterRepository.findByResidentProfileId(22L)).thenReturn(Optional.of(meter));
        when(waterUsageRepository.findByWaterMeterId(30L)).thenReturn(java.util.List.of());

        when(complaintRepository.findByResidentIdOrderByCreatedAtDesc(22L)).thenReturn(java.util.List.of(complaint));
        when(complaintRepository.findByAssignedToId(11L)).thenReturn(java.util.List.of());
        when(complaintRepository.findByLastUpdatedById(11L)).thenReturn(java.util.List.of());

        when(notificationRepository.findByRecipient("resident@example.com")).thenReturn(java.util.List.of(notification1));
        when(notificationRepository.findByRecipient("1111111111")).thenReturn(java.util.List.of(notification2));
        when(invitationRepository.findByEmail("resident@example.com")).thenReturn(java.util.List.of(invitation));

        // Call target method
        residentProfileService.deleteResident(adminEmail, 22L);

        // Verification of deletions
        org.mockito.Mockito.verify(paymentRepository).deleteAll(java.util.List.of(payment));
        org.mockito.Mockito.verify(invoiceRepository).delete(invoice);
        org.mockito.Mockito.verify(alertRepository).deleteAll(java.util.List.of(alert1));
        org.mockito.Mockito.verify(alertRepository).deleteAll(java.util.List.of(alert2));
        org.mockito.Mockito.verify(billRepository).deleteAll(java.util.List.of(bill));
        org.mockito.Mockito.verify(waterMeterRepository).delete(meter);
        org.mockito.Mockito.verify(complaintRepository).deleteAll(java.util.List.of(complaint));
        org.mockito.Mockito.verify(notificationRepository).deleteAll(java.util.List.of(notification1));
        org.mockito.Mockito.verify(notificationRepository).deleteAll(java.util.List.of(notification2));
        org.mockito.Mockito.verify(invitationRepository).deleteAll(java.util.List.of(invitation));
        org.mockito.Mockito.verify(residentProfileRepository).delete(resident);
        org.mockito.Mockito.verify(userRepository).delete(residentUser);
    }
}
