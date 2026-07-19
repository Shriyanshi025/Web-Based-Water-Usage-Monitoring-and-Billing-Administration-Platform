package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.dto.TariffPlanRequest;
import com.water.monitoring_and_billing_platform.dto.TariffPlanResponse;
import com.water.monitoring_and_billing_platform.dto.TariffSlabRequest;
import com.water.monitoring_and_billing_platform.dto.TariffSlabResponse;
import com.water.monitoring_and_billing_platform.entity.Community;
import com.water.monitoring_and_billing_platform.entity.CommunityAdminProfile;
import com.water.monitoring_and_billing_platform.entity.TariffPlan;
import com.water.monitoring_and_billing_platform.entity.TariffSlab;
import com.water.monitoring_and_billing_platform.entity.User;
import com.water.monitoring_and_billing_platform.exception.UserNotFoundException;
import com.water.monitoring_and_billing_platform.repository.BillRepository;
import com.water.monitoring_and_billing_platform.repository.CommunityAdminProfileRepository;
import com.water.monitoring_and_billing_platform.repository.TariffPlanRepository;
import com.water.monitoring_and_billing_platform.repository.UserRepository;
import com.water.monitoring_and_billing_platform.service.TariffPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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
        validateSlabs(request.getSlabs());

        TariffPlan plan = TariffPlan.builder()
                .name(request.getName())
                .fixedCharge(request.getFixedCharge())
                .ratePerUnit(request.getRatePerUnit())
                .community(adminProfile.getCommunity())
                .active(false)
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

        plan = tariffPlanRepository.save(plan);
        return mapToResponse(plan);
    }

    @Override
    @Transactional
    public TariffPlanResponse updateTariffPlan(String adminEmail, Long id, TariffPlanRequest request) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);

        TariffPlan plan = tariffPlanRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tariff plan not found."));

        if (!plan.getCommunity().getId().equals(adminProfile.getCommunity().getId())) {
            throw new IllegalArgumentException("Unauthorized to modify tariff plan of another community.");
        }

        if (billRepository.existsByTariffPlanId(id)) {
            throw new IllegalStateException("Tariff plan is already used for billing and cannot be modified.");
        }

        validateSlabs(request.getSlabs());

        plan.setName(request.getName());
        plan.setFixedCharge(request.getFixedCharge());
        plan.setRatePerUnit(request.getRatePerUnit());

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

        plan = tariffPlanRepository.save(plan);
        return mapToResponse(plan);
    }

    @Override
    @Transactional
    public void deleteTariffPlan(String adminEmail, Long id) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);

        TariffPlan plan = tariffPlanRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tariff plan not found."));

        if (!plan.getCommunity().getId().equals(adminProfile.getCommunity().getId())) {
            throw new IllegalArgumentException("Unauthorized to delete tariff plan of another community.");
        }

        if (billRepository.existsByTariffPlanId(id)) {
            throw new IllegalStateException("Tariff plan is already used for billing and cannot be deleted.");
        }

        tariffPlanRepository.delete(plan);
    }

    @Override
    public TariffPlanResponse getTariffPlanById(String adminEmail, Long id) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);

        TariffPlan plan = tariffPlanRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tariff plan not found."));

        if (!plan.getCommunity().getId().equals(adminProfile.getCommunity().getId())) {
            throw new IllegalArgumentException("Unauthorized to view tariff plan of another community.");
        }

        return mapToResponse(plan);
    }

    @Override
    public List<TariffPlanResponse> getTariffPlansByCommunity(String adminEmail) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);

        return tariffPlanRepository.findByCommunityId(adminProfile.getCommunity().getId()).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public TariffPlanResponse activateTariffPlan(String adminEmail, Long id) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);

        TariffPlan plan = tariffPlanRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tariff plan not found."));

        if (!plan.getCommunity().getId().equals(adminProfile.getCommunity().getId())) {
            throw new IllegalArgumentException("Unauthorized to activate tariff plan of another community.");
        }

        Optional<TariffPlan> activeOpt = tariffPlanRepository.findFirstByCommunityIdAndActiveTrue(adminProfile.getCommunity().getId());
        if (activeOpt.isPresent() && !activeOpt.get().getId().equals(id)) {
            TariffPlan activePlan = activeOpt.get();
            activePlan.setActive(false);
            tariffPlanRepository.save(activePlan);
        }

        plan.setActive(true);
        plan = tariffPlanRepository.save(plan);
        return mapToResponse(plan);
    }

    @Override
    @Transactional
    public TariffPlanResponse deactivateTariffPlan(String adminEmail, Long id) {
        CommunityAdminProfile adminProfile = getAdminProfile(adminEmail);

        TariffPlan plan = tariffPlanRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tariff plan not found."));

        if (!plan.getCommunity().getId().equals(adminProfile.getCommunity().getId())) {
            throw new IllegalArgumentException("Unauthorized to deactivate tariff plan of another community.");
        }

        plan.setActive(false);
        plan = tariffPlanRepository.save(plan);
        return mapToResponse(plan);
    }

    private void validateSlabs(List<TariffSlabRequest> slabRequests) {
        if (slabRequests == null || slabRequests.isEmpty()) {
            return;
        }

        List<TariffSlabRequest> sorted = slabRequests.stream()
                .sorted(Comparator.comparing(TariffSlabRequest::getMinUnits))
                .toList();

        if (sorted.get(0).getMinUnits() != 0.0) {
            throw new IllegalArgumentException("First slab must start at 0 units.");
        }

        for (int i = 0; i < sorted.size(); i++) {
            TariffSlabRequest current = sorted.get(i);

            if (current.getMinUnits() < 0) {
                throw new IllegalArgumentException("Minimum units cannot be negative.");
            }

            if (current.getRatePerUnit() == null || current.getRatePerUnit().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Rate per unit must be positive.");
            }

            if (current.getMaxUnits() != null) {
                if (current.getMaxUnits() <= current.getMinUnits()) {
                    throw new IllegalArgumentException("Maximum units must be greater than minimum units.");
                }
            }

            if (i < sorted.size() - 1) {
                if (current.getMaxUnits() == null) {
                    throw new IllegalArgumentException("Only the last slab can have an unlimited maximum units.");
                }
                TariffSlabRequest next = sorted.get(i + 1);
                if (!current.getMaxUnits().equals(next.getMinUnits())) {
                    throw new IllegalArgumentException("Tariff slabs must be continuous.");
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

        return TariffPlanResponse.builder()
                .id(plan.getId())
                .name(plan.getName())
                .ratePerUnit(plan.getRatePerUnit())
                .fixedCharge(plan.getFixedCharge())
                .active(plan.isActive())
                .slabs(slabs)
                .build();
    }
}
