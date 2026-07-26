package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.dto.TariffPlanPreviewResponse;
import com.water.monitoring_and_billing_platform.dto.TariffPlanRequest;
import com.water.monitoring_and_billing_platform.dto.TariffPlanResponse;
import com.water.monitoring_and_billing_platform.dto.TariffSlabRequest;
import com.water.monitoring_and_billing_platform.dto.TariffSlabResponse;
import com.water.monitoring_and_billing_platform.entity.Bill;
import com.water.monitoring_and_billing_platform.entity.Community;
import com.water.monitoring_and_billing_platform.entity.CommunityAdminProfile;
import com.water.monitoring_and_billing_platform.entity.TariffPlan;
import com.water.monitoring_and_billing_platform.entity.TariffSlab;
import com.water.monitoring_and_billing_platform.entity.User;
import com.water.monitoring_and_billing_platform.enums.TariffPolicyStatus;
import com.water.monitoring_and_billing_platform.exception.UserNotFoundException;
import com.water.monitoring_and_billing_platform.repository.BillRepository;
import com.water.monitoring_and_billing_platform.repository.CommunityAdminProfileRepository;
import com.water.monitoring_and_billing_platform.repository.TariffPlanRepository;
import com.water.monitoring_and_billing_platform.repository.UserRepository;
import com.water.monitoring_and_billing_platform.service.BillCalculationService;
import com.water.monitoring_and_billing_platform.service.TariffPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TariffPlanServiceImpl implements TariffPlanService {

    private final TariffPlanRepository tariffPlanRepository;
    private final BillRepository billRepository;
    private final UserRepository userRepository;
    private final CommunityAdminProfileRepository communityAdminProfileRepository;
    private final BillCalculationService billCalculationService;

    private CommunityAdminProfile getAdminProfile(String adminEmail) {
        User user = userRepository.findByEmail(adminEmail)
                .orElseThrow(UserNotFoundException::new);
        return communityAdminProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Community Admin profile not found."));
    }

    @Override
    @Transactional
    public TariffPlanResponse createTariffPlan(String adminEmail, TariffPlanRequest request) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);
        Long communityId = adminProfile.getCommunity().getId();

        if (tariffPlanRepository.existsByCommunityIdAndNameIgnoreCase(communityId, request.getName().trim())) {
            throw new IllegalArgumentException("A tariff policy with the name '" + request.getName().trim() + "' already exists in your community.");
        }

        if (request.getEffectiveTo() != null && request.getEffectiveFrom() != null && request.getEffectiveTo().isBefore(request.getEffectiveFrom())) {
            throw new IllegalArgumentException("Effective To date cannot be before Effective From date.");
        }

        validateSlabs(request.getSlabs());

        // Status logic: Default to DRAFT or requested status, unless first plan
        boolean isFirstPlan = !tariffPlanRepository.existsByCommunityId(communityId);
        TariffPolicyStatus initialStatus = request.getPolicyStatus() != null ? request.getPolicyStatus() : (isFirstPlan ? TariffPolicyStatus.ACTIVE : TariffPolicyStatus.DRAFT);

        if (initialStatus == TariffPolicyStatus.ACTIVE) {
            if (request.getEffectiveTo() != null && request.getEffectiveTo().isBefore(LocalDate.now())) {
                throw new IllegalArgumentException("Cannot activate an expired tariff policy.");
            }
            // Deactivate any existing active plans in the community to enforce ONLY ONE ACTIVE policy rule
            List<TariffPlan> existingActive = tariffPlanRepository.findByCommunityIdAndActiveTrue(communityId);
            for (TariffPlan ap : existingActive) {
                ap.setActive(false);
                ap.setPolicyStatus(TariffPolicyStatus.INACTIVE);
                tariffPlanRepository.save(ap);
            }
        }

        TariffPlan plan = TariffPlan.builder()
                .name(request.getName().trim())
                .description(request.getDescription())
                .fixedCharge(request.getFixedCharge())
                .ratePerUnit(request.getRatePerUnit())
                .taxRate(request.getTaxRate() != null ? request.getTaxRate() : new BigDecimal("0.05"))
                .maintenanceCharge(request.getMaintenanceCharge())
                .serviceCharge(request.getServiceCharge())
                .effectiveFrom(request.getEffectiveFrom())
                .effectiveTo(request.getEffectiveTo())
                .policyStatus(initialStatus)
                .active(initialStatus == TariffPolicyStatus.ACTIVE)
                .versionNumber(1)
                .createdBy(adminEmail)
                .community(adminProfile.getCommunity())
                .build();

        if (request.getSlabs() != null) {
            List<TariffSlab> slabs = new ArrayList<>();
            for (TariffSlabRequest sReq : request.getSlabs()) {
                slabs.add(TariffSlab.builder()
                        .tariffPlan(plan)
                        .minUnits(sReq.getMinUnits())
                        .maxUnits(sReq.getMaxUnits())
                        .ratePerUnit(sReq.getRatePerUnit())
                        .build());
            }
            plan.setSlabs(slabs);
        }

        plan = tariffPlanRepository.saveAndFlush(plan);
        return mapToResponse(plan);
    }

    @Override
    @Transactional
    public TariffPlanResponse updateTariffPlan(String adminEmail, Long id, TariffPlanRequest request) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);
        Long communityId = adminProfile.getCommunity().getId();

        TariffPlan plan = tariffPlanRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tariff plan not found with ID: " + id));

        if (!plan.getCommunity().getId().equals(communityId)) {
            throw new IllegalArgumentException("Unauthorized to modify tariff plan of another community.");
        }

        if (plan.getPolicyStatus() == TariffPolicyStatus.ARCHIVED) {
            throw new IllegalStateException("Archived tariff policies are read-only and cannot be edited.");
        }

        if (tariffPlanRepository.existsByCommunityIdAndNameIgnoreCaseAndIdNot(communityId, request.getName().trim(), id)) {
            throw new IllegalArgumentException("Another tariff policy with the name '" + request.getName().trim() + "' already exists in your community.");
        }

        if (request.getEffectiveTo() != null && request.getEffectiveFrom() != null && request.getEffectiveTo().isBefore(request.getEffectiveFrom())) {
            throw new IllegalArgumentException("Effective To date cannot be before Effective From date.");
        }

        validateSlabs(request.getSlabs());

        if (request.getPolicyStatus() == TariffPolicyStatus.ACTIVE && plan.getPolicyStatus() != TariffPolicyStatus.ACTIVE) {
            if (request.getEffectiveTo() != null && request.getEffectiveTo().isBefore(LocalDate.now())) {
                throw new IllegalArgumentException("Cannot activate an expired tariff policy.");
            }
            List<TariffPlan> activePlans = tariffPlanRepository.findByCommunityIdAndActiveTrue(communityId);
            for (TariffPlan ap : activePlans) {
                if (!ap.getId().equals(id)) {
                    ap.setActive(false);
                    ap.setPolicyStatus(TariffPolicyStatus.INACTIVE);
                    tariffPlanRepository.save(ap);
                }
            }
            plan.setActive(true);
            plan.setPolicyStatus(TariffPolicyStatus.ACTIVE);
        } else if (request.getPolicyStatus() != null && request.getPolicyStatus() != TariffPolicyStatus.ACTIVE) {
            plan.setActive(false);
            plan.setPolicyStatus(request.getPolicyStatus());
        }

        plan.setName(request.getName().trim());
        plan.setDescription(request.getDescription());
        plan.setFixedCharge(request.getFixedCharge());
        plan.setRatePerUnit(request.getRatePerUnit());
        plan.setTaxRate(request.getTaxRate() != null ? request.getTaxRate() : new BigDecimal("0.05"));
        plan.setMaintenanceCharge(request.getMaintenanceCharge());
        plan.setServiceCharge(request.getServiceCharge());
        plan.setEffectiveFrom(request.getEffectiveFrom());
        plan.setEffectiveTo(request.getEffectiveTo());

        if (plan.getSlabs() != null) {
            plan.getSlabs().clear();
        } else {
            plan.setSlabs(new ArrayList<>());
        }

        if (request.getSlabs() != null) {
            for (TariffSlabRequest sReq : request.getSlabs()) {
                plan.getSlabs().add(TariffSlab.builder()
                        .tariffPlan(plan)
                        .minUnits(sReq.getMinUnits())
                        .maxUnits(sReq.getMaxUnits())
                        .ratePerUnit(sReq.getRatePerUnit())
                        .build());
            }
        }

        plan = tariffPlanRepository.saveAndFlush(plan);
        return mapToResponse(plan);
    }

    @Override
    @Transactional
    public TariffPlanResponse duplicateTariffPlan(String adminEmail, Long id) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);
        Long communityId = adminProfile.getCommunity().getId();

        TariffPlan sourcePlan = tariffPlanRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tariff plan not found with ID: " + id));

        if (!sourcePlan.getCommunity().getId().equals(communityId)) {
            throw new IllegalArgumentException("Unauthorized to duplicate tariff plan of another community.");
        }

        String duplicateName = sourcePlan.getName() + " Copy";
        int counter = 1;
        while (tariffPlanRepository.existsByCommunityIdAndNameIgnoreCase(communityId, duplicateName)) {
            counter++;
            duplicateName = sourcePlan.getName() + " Copy (" + counter + ")";
        }

        int nextVersion = sourcePlan.getVersionNumber() != null ? sourcePlan.getVersionNumber() + 1 : 1;

        TariffPlan newPlan = TariffPlan.builder()
                .name(duplicateName)
                .description(sourcePlan.getDescription() != null ? sourcePlan.getDescription() + " (Duplicated)" : "Copy of " + sourcePlan.getName())
                .fixedCharge(sourcePlan.getFixedCharge())
                .ratePerUnit(sourcePlan.getRatePerUnit())
                .taxRate(sourcePlan.getTaxRate())
                .maintenanceCharge(sourcePlan.getMaintenanceCharge())
                .serviceCharge(sourcePlan.getServiceCharge())
                .effectiveFrom(sourcePlan.getEffectiveFrom())
                .effectiveTo(sourcePlan.getEffectiveTo())
                .policyStatus(TariffPolicyStatus.DRAFT)
                .active(false)
                .versionNumber(nextVersion)
                .createdBy(adminEmail)
                .community(adminProfile.getCommunity())
                .build();

        if (sourcePlan.getSlabs() != null) {
            List<TariffSlab> newSlabs = new ArrayList<>();
            for (TariffSlab s : sourcePlan.getSlabs()) {
                newSlabs.add(TariffSlab.builder()
                        .tariffPlan(newPlan)
                        .minUnits(s.getMinUnits())
                        .maxUnits(s.getMaxUnits())
                        .ratePerUnit(s.getRatePerUnit())
                        .build());
            }
            newPlan.setSlabs(newSlabs);
        }

        newPlan = tariffPlanRepository.saveAndFlush(newPlan);
        return mapToResponse(newPlan);
    }

    @Override
    @Transactional
    public void deleteTariffPlan(String adminEmail, Long id) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);

        TariffPlan plan = tariffPlanRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tariff plan not found with ID: " + id));

        if (!plan.getCommunity().getId().equals(adminProfile.getCommunity().getId())) {
            throw new IllegalArgumentException("Unauthorized to delete tariff plan of another community.");
        }

        if (billRepository.existsByTariffPlanId(id)) {
            throw new IllegalStateException("This tariff policy has been used in generated bills and cannot be deleted. You can archive or deactivate it instead.");
        }

        tariffPlanRepository.delete(plan);
    }

    @Override
    public TariffPlanResponse getTariffPlanById(String adminEmail, Long id) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);

        TariffPlan plan = tariffPlanRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tariff plan not found with ID: " + id));

        if (!plan.getCommunity().getId().equals(adminProfile.getCommunity().getId())) {
            throw new IllegalArgumentException("Unauthorized to view tariff plan of another community.");
        }

        return mapToResponse(plan);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TariffPlanResponse> getTariffPlansByCommunity(String adminEmail) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);
        Long communityId = adminProfile.getCommunity().getId();

        List<TariffPlan> plans = tariffPlanRepository.findByCommunityId(communityId);

        return plans.stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public TariffPlanResponse activateTariffPlan(String adminEmail, Long id) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);
        Long communityId = adminProfile.getCommunity().getId();

        TariffPlan plan = tariffPlanRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tariff plan not found with ID: " + id));

        if (!plan.getCommunity().getId().equals(communityId)) {
            throw new IllegalArgumentException("Unauthorized to activate tariff plan of another community.");
        }

        if (plan.getPolicyStatus() == TariffPolicyStatus.ARCHIVED) {
            throw new IllegalStateException("Cannot activate an archived tariff policy.");
        }

        if (plan.getEffectiveTo() != null && plan.getEffectiveTo().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Cannot activate an expired tariff policy.");
        }

        // Deactivate other active plans for this community
        List<TariffPlan> activePlans = tariffPlanRepository.findByCommunityIdAndActiveTrue(communityId);
        for (TariffPlan ap : activePlans) {
            if (!ap.getId().equals(id)) {
                ap.setActive(false);
                ap.setPolicyStatus(TariffPolicyStatus.INACTIVE);
                tariffPlanRepository.save(ap);
            }
        }

        plan.setActive(true);
        plan.setPolicyStatus(TariffPolicyStatus.ACTIVE);
        plan = tariffPlanRepository.saveAndFlush(plan);
        return mapToResponse(plan);
    }

    @Override
    @Transactional
    public TariffPlanResponse deactivateTariffPlan(String adminEmail, Long id) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);
        Long communityId = adminProfile.getCommunity().getId();

        TariffPlan plan = tariffPlanRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tariff plan not found with ID: " + id));

        if (!plan.getCommunity().getId().equals(communityId)) {
            throw new IllegalArgumentException("Unauthorized to deactivate tariff plan of another community.");
        }

        long activeCount = tariffPlanRepository.countByCommunityIdAndActiveTrue(communityId);
        if (activeCount <= 1 && plan.isActive()) {
            throw new IllegalStateException("Cannot deactivate the only active tariff plan. Please activate another policy first to avoid locking out bill generation.");
        }

        plan.setActive(false);
        plan.setPolicyStatus(TariffPolicyStatus.INACTIVE);
        plan = tariffPlanRepository.saveAndFlush(plan);
        return mapToResponse(plan);
    }

    @Override
    @Transactional
    public TariffPlanResponse archiveTariffPlan(String adminEmail, Long id) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);
        Long communityId = adminProfile.getCommunity().getId();

        TariffPlan plan = tariffPlanRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tariff plan not found with ID: " + id));

        if (!plan.getCommunity().getId().equals(communityId)) {
            throw new IllegalArgumentException("Unauthorized to archive tariff plan of another community.");
        }

        if (plan.isActive() || plan.getPolicyStatus() == TariffPolicyStatus.ACTIVE) {
            throw new IllegalStateException("Cannot archive an ACTIVE tariff policy. Please deactivate it or activate another policy first.");
        }

        plan.setActive(false);
        plan.setPolicyStatus(TariffPolicyStatus.ARCHIVED);
        plan = tariffPlanRepository.saveAndFlush(plan);
        return mapToResponse(plan);
    }

    @Override
    @Transactional(readOnly = true)
    public TariffPlanPreviewResponse previewTariffPlan(String adminEmail, Long id, List<Double> sampleUnits) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);

        TariffPlan plan = tariffPlanRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tariff plan not found with ID: " + id));

        if (!plan.getCommunity().getId().equals(adminProfile.getCommunity().getId())) {
            throw new IllegalArgumentException("Unauthorized to preview tariff plan of another community.");
        }

        return generatePreview(plan, sampleUnits);
    }

    @Override
    public TariffPlanPreviewResponse previewUnsavedTariffPlan(String adminEmail, TariffPlanRequest request, List<Double> sampleUnits) {
        validateSlabs(request.getSlabs());

        TariffPlan plan = TariffPlan.builder()
                .name(request.getName() != null ? request.getName().trim() : "Preview Plan")
                .description(request.getDescription())
                .fixedCharge(request.getFixedCharge() != null ? request.getFixedCharge() : BigDecimal.ZERO)
                .ratePerUnit(request.getRatePerUnit())
                .taxRate(request.getTaxRate() != null ? request.getTaxRate() : new BigDecimal("0.05"))
                .maintenanceCharge(request.getMaintenanceCharge())
                .serviceCharge(request.getServiceCharge())
                .build();

        if (request.getSlabs() != null) {
            List<TariffSlab> slabs = new ArrayList<>();
            for (TariffSlabRequest sReq : request.getSlabs()) {
                slabs.add(TariffSlab.builder()
                        .tariffPlan(plan)
                        .minUnits(sReq.getMinUnits())
                        .maxUnits(sReq.getMaxUnits())
                        .ratePerUnit(sReq.getRatePerUnit())
                        .build());
            }
            plan.setSlabs(slabs);
        }

        return generatePreview(plan, sampleUnits);
    }

    private TariffPlanPreviewResponse generatePreview(TariffPlan plan, List<Double> sampleUnits) {
        List<Double> unitsList = (sampleUnits != null && !sampleUnits.isEmpty()) ? sampleUnits : List.of(8.0, 18.0, 35.0);

        BigDecimal fixed = plan.getFixedCharge() != null ? plan.getFixedCharge() : BigDecimal.ZERO;
        BigDecimal maint = plan.getMaintenanceCharge() != null ? plan.getMaintenanceCharge() : BigDecimal.ZERO;
        BigDecimal service = plan.getServiceCharge() != null ? plan.getServiceCharge() : BigDecimal.ZERO;
        BigDecimal additional = maint.add(service);
        BigDecimal taxRate = plan.getTaxRate() != null ? plan.getTaxRate() : new BigDecimal("0.05");

        List<TariffPlanPreviewResponse.PreviewItem> items = new ArrayList<>();

        for (double units : unitsList) {
            BigDecimal waterCharge = billCalculationService.calculateBillAmount(units, plan);
            BigDecimal subtotal = billCalculationService.calculateSubtotal(waterCharge, fixed, additional);
            BigDecimal taxAmount = billCalculationService.calculateTax(subtotal, taxRate);
            BigDecimal totalAmount = billCalculationService.calculateTotalAmount(subtotal, taxAmount);
            String slabBreakdownJson = billCalculationService.calculateSlabBreakdownJson(units, plan);

            items.add(TariffPlanPreviewResponse.PreviewItem.builder()
                    .unitsConsumed(units)
                    .waterCharge(waterCharge)
                    .fixedCharge(fixed)
                    .maintenanceCharge(maint)
                    .serviceCharge(service)
                    .subtotal(subtotal)
                    .taxRate(taxRate)
                    .taxAmount(taxAmount)
                    .totalAmount(totalAmount)
                    .slabBreakdownJson(slabBreakdownJson)
                    .build());
        }

        return TariffPlanPreviewResponse.builder()
                .planId(plan.getId())
                .planName(plan.getName())
                .description(plan.getDescription())
                .fixedCharge(fixed)
                .taxRate(taxRate)
                .previews(items)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public TariffPlan getActiveTariffPlan(Community community) {
        return tariffPlanRepository.findFirstByCommunityIdAndActiveTrue(community.getId())
                .orElseThrow(() -> new IllegalStateException("No active tariff policy found for community: " + community.getCommunityName() + ". Please create and activate a tariff policy before generating bills."));
    }

    private void validateSlabs(List<TariffSlabRequest> slabRequests) {
        if (slabRequests == null || slabRequests.isEmpty()) {
            throw new IllegalArgumentException("Tariff plan must have at least one tariff slab configured.");
        }

        for (TariffSlabRequest current : slabRequests) {
            if (current.getMinUnits() == null) {
                throw new IllegalArgumentException("Minimum units is required for each slab.");
            }
            if (current.getMinUnits() < 0) {
                throw new IllegalArgumentException("Minimum units cannot be negative.");
            }

            if (current.getMaxUnits() != null) {
                if (current.getMaxUnits() < 0) {
                    throw new IllegalArgumentException("Maximum units cannot be negative.");
                }
                if (current.getMaxUnits() <= current.getMinUnits()) {
                    throw new IllegalArgumentException("Maximum units (" + current.getMaxUnits() + ") must be greater than minimum units (" + current.getMinUnits() + ").");
                }
            }

            if (current.getRatePerUnit() == null) {
                throw new IllegalArgumentException("Rate per unit is required for each slab.");
            }
            if (current.getRatePerUnit().compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("Rate per unit cannot be negative.");
            }
        }

        List<TariffSlabRequest> sorted = slabRequests.stream()
                .sorted(Comparator.comparing(TariffSlabRequest::getMinUnits))
                .toList();

        if (sorted.get(0).getMinUnits() != 0.0) {
            throw new IllegalArgumentException("First slab must start at 0 units.");
        }

        for (int i = 0; i < sorted.size(); i++) {
            TariffSlabRequest current = sorted.get(i);

            if (i < sorted.size() - 1) {
                if (current.getMaxUnits() == null) {
                    throw new IllegalArgumentException("Only the last slab can have an unlimited maximum units (null).");
                }
                TariffSlabRequest next = sorted.get(i + 1);
                double currentMax = current.getMaxUnits();
                double nextMin = next.getMinUnits();

                if (nextMin < currentMax) {
                    throw new IllegalArgumentException("Slab overlap detected: Slab ending at " + currentMax + " overlaps with next slab starting at " + nextMin + ".");
                }
                if (nextMin > currentMax) {
                    throw new IllegalArgumentException("Slab gap detected: Continuous ranges required. Slab ending at " + currentMax + " has a gap before next slab starting at " + nextMin + ".");
                }
            } else {
                if (current.getMaxUnits() != null) {
                    throw new IllegalArgumentException("The last slab must have unlimited maximum units (null).");
                }
            }
        }
    }

    private TariffPlanResponse mapToResponse(TariffPlan plan) {
        List<TariffSlabResponse> slabs = null;
        if (plan.getSlabs() != null) {
            slabs = plan.getSlabs().stream()
                    .sorted(Comparator.comparing(TariffSlab::getMinUnits))
                    .map(s -> TariffSlabResponse.builder()
                            .id(s.getId())
                            .minUnits(s.getMinUnits())
                            .maxUnits(s.getMaxUnits())
                            .ratePerUnit(s.getRatePerUnit())
                            .build())
                    .toList();
        }

        boolean usedInBills = false;
        long billsCount = 0;
        LocalDateTime lastUsed = null;

        if (plan.getId() != null) {
            usedInBills = billRepository.existsByTariffPlanId(plan.getId());
            billsCount = billRepository.countByTariffPlanId(plan.getId());
            Optional<Bill> lastBill = billRepository.findTopByTariffPlanIdOrderByCreatedAtDesc(plan.getId());
            if (lastBill.isPresent()) {
                lastUsed = lastBill.get().getCreatedAt();
            }
        }

        TariffPolicyStatus status = plan.getPolicyStatus();
        if (status == null) {
            status = plan.isActive() ? TariffPolicyStatus.ACTIVE : TariffPolicyStatus.DRAFT;
        }

        return TariffPlanResponse.builder()
                .id(plan.getId())
                .name(plan.getName())
                .description(plan.getDescription())
                .ratePerUnit(plan.getRatePerUnit())
                .fixedCharge(plan.getFixedCharge())
                .taxRate(plan.getTaxRate())
                .maintenanceCharge(plan.getMaintenanceCharge())
                .serviceCharge(plan.getServiceCharge())
                .effectiveFrom(plan.getEffectiveFrom())
                .effectiveTo(plan.getEffectiveTo())
                .active(plan.isActive())
                .policyStatus(status)
                .versionNumber(plan.getVersionNumber() != null ? plan.getVersionNumber() : 1)
                .createdBy(plan.getCreatedBy() != null ? plan.getCreatedBy() : "System Admin")
                .createdAt(plan.getCreatedAt())
                .updatedAt(plan.getUpdatedAt())
                .usedInBills(usedInBills)
                .billsCount(billsCount)
                .lastUsed(lastUsed)
                .slabs(slabs)
                .build();
    }
}
