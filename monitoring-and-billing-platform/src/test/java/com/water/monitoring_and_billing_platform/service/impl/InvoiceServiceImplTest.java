package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.dto.InvoiceResponse;
import com.water.monitoring_and_billing_platform.entity.*;
import com.water.monitoring_and_billing_platform.enums.Role;
import com.water.monitoring_and_billing_platform.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class InvoiceServiceImplTest {

    @Mock
    private InvoiceRepository invoiceRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private CommunityAdminProfileRepository communityAdminProfileRepository;
    @Mock
    private ResidentProfileRepository residentProfileRepository;

    @InjectMocks
    private InvoiceServiceImpl invoiceService;

    private User user;
    private User admin;
    private Community community;
    private ResidentProfile resident;
    private CommunityAdminProfile adminProfile;
    private BillingCycle cycle;
    private Bill bill;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).fullName("John Doe").email("john@example.com").role(Role.USER).build();
        admin = User.builder().id(2L).fullName("Admin User").email("admin@example.com").role(Role.COMMUNITY_ADMIN).build();
        community = Community.builder().id(10L).communityName("Springfield").build();
        Unit unit = Unit.builder().id(101L).unitNumber("101").occupancy(3).area(1200.0).build();
        Block block = Block.builder().id(201L).blockName("Block A").build();

        resident = ResidentProfile.builder()
                .id(1L)
                .user(user)
                .community(community)
                .unit(unit)
                .block(block)
                .active(true)
                .build();

        adminProfile = CommunityAdminProfile.builder()
                .id(1L)
                .user(admin)
                .community(community)
                .build();

        cycle = BillingCycle.builder()
                .id(5L)
                .name("Cycle 1")
                .periodStart(LocalDate.of(2026, 7, 1))
                .periodEnd(LocalDate.of(2026, 7, 31))
                .build();

        bill = Bill.builder()
                .id(1L)
                .residentProfile(resident)
                .billingCycle(cycle)
                .billingMonth(7)
                .billingYear(2026)
                .previousReading(100.0)
                .currentReading(150.0)
                .unitsConsumed(50.0)
                .fixedCharge(new BigDecimal("100.00"))
                .sharedWaterCost(new BigDecimal("250.00"))
                .distributionStrategy("EQUAL")
                .amount(new BigDecimal("1000.00"))
                .totalAmount(new BigDecimal("1000.00"))
                .billStatus("GENERATED")
                .paymentStatus("UNPAID")
                .generatedDate(LocalDate.of(2026, 8, 1))
                .dueDate(LocalDate.of(2026, 8, 15))
                .build();
    }

    @Test
    void generateInvoice_Success() {
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(invocation -> invocation.getArgument(0));

        InvoiceResponse response = invoiceService.generateInvoice(bill);

        assertNotNull(response);
        assertEquals("John Doe", response.getResidentName());
        assertEquals("101", response.getUnitNumber());
        assertEquals("Block A", response.getBlockName());
        assertEquals("Springfield", response.getCommunityName());
        assertEquals("Cycle 1", response.getBillingCycleName());
        assertEquals(new BigDecimal("1000.00"), response.getTotalAmount());
        assertEquals("EQUAL", response.getDistributionStrategy());
        verify(invoiceRepository).save(any(Invoice.class));
    }

    @Test
    void listInvoices_AsUser() {
        Invoice invoice = Invoice.builder()
                .id(1L)
                .invoiceNumber("INV-12345")
                .bill(bill)
                .residentName("John Doe")
                .unitNumber("101")
                .blockName("Block A")
                .communityName("Springfield")
                .billingCycleName("Cycle 1")
                .totalAmount(new BigDecimal("1000.00"))
                .billStatus("GENERATED")
                .paymentStatus("UNPAID")
                .generatedDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(15))
                .build();

        PageRequest pageRequest = PageRequest.of(0, 10);
        Page<Invoice> invoicePage = new PageImpl<>(List.of(invoice));

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
        when(residentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(resident));
        when(invoiceRepository.findByBillResidentProfileId(1L, pageRequest)).thenReturn(invoicePage);

        Page<InvoiceResponse> result = invoiceService.listInvoices("john@example.com", pageRequest);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("INV-12345", result.getContent().get(0).getInvoiceNumber());
    }

    @Test
    void generateInvoicePdf_Success() {
        Invoice invoice = Invoice.builder()
                .id(1L)
                .invoiceNumber("INV-12345")
                .bill(bill)
                .residentName("John Doe")
                .unitNumber("101")
                .blockName("Block A")
                .communityName("Springfield")
                .billingCycleName("Cycle 1")
                .totalAmount(new BigDecimal("1000.00"))
                .fixedCharge(new BigDecimal("100.00"))
                .variableCharge(new BigDecimal("650.00"))
                .sharedWaterCost(new BigDecimal("250.00"))
                .distributionStrategy("EQUAL")
                .billStatus("GENERATED")
                .paymentStatus("UNPAID")
                .generatedDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(15))
                .build();

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
        when(residentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(resident));
        when(invoiceRepository.findById(1L)).thenReturn(Optional.of(invoice));

        byte[] pdfBytes = invoiceService.generateInvoicePdf("john@example.com", 1L);

        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0);
    }
}
