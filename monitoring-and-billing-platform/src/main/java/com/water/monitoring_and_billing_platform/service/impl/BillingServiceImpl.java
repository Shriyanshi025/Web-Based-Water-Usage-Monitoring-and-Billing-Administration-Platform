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
        TariffPlan plan = tariffPlanRepository.findById(request.getTariffPlanId())
                .orElseThrow(() -> new RuntimeException("Tariff plan not found"));

        List<ResidentProfile> residents = residentProfileRepository.findAll().stream()
                .filter(resident -> resident.isActive() && Objects.equals(resident.getCommunity().getId(), adminProfile.getCommunity().getId()))
                .toList();

        List<Bill> created = new ArrayList<>();
        for (ResidentProfile resident : residents) {
            Double unitsConsumed = 0.0;
            BigDecimal amount = plan.getFixedCharge().add(plan.getRatePerUnit().multiply(BigDecimal.valueOf(unitsConsumed)));
            Bill bill = Bill.builder()
                    .residentProfile(resident)
                    .billingCycle(cycle)
                    .tariffPlan(plan)
                    .unitsConsumed(unitsConsumed)
                    .amount(amount)
                    .billDate(LocalDate.now())
                    .status(com.water.monitoring_and_billing_platform.enums.BillStatus.UNPAID)
                    .build();
            created.add(billRepository.save(bill));
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

        BigDecimal amount = plan.getFixedCharge().add(plan.getRatePerUnit().multiply(BigDecimal.valueOf(usage.getUnitsConsumed())));

        Bill bill = Bill.builder()
                .residentProfile(usage.getWaterMeter().getResidentProfile())
                .billingCycle(cycle)
                .tariffPlan(plan)
                .unitsConsumed(usage.getUnitsConsumed())
                .amount(amount)
                .billDate(LocalDate.now())
                .status(com.water.monitoring_and_billing_platform.enums.BillStatus.UNPAID)
                .build();

        return mapToResponse(billRepository.save(bill));
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
        
        activityLogRepository.save(com.water.monitoring_and_billing_platform.entity.ActivityLog.builder()
                .title("Bill Paid")
                .description("Bill #" + bill.getId() + " paid successfully by " + user.getFullName())
                .timestamp(java.time.LocalDateTime.now())
                .icon("Payment")
                .color("success.main")
                .community(profile.getCommunity())
                .user(user)
                .build());
                
        return mapToResponse(billRepository.save(bill));
    }

    private BillResponse mapToResponse(Bill bill) {
        return BillResponse.builder()
                .id(bill.getId())
                .residentProfileId(bill.getResidentProfile().getId())
                .residentName(bill.getResidentProfile().getUser().getFullName())
                .unitNumber(bill.getResidentProfile().getUnit().getUnitNumber())
                .billingCycleId(bill.getBillingCycle().getId())
                .billingCycleName(bill.getBillingCycle().getName())
                .tariffPlanId(bill.getTariffPlan().getId())
                .tariffPlanName(bill.getTariffPlan().getName())
                .unitsConsumed(bill.getUnitsConsumed())
                .amount(bill.getAmount())
                .billDate(bill.getBillDate())
                .status(bill.getStatus().name())
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
}
