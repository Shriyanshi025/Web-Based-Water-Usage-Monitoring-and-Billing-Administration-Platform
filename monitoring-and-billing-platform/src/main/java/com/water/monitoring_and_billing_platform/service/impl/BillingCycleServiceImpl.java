package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.dto.BillingCycleRequest;
import com.water.monitoring_and_billing_platform.dto.BillingCycleResponse;
import com.water.monitoring_and_billing_platform.entity.BillingCycle;
import com.water.monitoring_and_billing_platform.entity.CommunityAdminProfile;
import com.water.monitoring_and_billing_platform.entity.User;
import com.water.monitoring_and_billing_platform.enums.BillingCycleStatus;
import com.water.monitoring_and_billing_platform.exception.UserNotFoundException;
import com.water.monitoring_and_billing_platform.repository.BillingCycleRepository;
import com.water.monitoring_and_billing_platform.repository.CommunityAdminProfileRepository;
import com.water.monitoring_and_billing_platform.repository.UserRepository;
import com.water.monitoring_and_billing_platform.service.BillingCycleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BillingCycleServiceImpl implements BillingCycleService {

    private final BillingCycleRepository billingCycleRepository;
    private final UserRepository userRepository;
    private final CommunityAdminProfileRepository communityAdminProfileRepository;
    private final com.water.monitoring_and_billing_platform.service.AlertService alertService;

    private CommunityAdminProfile getAdminProfile(String adminEmail) {
        User user = userRepository.findByEmail(adminEmail)
                .orElseThrow(UserNotFoundException::new);
        return communityAdminProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Community Admin profile not found."));
    }

    @Override
    @Transactional
    public BillingCycleResponse createBillingCycle(String adminEmail, BillingCycleRequest request) {
        getAdminProfile(adminEmail);

        if (request.getPeriodStart().isAfter(request.getPeriodEnd())) {
            throw new IllegalArgumentException("Start date must be before or equal to end date.");
        }

        if (billingCycleRepository.existsByPeriodStartLessThanEqualAndPeriodEndGreaterThanEqual(request.getPeriodEnd(), request.getPeriodStart())) {
            throw new IllegalArgumentException("Billing period overlaps with an existing cycle.");
        }

        BillingCycle cycle = BillingCycle.builder()
                .name(request.getName())
                .periodStart(request.getPeriodStart())
                .periodEnd(request.getPeriodEnd())
                .active(false)
                .status(BillingCycleStatus.CLOSED)
                .build();

        cycle = billingCycleRepository.save(cycle);
        return mapToResponse(cycle);
    }

    @Override
    @Transactional
    public BillingCycleResponse updateBillingCycle(String adminEmail, Long id, BillingCycleRequest request) {
        getAdminProfile(adminEmail);

        BillingCycle cycle = billingCycleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Billing cycle not found."));

        if (cycle.getStatus() == BillingCycleStatus.CLOSED || cycle.getStatus() == BillingCycleStatus.ARCHIVED) {
            throw new IllegalStateException("Closed or Archived cycles cannot be modified.");
        }

        if (request.getPeriodStart().isAfter(request.getPeriodEnd())) {
            throw new IllegalArgumentException("Start date must be before or equal to end date.");
        }

        if (billingCycleRepository.existsByIdNotAndPeriodStartLessThanEqualAndPeriodEndGreaterThanEqual(id, request.getPeriodEnd(), request.getPeriodStart())) {
            throw new IllegalArgumentException("Billing period overlaps with an existing cycle.");
        }

        cycle.setName(request.getName());
        cycle.setPeriodStart(request.getPeriodStart());
        cycle.setPeriodEnd(request.getPeriodEnd());

        cycle = billingCycleRepository.save(cycle);
        return mapToResponse(cycle);
    }

    @Override
    @Transactional
    public BillingCycleResponse openBillingCycle(String adminEmail, Long id) {
        getAdminProfile(adminEmail);

        BillingCycle cycle = billingCycleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Billing cycle not found."));

        if (cycle.getStatus() != BillingCycleStatus.CLOSED) {
            throw new IllegalStateException("Only CLOSED billing cycles can be opened.");
        }

        Optional<BillingCycle> activeOpt = billingCycleRepository.findFirstByActiveTrueOrderByPeriodStartDesc();
        if (activeOpt.isPresent()) {
            throw new IllegalArgumentException("An active billing cycle already exists. Please finalize the current billing cycle before opening a new one.");
        }

        cycle.setActive(true);
        cycle.setStatus(BillingCycleStatus.ACTIVE);

        cycle = billingCycleRepository.save(cycle);
        return mapToResponse(cycle);
    }

    @Override
    @Transactional
    public BillingCycleResponse closeBillingCycle(String adminEmail, Long id) {
        getAdminProfile(adminEmail);

        BillingCycle cycle = billingCycleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Billing cycle not found."));

        if (cycle.getStatus() != BillingCycleStatus.ACTIVE) {
            throw new IllegalStateException("Only ACTIVE billing cycles can be closed.");
        }

        cycle.setActive(false);
        cycle.setStatus(BillingCycleStatus.CLOSED);

        cycle = billingCycleRepository.save(cycle);

        // Notify Main Admin(s)
        java.util.List<User> mainAdmins = userRepository.findByRole(com.water.monitoring_and_billing_platform.enums.Role.MAIN_ADMIN);
        for (User admin : mainAdmins) {
            alertService.createInAppNotification(
                    admin,
                    null,
                    null,
                    "Billing Cycle Closed",
                    "Billing cycle '" + cycle.getName() + "' has been closed.",
                    com.water.monitoring_and_billing_platform.enums.AlertType.SYSTEM_NOTIFICATION,
                    com.water.monitoring_and_billing_platform.enums.AlertSeverity.LOW,
                    null
            );
        }

        return mapToResponse(cycle);
    }

    @Override
    @Transactional
    public BillingCycleResponse archiveBillingCycle(String adminEmail, Long id) {
        getAdminProfile(adminEmail);

        BillingCycle cycle = billingCycleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Billing cycle not found."));

        if (cycle.getStatus() != BillingCycleStatus.CLOSED) {
            if (cycle.getStatus() == BillingCycleStatus.ACTIVE) {
                throw new IllegalArgumentException("ACTIVE billing cycle cannot be archived directly.");
            }
            throw new IllegalArgumentException("A billing cycle must be CLOSED before it can be ARCHIVED.");
        }

        cycle.setActive(false);
        cycle.setStatus(BillingCycleStatus.ARCHIVED);

        cycle = billingCycleRepository.save(cycle);
        return mapToResponse(cycle);
    }

    @Override
    public BillingCycleResponse getActiveBillingCycle(String adminEmail) {
        getAdminProfile(adminEmail);

        BillingCycle cycle = billingCycleRepository.findFirstByActiveTrueOrderByPeriodStartDesc()
                .orElseGet(() -> BillingCycle.builder()
                        .id(0L)
                        .name("No Active Cycle")
                        .active(false)
                        .status(BillingCycleStatus.CLOSED)
                        .build());

        return mapToResponse(cycle);
    }

    @Override
    public BillingCycleResponse getBillingCycleById(String adminEmail, Long id) {
        getAdminProfile(adminEmail);

        BillingCycle cycle = billingCycleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Billing cycle not found."));

        return mapToResponse(cycle);
    }

    @Override
    public List<BillingCycleResponse> getAllBillingCycles(String adminEmail) {
        getAdminProfile(adminEmail);

        return billingCycleRepository.findAll().stream()
                .sorted((c1, c2) -> c2.getPeriodStart().compareTo(c1.getPeriodStart()))
                .map(this::mapToResponse)
                .toList();
    }

    private BillingCycleResponse mapToResponse(BillingCycle cycle) {
        return BillingCycleResponse.builder()
                .id(cycle.getId())
                .name(cycle.getName())
                .periodStart(cycle.getPeriodStart())
                .periodEnd(cycle.getPeriodEnd())
                .active(cycle.isActive())
                .status(cycle.getStatus() != null ? cycle.getStatus().name() : null)
                .generatedAt(cycle.getGeneratedAt())
                .build();
    }
}
