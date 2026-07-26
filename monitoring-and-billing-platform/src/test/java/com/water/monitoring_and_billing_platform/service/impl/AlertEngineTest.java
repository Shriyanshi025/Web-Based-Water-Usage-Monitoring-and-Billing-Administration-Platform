package com.water.monitoring_and_billing_platform.service.impl;

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
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@org.mockito.junit.jupiter.MockitoSettings(strictness = org.mockito.quality.Strictness.LENIENT)
public class AlertEngineTest {

    @Mock private AlertRepository alertRepository;
    @Mock private AlertConfigurationRepository alertConfigurationRepository;
    @Mock private ResidentProfileRepository residentProfileRepository;
    @Mock private WaterMeterRepository waterMeterRepository;
    @Mock private WaterUsageRepository waterUsageRepository;
    @Mock private BillRepository billRepository;
    @Mock private BillingCycleRepository billingCycleRepository;
    @Mock private UserRepository userRepository;
    @Mock private CommunityAdminProfileRepository communityAdminProfileRepository;
    @Mock private EmailNotificationService emailNotificationService;

    @InjectMocks
    private AlertServiceImpl alertService;

    private User user;
    private Community community;
    private ResidentProfile resident;
    private WaterMeter meter;
    private BillingCycle cycle;
    private AlertConfiguration config;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("resident@example.com").fullName("John Doe").role(Role.USER).build();
        community = Community.builder().id(10L).communityName("Springfield").build();
        resident = ResidentProfile.builder().id(100L).user(user).community(community).active(true).unit(Unit.builder().unitNumber("101").build()).build();
        meter = WaterMeter.builder().id(500L).meterNumber("MTR-01").residentProfile(resident).build();
        cycle = BillingCycle.builder().id(5L).name("July Cycle").periodStart(LocalDate.of(2026, 7, 1)).periodEnd(LocalDate.of(2026, 7, 31)).active(true).build();
        config = AlertConfiguration.builder().highConsumptionThreshold(20.0).highUsagePercentage(150.0).leakDetectionThreshold(0.01).meterOfflineDurationHours(24).overdueReminderDays(5).build();
    }

    @Test
    void processScheduledAlerts_HighConsumptionAlertGenerated() {
        when(billingCycleRepository.findFirstByActiveTrueOrderByPeriodStartDesc()).thenReturn(Optional.of(cycle));
        when(residentProfileRepository.findAll()).thenReturn(List.of(resident));
        when(alertConfigurationRepository.findByCommunityId(10L)).thenReturn(Optional.of(config));
        when(waterMeterRepository.findByResidentProfileId(100L)).thenReturn(Optional.of(meter));

        // Consume 25 kL, which is > threshold of 20 kL
        WaterUsage usage = WaterUsage.builder().id(1001L).waterMeter(meter).unitsConsumed(25.0).build();
        when(waterUsageRepository.findByWaterMeterIdAndReadingDateBetween(eq(500L), any(), any())).thenReturn(List.of(usage));
        when(alertRepository.existsByResidentIdAndBillingCycleIdAndAlertTypeAndStatus(100L, 5L, AlertType.HIGH_WATER_USAGE, AlertStatus.ACTIVE)).thenReturn(false);

        alertService.processScheduledAlerts();

        verify(alertRepository, times(1)).save(argThat(alert -> 
            alert.getAlertType() == AlertType.HIGH_WATER_USAGE &&
            alert.getSeverity() == AlertSeverity.MEDIUM &&
            alert.getStatus() == AlertStatus.ACTIVE
        ));
    }

    @Test
    void processScheduledAlerts_DuplicatePreventionReusesActiveAlert() {
        when(billingCycleRepository.findFirstByActiveTrueOrderByPeriodStartDesc()).thenReturn(Optional.of(cycle));
        when(residentProfileRepository.findAll()).thenReturn(List.of(resident));
        when(alertConfigurationRepository.findByCommunityId(10L)).thenReturn(Optional.of(config));
        when(waterMeterRepository.findByResidentProfileId(100L)).thenReturn(Optional.of(meter));

        WaterUsage usage = WaterUsage.builder().id(1001L).waterMeter(meter).unitsConsumed(35.0).build();
        when(waterUsageRepository.findByWaterMeterIdAndReadingDateBetween(eq(500L), any(), any())).thenReturn(List.of(usage));
        
        // Active alert already exists
        when(alertRepository.existsByResidentIdAndBillingCycleIdAndAlertTypeAndStatus(100L, 5L, AlertType.HIGH_WATER_USAGE, AlertStatus.ACTIVE)).thenReturn(true);

        alertService.processScheduledAlerts();

        // Should not call save since duplicate exists
        verify(alertRepository, never()).save(argThat(alert -> alert.getAlertType() == AlertType.HIGH_WATER_USAGE));
    }

    @Test
    void processScheduledAlerts_MissingMeterReadingAlertGenerated() {
        when(billingCycleRepository.findFirstByActiveTrueOrderByPeriodStartDesc()).thenReturn(Optional.of(cycle));
        when(residentProfileRepository.findAll()).thenReturn(List.of(resident));
        when(alertConfigurationRepository.findByCommunityId(10L)).thenReturn(Optional.of(config));
        when(waterMeterRepository.findByResidentProfileId(100L)).thenReturn(Optional.of(meter));

        // No water usages recorded
        when(waterUsageRepository.findByWaterMeterIdAndReadingDateBetween(eq(500L), any(), any())).thenReturn(Collections.emptyList());
        when(alertRepository.existsByResidentIdAndBillingCycleIdAndAlertTypeAndStatus(100L, 5L, AlertType.MISSING_METER_READING, AlertStatus.ACTIVE)).thenReturn(false);

        alertService.processScheduledAlerts();

        verify(alertRepository, times(1)).save(argThat(alert -> 
            alert.getAlertType() == AlertType.MISSING_METER_READING &&
            alert.getSeverity() == AlertSeverity.LOW
        ));
    }

    @Test
    void markAsRead_UpdatesStatusToRead() {
        Alert alert = Alert.builder().id(200L).alertNumber("ALT-123").alertType(AlertType.HIGH_WATER_USAGE).severity(AlertSeverity.MEDIUM).status(AlertStatus.ACTIVE).resident(resident).community(community).build();
        when(userRepository.findByEmail("resident@example.com")).thenReturn(Optional.of(user));
        when(alertRepository.findById(200L)).thenReturn(Optional.of(alert));
        when(residentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(resident));
        when(alertRepository.save(any(Alert.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = alertService.markAsRead("resident@example.com", 200L);

        assertEquals("READ", response.getStatus());
        verify(alertRepository, times(1)).save(alert);
    }

    @Test
    void deleteAlert_RemovesAlertFromDb() {
        Alert alert = Alert.builder().id(200L).alertNumber("ALT-123").alertType(AlertType.HIGH_WATER_USAGE).severity(AlertSeverity.MEDIUM).status(AlertStatus.ACTIVE).resident(resident).community(community).build();
        when(userRepository.findByEmail("resident@example.com")).thenReturn(Optional.of(user));
        when(alertRepository.findById(200L)).thenReturn(Optional.of(alert));
        when(residentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(resident));

        alertService.deleteAlert("resident@example.com", 200L);

        verify(alertRepository, times(1)).delete(alert);
    }
}
