package com.water.monitoring_and_billing_platform.service.impl;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.*;
import com.water.monitoring_and_billing_platform.dto.InvoiceResponse;
import com.water.monitoring_and_billing_platform.entity.*;
import com.lowagie.text.pdf.PdfWriter;
import com.water.monitoring_and_billing_platform.enums.Role;
import com.water.monitoring_and_billing_platform.repository.*;
import com.water.monitoring_and_billing_platform.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Objects;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final UserRepository userRepository;
    private final CommunityAdminProfileRepository communityAdminProfileRepository;
    private final ResidentProfileRepository residentProfileRepository;

    private User getUserOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
    }

    private Long getCommunityIdForAdmin(User adminUser) {
        return communityAdminProfileRepository.findByUserId(adminUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("Admin profile not found"))
                .getCommunity().getId();
    }

    private Long getResidentProfileIdForUser(User user) {
        return residentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Resident profile not found"))
                .getId();
    }

    @Override
    @Transactional
    public InvoiceResponse generateInvoice(Bill bill) {
        if (bill == null) {
            throw new IllegalArgumentException("Bill cannot be null");
        }

        ResidentProfile resident = bill.getResidentProfile();
        String blockName = (resident.getBlock() != null) ? resident.getBlock().getBlockName() : "N/A";
        String communityName = (resident.getCommunity() != null) ? resident.getCommunity().getCommunityName() : "N/A";
        String cycleName = (bill.getBillingCycle() != null) ? bill.getBillingCycle().getName() : "N/A";
        LocalDate periodStart = (bill.getBillingCycle() != null) ? bill.getBillingCycle().getPeriodStart() : null;
        LocalDate periodEnd = (bill.getBillingCycle() != null) ? bill.getBillingCycle().getPeriodEnd() : null;

        // Dynamic Invoice Number Generation
        String suffix = (bill.getBillNumber() != null && bill.getBillNumber().contains("-")) ?
                bill.getBillNumber().substring(bill.getBillNumber().lastIndexOf("-") + 1) : 
                String.format("%06d", bill.getId() != null ? bill.getId() : new Random().nextInt(1000000));
        String invoiceNumber = "INV-" + bill.getBillingYear() + 
                String.format("%02d", bill.getBillingMonth()) + "-" + suffix;

        Invoice invoice = Invoice.builder()
                .invoiceNumber(invoiceNumber)
                .bill(bill)
                .residentName(resident.getUser().getFullName())
                .unitNumber(resident.getUnit().getUnitNumber())
                .blockName(blockName)
                .communityName(communityName)
                .billingCycleName(cycleName)
                .periodStart(periodStart)
                .periodEnd(periodEnd)
                .previousReading(bill.getPreviousReading())
                .currentReading(bill.getCurrentReading())
                .unitsConsumed(bill.getUnitsConsumed())
                .fixedCharge(bill.getFixedCharge())
                .variableCharge(bill.getSubtotal() != null ? bill.getSubtotal() : BigDecimal.ZERO) // Variable portion is represented by subtotal in billing engine
                .sharedWaterCost(bill.getSharedWaterCost() != null ? bill.getSharedWaterCost() : BigDecimal.ZERO)
                .distributionStrategy(bill.getDistributionStrategy() != null ? bill.getDistributionStrategy() : "EQUAL")
                .totalAmount(bill.getTotalAmount() != null ? bill.getTotalAmount() : BigDecimal.ZERO)
                .billStatus(bill.getBillStatus() != null ? bill.getBillStatus() : "UNPAID")
                .paymentStatus(bill.getPaymentStatus() != null ? bill.getPaymentStatus() : "UNPAID")
                .generatedDate(bill.getGeneratedDate() != null ? bill.getGeneratedDate() : LocalDate.now())
                .dueDate(bill.getDueDate() != null ? bill.getDueDate() : LocalDate.now().plusDays(15))
                .build();

        Invoice saved = invoiceRepository.save(invoice);
        return mapToResponse(saved);
    }

    @Override
    public Page<InvoiceResponse> listInvoices(String email, Pageable pageable) {
        User user = getUserOrThrow(email);
        if (user.getRole() == Role.COMMUNITY_ADMIN) {
            Long communityId = getCommunityIdForAdmin(user);
            return invoiceRepository.findByBillResidentProfileCommunityId(communityId, pageable)
                    .map(this::mapToResponse);
        } else if (user.getRole() == Role.USER) {
            Long residentProfileId = getResidentProfileIdForUser(user);
            return invoiceRepository.findByBillResidentProfileId(residentProfileId, pageable)
                    .map(this::mapToResponse);
        } else {
            return Page.empty();
        }
    }

    @Override
    public InvoiceResponse getInvoiceById(String email, Long id) {
        User user = getUserOrThrow(email);
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found with id: " + id));

        validateAccess(user, invoice);
        return mapToResponse(invoice);
    }

    @Override
    public InvoiceResponse getInvoiceByInvoiceNumber(String email, String invoiceNumber) {
        User user = getUserOrThrow(email);
        Invoice invoice = invoiceRepository.findByInvoiceNumber(invoiceNumber)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found with invoice number: " + invoiceNumber));

        validateAccess(user, invoice);
        return mapToResponse(invoice);
    }

    private void validateAccess(User user, Invoice invoice) {
        if (user.getRole() == Role.COMMUNITY_ADMIN) {
            Long adminCommunityId = getCommunityIdForAdmin(user);
            Long invoiceCommunityId = invoice.getBill().getResidentProfile().getCommunity().getId();
            if (!Objects.equals(adminCommunityId, invoiceCommunityId)) {
                throw new SecurityException("Unauthorized access to this community's invoices.");
            }
        } else if (user.getRole() == Role.USER) {
            Long residentProfileId = getResidentProfileIdForUser(user);
            Long invoiceResidentProfileId = invoice.getBill().getResidentProfile().getId();
            if (!Objects.equals(residentProfileId, invoiceResidentProfileId)) {
                throw new SecurityException("Unauthorized access to this invoice.");
            }
        } else {
            throw new SecurityException("Unauthorized role.");
        }
    }

    @Override
    public byte[] generateInvoicePdf(String email, Long id) {
        User user = getUserOrThrow(email);
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found with id: " + id));

        validateAccess(user, invoice);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 54, 36);
        PdfWriter.getInstance(document, out);

        document.open();

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, java.awt.Color.DARK_GRAY);
        Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, java.awt.Color.GRAY);
        Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 9);
        Font boldBodyFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9);
        Font footerFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8, java.awt.Color.GRAY);

        // Header Branding
        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[]{60, 40});
        
        PdfPCell logoCell = new PdfPCell();
        logoCell.setBorder(Rectangle.NO_BORDER);
        logoCell.addElement(new Paragraph("HydroSync Utility Solutions", titleFont));
        logoCell.addElement(new Paragraph("Automated Water Metering & Statement", footerFont));
        headerTable.addCell(logoCell);
        
        PdfPCell docTitleCell = new PdfPCell();
        docTitleCell.setBorder(Rectangle.NO_BORDER);
        docTitleCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        Paragraph invTitle = new Paragraph("INVOICE STATEMENT", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, new java.awt.Color(25, 118, 210)));
        invTitle.setAlignment(Element.ALIGN_RIGHT);
        docTitleCell.addElement(invTitle);
        headerTable.addCell(docTitleCell);
        
        document.add(headerTable);
        document.add(new Paragraph(" "));
        document.add(new Paragraph("----------------------------------------------------------------------------------------------------------------------------------"));
        document.add(new Paragraph(" "));

        // Meta Info Table
        PdfPTable metaTable = new PdfPTable(4);
        metaTable.setWidthPercentage(100);
        metaTable.setWidths(new float[]{25, 25, 25, 25});
        
        metaTable.addCell(createStyledCell("Invoice Number", boldBodyFont, true));
        metaTable.addCell(createStyledCell(invoice.getInvoiceNumber(), bodyFont, false));
        metaTable.addCell(createStyledCell("Bill Number", boldBodyFont, true));
        metaTable.addCell(createStyledCell(invoice.getBill() != null ? invoice.getBill().getBillNumber() : "N/A", bodyFont, false));
        
        java.time.format.DateTimeFormatter dtf = java.time.format.DateTimeFormatter.ofPattern("dd MMM yyyy", java.util.Locale.ENGLISH);
        String genDateStr = invoice.getGeneratedDate() != null ? invoice.getGeneratedDate().format(dtf) : "N/A";
        String dueDateStr = invoice.getDueDate() != null ? invoice.getDueDate().format(dtf) : "N/A";

        metaTable.addCell(createStyledCell("Generated Date", boldBodyFont, true));
        metaTable.addCell(createStyledCell(genDateStr, bodyFont, false));
        metaTable.addCell(createStyledCell("Due Date", boldBodyFont, true));
        metaTable.addCell(createStyledCell(dueDateStr, bodyFont, false));
        
        String monthName = "N/A";
        int billingMonth = invoice.getBill() != null ? invoice.getBill().getBillingMonth() : (invoice.getPeriodStart() != null ? invoice.getPeriodStart().getMonthValue() : 0);
        int billingYear = invoice.getBill() != null ? invoice.getBill().getBillingYear() : (invoice.getPeriodStart() != null ? invoice.getPeriodStart().getYear() : 0);
        if (billingMonth > 0 && billingMonth <= 12) {
            monthName = java.time.Month.of(billingMonth).getDisplayName(java.time.format.TextStyle.FULL, java.util.Locale.ENGLISH) + " " + billingYear;
        }

        metaTable.addCell(createStyledCell("Billing Month", boldBodyFont, true));
        metaTable.addCell(createStyledCell(monthName, bodyFont, false));
        metaTable.addCell(createStyledCell("Billing Period", boldBodyFont, true));
        String billingPeriod = "N/A";
        if (invoice.getPeriodStart() != null && invoice.getPeriodEnd() != null) {
            billingPeriod = invoice.getPeriodStart().format(dtf) + " to " + invoice.getPeriodEnd().format(dtf);
        }
        metaTable.addCell(createStyledCell(billingPeriod, bodyFont, false));
        
        metaTable.addCell(createStyledCell("Payment Status", boldBodyFont, true));
        metaTable.addCell(createStyledCell(invoice.getPaymentStatus(), boldBodyFont, false));
        metaTable.addCell(createStyledCell("Bill Status", boldBodyFont, true));
        metaTable.addCell(createStyledCell(invoice.getBillStatus(), bodyFont, false));

        document.add(metaTable);
        document.add(new Paragraph(" "));

        // Household & Community details
        Paragraph detailsHeader = new Paragraph("HOUSEHOLD & WATER METER DETAILS", subTitleFont);
        document.add(detailsHeader);
        document.add(new Paragraph(" "));

        PdfPTable houseTable = new PdfPTable(4);
        houseTable.setWidthPercentage(100);
        houseTable.setWidths(new float[]{25, 25, 25, 25});
        
        houseTable.addCell(createStyledCell("Resident Name", boldBodyFont, true));
        houseTable.addCell(createStyledCell(invoice.getResidentName(), bodyFont, false));
        houseTable.addCell(createStyledCell("Resident ID", boldBodyFont, true));
        houseTable.addCell(createStyledCell(invoice.getBill() != null && invoice.getBill().getResidentProfile() != null ?
                String.valueOf(invoice.getBill().getResidentProfile().getId()) : "N/A", bodyFont, false));
        
        houseTable.addCell(createStyledCell("Community Name", boldBodyFont, true));
        houseTable.addCell(createStyledCell(invoice.getCommunityName(), bodyFont, false));
        houseTable.addCell(createStyledCell("Block / Unit", boldBodyFont, true));
        houseTable.addCell(createStyledCell(invoice.getBlockName() + " / " + invoice.getUnitNumber(), bodyFont, false));

        houseTable.addCell(createStyledCell("Meter ID / Number", boldBodyFont, true));
        String meterNumber = (invoice.getBill() != null && invoice.getBill().getWaterMeter() != null) ?
                invoice.getBill().getWaterMeter().getMeterNumber() : "N/A";
        houseTable.addCell(createStyledCell(meterNumber, bodyFont, false));
        houseTable.addCell(createStyledCell("Billing Cycle", boldBodyFont, true));
        houseTable.addCell(createStyledCell(invoice.getBillingCycleName(), bodyFont, false));

        document.add(houseTable);
        document.add(new Paragraph(" "));

        // Water Usage details
        Paragraph usageHeader = new Paragraph("CONSUMPTION METRICS", subTitleFont);
        document.add(usageHeader);
        document.add(new Paragraph(" "));

        PdfPTable usageTable = new PdfPTable(3);
        usageTable.setWidthPercentage(100);
        usageTable.addCell(createStyledCell("Previous Reading", boldBodyFont, true));
        usageTable.addCell(createStyledCell("Current Reading", boldBodyFont, true));
        usageTable.addCell(createStyledCell("Water Consumption (Units)", boldBodyFont, true));
        
        usageTable.addCell(createStyledCell(String.format("%.2f", invoice.getPreviousReading()), bodyFont, false));
        usageTable.addCell(createStyledCell(String.format("%.2f", invoice.getCurrentReading()), bodyFont, false));
        usageTable.addCell(createStyledCell(String.format("%.2f", invoice.getUnitsConsumed()) + " KL", boldBodyFont, false));
        document.add(usageTable);

        document.add(new Paragraph(" "));

        // Cost breakdown details
        Paragraph costHeader = new Paragraph("CHARGES BREAKDOWN", subTitleFont);
        document.add(costHeader);
        document.add(new Paragraph(" "));

        PdfPTable costTable = new PdfPTable(2);
        costTable.setWidthPercentage(100);
        costTable.setWidths(new float[]{60, 40});
        
        costTable.addCell(createStyledCell("Fixed Charges (Base connection fee)", bodyFont, false));
        costTable.addCell(createStyledCell("INR " + invoice.getFixedCharge().toString(), bodyFont, false));
        
        costTable.addCell(createStyledCell("Variable Charges (Water consumption fee)", bodyFont, false));
        costTable.addCell(createStyledCell("INR " + invoice.getVariableCharge().toString(), bodyFont, false));
        
        costTable.addCell(createStyledCell("Shared Cost (" + invoice.getDistributionStrategy() + " distribution strategy)", bodyFont, false));
        costTable.addCell(createStyledCell("INR " + invoice.getSharedWaterCost().toString(), bodyFont, false));
        
        PdfPCell totalLabelCell = createStyledCell("GRAND TOTAL AMOUNT DUE", boldBodyFont, true);
        totalLabelCell.setBackgroundColor(new java.awt.Color(230, 242, 255));
        PdfPCell totalValCell = createStyledCell("INR " + invoice.getTotalAmount().toString(), boldBodyFont, false);
        totalValCell.setBackgroundColor(new java.awt.Color(230, 242, 255));
        
        costTable.addCell(totalLabelCell);
        costTable.addCell(totalValCell);
        document.add(costTable);

        document.add(new Paragraph(" "));
        document.add(new Paragraph(" "));

        // Signature section
        PdfPTable signatureTable = new PdfPTable(2);
        signatureTable.setWidthPercentage(100);
        
        PdfPCell msgCell = new PdfPCell();
        msgCell.setBorder(Rectangle.NO_BORDER);
        msgCell.addElement(new Paragraph("Thank you for your water conservation efforts!", footerFont));
        msgCell.addElement(new Paragraph("Please pay by the due date to avoid late payment penalties.", footerFont));
        signatureTable.addCell(msgCell);
        
        PdfPCell signCell = new PdfPCell();
        signCell.setBorder(Rectangle.NO_BORDER);
        signCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        Paragraph signLine = new Paragraph("Authorized Signatory", boldBodyFont);
        signLine.setAlignment(Element.ALIGN_RIGHT);
        Paragraph brandLine = new Paragraph("HydroSync Solutions", footerFont);
        brandLine.setAlignment(Element.ALIGN_RIGHT);
        signCell.addElement(signLine);
        signCell.addElement(brandLine);
        signatureTable.addCell(signCell);
        
        document.add(signatureTable);

        document.close();

        return out.toByteArray();
    }

    private PdfPCell createStyledCell(String text, Font font, boolean header) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(6);
        cell.setBorderColor(new java.awt.Color(224, 224, 224));
        if (header) {
            cell.setBackgroundColor(new java.awt.Color(245, 245, 245));
        }
        return cell;
    }

    private InvoiceResponse mapToResponse(Invoice invoice) {
        return InvoiceResponse.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .billId(invoice.getBill() != null ? invoice.getBill().getId() : null)
                .residentName(invoice.getResidentName())
                .unitNumber(invoice.getUnitNumber())
                .blockName(invoice.getBlockName())
                .communityName(invoice.getCommunityName())
                .billingCycleName(invoice.getBillingCycleName())
                .periodStart(invoice.getPeriodStart())
                .periodEnd(invoice.getPeriodEnd())
                .previousReading(invoice.getPreviousReading())
                .currentReading(invoice.getCurrentReading())
                .unitsConsumed(invoice.getUnitsConsumed())
                .fixedCharge(invoice.getFixedCharge())
                .variableCharge(invoice.getVariableCharge())
                .sharedWaterCost(invoice.getSharedWaterCost())
                .distributionStrategy(invoice.getDistributionStrategy())
                .totalAmount(invoice.getTotalAmount())
                .billStatus(invoice.getBillStatus())
                .paymentStatus(invoice.getPaymentStatus())
                .generatedDate(invoice.getGeneratedDate())
                .dueDate(invoice.getDueDate())
                .build();
    }
}
