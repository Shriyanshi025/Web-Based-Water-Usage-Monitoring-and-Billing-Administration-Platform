package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.dto.BillResponse;
import com.water.monitoring_and_billing_platform.dto.BillingCycleResponse;
import com.water.monitoring_and_billing_platform.dto.GenerateBillRequest;
import com.water.monitoring_and_billing_platform.dto.TariffPlanResponse;
import com.water.monitoring_and_billing_platform.entity.*;
import com.water.monitoring_and_billing_platform.repository.*;
import com.water.monitoring_and_billing_platform.service.BillingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class BillingServiceImpl implements BillingService {

    private final BillRepository billRepository;
    private final BillingCycleRepository billingCycleRepository;
    private final TariffPlanRepository tariffPlanRepository;
    private final ResidentProfileRepository residentProfileRepository;
    private final CommunityAdminProfileRepository communityAdminProfileRepository;
    private final UserRepository userRepository;
    private final com.water.monitoring_and_billing_platform.repository.ActivityLogRepository activityLogRepository;
    private final WaterMeterRepository waterMeterRepository;
    private final WaterUsageRepository waterUsageRepository;
    private final com.water.monitoring_and_billing_platform.service.BillNumberGenerator billNumberGenerator;
    private final BulkWaterPurchaseRepository bulkWaterPurchaseRepository;
    private final com.water.monitoring_and_billing_platform.service.InvoiceService invoiceService;
    private final com.water.monitoring_and_billing_platform.service.AlertService alertService;
    private final com.water.monitoring_and_billing_platform.service.EmailNotificationService emailNotificationService;
    private final com.water.monitoring_and_billing_platform.service.BillCalculationService billCalculationService;
    private final com.water.monitoring_and_billing_platform.service.ConsumptionCostDistributionService consumptionCostDistributionService;

    private CommunityAdminProfile getAdminProfile(String adminEmail) {
        User user = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return communityAdminProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Community admin profile not found"));
    }

    @Override
    public List<BillResponse> getBills(String adminEmail) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);
        return billRepository.findAll().stream()
                .filter(bill -> Objects.equals(bill.getResidentProfile().getCommunity().getId(), adminProfile.getCommunity().getId()))
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public BillResponse getBillById(String adminEmail, Long billId) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);
        Bill bill = billRepository.findById(billId).orElseThrow(() -> new RuntimeException("Bill not found"));
        if (!Objects.equals(bill.getResidentProfile().getCommunity().getId(), adminProfile.getCommunity().getId())) {
            throw new RuntimeException("Bill not found");
        }
        return mapToResponse(bill);
    }

    @Override
    @Transactional
    public List<BillResponse> generateBills(String adminEmail, GenerateBillRequest request) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);
        BillingCycle cycle = billingCycleRepository.findById(request.getBillingCycleId())
                .orElseThrow(() -> new RuntimeException("Billing cycle not found"));
        
        if (!cycle.isActive()) {
            throw new IllegalArgumentException("The billing cycle is not active.");
        }

        TariffPlan plan = tariffPlanRepository.findById(request.getTariffPlanId())
                .orElseThrow(() -> new IllegalArgumentException("Tariff plan not found"));

        if (!plan.getCommunity().getId().equals(adminProfile.getCommunity().getId())) {
            throw new IllegalArgumentException("Selected tariff plan does not belong to your community.");
        }

        if (!plan.isActive()) {
            throw new IllegalArgumentException("The selected tariff plan is inactive. Only active tariff plans can be selected for billing.");
        }

        List<ResidentProfile> residents = residentProfileRepository.findAll().stream()
                .filter(resident -> resident.isActive() && Objects.equals(resident.getCommunity().getId(), adminProfile.getCommunity().getId()))
                .toList();

        // Check if any bills already exist for this billing cycle for any household in this community
        boolean duplicateExists = residents.stream()
                .anyMatch(resident -> billRepository.existsByResidentProfileIdAndBillingCycleId(resident.getId(), request.getBillingCycleId()));
        if (duplicateExists) {
            throw new IllegalArgumentException("Bills have already been generated for this cycle. Delete existing bills first to regenerate.");
        }

        // 1. Bulk Water Purchase Missing Check & Alert
        List<BulkWaterPurchase> purchases = bulkWaterPurchaseRepository.findByBillingCycleIdAndCommunityId(
                request.getBillingCycleId(),
                adminProfile.getCommunity().getId()
        );
        if (purchases.isEmpty()) {
            alertService.createInAppNotification(
                    adminProfile.getUser(),
                    null,
                    adminProfile.getCommunity(),
                    "Bulk Water Purchase Missing",
                    "No bulk water purchase records were found for the cycle: " + cycle.getName() + ". Proportional cost distribution will calculate as ₹0.00.",
                    com.water.monitoring_and_billing_platform.enums.AlertType.BULK_WATER_PURCHASE_MISSING,
                    com.water.monitoring_and_billing_platform.enums.AlertSeverity.HIGH,
                    null
            );
        }

        List<Bill> created = new ArrayList<>();
        try {
            LocalDate today = LocalDate.now();
            int month = cycle.getPeriodStart().getMonthValue();
            int year = cycle.getPeriodStart().getYear();

            for (ResidentProfile resident : residents) {
                if (billRepository.existsByResidentProfileIdAndBillingCycleId(resident.getId(), request.getBillingCycleId())) {
                    continue;
                }
                Double unitsConsumed = 0.0;
                Double previousReading = 0.0;
                Double currentReading = 0.0;

                var meterOpt = waterMeterRepository.findByResidentProfileId(resident.getId());
                if (meterOpt.isPresent()) {
                    WaterMeter meter = meterOpt.get();
                    List<WaterUsage> usages = waterUsageRepository.findByWaterMeterIdAndReadingDateBetween(
                            meter.getId(),
                            cycle.getPeriodStart(),
                            cycle.getPeriodEnd()
                    );

                    unitsConsumed = usages.stream()
                            .mapToDouble(WaterUsage::getUnitsConsumed)
                            .sum();

                    if (!usages.isEmpty()) {
                        List<WaterUsage> sortedUsages = usages.stream()
                                .sorted(java.util.Comparator.comparing(WaterUsage::getReadingDate).thenComparing(WaterUsage::getId))
                                .toList();
                        previousReading = sortedUsages.get(0).getPreviousReading();
                        currentReading = sortedUsages.get(sortedUsages.size() - 1).getCurrentReading();
                    } else {
                        previousReading = meter.getCurrentReading();
                        currentReading = meter.getCurrentReading();
                    }
                }

                // Call billing engine for base usage cost
                BigDecimal variableCharge = calculateVariableCharge(unitsConsumed, plan);
                BigDecimal fixed = plan.getFixedCharge() != null ? plan.getFixedCharge() : BigDecimal.ZERO;
                BigDecimal maintenance = plan.getMaintenanceCharge() != null ? plan.getMaintenanceCharge() : BigDecimal.ZERO;
                BigDecimal service = plan.getServiceCharge() != null ? plan.getServiceCharge() : BigDecimal.ZERO;
                BigDecimal additionalCharge = maintenance.add(service);
                BigDecimal effectiveTaxRate = plan.getTaxRate() != null ? plan.getTaxRate() : new BigDecimal("0.05");

                // Reusable Consumption Cost Distribution calculation for shared bulk water cost
                SharedCostDistribution sharedCostDist = calculateSharedCostForResident(resident, cycle.getId());

                BigDecimal slabSubtotal = fixed.add(variableCharge).add(additionalCharge);
                BigDecimal tax = slabSubtotal.multiply(effectiveTaxRate).setScale(2, java.math.RoundingMode.HALF_UP);
                BigDecimal totalAmount = slabSubtotal.add(tax).add(sharedCostDist.sharedCost);

                String slabBreakdown = billCalculationService.calculateSlabBreakdownJson(unitsConsumed, plan);

                String billNum = billNumberGenerator.generateBillNumber(adminProfile.getCommunity(), today);

                Bill bill = Bill.builder()
                        .billNumber(billNum)
                        .residentProfile(resident)
                        .waterMeter(meterOpt.orElse(null))
                        .billingCycle(cycle)
                        .tariffPlan(plan)
                        .tariffPlanName(plan.getName())
                        .tariffPlanDescription(plan.getDescription())
                        .taxRate(effectiveTaxRate)
                        .billingMonth(month)
                        .billingYear(year)
                        .previousReading(previousReading)
                        .currentReading(currentReading)
                        .unitsConsumed(unitsConsumed)
                        .ratePerUnit(plan.getRatePerUnit())
                        .fixedCharge(fixed)
                        .additionalCharge(additionalCharge)
                        .sharedWaterCost(sharedCostDist.sharedCost)
                        .distributionStrategy(sharedCostDist.strategy)
                        .subtotal(slabSubtotal)
                        .tax(tax)
                        .amount(totalAmount)
                        .totalAmount(totalAmount)
                        .slabBreakdown(slabBreakdown)
                        .billDate(today)
                        .generatedDate(today)
                        .dueDate(today.plusDays(15))
                        .status(com.water.monitoring_and_billing_platform.enums.BillStatus.UNPAID)
                        .billStatus("UNPAID")
                        .paymentStatus("UNPAID")
                        .paid(false)
                        .build();

                Bill savedBill = billRepository.save(bill);
                invoiceService.generateInvoice(savedBill);
                alertService.createInAppNotification(
                        resident.getUser(),
                        resident,
                        resident.getCommunity(),
                        "New Bill Generated",
                        "A new bill of Rs. " + savedBill.getTotalAmount() + " has been generated for cycle: " + cycle.getName(),
                        com.water.monitoring_and_billing_platform.enums.AlertType.BILL_GENERATED,
                        com.water.monitoring_and_billing_platform.enums.AlertSeverity.LOW,
                        savedBill.getId()
                );
                try {
                    emailNotificationService.sendBillGeneratedEmail(
                            resident.getUser().getEmail(),
                            resident.getUser().getFullName(),
                            savedBill.getBillNumber(),
                            cycle.getName(),
                            savedBill.getUnitsConsumed(),
                            savedBill.getTotalAmount(),
                            savedBill.getDueDate()
                    );
                } catch (Exception ex) {
                    log.error("Failed to send bill generated email: {}", ex.getMessage());
                }
                created.add(savedBill);
            }

            // 2. Bill Generation Completed Notification (Community Admin)
            alertService.createInAppNotification(
                    adminProfile.getUser(),
                    null,
                    adminProfile.getCommunity(),
                    "Bill Generation Completed",
                    "Bills have been generated successfully for " + created.size() + " households for cycle: " + cycle.getName(),
                    com.water.monitoring_and_billing_platform.enums.AlertType.BILL_GENERATED,
                    com.water.monitoring_and_billing_platform.enums.AlertSeverity.LOW,
                    null
            );

        } catch (Exception e) {
            // 3. Billing Failure Alert (Community Admin)
            alertService.createInAppNotification(
                    adminProfile.getUser(),
                    null,
                    adminProfile.getCommunity(),
                    "Billing Generation Failure",
                    "An error occurred during billing cycle " + cycle.getName() + " calculation: " + e.getMessage(),
                    com.water.monitoring_and_billing_platform.enums.AlertType.BILLING_FAILURE,
                    com.water.monitoring_and_billing_platform.enums.AlertSeverity.HIGH,
                    null
            );
            throw e;
        }

        activityLogRepository.save(com.water.monitoring_and_billing_platform.entity.ActivityLog.builder()
                .title("Bills Generated")
                .description("Generated " + created.size() + " bills for cycle: " + cycle.getName())
                .timestamp(java.time.LocalDateTime.now())
                .icon("Receipt")
                .color("info.main")
                .community(adminProfile.getCommunity())
                .user(adminProfile.getUser())
                .build());

        return created.stream().map(this::mapToResponse).toList();
    }

    private BigDecimal calculateVariableCharge(double totalUnits, TariffPlan plan) {
        return billCalculationService.calculateBillAmount(totalUnits, plan);
    }

    @Override
    @Transactional
    public void deleteBillsForCycle(String adminEmail, Long billingCycleId) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);
        List<Bill> bills = billRepository.findByResidentProfileCommunityIdAndBillingCycleId(adminProfile.getCommunity().getId(), billingCycleId);
        billRepository.deleteAll(bills);
    }

    @Override
    public BillingCycleResponse getActiveBillingCycle(String adminEmail) {
        getAdminProfile(adminEmail);
        BillingCycle cycle = billingCycleRepository.findFirstByActiveTrueOrderByPeriodStartDesc().orElseGet(() -> BillingCycle.builder()
                .id(0L)
                .name("No Active Cycle")
                .active(false)
                .build());
        return mapToResponse(cycle);
    }

    @Override
    public List<TariffPlanResponse> getTariffPlans(String adminEmail) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);
        return tariffPlanRepository.findByCommunityIdAndActiveTrue(adminProfile.getCommunity().getId()).stream().map(this::mapToResponse).toList();
    }

    @Override
    @Transactional
    public BillResponse generateBillForReading(WaterUsage usage) {
        BillingCycle cycle = billingCycleRepository.findFirstByActiveTrueOrderByPeriodStartDesc()
                .orElseThrow(() -> new RuntimeException("No active billing cycle"));

        ResidentProfile resident = usage.getWaterMeter().getResidentProfile();
        Community community = resident.getCommunity();

        TariffPlan plan = tariffPlanRepository.findFirstByCommunityIdAndActiveTrue(community.getId())
                .orElseThrow(() -> new IllegalStateException("No active tariff plan found for community: " + community.getCommunityName() + ". Please create and activate a tariff plan before generating bills."));

        SharedCostDistribution dist = calculateSharedCostForResident(resident, cycle.getId());

        BigDecimal variableCharge = calculateVariableCharge(usage.getUnitsConsumed(), plan);
        BigDecimal fixed = plan.getFixedCharge() != null ? plan.getFixedCharge() : BigDecimal.ZERO;
        BigDecimal subtotal = fixed.add(variableCharge);
        BigDecimal taxRate = plan.getTaxRate() != null ? plan.getTaxRate() : new BigDecimal("0.05");
        BigDecimal tax = subtotal.multiply(taxRate).setScale(2, java.math.RoundingMode.HALF_UP);
        BigDecimal totalAmount = subtotal.add(tax).add(dist.sharedCost).setScale(2, java.math.RoundingMode.HALF_UP);

        String slabBreakdown = billCalculationService.calculateSlabBreakdownJson(usage.getUnitsConsumed(), plan);
        String billNum = billNumberGenerator.generateBillNumber(community, LocalDate.now());

        Bill bill = Bill.builder()
                .billNumber(billNum)
                .residentProfile(resident)
                .waterMeter(usage.getWaterMeter())
                .billingCycle(cycle)
                .tariffPlan(plan)
                .tariffPlanName(plan.getName())
                .tariffPlanDescription(plan.getDescription())
                .taxRate(taxRate)
                .unitsConsumed(usage.getUnitsConsumed())
                .ratePerUnit(plan.getRatePerUnit())
                .fixedCharge(fixed)
                .additionalCharge(BigDecimal.ZERO)
                .sharedWaterCost(dist.sharedCost)
                .distributionStrategy(dist.strategy)
                .subtotal(subtotal)
                .tax(tax)
                .amount(totalAmount)
                .totalAmount(totalAmount)
                .slabBreakdown(slabBreakdown)
                .billDate(LocalDate.now())
                .generatedDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(15))
                .status(com.water.monitoring_and_billing_platform.enums.BillStatus.UNPAID)
                .billStatus("UNPAID")
                .paymentStatus("UNPAID")
                .paid(false)
                .build();

        Bill savedBill = billRepository.save(bill);
        invoiceService.generateInvoice(savedBill);
        alertService.createInAppNotification(
                resident.getUser(),
                resident,
                resident.getCommunity(),
                "New Bill Generated",
                "A new bill of Rs. " + savedBill.getTotalAmount() + " has been generated.",
                com.water.monitoring_and_billing_platform.enums.AlertType.BILL_GENERATED,
                com.water.monitoring_and_billing_platform.enums.AlertSeverity.LOW,
                savedBill.getId()
        );
        return mapToResponse(savedBill);
    }

    @Override
    public List<BillResponse> getMyBills(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow(() -> new RuntimeException("User not found"));
        ResidentProfile profile = residentProfileRepository.findByUserId(user.getId()).orElseThrow(() -> new RuntimeException("Profile not found"));
        return billRepository.findByResidentProfileId(profile.getId()).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public BillResponse getMyBillById(String userEmail, Long billId) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        ResidentProfile profile = residentProfileRepository.findByUserId(user.getId()).orElseThrow();
        Bill bill = billRepository.findById(billId).orElseThrow(() -> new RuntimeException("Bill not found"));
        if (!Objects.equals(bill.getResidentProfile().getId(), profile.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        return mapToResponse(bill);
    }

    @Override
    @Transactional
    public BillResponse payMyBill(String userEmail, Long billId) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        ResidentProfile profile = residentProfileRepository.findByUserId(user.getId()).orElseThrow();
        Bill bill = billRepository.findById(billId).orElseThrow(() -> new RuntimeException("Bill not found"));
        if (!Objects.equals(bill.getResidentProfile().getId(), profile.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        bill.setStatus(com.water.monitoring_and_billing_platform.enums.BillStatus.PAID);
        Bill savedBill = billRepository.save(bill);

        alertService.createInAppNotification(
                user,
                profile,
                profile.getCommunity(),
                "Bill Paid Successfully",
                "Your payment of Rs. " + savedBill.getTotalAmount() + " for Bill #" + savedBill.getId() + " has been successfully processed.",
                com.water.monitoring_and_billing_platform.enums.AlertType.PAYMENT_SUCCESS,
                com.water.monitoring_and_billing_platform.enums.AlertSeverity.LOW,
                savedBill.getId()
        );
        
        activityLogRepository.save(com.water.monitoring_and_billing_platform.entity.ActivityLog.builder()
                .title("Bill Paid")
                .description("Bill #" + bill.getId() + " paid successfully by " + user.getFullName())
                .timestamp(java.time.LocalDateTime.now())
                .icon("Payment")
                .color("success.main")
                .community(profile.getCommunity())
                .user(user)
                .build());
                
        return mapToResponse(savedBill);
    }

    private BillResponse mapToResponse(Bill bill) {
        return BillResponse.builder()
                .id(bill.getId())
                .billNumber(bill.getBillNumber())
                .residentProfileId(bill.getResidentProfile().getId())
                .residentName(bill.getResidentProfile().getUser().getFullName())
                .unitNumber(bill.getResidentProfile().getUnit().getUnitNumber())
                .billingCycleId(bill.getBillingCycle().getId())
                .billingCycleName(bill.getBillingCycle().getName())
                .billingMonth(bill.getBillingMonth())
                .billingYear(bill.getBillingYear())
                .tariffPlanId(bill.getTariffPlan().getId())
                .tariffPlanName(bill.getTariffPlan().getName())
                .unitsConsumed(bill.getUnitsConsumed())
                .previousReading(bill.getPreviousReading())
                .currentReading(bill.getCurrentReading())
                .ratePerUnit(bill.getRatePerUnit())
                .fixedCharge(bill.getFixedCharge())
                .additionalCharge(bill.getAdditionalCharge())
                .subtotal(bill.getSubtotal())
                .tax(bill.getTax())
                .taxRate(bill.getTariffPlan() != null ? bill.getTariffPlan().getTaxRate() : null)
                .amount(bill.getAmount())
                .totalAmount(bill.getTotalAmount())
                .sharedWaterCost(bill.getSharedWaterCost())
                .distributionStrategy(bill.getDistributionStrategy())
                .billDate(bill.getBillDate())
                .generatedDate(bill.getGeneratedDate())
                .dueDate(bill.getDueDate())
                .status(bill.getStatus() != null ? bill.getStatus().name() : null)
                .billStatus(bill.getBillStatus())
                .paymentStatus(bill.getPaymentStatus())
                .slabBreakdown(bill.getSlabBreakdown())
                .remarks(bill.getRemarks())
                .build();
    }

    private BillingCycleResponse mapToResponse(BillingCycle cycle) {
        return BillingCycleResponse.builder()
                .id(cycle.getId())
                .name(cycle.getName())
                .periodStart(cycle.getPeriodStart())
                .periodEnd(cycle.getPeriodEnd())
                .active(cycle.isActive())
                .generatedAt(cycle.getGeneratedAt())
                .build();
    }

    private TariffPlanResponse mapToResponse(TariffPlan plan) {
        List<com.water.monitoring_and_billing_platform.dto.TariffSlabResponse> slabs = null;
        if (plan.getSlabs() != null) {
            slabs = plan.getSlabs().stream()
                    .sorted(java.util.Comparator.comparing(TariffSlab::getMinUnits))
                    .map(s -> com.water.monitoring_and_billing_platform.dto.TariffSlabResponse.builder()
                            .id(s.getId())
                            .minUnits(s.getMinUnits())
                            .maxUnits(s.getMaxUnits())
                            .ratePerUnit(s.getRatePerUnit())
                            .build())
                    .toList();
        }

        return TariffPlanResponse.builder()
                .id(plan.getId())
                .name(plan.getName())
                .ratePerUnit(plan.getRatePerUnit())
                .fixedCharge(plan.getFixedCharge())
                .taxRate(plan.getTaxRate())
                .maintenanceCharge(plan.getMaintenanceCharge())
                .serviceCharge(plan.getServiceCharge())
                .active(plan.isActive())
                .slabs(slabs)
                .build();
    }

    public static class SharedCostDistribution {
        public BigDecimal sharedCost = BigDecimal.ZERO;
        public String strategy = "EQUAL";
    }

    public SharedCostDistribution calculateSharedCostForResident(
            ResidentProfile resident,
            Long billingCycleId
    ) {
        SharedCostDistribution dist = new SharedCostDistribution();
        dist.sharedCost = BigDecimal.ZERO;
        dist.strategy = "EQUAL";

        if (resident == null || billingCycleId == null) {
            return dist;
        }

        try {
            com.water.monitoring_and_billing_platform.dto.ConsumptionCostDistributionResponse consDist =
                    consumptionCostDistributionService.calculateDistribution(
                            resident.getCommunity().getId(),
                            billingCycleId
                    );

            if (consDist.getTotalCommunityConsumption() > 0.0) {
                dist.strategy = "CONSUMPTION";
                dist.sharedCost = consDist.getDistributions().stream()
                        .filter(d -> d.getResidentProfileId().equals(resident.getId()))
                        .map(com.water.monitoring_and_billing_platform.dto.HouseholdCostDistributionResponse::getDistributedCost)
                        .findFirst()
                        .orElse(BigDecimal.ZERO);
                return dist;
            }
        } catch (Exception e) {
            // Ignore and fallback to legacy strategies
        }

        List<BulkWaterPurchase> purchases = bulkWaterPurchaseRepository.findByBillingCycleIdAndCommunityId(
                billingCycleId,
                resident.getCommunity().getId()
        );

        if (purchases.isEmpty()) {
            return dist;
        }

        BigDecimal totalCost = purchases.stream()
                .map(BulkWaterPurchase::getTotalCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalCost.compareTo(BigDecimal.ZERO) <= 0) {
            return dist;
        }

        List<ResidentProfile> communityResidents = residentProfileRepository.findByCommunityIdAndActiveTrue(resident.getCommunity().getId());
        if (communityResidents.isEmpty()) {
            return dist;
        }

        boolean hasOccupancy = communityResidents.stream()
                .allMatch(r -> r.getUnit() != null && r.getUnit().getOccupancy() != null && r.getUnit().getOccupancy() > 0);

        boolean hasArea = communityResidents.stream()
                .allMatch(r -> r.getUnit() != null && r.getUnit().getArea() != null && r.getUnit().getArea() > 0.0);

        if (hasOccupancy) {
            dist.strategy = "PROPORTIONAL_OCCUPANCY";
            double totalOccupancy = communityResidents.stream()
                    .map(r -> r.getUnit().getOccupancy())
                    .filter(Objects::nonNull)
                    .mapToDouble(Integer::doubleValue)
                    .sum();
            
            if (totalOccupancy > 0) {
                double residentOccupancy = (resident.getUnit() != null && resident.getUnit().getOccupancy() != null) ? resident.getUnit().getOccupancy() : 0.0;
                dist.sharedCost = totalCost.multiply(BigDecimal.valueOf(residentOccupancy))
                        .divide(BigDecimal.valueOf(totalOccupancy), 2, java.math.RoundingMode.HALF_UP);
            }
        } else if (hasArea) {
            dist.strategy = "PROPORTIONAL_AREA";
            double totalArea = communityResidents.stream()
                    .map(r -> r.getUnit().getArea())
                    .filter(Objects::nonNull)
                    .mapToDouble(Double::doubleValue)
                    .sum();

            if (totalArea > 0) {
                double residentArea = (resident.getUnit() != null && resident.getUnit().getArea() != null) ? resident.getUnit().getArea() : 0.0;
                dist.sharedCost = totalCost.multiply(BigDecimal.valueOf(residentArea))
                        .divide(BigDecimal.valueOf(totalArea), 2, java.math.RoundingMode.HALF_UP);
            }
        } else {
            dist.strategy = "EQUAL";
            dist.sharedCost = totalCost.divide(BigDecimal.valueOf(communityResidents.size()), 2, java.math.RoundingMode.HALF_UP);
        }

        return dist;
    }
}
