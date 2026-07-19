package com.water.monitoring_and_billing_platform.service;

import com.water.monitoring_and_billing_platform.entity.*;
import com.water.monitoring_and_billing_platform.enums.BillStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class BillGenerationService {

    private final BillCalculationService billCalculationService;
    private final BillNumberGenerator billNumberGenerator;

    public Bill prepareBill(
            ResidentProfile resident,
            WaterMeter meter,
            BillingCycle cycle,
            TariffPlan plan,
            double previousReading,
            double currentReading,
            BigDecimal additionalCharge,
            BigDecimal taxRate,
            String remarks
    ) {
        if (resident == null) {
            throw new IllegalArgumentException("Resident profile cannot be null");
        }
        if (cycle == null) {
            throw new IllegalArgumentException("Billing cycle cannot be null");
        }
        if (plan == null) {
            throw new IllegalArgumentException("Tariff plan cannot be null");
        }

        double unitsConsumed = billCalculationService.calculateUnitsConsumed(currentReading, previousReading);
        BigDecimal billAmount = billCalculationService.calculateBillAmount(unitsConsumed, plan.getRatePerUnit());
        
        BigDecimal fixed = plan.getFixedCharge() != null ? plan.getFixedCharge() : BigDecimal.ZERO;
        BigDecimal additional = additionalCharge != null ? additionalCharge : BigDecimal.ZERO;
        
        BigDecimal subtotal = billCalculationService.calculateSubtotal(billAmount, fixed, additional);
        BigDecimal tax = billCalculationService.calculateTax(subtotal, taxRate);
        BigDecimal totalAmount = billCalculationService.calculateTotalAmount(subtotal, tax);

        LocalDate today = LocalDate.now();
        String billNum = billNumberGenerator.generateBillNumber(resident.getCommunity(), today);

        int month = cycle.getPeriodStart().getMonthValue();
        int year = cycle.getPeriodStart().getYear();

        return Bill.builder()
                .billNumber(billNum)
                .residentProfile(resident)
                .waterMeter(meter)
                .billingCycle(cycle)
                .tariffPlan(plan)
                .billingMonth(month)
                .billingYear(year)
                .previousReading(previousReading)
                .currentReading(currentReading)
                .unitsConsumed(unitsConsumed)
                .ratePerUnit(plan.getRatePerUnit())
                .fixedCharge(fixed)
                .additionalCharge(additional)
                .subtotal(subtotal)
                .tax(tax)
                .amount(totalAmount)
                .totalAmount(totalAmount)
                .billDate(today)
                .generatedDate(today)
                .dueDate(today.plusDays(15))
                .status(BillStatus.UNPAID)
                .billStatus("UNPAID")
                .paymentStatus("UNPAID")
                .paid(false)
                .remarks(remarks)
                .build();
    }
}
