package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.dto.BulkWaterPurchaseRequest;
import com.water.monitoring_and_billing_platform.dto.BulkWaterPurchaseResponse;
import com.water.monitoring_and_billing_platform.dto.BulkWaterPurchaseSummaryResponse;
import com.water.monitoring_and_billing_platform.entity.*;
import com.water.monitoring_and_billing_platform.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BulkWaterPurchaseServiceImplTest {

    @Mock
    private BulkWaterPurchaseRepository bulkWaterPurchaseRepository;
    @Mock
    private BillingCycleRepository billingCycleRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private CommunityAdminProfileRepository communityAdminProfileRepository;

    @InjectMocks
    private BulkWaterPurchaseServiceImpl bulkWaterPurchaseService;

    private User adminUser;
    private CommunityAdminProfile adminProfile;
    private Community community;
    private BillingCycle cycle;

    @BeforeEach
    void setUp() {
        adminUser = User.builder().id(1L).email("admin@example.com").build();
        community = Community.builder().id(10L).communityName("Oakwood").build();
        adminProfile = CommunityAdminProfile.builder().id(1L).user(adminUser).community(community).build();
        cycle = BillingCycle.builder().id(5L).name("July 2026").active(true).build();
    }

    @Test
    void recordPurchase_Success() {
        BulkWaterPurchaseRequest request = new BulkWaterPurchaseRequest();
        request.setSource("Tanker");
        request.setPurchasedVolume(15.5);
        request.setTotalCost(new BigDecimal("4500.00"));
        request.setPurchaseDate(LocalDate.of(2026, 7, 10));
        request.setBillingCycleId(5L);

        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));
        when(communityAdminProfileRepository.findByUserId(1L)).thenReturn(Optional.of(adminProfile));
        when(billingCycleRepository.findById(5L)).thenReturn(Optional.of(cycle));
        when(bulkWaterPurchaseRepository.existsByCommunityIdAndBillingCycleIdAndSourceIgnoreCaseAndPurchaseDate(
                eq(10L), eq(5L), eq("Tanker"), eq(LocalDate.of(2026, 7, 10))
        )).thenReturn(false);

        BulkWaterPurchase saved = BulkWaterPurchase.builder()
                .id(1L)
                .source("Tanker")
                .purchasedVolume(15.5)
                .totalCost(new BigDecimal("4500.00"))
                .purchaseDate(LocalDate.of(2026, 7, 10))
                .billingCycle(cycle)
                .community(community)
                .build();

        when(bulkWaterPurchaseRepository.save(any(BulkWaterPurchase.class))).thenReturn(saved);

        BulkWaterPurchaseResponse response = bulkWaterPurchaseService.recordPurchase("admin@example.com", request);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Tanker", response.getSource());
        assertEquals(15.5, response.getPurchasedVolume());
        assertEquals(new BigDecimal("4500.00"), response.getTotalCost());
        verify(bulkWaterPurchaseRepository).save(any(BulkWaterPurchase.class));
    }

    @Test
    void recordPurchase_DuplicateThrowsException() {
        BulkWaterPurchaseRequest request = new BulkWaterPurchaseRequest();
        request.setSource("Tanker");
        request.setPurchasedVolume(15.5);
        request.setTotalCost(new BigDecimal("4500.00"));
        request.setPurchaseDate(LocalDate.of(2026, 7, 10));
        request.setBillingCycleId(5L);

        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));
        when(communityAdminProfileRepository.findByUserId(1L)).thenReturn(Optional.of(adminProfile));
        when(billingCycleRepository.findById(5L)).thenReturn(Optional.of(cycle));
        when(bulkWaterPurchaseRepository.existsByCommunityIdAndBillingCycleIdAndSourceIgnoreCaseAndPurchaseDate(
                eq(10L), eq(5L), eq("Tanker"), eq(LocalDate.of(2026, 7, 10))
        )).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> {
            bulkWaterPurchaseService.recordPurchase("admin@example.com", request);
        });
    }

    @Test
    void recordPurchase_NegativeVolumeThrowsException() {
        BulkWaterPurchaseRequest request = new BulkWaterPurchaseRequest();
        request.setSource("Tanker");
        request.setPurchasedVolume(-5.0);
        request.setTotalCost(new BigDecimal("4500.00"));
        request.setPurchaseDate(LocalDate.of(2026, 7, 10));
        request.setBillingCycleId(5L);

        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));
        when(communityAdminProfileRepository.findByUserId(1L)).thenReturn(Optional.of(adminProfile));

        assertThrows(IllegalArgumentException.class, () -> {
            bulkWaterPurchaseService.recordPurchase("admin@example.com", request);
        });
    }

    @Test
    void recordPurchase_NegativeCostThrowsException() {
        BulkWaterPurchaseRequest request = new BulkWaterPurchaseRequest();
        request.setSource("Tanker");
        request.setPurchasedVolume(10.0);
        request.setTotalCost(new BigDecimal("-100.00"));
        request.setPurchaseDate(LocalDate.of(2026, 7, 10));
        request.setBillingCycleId(5L);

        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));
        when(communityAdminProfileRepository.findByUserId(1L)).thenReturn(Optional.of(adminProfile));

        assertThrows(IllegalArgumentException.class, () -> {
            bulkWaterPurchaseService.recordPurchase("admin@example.com", request);
        });
    }

    @Test
    void getSummaryForCycle_Success() {
        BulkWaterPurchase p1 = BulkWaterPurchase.builder()
                .id(1L)
                .source("Tanker")
                .purchasedVolume(10.0)
                .totalCost(new BigDecimal("2000.00"))
                .purchaseDate(LocalDate.of(2026, 7, 5))
                .billingCycle(cycle)
                .community(community)
                .build();

        BulkWaterPurchase p2 = BulkWaterPurchase.builder()
                .id(2L)
                .source("Municipal")
                .purchasedVolume(20.0)
                .totalCost(new BigDecimal("3000.00"))
                .purchaseDate(LocalDate.of(2026, 7, 15))
                .billingCycle(cycle)
                .community(community)
                .build();

        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));
        when(communityAdminProfileRepository.findByUserId(1L)).thenReturn(Optional.of(adminProfile));
        when(billingCycleRepository.findById(5L)).thenReturn(Optional.of(cycle));
        when(bulkWaterPurchaseRepository.findByBillingCycleIdAndCommunityId(5L, 10L)).thenReturn(List.of(p1, p2));

        BulkWaterPurchaseSummaryResponse summary = bulkWaterPurchaseService.getSummaryForCycle("admin@example.com", 5L);

        assertNotNull(summary);
        assertEquals(5L, summary.getBillingCycleId());
        assertEquals("July 2026", summary.getBillingCycleName());
        assertEquals(30.0, summary.getTotalVolume());
        assertEquals(new BigDecimal("5000.00"), summary.getTotalCost());
        assertEquals(2, summary.getPurchases().size());
    }
}
