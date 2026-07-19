package com.water.monitoring_and_billing_platform.controller;

import com.water.monitoring_and_billing_platform.dto.ApiResponse;
import com.water.monitoring_and_billing_platform.dto.InvoiceResponse;
import com.water.monitoring_and_billing_platform.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class InvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Page<InvoiceResponse>>> listInvoices(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort
    ) {
        String[] sortParams = sort.split(",");
        String sortBy = sortParams[0];
        Sort.Direction direction = Sort.Direction.DESC;
        if (sortParams.length > 1 && "asc".equalsIgnoreCase(sortParams[1])) {
            direction = Sort.Direction.ASC;
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<InvoiceResponse> result = invoiceService.listInvoices(userDetails.getUsername(), pageable);

        return ResponseEntity.ok(ApiResponse.<Page<InvoiceResponse>>builder()
                .success(true)
                .message("Invoices retrieved successfully")
                .data(result)
                .build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<InvoiceResponse>> getInvoiceById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        InvoiceResponse response = invoiceService.getInvoiceById(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.<InvoiceResponse>builder()
                .success(true)
                .message("Invoice retrieved successfully")
                .data(response)
                .build());
    }

    @GetMapping("/number/{invoiceNumber}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<InvoiceResponse>> getInvoiceByInvoiceNumber(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String invoiceNumber
    ) {
        InvoiceResponse response = invoiceService.getInvoiceByInvoiceNumber(userDetails.getUsername(), invoiceNumber);
        return ResponseEntity.ok(ApiResponse.<InvoiceResponse>builder()
                .success(true)
                .message("Invoice retrieved successfully")
                .data(response)
                .build());
    }

    @GetMapping("/{id}/pdf")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> downloadInvoicePdf(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        byte[] pdfBytes = invoiceService.generateInvoicePdf(userDetails.getUsername(), id);
        InvoiceResponse invoice = invoiceService.getInvoiceById(userDetails.getUsername(), id);
        String filename = "Invoice-" + (invoice != null ? invoice.getInvoiceNumber() : "INV-" + id) + ".pdf";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.builder("attachment")
                .filename(filename)
                .build());

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}
