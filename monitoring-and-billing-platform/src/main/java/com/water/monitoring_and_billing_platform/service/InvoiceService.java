package com.water.monitoring_and_billing_platform.service;

import com.water.monitoring_and_billing_platform.dto.InvoiceResponse;
import com.water.monitoring_and_billing_platform.entity.Bill;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface InvoiceService {
    InvoiceResponse generateInvoice(Bill bill);
    Page<InvoiceResponse> listInvoices(String email, Pageable pageable);
    InvoiceResponse getInvoiceById(String email, Long id);
    InvoiceResponse getInvoiceByInvoiceNumber(String email, String invoiceNumber);
    byte[] generateInvoicePdf(String email, Long id);
}
