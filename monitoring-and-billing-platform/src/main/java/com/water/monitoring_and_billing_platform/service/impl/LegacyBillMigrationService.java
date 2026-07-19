package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.entity.Bill;
import com.water.monitoring_and_billing_platform.entity.Invoice;
import com.water.monitoring_and_billing_platform.repository.BillRepository;
import com.water.monitoring_and_billing_platform.repository.InvoiceRepository;
import com.water.monitoring_and_billing_platform.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class LegacyBillMigrationService {

    private final BillRepository billRepository;
    private final InvoiceRepository invoiceRepository;
    private final InvoiceService invoiceService;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void migrateLegacyBills() {
        log.info("Starting one-time migration for legacy bills...");
        List<Bill> bills = billRepository.findAll();
        int count = 0;
        for (Bill bill : bills) {
            String billNum = bill.getBillNumber();
            // Migrate if billNumber is null or starts with BILL-LEGACY or has no standard format
            if (billNum == null || billNum.startsWith("BILL-LEGACY") || billNum.trim().isEmpty()) {
                int year = bill.getBillingYear() != null ? bill.getBillingYear() : 
                        (bill.getBillingCycle() != null ? parseYear(bill.getBillingCycle().getName()) : bill.getBillDate().getYear());
                int month = bill.getBillingMonth() != null ? bill.getBillingMonth() : 
                        (bill.getBillingCycle() != null ? parseMonth(bill.getBillingCycle().getName()) : bill.getBillDate().getMonthValue());

                bill.setBillingYear(year);
                bill.setBillingMonth(month);

                String formattedBillNum = String.format("BILL-%d%02d-%06d", year, month, bill.getId());
                bill.setBillNumber(formattedBillNum);

                if (bill.getBillStatus() == null) {
                    bill.setBillStatus(bill.getStatus() != null ? bill.getStatus().name() : "UNPAID");
                }
                if (bill.getPaymentStatus() == null) {
                    bill.setPaymentStatus(bill.isPaid() ? "PAID" : "UNPAID");
                }
                if (bill.getGeneratedDate() == null) {
                    bill.setGeneratedDate(bill.getBillDate());
                }
                if (bill.getDueDate() == null) {
                    bill.setDueDate(bill.getBillDate().plusDays(15));
                }
                if (bill.getTotalAmount() == null) {
                    bill.setTotalAmount(bill.getAmount());
                }

                billRepository.save(bill);

                // Update or create corresponding invoice
                Invoice invoice = invoiceRepository.findByBillId(bill.getId()).orElse(null);
                if (invoice == null) {
                    invoiceService.generateInvoice(bill);
                } else {
                    String formattedInvoiceNum = String.format("INV-%d%02d-%06d", year, month, bill.getId());
                    invoice.setInvoiceNumber(formattedInvoiceNum);
                    invoice.setBill(bill);
                    invoice.setResidentName(bill.getResidentProfile().getUser().getFullName());
                    invoice.setUnitNumber(bill.getResidentProfile().getUnit().getUnitNumber());
                    invoice.setBlockName(bill.getResidentProfile().getBlock().getBlockName());
                    invoice.setCommunityName(bill.getResidentProfile().getCommunity().getCommunityName());
                    invoice.setBillingCycleName(bill.getBillingCycle().getName());
                    invoice.setPeriodStart(bill.getBillingCycle().getPeriodStart());
                    invoice.setPeriodEnd(bill.getBillingCycle().getPeriodEnd());
                    invoice.setPreviousReading(bill.getPreviousReading());
                    invoice.setCurrentReading(bill.getCurrentReading());
                    invoice.setUnitsConsumed(bill.getUnitsConsumed());
                    invoice.setFixedCharge(bill.getFixedCharge() != null ? bill.getFixedCharge() : BigDecimal.ZERO);
                    invoice.setVariableCharge(bill.getSubtotal() != null ? bill.getSubtotal() : bill.getAmount());
                    invoice.setSharedWaterCost(bill.getSharedWaterCost() != null ? bill.getSharedWaterCost() : BigDecimal.ZERO);
                    invoice.setDistributionStrategy(bill.getDistributionStrategy() != null ? bill.getDistributionStrategy() : "EQUAL");
                    invoice.setTotalAmount(bill.getTotalAmount() != null ? bill.getTotalAmount() : bill.getAmount());
                    invoice.setBillStatus(bill.getBillStatus());
                    invoice.setPaymentStatus(bill.getPaymentStatus());
                    invoice.setGeneratedDate(bill.getGeneratedDate());
                    invoice.setDueDate(bill.getDueDate());
                    invoiceRepository.save(invoice);
                }
                count++;
            }
        }
        log.info("Migration completed. Migrated {} bills.", count);
    }

    private int parseYear(String cycleName) {
        try {
            if (cycleName.contains("-")) {
                return Integer.parseInt(cycleName.split("-")[0]);
            }
            return Integer.parseInt(cycleName.substring(0, 4));
        } catch (Exception e) {
            return LocalDate.now().getYear();
        }
    }

    private int parseMonth(String cycleName) {
        try {
            if (cycleName.contains("-")) {
                return Integer.parseInt(cycleName.split("-")[1]);
            }
            return Integer.parseInt(cycleName.substring(4));
        } catch (Exception e) {
            return LocalDate.now().getMonthValue();
        }
    }
}
