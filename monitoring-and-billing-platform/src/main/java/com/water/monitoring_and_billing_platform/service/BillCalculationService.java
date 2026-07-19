package com.water.monitoring_and_billing_platform.service;

import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class BillCalculationService {

    public double calculateUnitsConsumed(double currentReading, double previousReading) {
        if (currentReading < previousReading) {
            throw new IllegalArgumentException("Current reading cannot be less than previous reading");
        }
        return BigDecimal.valueOf(currentReading)
                .subtract(BigDecimal.valueOf(previousReading))
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }

    public BigDecimal calculateBillAmount(double unitsConsumed, BigDecimal ratePerUnit) {
        if (ratePerUnit == null) {
            ratePerUnit = BigDecimal.ZERO;
        }
        return ratePerUnit.multiply(BigDecimal.valueOf(unitsConsumed))
                .setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal calculateSubtotal(BigDecimal billAmount, BigDecimal fixedCharge, BigDecimal additionalCharge) {
        BigDecimal subtotal = BigDecimal.ZERO;
        if (billAmount != null) subtotal = subtotal.add(billAmount);
        if (fixedCharge != null) subtotal = subtotal.add(fixedCharge);
        if (additionalCharge != null) subtotal = subtotal.add(additionalCharge);
        return subtotal.setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal calculateTax(BigDecimal subtotal, BigDecimal taxRate) {
        if (subtotal == null || taxRate == null) {
            return BigDecimal.ZERO;
        }
        return subtotal.multiply(taxRate)
                .setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal calculateTotalAmount(BigDecimal subtotal, BigDecimal tax) {
        BigDecimal total = BigDecimal.ZERO;
        if (subtotal != null) total = total.add(subtotal);
        if (tax != null) total = total.add(tax);
        return total.setScale(2, RoundingMode.HALF_UP);
    }
}
