package com.water.monitoring_and_billing_platform.service;

import com.water.monitoring_and_billing_platform.entity.TariffPlan;
import com.water.monitoring_and_billing_platform.entity.TariffSlab;
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

    public BigDecimal calculateBillAmount(double unitsConsumed, TariffPlan plan) {
        if (plan == null) {
            return BigDecimal.ZERO;
        }
        if (plan.getSlabs() == null || plan.getSlabs().isEmpty()) {
            throw new IllegalStateException("Tariff plan has no slabs configured.");
        }

        java.util.List<TariffSlab> sortedSlabs = plan.getSlabs().stream()
                .sorted(java.util.Comparator.comparing(TariffSlab::getMinUnits))
                .toList();

        BigDecimal totalAmount = BigDecimal.ZERO;
        double start = 0.0;

        for (int i = 0; i < sortedSlabs.size(); i++) {
            TariffSlab slab = sortedSlabs.get(i);
            BigDecimal rate = slab.getRatePerUnit() != null ? slab.getRatePerUnit() : BigDecimal.ZERO;

            if (i > 0) {
                start = sortedSlabs.get(i - 1).getMaxUnits();
            } else {
                start = 0.0;
            }

            if (unitsConsumed <= start) {
                continue;
            }

            Double max = slab.getMaxUnits();
            double unitsInSlab;
            if (max == null) {
                unitsInSlab = unitsConsumed - start;
            } else {
                unitsInSlab = Math.min(unitsConsumed, max) - start;
            }

            totalAmount = totalAmount.add(rate.multiply(BigDecimal.valueOf(unitsInSlab)));
        }

        return totalAmount.setScale(2, RoundingMode.HALF_UP);
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

    public String calculateSlabBreakdownJson(double unitsConsumed, TariffPlan plan) {
        if (plan == null || plan.getSlabs() == null || plan.getSlabs().isEmpty()) {
            return "[]";
        }

        java.util.List<TariffSlab> sortedSlabs = plan.getSlabs().stream()
                .sorted(java.util.Comparator.comparing(TariffSlab::getMinUnits))
                .toList();

        StringBuilder sb = new StringBuilder();
        sb.append("[");
        double start = 0.0;
        boolean first = true;

        for (int i = 0; i < sortedSlabs.size(); i++) {
            TariffSlab slab = sortedSlabs.get(i);
            BigDecimal rate = slab.getRatePerUnit() != null ? slab.getRatePerUnit() : BigDecimal.ZERO;

            if (i > 0) {
                start = sortedSlabs.get(i - 1).getMaxUnits();
            } else {
                start = 0.0;
            }

            if (unitsConsumed <= start) {
                continue;
            }

            Double max = slab.getMaxUnits();
            double unitsInSlab;
            if (max == null) {
                unitsInSlab = unitsConsumed - start;
            } else {
                unitsInSlab = Math.min(unitsConsumed, max) - start;
            }

            if (unitsInSlab <= 0) {
                continue;
            }

            if (!first) {
                sb.append(",");
            }
            first = false;

            String rangeLabel;
            int minVal = (int) slab.getMinUnits().doubleValue();
            if (max == null) {
                rangeLabel = "Above " + (int)start + " kL";
            } else {
                rangeLabel = minVal + "–" + max.intValue() + " kL";
            }

            BigDecimal cost = rate.multiply(BigDecimal.valueOf(unitsInSlab)).setScale(2, java.math.RoundingMode.HALF_UP);

            sb.append("{")
              .append("\"range\":\"").append(rangeLabel).append("\",")
              .append("\"units\":").append(BigDecimal.valueOf(unitsInSlab).setScale(2, java.math.RoundingMode.HALF_UP)).append(",")
              .append("\"rate\":").append(rate).append(",")
              .append("\"amount\":").append(cost)
              .append("}");
        }
        sb.append("]");
        return sb.toString();
    }
}
