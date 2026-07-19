package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.dto.BulkWaterPurchaseRequest;
import com.water.monitoring_and_billing_platform.dto.BulkWaterPurchaseResponse;
import com.water.monitoring_and_billing_platform.dto.BulkWaterPurchaseSummaryResponse;
import com.water.monitoring_and_billing_platform.entity.*;
import com.water.monitoring_and_billing_platform.repository.*;
import com.water.monitoring_and_billing_platform.service.BulkWaterPurchaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class BulkWaterPurchaseServiceImpl implements BulkWaterPurchaseService {

    private final BulkWaterPurchaseRepository bulkWaterPurchaseRepository;
    private final BillingCycleRepository billingCycleRepository;
    private final UserRepository userRepository;
    private final CommunityAdminProfileRepository communityAdminProfileRepository;

    private CommunityAdminProfile getAdminProfile(String adminEmail) {
        User user = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return communityAdminProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Community admin profile not found"));
    }

    @Override
    @Transactional
    public BulkWaterPurchaseResponse recordPurchase(String adminEmail, BulkWaterPurchaseRequest request) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);
        Community community = adminProfile.getCommunity();

        if (request.getPurchasedVolume() <= 0) {
            throw new IllegalArgumentException("Purchased volume must be positive");
        }
        if (request.getTotalCost().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Total cost must be positive");
        }

        BillingCycle cycle = billingCycleRepository.findById(request.getBillingCycleId())
                .orElseThrow(() -> new IllegalArgumentException("Billing cycle not found"));

        // Check for duplicates
        boolean exists = bulkWaterPurchaseRepository.existsByCommunityIdAndBillingCycleIdAndSourceIgnoreCaseAndPurchaseDate(
                community.getId(),
                cycle.getId(),
                request.getSource().trim(),
                request.getPurchaseDate()
        );

        if (exists) {
            throw new IllegalArgumentException("A duplicate purchase entry already exists for the same source and date in this cycle.");
        }

        BulkWaterPurchase purchase = BulkWaterPurchase.builder()
                .source(request.getSource())
                .purchasedVolume(request.getPurchasedVolume())
                .totalCost(request.getTotalCost())
                .purchaseDate(request.getPurchaseDate())
                .billingCycle(cycle)
                .community(community)
                .build();

        BulkWaterPurchase saved = bulkWaterPurchaseRepository.save(purchase);
        return mapToResponse(saved);
    }

    @Override
    public List<BulkWaterPurchaseResponse> getPurchasesForCycle(String adminEmail, Long billingCycleId) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);
        return bulkWaterPurchaseRepository.findByBillingCycleIdAndCommunityId(billingCycleId, adminProfile.getCommunity().getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public BulkWaterPurchaseSummaryResponse getSummaryForCycle(String adminEmail, Long billingCycleId) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);
        Long communityId = adminProfile.getCommunity().getId();

        BillingCycle cycle = billingCycleRepository.findById(billingCycleId)
                .orElseThrow(() -> new IllegalArgumentException("Billing cycle not found"));

        List<BulkWaterPurchase> purchases = bulkWaterPurchaseRepository.findByBillingCycleIdAndCommunityId(billingCycleId, communityId);

        double totalVolume = purchases.stream().mapToDouble(BulkWaterPurchase::getPurchasedVolume).sum();
        BigDecimal totalCost = purchases.stream()
                .map(BulkWaterPurchase::getTotalCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<BulkWaterPurchaseResponse> purchaseResponses = purchases.stream()
                .map(this::mapToResponse)
                .toList();

        return BulkWaterPurchaseSummaryResponse.builder()
                .billingCycleId(cycle.getId())
                .billingCycleName(cycle.getName())
                .totalVolume(totalVolume)
                .totalCost(totalCost)
                .purchases(purchaseResponses)
                .build();
    }

    private BulkWaterPurchaseResponse mapToResponse(BulkWaterPurchase purchase) {
        return BulkWaterPurchaseResponse.builder()
                .id(purchase.getId())
                .source(purchase.getSource())
                .purchasedVolume(purchase.getPurchasedVolume())
                .totalCost(purchase.getTotalCost())
                .purchaseDate(purchase.getPurchaseDate())
                .billingCycleId(purchase.getBillingCycle().getId())
                .billingCycleName(purchase.getBillingCycle().getName())
                .communityId(purchase.getCommunity().getId())
                .build();
    }
}
