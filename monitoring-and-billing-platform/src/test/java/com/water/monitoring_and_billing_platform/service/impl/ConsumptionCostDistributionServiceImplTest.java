package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.dto.ConsumptionCostDistributionResponse;
import com.water.monitoring_and_billing_platform.dto.HouseholdCostDistributionResponse;
import com.water.monitoring_and_billing_platform.entity.*;
import com.water.monitoring_and_billing_platform.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ConsumptionCostDistributionServiceImplTest {

    @Mock private BulkWaterPurchaseRepository bulkWaterPurchaseRepository;
    @Mock private BillingCycleRepository billingCycleRepository;
    @Mock private ResidentProfileRepository residentProfileRepository;
    @Mock private WaterMeterRepository waterMeterRepository;
    @Mock private WaterUsageRepository waterUsageRepository;
    @Mock private UserRepository userRepository;
    @Mock private CommunityAdminProfileRepository communityAdminProfileRepository;

    @InjectMocks
    private ConsumptionCostDistributionServiceImpl service;

    private User adminUser;
    private CommunityAdminProfile adminProfile;
    private Community community;
    private BillingCycle cycle;

    private ResidentProfile r1;
    private ResidentProfile r2;
    private ResidentProfile r3;

    private WaterMeter m1;
    private WaterMeter m2;

    @BeforeEach
    void setUp() {
        adminUser = User.builder().id(100L).email("admin@example.com").build();
        community = Community.builder().id(10L).communityName("Meadowlands").build();
        adminProfile = CommunityAdminProfile.builder().id(1L).user(adminUser).community(community).build();
        cycle = BillingCycle.builder()
                .id(5L)
                .name("Cycle 1")
                .periodStart(LocalDate.of(2026, 7, 1))
                .periodEnd(LocalDate.of(2026, 7, 31))
                .build();

        User u1 = User.builder().id(11L).fullName("Resident One").build();
        User u2 = User.builder().id(12L).fullName("Resident Two").build();
        User u3 = User.builder().id(13L).fullName("Resident Three").build();

        Unit un1 = Unit.builder().id(21L).unitNumber("A-101").build();
        Unit un2 = Unit.builder().id(22L).unitNumber("A-102").build();
        Unit un3 = Unit.builder().id(23L).unitNumber("A-103").build();

        r1 = ResidentProfile.builder().id(1L).user(u1).unit(un1).community(community).active(true).build();
        r2 = ResidentProfile.builder().id(2L).user(u2).unit(un2).community(community).active(true).build();
        r3 = ResidentProfile.builder().id(3L).user(u3).unit(un3).community(community).active(true).build();

        m1 = WaterMeter.builder().id(51L).meterNumber("MTR-01").residentProfile(r1).build();
        m2 = WaterMeter.builder().id(52L).meterNumber("MTR-02").residentProfile(r2).build();
    }

    @Test
    void calculateDistribution_SuccessAndReconciliation() {
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));
        when(communityAdminProfileRepository.findByUserId(100L)).thenReturn(Optional.of(adminProfile));
        when(billingCycleRepository.findById(5L)).thenReturn(Optional.of(cycle));

        BulkWaterPurchase p1 = BulkWaterPurchase.builder().id(201L).totalCost(new BigDecimal("10000.00")).build();
        BulkWaterPurchase p2 = BulkWaterPurchase.builder().id(202L).totalCost(new BigDecimal("5000.00")).build();
        when(bulkWaterPurchaseRepository.findByBillingCycleIdAndCommunityId(5L, 10L)).thenReturn(List.of(p1, p2));

        when(residentProfileRepository.findByCommunityIdAndActiveTrue(10L)).thenReturn(List.of(r1, r2, r3));
        when(waterMeterRepository.findByResidentProfileCommunityId(10L)).thenReturn(List.of(m1, m2));

        WaterUsage u1_1 = WaterUsage.builder().id(301L).waterMeter(m1).unitsConsumed(30.0).build();
        WaterUsage u2_1 = WaterUsage.builder().id(302L).waterMeter(m2).unitsConsumed(15.0).build();

        when(waterUsageRepository.findByWaterMeterResidentProfileCommunityIdAndReadingDateBetween(10L, cycle.getPeriodStart(), cycle.getPeriodEnd()))
                .thenReturn(List.of(u1_1, u2_1));

        ConsumptionCostDistributionResponse response = service.calculateDistribution("admin@example.com", 5L);

        assertNotNull(response);
        assertEquals(new BigDecimal("15000.00"), response.getTotalBulkCost());
        assertEquals(45.0, response.getTotalCommunityConsumption());
        
        // Cost per kL = 15000 / 45 = 333.3333
        // R1: 30 * 333.3333 = 10000.00
        // R2: 15 * 333.3333 = 5000.00
        // R3: Excluded (no reading)
        // Remainder = 0
        BigDecimal r1Cost = response.getDistributions().stream()
                .filter(d -> d.getResidentProfileId().equals(1L))
                .map(HouseholdCostDistributionResponse::getDistributedCost)
                .findFirst().orElse(BigDecimal.ZERO);

        BigDecimal r2Cost = response.getDistributions().stream()
                .filter(d -> d.getResidentProfileId().equals(2L))
                .map(HouseholdCostDistributionResponse::getDistributedCost)
                .findFirst().orElse(BigDecimal.ZERO);

        BigDecimal r3Cost = response.getDistributions().stream()
                .filter(d -> d.getResidentProfileId().equals(3L))
                .map(HouseholdCostDistributionResponse::getDistributedCost)
                .findFirst().orElse(BigDecimal.ZERO);

        assertEquals(new BigDecimal("10000.00"), r1Cost);
        assertEquals(new BigDecimal("5000.00"), r2Cost);
        assertEquals(BigDecimal.ZERO, r3Cost);

        // Verify total reconciliation
        BigDecimal sum = r1Cost.add(r2Cost).add(r3Cost);
        assertEquals(response.getTotalBulkCost(), sum);

        // Verify No N+1 queries (methods not queried repeatedly)
        verify(residentProfileRepository, times(1)).findByCommunityIdAndActiveTrue(anyLong());
        verify(waterMeterRepository, times(1)).findByResidentProfileCommunityId(anyLong());
        verify(waterUsageRepository, times(1)).findByWaterMeterResidentProfileCommunityIdAndReadingDateBetween(anyLong(), any(), any());
    }

    @Test
    void calculateDistribution_RoundingAdjustmentReconcilesToHighestConsumer() {
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));
        when(communityAdminProfileRepository.findByUserId(100L)).thenReturn(Optional.of(adminProfile));
        when(billingCycleRepository.findById(5L)).thenReturn(Optional.of(cycle));

        // Bulk cost = ₹100.00
        BulkWaterPurchase p = BulkWaterPurchase.builder().id(201L).totalCost(new BigDecimal("100.00")).build();
        when(bulkWaterPurchaseRepository.findByBillingCycleIdAndCommunityId(5L, 10L)).thenReturn(List.of(p));

        when(residentProfileRepository.findByCommunityIdAndActiveTrue(10L)).thenReturn(List.of(r1, r2));
        when(waterMeterRepository.findByResidentProfileCommunityId(10L)).thenReturn(List.of(m1, m2));

        // Consumptions: R1 = 30.0, R2 = 60.0 (Total = 90.0)
        // Cost per kL = 100.00 / 90.0 = 1.1111
        // R1 initial share = 30 * 1.1111 = 33.33
        // R2 initial share = 60 * 1.1111 = 66.67
        // Sum of shares = 33.33 + 66.67 = 100.00 (No remainder here)
        // Let's modify units: R1 = 30.0, R2 = 30.0, R3 (new metered resident, R3 has a meter)
        // Let's make: R1 = 10.0, R2 = 20.0 (Total = 30.0)
        // Cost per kL = 100.00 / 30.0 = 3.3333
        // R1 share = 10 * 3.3333 = 33.33
        // R2 share = 20 * 3.3333 = 66.67
        // Sum = 100.00

        // Let's use numbers that produce a remainder:
        // Total Bulk Cost = ₹100.00
        // Consumption: R1 = 30.0, R2 = 70.0 (Total = 100.0) -> Let's use bulk cost = ₹100.01
        // R1 = 30.0, R2 = 60.0 (Total = 90.0), Bulk Cost = ₹100.01
        // Cost per kL = 100.01 / 90.0 = 1.1112
        // R1 initial = 30 * 1.1112 = 33.34
        // R2 initial = 60 * 1.1112 = 66.67
        // Sum = 33.34 + 66.67 = 100.01 (Sum matches bulk cost, no remainder)

        // Let's use: Bulk Cost = ₹100.00, R1 = 3.0, R2 = 6.0 (Total = 9.0)
        // Cost per kL = 100.00 / 9.0 = 11.1111
        // R1 initial = 3 * 11.1111 = 33.33
        // R2 initial = 6 * 11.1111 = 66.67
        // Sum = 33.33 + 66.67 = 100.00 (No remainder)

        // Let's use: Bulk Cost = ₹10.00, R1 = 3.0, R2 = 6.0 (Total = 9.0)
        // Cost per kL = 10.00 / 9.0 = 1.1111
        // R1 initial = 3 * 1.1111 = 3.33
        // R2 initial = 6 * 1.1111 = 6.67
        // Sum = 3.33 + 6.67 = 10.00 (No remainder)

        // Let's try: Bulk Cost = ₹10.00, R1 = 3.0, R2 = 3.0, R3 (not present) -> Total = 6.0
        // Cost per kL = 10.00 / 6.0 = 1.6667
        // R1 initial = 3 * 1.6667 = 5.00
        // R2 initial = 3 * 1.6667 = 5.00
        // Sum = 10.00 (No remainder)

        // Let's use: Bulk Cost = ₹1.00, R1 = 3.0, R2 = 3.0 (Total = 6.0)
        // Cost per kL = 1.00 / 6.0 = 0.1667
        // R1 initial = 3 * 0.1667 = 0.50
        // R2 initial = 3 * 0.1667 = 0.50
        // Sum = 1.00

        // Let's use: Bulk Cost = ₹1.00, R1 = 3.0, R2 = 7.0 (Total = 10.0)
        // Cost per kL = 1.00 / 10.0 = 0.1000
        // R1 initial = 3 * 0.10 = 0.30
        // R2 initial = 7 * 0.10 = 0.70
        // Sum = 1.00

        // Let's try: Bulk Cost = ₹10.00, R1 = 3.0, R2 = 5.0 (Total = 8.0)
        // Cost per kL = 10.00 / 8.0 = 1.2500
        // R1 initial = 3 * 1.25 = 3.75
        // R2 initial = 5 * 1.25 = 6.25
        // Sum = 10.00

        // Let's try: Bulk Cost = ₹10.00, R1 = 3.0, R2 = 4.0 (Total = 7.0)
        // Cost per kL = 10.00 / 7.0 = 1.4286
        // R1 initial = 3 * 1.4286 = 4.29
        // R2 initial = 4 * 1.4286 = 5.71
        // Sum = 4.29 + 5.71 = 10.00 (No remainder)

        // Let's try: Bulk Cost = ₹10.00, R1 = 3.0, R2 = 4.0, R3 (if R3 has a meter)
        // R1 = 3.0, R2 = 4.0, let's say R1 = 1.0, R2 = 2.0, R3 (not present) -> Total = 3.0
        // Let's use: Bulk Cost = ₹100.00, R1 = 100.0, R2 = 200.0, R3 (not present) -> Total = 300.0
        // Cost per kL = 100.00 / 300.0 = 0.3333
        // R1 initial = 100 * 0.3333 = 33.33
        // R2 initial = 200 * 0.3333 = 66.66
        // Sum = 99.99 (Remainder = ₹0.01!)
        // The highest consumer is R2 (200.0 consumption).
        // R2 should get the remainder: 66.66 + 0.01 = 66.67.

        WaterUsage u1_2 = WaterUsage.builder().id(301L).waterMeter(m1).unitsConsumed(100.0).build();
        WaterUsage u2_2 = WaterUsage.builder().id(302L).waterMeter(m2).unitsConsumed(200.0).build();
        when(waterUsageRepository.findByWaterMeterResidentProfileCommunityIdAndReadingDateBetween(10L, cycle.getPeriodStart(), cycle.getPeriodEnd()))
                .thenReturn(List.of(u1_2, u2_2));

        BulkWaterPurchase p3 = BulkWaterPurchase.builder().id(203L).totalCost(new BigDecimal("100.00")).build();
        when(bulkWaterPurchaseRepository.findByBillingCycleIdAndCommunityId(5L, 10L)).thenReturn(List.of(p3));

        ConsumptionCostDistributionResponse response = service.calculateDistribution("admin@example.com", 5L);

        assertNotNull(response);
        assertEquals(new BigDecimal("100.00"), response.getTotalBulkCost());

        BigDecimal r1Cost = response.getDistributions().stream()
                .filter(d -> d.getResidentProfileId().equals(1L))
                .map(HouseholdCostDistributionResponse::getDistributedCost)
                .findFirst().orElse(BigDecimal.ZERO);

        BigDecimal r2Cost = response.getDistributions().stream()
                .filter(d -> d.getResidentProfileId().equals(2L))
                .map(HouseholdCostDistributionResponse::getDistributedCost)
                .findFirst().orElse(BigDecimal.ZERO);

        assertEquals(new BigDecimal("33.33"), r1Cost);
        assertEquals(new BigDecimal("66.67"), r2Cost); // Reconciled!

        assertEquals(new BigDecimal("100.00"), r1Cost.add(r2Cost));
    }
}
