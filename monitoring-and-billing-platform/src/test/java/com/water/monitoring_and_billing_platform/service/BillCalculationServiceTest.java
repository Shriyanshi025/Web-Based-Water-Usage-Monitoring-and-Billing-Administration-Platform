package com.water.monitoring_and_billing_platform.service;

import com.water.monitoring_and_billing_platform.entity.TariffPlan;
import com.water.monitoring_and_billing_platform.entity.TariffSlab;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.util.Arrays;
import static org.junit.jupiter.api.Assertions.*;

public class BillCalculationServiceTest {

    private BillCalculationService service;
    private TariffPlan plan;

    @BeforeEach
    void setUp() {
        service = new BillCalculationService();
        plan = TariffPlan.builder()
                .id(1L)
                .name("Tiered Plan")
                .fixedCharge(new BigDecimal("100.00"))
                .build();

        TariffSlab slab1 = TariffSlab.builder().minUnits(0.0).maxUnits(10.0).ratePerUnit(new BigDecimal("15.00")).tariffPlan(plan).build();
        TariffSlab slab2 = TariffSlab.builder().minUnits(10.0).maxUnits(20.0).ratePerUnit(new BigDecimal("22.00")).tariffPlan(plan).build();
        TariffSlab slab3 = TariffSlab.builder().minUnits(20.0).maxUnits(30.0).ratePerUnit(new BigDecimal("30.00")).tariffPlan(plan).build();
        TariffSlab slab4 = TariffSlab.builder().minUnits(30.0).maxUnits(null).ratePerUnit(new BigDecimal("40.00")).tariffPlan(plan).build();

        plan.setSlabs(Arrays.asList(slab1, slab2, slab3, slab4));
    }

    @Test
    void testProgressiveCalculationSlabs() {
        // Slab 1: 5 units @ 15 = 75.00
        BigDecimal amount1 = service.calculateBillAmount(5.0, plan);
        assertEquals(new BigDecimal("75.00"), amount1);

        // Slab 2: 15 units = 10 @ 15 + 5 @ 22 = 150 + 110 = 260.00
        BigDecimal amount2 = service.calculateBillAmount(15.0, plan);
        assertEquals(new BigDecimal("260.00"), amount2);

        // Slab 3: 25 units = 10 @ 15 + 10 @ 22 + 5 @ 30 = 150 + 220 + 150 = 520.00
        BigDecimal amount3 = service.calculateBillAmount(25.0, plan);
        assertEquals(new BigDecimal("520.00"), amount3);

        // Slab 4: 35 units = 10 @ 15 + 10 @ 22 + 10 @ 30 + 5 @ 40 = 150 + 220 + 300 + 200 = 870.00
        BigDecimal amount4 = service.calculateBillAmount(35.0, plan);
        assertEquals(new BigDecimal("870.00"), amount4);
    }

    @Test
    void testEmptySlabsThrowsException() {
        plan.setSlabs(null);
        assertThrows(IllegalStateException.class, () -> service.calculateBillAmount(10.0, plan));
    }

    @Test
    void testIntegerContinuousCalculation() {
        TariffPlan intPlan = TariffPlan.builder()
                .id(2L)
                .name("Integer Tiered Plan")
                .fixedCharge(BigDecimal.ZERO)
                .build();
        TariffSlab s1 = TariffSlab.builder().minUnits(0.0).maxUnits(10.0).ratePerUnit(new BigDecimal("5.00")).tariffPlan(intPlan).build();
        TariffSlab s2 = TariffSlab.builder().minUnits(11.0).maxUnits(null).ratePerUnit(new BigDecimal("8.00")).tariffPlan(intPlan).build();
        intPlan.setSlabs(Arrays.asList(s1, s2));

        // 18 kL = 10 @ 5 + 8 @ 8 = 50 + 64 = 114.00
        BigDecimal amount = service.calculateBillAmount(18.0, intPlan);
        assertEquals(new BigDecimal("114.00"), amount);

        // 18.5 kL = 10 @ 5 + 8.5 @ 8 = 50 + 68 = 118.00
        BigDecimal amountDec = service.calculateBillAmount(18.5, intPlan);
        assertEquals(new BigDecimal("118.00"), amountDec);
    }
}
