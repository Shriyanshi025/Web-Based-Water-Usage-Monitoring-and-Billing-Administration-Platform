package com.water.monitoring_and_billing_platform.controller;

import com.water.monitoring_and_billing_platform.dto.ApiResponse;
import com.water.monitoring_and_billing_platform.entity.Bill;
import com.water.monitoring_and_billing_platform.entity.Invoice;
import com.water.monitoring_and_billing_platform.repository.InvoiceRepository;
import com.water.monitoring_and_billing_platform.service.BillService;
import com.water.monitoring_and_billing_platform.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bills")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174", "https://web-based-water-usage-monitoring-an.vercel.app"})
public class BillController {

    private final BillService billService;
    private final InvoiceRepository invoiceRepository;
    private final InvoiceService invoiceService;

    @GetMapping("/{id}/pdf")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> downloadBillPdf(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        Bill bill = billService.getBillById(id);
        Invoice invoice = invoiceRepository.findByBillId(id)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found for Bill ID: " + id));

        byte[] pdfBytes = invoiceService.generateInvoicePdf(userDetails.getUsername(), invoice.getId());

        String filename = "Bill-" + (bill.getBillNumber() != null ? bill.getBillNumber() : "BILL-" + id) + ".pdf";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.builder("attachment")
                .filename(filename)
                .build());

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }


    @PostMapping("/generate/{residentId}")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ApiResponse<Bill>> generateBill(@PathVariable Long residentId) {
        try {
            Bill bill = billService.generateBillForResident(residentId);
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    ApiResponse.<Bill>builder()
                            .success(true)
                            .message("Bill generated successfully")
                            .data(bill)
                            .build()
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    ApiResponse.<Bill>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build()
            );
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    ApiResponse.<Bill>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build()
            );
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Bill>> getBillById(@PathVariable Long id) {
        try {
            Bill bill = billService.getBillById(id);
            return ResponseEntity.ok(
                    ApiResponse.<Bill>builder()
                            .success(true)
                            .message("Bill retrieved successfully")
                            .data(bill)
                            .build()
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    ApiResponse.<Bill>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build()
            );
        }
    }

    @GetMapping("/resident/{residentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<Bill>>> getBillsByResidentId(@PathVariable Long residentId) {
        List<Bill> bills = billService.getBillsByResidentId(residentId);
        return ResponseEntity.ok(
                ApiResponse.<List<Bill>>builder()
                        .success(true)
                        .message("Bills retrieved successfully")
                        .data(bills)
                        .build()
        );
    }

    @GetMapping("/community/{communityId}")
    @PreAuthorize("hasAnyRole('COMMUNITY_ADMIN', 'MAIN_ADMIN')")
    public ResponseEntity<ApiResponse<List<Bill>>> getBillsByCommunityId(@PathVariable Long communityId) {
        List<Bill> bills = billService.getBillsByCommunityId(communityId);
        return ResponseEntity.ok(
                ApiResponse.<List<Bill>>builder()
                        .success(true)
                        .message("Bills retrieved successfully")
                        .data(bills)
                        .build()
        );
    }
}
