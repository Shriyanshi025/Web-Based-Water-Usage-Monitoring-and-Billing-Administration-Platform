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
import java.time.LocalDate;
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
            throw new IllegalArgumentException("Purchased volume must be positive.");
        }
        if (request.getUnitCost() == null || request.getUnitCost().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Unit cost must be positive.");
        }
        if (request.getPurchaseDate().isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("Purchase date cannot be in the future.");
        }

        BillingCycle cycle = billingCycleRepository.findById(request.getBillingCycleId())
                .orElseThrow(() -> new IllegalArgumentException("Billing cycle not found"));

        // Check for duplicates
        boolean exists = bulkWaterPurchaseRepository.existsByCommunityIdAndBillingCycleIdAndSourceIgnoreCaseAndPurchaseDate(
                community.getId(),
                cycle.getId(),
                request.getSupplierName().trim(),
                request.getPurchaseDate()
        );

        if (exists) {
            throw new IllegalArgumentException("A duplicate purchase entry already exists for the same supplier and date in this cycle.");
        }

        BigDecimal totalCost = BigDecimal.valueOf(request.getPurchasedVolume())
                .multiply(request.getUnitCost())
                .setScale(2, java.math.RoundingMode.HALF_UP);

        BulkWaterPurchase purchase = BulkWaterPurchase.builder()
                .source(request.getSupplierName())
                .purchasedVolume(request.getPurchasedVolume())
                .unitCost(request.getUnitCost())
                .totalCost(totalCost)
                .purchaseDate(request.getPurchaseDate())
                .notes(request.getNotes())
                .createdBy(adminEmail)
                .billingCycle(cycle)
                .community(community)
                .build();

        BulkWaterPurchase saved = bulkWaterPurchaseRepository.save(purchase);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public BulkWaterPurchaseResponse updatePurchase(String adminEmail, Long id, BulkWaterPurchaseRequest request) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);
        Community community = adminProfile.getCommunity();

        BulkWaterPurchase purchase = bulkWaterPurchaseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Bulk water purchase not found."));

        if (!purchase.getCommunity().getId().equals(community.getId())) {
            throw new IllegalArgumentException("Unauthorized to modify this bulk water purchase.");
        }

        if (request.getPurchasedVolume() <= 0) {
            throw new IllegalArgumentException("Purchased volume must be positive.");
        }
        if (request.getUnitCost() == null || request.getUnitCost().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Unit cost must be positive.");
        }
        if (request.getPurchaseDate().isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("Purchase date cannot be in the future.");
        }

        BillingCycle cycle = billingCycleRepository.findById(request.getBillingCycleId())
                .orElseThrow(() -> new IllegalArgumentException("Billing cycle not found."));

        // Check for duplicates
        boolean exists = bulkWaterPurchaseRepository.existsDuplicateForUpdate(
                community.getId(),
                cycle.getId(),
                request.getSupplierName().trim(),
                request.getPurchaseDate(),
                id
        );

        if (exists) {
            throw new IllegalArgumentException("A duplicate purchase entry already exists for the same supplier and date in this cycle.");
        }

        BigDecimal totalCost = BigDecimal.valueOf(request.getPurchasedVolume())
                .multiply(request.getUnitCost())
                .setScale(2, java.math.RoundingMode.HALF_UP);

        purchase.setSource(request.getSupplierName());
        purchase.setPurchasedVolume(request.getPurchasedVolume());
        purchase.setUnitCost(request.getUnitCost());
        purchase.setTotalCost(totalCost);
        purchase.setPurchaseDate(request.getPurchaseDate());
        purchase.setNotes(request.getNotes());
        purchase.setBillingCycle(cycle);

        BulkWaterPurchase saved = bulkWaterPurchaseRepository.save(purchase);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void deletePurchase(String adminEmail, Long id) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);
        BulkWaterPurchase purchase = bulkWaterPurchaseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Bulk water purchase not found."));

        if (!purchase.getCommunity().getId().equals(adminProfile.getCommunity().getId())) {
            throw new IllegalArgumentException("Unauthorized to delete this bulk water purchase.");
        }

        bulkWaterPurchaseRepository.delete(purchase);
    }

    @Override
    public BulkWaterPurchaseResponse getPurchaseById(String adminEmail, Long id) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);
        BulkWaterPurchase purchase = bulkWaterPurchaseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Bulk water purchase not found."));

        if (!purchase.getCommunity().getId().equals(adminProfile.getCommunity().getId())) {
            throw new IllegalArgumentException("Unauthorized to view this bulk water purchase.");
        }

        return mapToResponse(purchase);
    }

    @Override
    public List<BulkWaterPurchaseResponse> getAllPurchases(String adminEmail) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);
        return bulkWaterPurchaseRepository.findByCommunityId(adminProfile.getCommunity().getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
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
                .supplierName(purchase.getSource())
                .purchasedVolume(purchase.getPurchasedVolume())
                .unitCost(purchase.getUnitCost())
                .totalCost(purchase.getTotalCost())
                .purchaseDate(purchase.getPurchaseDate())
                .notes(purchase.getNotes())
                .createdBy(purchase.getCreatedBy())
                .billingCycleId(purchase.getBillingCycle().getId())
                .billingCycleName(purchase.getBillingCycle().getName())
                .communityId(purchase.getCommunity().getId())
                .createdAt(purchase.getCreatedAt())
                .updatedAt(purchase.getUpdatedAt())
                .build();
    }
}
