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
                .orElseThrow(() -> new RuntimeException("Tariff plan not found"));

        List<ResidentProfile> residents = residentProfileRepository.findAll().stream()
                .filter(resident -> resident.isActive() && Objects.equals(resident.getCommunity().getId(), adminProfile.getCommunity().getId()))
                .toList();

        // Check if any bills already exist for this billing cycle for any household in this community
        boolean duplicateExists = residents.stream()
                .anyMatch(resident -> billRepository.existsByResidentProfileIdAndBillingCycleId(resident.getId(), request.getBillingCycleId()));
        if (duplicateExists) {
            throw new IllegalArgumentException("Bills have already been generated for this cycle. Delete existing bills first to regenerate.");
        }

        List<Bill> created = new ArrayList<>();
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

            BigDecimal variableCharge = calculateVariableCharge(unitsConsumed, plan);
            BigDecimal fixed = plan.getFixedCharge() != null ? plan.getFixedCharge() : BigDecimal.ZERO;
            
            SharedCostDistribution dist = calculateSharedCostForResident(resident, cycle.getId());
            BigDecimal totalAmount = fixed.add(variableCharge).add(dist.sharedCost);

            String billNum = billNumberGenerator.generateBillNumber(adminProfile.getCommunity(), today);

            Bill bill = Bill.builder()
                    .billNumber(billNum)
                    .residentProfile(resident)
                    .waterMeter(meterOpt.orElse(null))
                    .billingCycle(cycle)
                    .tariffPlan(plan)
                    .billingMonth(month)
                    .billingYear(year)
                    .previousReading(previousReading)
                    .currentReading(currentReading)
                    .unitsConsumed(unitsConsumed)
                    .ratePerUnit(plan.getRatePerUnit())
                    .fixedCharge(fixed)
                    .additionalCharge(BigDecimal.ZERO)
                    .sharedWaterCost(dist.sharedCost)
                    .distributionStrategy(dist.strategy)
                    .subtotal(variableCharge)
                    .tax(BigDecimal.ZERO)
                    .amount(totalAmount)
                    .totalAmount(totalAmount)
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
            created.add(savedBill);
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
        if (plan.getSlabs() == null || plan.getSlabs().isEmpty()) {
            BigDecimal rate = plan.getRatePerUnit() != null ? plan.getRatePerUnit() : BigDecimal.ZERO;
            return rate.multiply(BigDecimal.valueOf(totalUnits));
        }

        BigDecimal variableCharge = BigDecimal.ZERO;
        List<com.water.monitoring_and_billing_platform.entity.TariffSlab> slabs = plan.getSlabs().stream()
                .sorted(java.util.Comparator.comparing(com.water.monitoring_and_billing_platform.entity.TariffSlab::getMinUnits))
                .toList();

        for (com.water.monitoring_and_billing_platform.entity.TariffSlab slab : slabs) {
            if (totalUnits <= slab.getMinUnits()) {
                break;
            }
            double slabMin = slab.getMinUnits();
            double slabMax = slab.getMaxUnits() != null ? slab.getMaxUnits() : Double.MAX_VALUE;
            double unitsInSlab = Math.min(totalUnits - slabMin, slabMax - slabMin);
            if (unitsInSlab > 0) {
                variableCharge = variableCharge.add(slab.getRatePerUnit().multiply(BigDecimal.valueOf(unitsInSlab)));
            }
        }
        return variableCharge;
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
        getAdminProfile(adminEmail);
        return tariffPlanRepository.findByActiveTrue().stream().map(this::mapToResponse).toList();
    }

    @Override
    @Transactional
    public BillResponse generateBillForReading(WaterUsage usage) {
        BillingCycle cycle = billingCycleRepository.findFirstByActiveTrueOrderByPeriodStartDesc()
                .orElseThrow(() -> new RuntimeException("No active billing cycle"));
        TariffPlan plan = tariffPlanRepository.findByActiveTrue().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("No active tariff plan"));

        ResidentProfile resident = usage.getWaterMeter().getResidentProfile();
        SharedCostDistribution dist = calculateSharedCostForResident(resident, cycle.getId());

        BigDecimal amount = plan.getFixedCharge().add(plan.getRatePerUnit().multiply(BigDecimal.valueOf(usage.getUnitsConsumed()))).add(dist.sharedCost);

        Bill bill = Bill.builder()
                .residentProfile(resident)
                .waterMeter(usage.getWaterMeter())
                .billingCycle(cycle)
                .tariffPlan(plan)
                .unitsConsumed(usage.getUnitsConsumed())
                .ratePerUnit(plan.getRatePerUnit())
                .fixedCharge(plan.getFixedCharge())
                .sharedWaterCost(dist.sharedCost)
                .distributionStrategy(dist.strategy)
                .amount(amount)
                .totalAmount(amount)
                .billDate(LocalDate.now())
                .status(com.water.monitoring_and_billing_platform.enums.BillStatus.UNPAID)
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
        return billRepository.findAll().stream()
                .filter(b -> Objects.equals(b.getResidentProfile().getId(), profile.getId()))
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
        return TariffPlanResponse.builder()
                .id(plan.getId())
                .name(plan.getName())
                .ratePerUnit(plan.getRatePerUnit())
                .fixedCharge(plan.getFixedCharge())
                .active(plan.isActive())
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
