package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.entity.*;
import com.water.monitoring_and_billing_platform.enums.BillStatus;
import com.water.monitoring_and_billing_platform.repository.*;
import com.water.monitoring_and_billing_platform.service.BillGenerationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BillServiceImplTest {

    @Mock
    private BillRepository billRepository;
    @Mock
    private ResidentProfileRepository residentProfileRepository;
    @Mock
    private WaterUsageRepository waterUsageRepository;
    @Mock
    private BillingCycleRepository billingCycleRepository;
    @Mock
    private TariffPlanRepository tariffPlanRepository;
    @Mock
    private WaterMeterRepository waterMeterRepository;
    @Mock
    private BillGenerationService billGenerationService;
    @Mock
    private BulkWaterPurchaseRepository bulkWaterPurchaseRepository;
    @Mock
    private com.water.monitoring_and_billing_platform.service.InvoiceService invoiceService;
    @Mock
    private com.water.monitoring_and_billing_platform.service.AlertService alertService;

    @InjectMocks
    private BillServiceImpl billService;

    private ResidentProfile resident;
    private BillingCycle cycle;
    private TariffPlan plan;
    private WaterMeter meter;
    private Community community;

    @BeforeEach
    void setUp() {
        community = Community.builder().id(1L).communityCode("GVR").build();
        resident = ResidentProfile.builder().id(1L).community(community).active(true).build();
        cycle = BillingCycle.builder().id(1L).periodStart(LocalDate.of(2026, 7, 1)).periodEnd(LocalDate.of(2026, 7, 31)).active(true).build();
        plan = TariffPlan.builder().id(1L).ratePerUnit(new BigDecimal("15.00")).fixedCharge(new BigDecimal("100.00")).active(true).build();
        meter = WaterMeter.builder().id(1L).currentReading(100.0).initialReading(10.0).build();
        lenient().when(bulkWaterPurchaseRepository.findByBillingCycleIdAndCommunityId(anyLong(), anyLong()))
                .thenReturn(java.util.List.of());
    }

    @Test
    void testFirstBillGeneration_PreviousReadingIsZero() {
        when(residentProfileRepository.findById(1L)).thenReturn(Optional.of(resident));
        when(billingCycleRepository.findFirstByActiveTrueOrderByPeriodStartDesc()).thenReturn(Optional.of(cycle));
        when(tariffPlanRepository.findByActiveTrue()).thenReturn(java.util.List.of(plan));
        when(waterMeterRepository.findByResidentProfileId(1L)).thenReturn(Optional.of(meter));

        // No duplicate exists
        when(billRepository.existsByResidentProfileIdAndBillingCycleId(1L, 1L)).thenReturn(false);

        // Water Usage exists
        WaterUsage usage = WaterUsage.builder()
                .id(1L)
                .previousReading(0.0)
                .currentReading(50.0)
                .readingDate(LocalDate.of(2026, 7, 10))
                .build();
        when(waterUsageRepository.findByWaterMeterIdAndReadingDateBetween(eq(1L), any(), any()))
                .thenReturn(java.util.List.of(usage));

        Bill preparedBill = Bill.builder()
                .billNumber("BILL-202607-GVR-000001")
                .previousReading(0.0)
                .currentReading(50.0)
                .unitsConsumed(50.0)
                .build();

        when(billGenerationService.prepareBill(
                eq(resident), eq(meter), eq(cycle), eq(plan), eq(0.0), eq(50.0), any(), any(), anyString()
        )).thenReturn(preparedBill);

        when(billRepository.save(any(Bill.class))).thenReturn(preparedBill);

        Bill result = billService.generateBillForResident(1L);

        assertNotNull(result);
        assertEquals(0.0, result.getPreviousReading());
        assertEquals(50.0, result.getCurrentReading());
        verify(billRepository).save(any(Bill.class));
    }

    @Test
    void testSecondBillGeneration_PreviousReadingIsLastRecorded() {
        when(residentProfileRepository.findById(1L)).thenReturn(Optional.of(resident));
        when(billingCycleRepository.findFirstByActiveTrueOrderByPeriodStartDesc()).thenReturn(Optional.of(cycle));
        when(tariffPlanRepository.findByActiveTrue()).thenReturn(java.util.List.of(plan));
        when(waterMeterRepository.findByResidentProfileId(1L)).thenReturn(Optional.of(meter));

        when(billRepository.existsByResidentProfileIdAndBillingCycleId(1L, 1L)).thenReturn(false);

        // Water Usage exists
        WaterUsage usage = WaterUsage.builder()
                .id(1L)
                .previousReading(50.0)
                .currentReading(120.0)
                .readingDate(LocalDate.of(2026, 7, 15))
                .build();
        when(waterUsageRepository.findByWaterMeterIdAndReadingDateBetween(eq(1L), any(), any()))
                .thenReturn(java.util.List.of(usage));

        Bill preparedBill = Bill.builder()
                .billNumber("BILL-202607-GVR-000002")
                .previousReading(50.0)
                .currentReading(120.0)
                .unitsConsumed(70.0)
                .build();

        when(billGenerationService.prepareBill(
                eq(resident), eq(meter), eq(cycle), eq(plan), eq(50.0), eq(120.0), any(), any(), anyString()
        )).thenReturn(preparedBill);

        when(billRepository.save(any(Bill.class))).thenReturn(preparedBill);

        Bill result = billService.generateBillForResident(1L);

        assertNotNull(result);
        assertEquals(50.0, result.getPreviousReading());
        assertEquals(120.0, result.getCurrentReading());
        assertEquals(70.0, result.getUnitsConsumed());
    }

    @Test
    void testDuplicatePreventionThrowsException() {
        when(residentProfileRepository.findById(1L)).thenReturn(Optional.of(resident));
        when(billingCycleRepository.findFirstByActiveTrueOrderByPeriodStartDesc()).thenReturn(Optional.of(cycle));

        // Duplicate exists
        when(billRepository.existsByResidentProfileIdAndBillingCycleId(1L, 1L)).thenReturn(true);

        assertThrows(IllegalStateException.class, () -> billService.generateBillForResident(1L));
    }

    @Test
    void testValidation_CurrentReadingLessThanPreviousReadingThrowsException() {
        when(residentProfileRepository.findById(1L)).thenReturn(Optional.of(resident));
        when(billingCycleRepository.findFirstByActiveTrueOrderByPeriodStartDesc()).thenReturn(Optional.of(cycle));
        when(tariffPlanRepository.findByActiveTrue()).thenReturn(java.util.List.of(plan));
        when(waterMeterRepository.findByResidentProfileId(1L)).thenReturn(Optional.of(meter));

        when(billRepository.existsByResidentProfileIdAndBillingCycleId(1L, 1L)).thenReturn(false);

        // Water Usage exists where current is less than previous
        WaterUsage usage = WaterUsage.builder()
                .id(1L)
                .previousReading(50.0)
                .currentReading(40.0)
                .readingDate(LocalDate.of(2026, 7, 15))
                .build();
        when(waterUsageRepository.findByWaterMeterIdAndReadingDateBetween(eq(1L), any(), any()))
                .thenReturn(java.util.List.of(usage));

        assertThrows(IllegalArgumentException.class, () -> billService.generateBillForResident(1L));
    }
}
