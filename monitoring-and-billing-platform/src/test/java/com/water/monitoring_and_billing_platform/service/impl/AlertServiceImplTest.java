package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.dto.AlertResponse;
import com.water.monitoring_and_billing_platform.dto.AlertStatisticsResponse;
import com.water.monitoring_and_billing_platform.dto.SystemAnnouncementRequest;
import com.water.monitoring_and_billing_platform.entity.*;
import com.water.monitoring_and_billing_platform.enums.*;
import com.water.monitoring_and_billing_platform.repository.*;
import com.water.monitoring_and_billing_platform.service.EmailNotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AlertServiceImplTest {

    @Mock
    private AlertRepository alertRepository;
    @Mock
    private AlertConfigurationRepository alertConfigurationRepository;
    @Mock
    private ResidentProfileRepository residentProfileRepository;
    @Mock
    private WaterMeterRepository waterMeterRepository;
    @Mock
    private WaterUsageRepository waterUsageRepository;
    @Mock
    private BillRepository billRepository;
    @Mock
    private BillingCycleRepository billingCycleRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private CommunityAdminProfileRepository communityAdminProfileRepository;
    @Mock
    private EmailNotificationService emailNotificationService;

    @InjectMocks
    private AlertServiceImpl alertService;

    private User residentUser;
    private User adminUser;
    private Community community;
    private ResidentProfile resident;
    private CommunityAdminProfile adminProfile;
    private BillingCycle cycle;
    private WaterMeter meter;
    private AlertConfiguration config;

    @BeforeEach
    void setUp() {
        residentUser = User.builder().id(1L).fullName("John Resident").email("resident@example.com").role(Role.USER).build();
        adminUser = User.builder().id(2L).fullName("Admin User").email("admin@example.com").role(Role.COMMUNITY_ADMIN).build();
        community = Community.builder().id(10L).communityName("Maplewood").build();
        resident = ResidentProfile.builder().id(1L).user(residentUser).community(community).active(true).build();
        adminProfile = CommunityAdminProfile.builder().id(1L).user(adminUser).community(community).build();
        cycle = BillingCycle.builder().id(5L).name("Cycle 1").periodStart(LocalDate.now().minusDays(10)).periodEnd(LocalDate.now().plusDays(10)).build();
        meter = WaterMeter.builder().id(100L).meterNumber("M-100").residentProfile(resident).active(true).build();
        config = AlertConfiguration.builder().highUsagePercentage(150.0).leakDetectionThreshold(0.01).meterOfflineDurationHours(24).overdueReminderDays(5).build();
    }

    @Test
    void testProcessScheduledAlerts_HighUsageDetected() {
        when(billingCycleRepository.findFirstByActiveTrueOrderByPeriodStartDesc()).thenReturn(Optional.of(cycle));
        when(residentProfileRepository.findAll()).thenReturn(List.of(resident));
        when(alertConfigurationRepository.findByCommunityId(10L)).thenReturn(Optional.of(config));
        
        when(alertRepository.existsByResidentIdAndBillingCycleIdAndAlertTypeAndStatus(
                anyLong(), anyLong(), eq(AlertType.HIGH_WATER_USAGE), eq(AlertStatus.ACTIVE)
        )).thenReturn(false);
        when(alertRepository.existsByResidentIdAndBillingCycleIdAndAlertTypeAndStatus(
                anyLong(), anyLong(), eq(AlertType.SUSPECTED_LEAK), eq(AlertStatus.ACTIVE)
        )).thenReturn(true);
        when(alertRepository.existsByResidentIdAndAlertTypeAndStatus(
                anyLong(), eq(AlertType.METER_OFFLINE), eq(AlertStatus.ACTIVE)
        )).thenReturn(true);

        when(waterMeterRepository.findByResidentProfileId(1L)).thenReturn(Optional.of(meter));

        // High water consumption: current = 150.0 KL
        WaterUsage u1 = WaterUsage.builder().unitsConsumed(150.0).readingDate(LocalDate.now()).build();
        when(waterUsageRepository.findByWaterMeterIdAndReadingDateBetween(eq(100L), any(), any()))
                .thenReturn(List.of(u1));

        // Historical average = 50.0 KL
        Bill pastBill = Bill.builder().unitsConsumed(50.0).build();
        when(billRepository.findByResidentProfileId(1L)).thenReturn(List.of(pastBill));

        alertService.processScheduledAlerts();

        verify(alertRepository).save(any(Alert.class));
        verify(emailNotificationService).sendAlertEmail(eq("resident@example.com"), anyString(), anyString());
    }

    @Test
    void testProcessScheduledAlerts_SuspectedLeak() {
        when(billingCycleRepository.findFirstByActiveTrueOrderByPeriodStartDesc()).thenReturn(Optional.of(cycle));
        when(residentProfileRepository.findAll()).thenReturn(List.of(resident));
        when(alertConfigurationRepository.findByCommunityId(10L)).thenReturn(Optional.of(config));

        when(alertRepository.existsByResidentIdAndBillingCycleIdAndAlertTypeAndStatus(
                anyLong(), anyLong(), eq(AlertType.HIGH_WATER_USAGE), eq(AlertStatus.ACTIVE)
        )).thenReturn(true);
        when(alertRepository.existsByResidentIdAndBillingCycleIdAndAlertTypeAndStatus(
                anyLong(), anyLong(), eq(AlertType.SUSPECTED_LEAK), eq(AlertStatus.ACTIVE)
        )).thenReturn(false);
        when(alertRepository.existsByResidentIdAndAlertTypeAndStatus(
                anyLong(), eq(AlertType.METER_OFFLINE), eq(AlertStatus.ACTIVE)
        )).thenReturn(true);

        when(waterMeterRepository.findByResidentProfileId(1L)).thenReturn(Optional.of(meter));

        // Suspected leak check: last 3 usages all above threshold (0.01)
        WaterUsage u1 = WaterUsage.builder().unitsConsumed(5.0).readingDate(LocalDate.now()).build();
        WaterUsage u2 = WaterUsage.builder().unitsConsumed(5.0).readingDate(LocalDate.now().minusDays(1)).build();
        WaterUsage u3 = WaterUsage.builder().unitsConsumed(5.0).readingDate(LocalDate.now().minusDays(2)).build();
        when(waterUsageRepository.findByWaterMeterIdAndReadingDateBetween(eq(100L), any(), any()))
                .thenReturn(List.of(u1, u2, u3));

        alertService.processScheduledAlerts();

        verify(alertRepository).save(any(Alert.class));
        verify(emailNotificationService).sendAlertEmail(eq("resident@example.com"), anyString(), anyString());
    }

    @Test
    void testCreateSystemAnnouncement() {
        SystemAnnouncementRequest request = new SystemAnnouncementRequest();
        request.setTitle("Maintenance Notice");
        request.setMessage("Water supply will be offline tomorrow.");
        request.setCommunityId(10L);
        request.setSeverity("HIGH");

        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));
        when(communityAdminProfileRepository.findByUserId(2L)).thenReturn(Optional.of(adminProfile));
        when(residentProfileRepository.findByCommunityIdAndActiveTrue(10L)).thenReturn(List.of(resident));
        when(alertRepository.save(any(Alert.class))).thenAnswer(inv -> inv.getArgument(0));

        AlertResponse response = alertService.createSystemAnnouncement("admin@example.com", request);

        assertNotNull(response);
        assertEquals("Maintenance Notice", response.getTitle());
        assertEquals("SYSTEM_NOTIFICATION", response.getAlertType());
        assertEquals("HIGH", response.getSeverity());
        verify(alertRepository).save(any(Alert.class));
        verify(emailNotificationService).sendAlertEmail(eq("resident@example.com"), anyString(), anyString());
    }

    @Test
    void testGetStatistics() {
        Alert activeAlert = Alert.builder().id(1L).alertType(AlertType.HIGH_WATER_USAGE).severity(AlertSeverity.HIGH).status(AlertStatus.ACTIVE).createdDate(LocalDateTime.now()).community(community).build();
        Alert resolvedAlert = Alert.builder().id(2L).alertType(AlertType.SUSPECTED_LEAK).severity(AlertSeverity.CRITICAL).status(AlertStatus.RESOLVED).createdDate(LocalDateTime.now()).community(community).build();

        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));
        when(communityAdminProfileRepository.findByUserId(2L)).thenReturn(Optional.of(adminProfile));
        when(alertRepository.findByCommunityId(10L)).thenReturn(List.of(activeAlert, resolvedAlert));

        AlertStatisticsResponse stats = alertService.getStatistics("admin@example.com");

        assertNotNull(stats);
        assertEquals(2, stats.getTotalAlerts());
        assertEquals(1, stats.getActiveAlerts());
        assertEquals(1, stats.getResolvedAlerts());
        assertEquals(2, stats.getAlertsToday());
    }
}
