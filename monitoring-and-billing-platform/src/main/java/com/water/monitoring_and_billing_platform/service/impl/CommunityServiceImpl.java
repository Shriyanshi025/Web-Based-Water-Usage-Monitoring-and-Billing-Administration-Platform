package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.dto.CommunityRequest;
import com.water.monitoring_and_billing_platform.dto.CommunityResponse;
import com.water.monitoring_and_billing_platform.dto.CommunityStatusUpdateRequest;
import com.water.monitoring_and_billing_platform.entity.Community;
import com.water.monitoring_and_billing_platform.entity.TariffPlan;
import com.water.monitoring_and_billing_platform.exception.CommunityAlreadyExistsException;
import com.water.monitoring_and_billing_platform.exception.CommunityNotFoundException;
import com.water.monitoring_and_billing_platform.repository.*;
import com.water.monitoring_and_billing_platform.service.CommunityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import com.water.monitoring_and_billing_platform.enums.AlertSeverity;
import com.water.monitoring_and_billing_platform.enums.AlertType;
import com.water.monitoring_and_billing_platform.enums.Role;
import com.water.monitoring_and_billing_platform.service.AlertService;

@Service
@RequiredArgsConstructor
public class CommunityServiceImpl implements CommunityService {

    private final CommunityRepository communityRepository;
    private final ActivityLogRepository activityLogRepository;
    private final BlockRepository blockRepository;
    private final UnitRepository unitRepository;
    private final WaterMeterRepository waterMeterRepository;
    private final ResidentProfileRepository residentProfileRepository;
    private final CommunityAdminProfileRepository communityAdminProfileRepository;
    private final UserRepository userRepository;
    private final AlertRepository alertRepository;
    private final TariffPlanRepository tariffPlanRepository;
    private final AlertService alertService;
    private final com.water.monitoring_and_billing_platform.service.TariffPlanService tariffPlanService;

    @jakarta.persistence.PersistenceContext
    private jakarta.persistence.EntityManager entityManager;

    @Override
    @Transactional
    public CommunityResponse createCommunity(CommunityRequest request) {
        if (communityRepository.existsByCommunityName(request.getCommunityName())) {
            throw new CommunityAlreadyExistsException();
        }
        
        if (communityRepository.existsByCommunityCode(request.getCommunityCode())) {
            throw new CommunityAlreadyExistsException();
        }

        Community community = Community.builder()
                .communityName(request.getCommunityName())
                .communityCode(request.getCommunityCode())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .active(true)
                .build();

        Community savedCommunity = communityRepository.save(community);

        TariffPlan defaultPlan = TariffPlan.builder()
                .name("Standard Residential Tariff")
                .description("Initial tariff policy created for " + savedCommunity.getCommunityName())
                .fixedCharge(java.math.BigDecimal.valueOf(100.00))
                .ratePerUnit(java.math.BigDecimal.valueOf(5.00))
                .taxRate(java.math.BigDecimal.valueOf(0.05))
                .community(savedCommunity)
                .active(true)
                .build();
        List<com.water.monitoring_and_billing_platform.entity.TariffSlab> slabs = new java.util.ArrayList<>();
        slabs.add(com.water.monitoring_and_billing_platform.entity.TariffSlab.builder().tariffPlan(defaultPlan).minUnits(0.0).maxUnits(10.0).ratePerUnit(java.math.BigDecimal.valueOf(5.00)).build());
        slabs.add(com.water.monitoring_and_billing_platform.entity.TariffSlab.builder().tariffPlan(defaultPlan).minUnits(10.0).maxUnits(20.0).ratePerUnit(java.math.BigDecimal.valueOf(8.00)).build());
        slabs.add(com.water.monitoring_and_billing_platform.entity.TariffSlab.builder().tariffPlan(defaultPlan).minUnits(20.0).maxUnits(null).ratePerUnit(java.math.BigDecimal.valueOf(12.00)).build());
        defaultPlan.setSlabs(slabs);
        tariffPlanRepository.save(defaultPlan);

        activityLogRepository.save(com.water.monitoring_and_billing_platform.entity.ActivityLog.builder()
                .title("Community Created")
                .description("New community added: " + savedCommunity.getCommunityName())
                .timestamp(java.time.LocalDateTime.now())
                .icon("DomainAdd")
                .color("success.main")
                .community(savedCommunity)
                .build());

        // Notify Main Admin(s)
        List<com.water.monitoring_and_billing_platform.entity.User> mainAdmins = userRepository.findByRole(Role.MAIN_ADMIN);
        for (com.water.monitoring_and_billing_platform.entity.User admin : mainAdmins) {
            alertService.createInAppNotification(
                    admin,
                    null,
                    savedCommunity,
                    "Community Created",
                    "New community '" + savedCommunity.getCommunityName() + "' has been successfully created.",
                    AlertType.SYSTEM_NOTIFICATION,
                    AlertSeverity.LOW,
                    null
            );
        }

        return mapToResponse(savedCommunity);
    }

    @Override
    @Transactional
    public CommunityResponse updateCommunity(Long id, CommunityRequest request) {
        Community community = communityRepository.findById(id)
                .orElseThrow(() -> new CommunityNotFoundException());

        if (!community.getCommunityName().equals(request.getCommunityName()) &&
                communityRepository.existsByCommunityName(request.getCommunityName())) {
            throw new CommunityAlreadyExistsException();
        }

        if (!community.getCommunityCode().equals(request.getCommunityCode()) &&
                communityRepository.existsByCommunityCode(request.getCommunityCode())) {
            throw new CommunityAlreadyExistsException();
        }

        community.setCommunityName(request.getCommunityName());
        community.setCommunityCode(request.getCommunityCode());
        community.setAddress(request.getAddress());
        community.setCity(request.getCity());
        community.setState(request.getState());
        community.setPincode(request.getPincode());

        community = communityRepository.save(community);

        activityLogRepository.save(com.water.monitoring_and_billing_platform.entity.ActivityLog.builder()
                .title("Community Updated")
                .description("Community details updated: " + community.getCommunityName())
                .timestamp(java.time.LocalDateTime.now())
                .icon("Domain")
                .color("info.main")
                .community(community)
                .build());

        return mapToResponse(community);
    }

    @Override
    @Transactional(readOnly = true)
    public CommunityResponse getCommunity(Long id) {
        Community community = communityRepository.findById(id)
                .orElseThrow(() -> new CommunityNotFoundException());
        return mapToResponse(community);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommunityResponse> getAllCommunities() {
        List<Community> communities = communityRepository.findAll();
        List<Object[]> statsList = communityRepository.fetchCommunityStats();
        java.util.Map<Long, long[]> statsMap = new java.util.HashMap<>();
        for (Object[] row : statsList) {
            Long cId = (Long) row[0];
            long adminCount = (Long) row[1];
            long residentCount = (Long) row[2];
            long blockCount = (Long) row[3];
            long unitCount = (Long) row[4];
            statsMap.put(cId, new long[]{adminCount, residentCount, blockCount, unitCount});
        }

        return communities.stream().map(c -> {
            long[] stats = statsMap.getOrDefault(c.getId(), new long[]{0, 0, 0, 0});
            return CommunityResponse.builder()
                    .id(c.getId())
                    .communityName(c.getCommunityName())
                    .communityCode(c.getCommunityCode())
                    .address(c.getAddress())
                    .city(c.getCity())
                    .state(c.getState())
                    .pincode(c.getPincode())
                    .active(c.isActive())
                    .createdAt(c.getCreatedAt())
                    .updatedAt(c.getUpdatedAt())
                    .totalCommunityAdmins(stats[0])
                    .totalResidents(stats[1])
                    .totalBlocks(stats[2])
                    .totalUnits(stats[3])
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CommunityResponse updateCommunityStatus(Long id, CommunityStatusUpdateRequest request) {
        Community community = communityRepository.findById(id)
                .orElseThrow(() -> new CommunityNotFoundException());

        community.setActive(request.getActive());
        community = communityRepository.save(community);

        return mapToResponse(community);
    }

    @Override
    @Transactional
    public void deleteCommunity(Long id) {
        Community community = communityRepository.findById(id)
                .orElseThrow(() -> new CommunityNotFoundException());

        // 1. Cascade delete all Residents in this Community
        List<com.water.monitoring_and_billing_platform.entity.ResidentProfile> residents = residentProfileRepository.findByCommunityId(id);
        for (com.water.monitoring_and_billing_platform.entity.ResidentProfile resident : residents) {
            com.water.monitoring_and_billing_platform.entity.User residentUser = resident.getUser();

            entityManager.createQuery("DELETE FROM Payment p WHERE p.resident.id = :rId")
                    .setParameter("rId", resident.getId()).executeUpdate();

            List<com.water.monitoring_and_billing_platform.entity.Bill> bills = entityManager.createQuery(
                    "SELECT b FROM Bill b WHERE b.residentProfile.id = :rId", com.water.monitoring_and_billing_platform.entity.Bill.class)
                    .setParameter("rId", resident.getId()).getResultList();
            for (com.water.monitoring_and_billing_platform.entity.Bill b : bills) {
                entityManager.createQuery("DELETE FROM Invoice i WHERE i.bill.id = :bId")
                        .setParameter("bId", b.getId()).executeUpdate();
            }
            entityManager.createQuery("DELETE FROM Bill b WHERE b.residentProfile.id = :rId")
                    .setParameter("rId", resident.getId()).executeUpdate();

            List<com.water.monitoring_and_billing_platform.entity.WaterMeter> meters = entityManager.createQuery(
                    "SELECT wm FROM WaterMeter wm WHERE wm.residentProfile.id = :rId", com.water.monitoring_and_billing_platform.entity.WaterMeter.class)
                    .setParameter("rId", resident.getId()).getResultList();
            for (com.water.monitoring_and_billing_platform.entity.WaterMeter wm : meters) {
                entityManager.createQuery("DELETE FROM WaterUsage wu WHERE wu.waterMeter.id = :wmId")
                        .setParameter("wmId", wm.getId()).executeUpdate();
                entityManager.remove(wm);
            }

            entityManager.createQuery("DELETE FROM Complaint c WHERE c.resident.id = :rId")
                    .setParameter("rId", resident.getId()).executeUpdate();
            if (residentUser != null) {
                entityManager.createQuery("UPDATE Complaint c SET c.assignedTo = null WHERE c.assignedTo.id = :uId")
                        .setParameter("uId", residentUser.getId()).executeUpdate();
                entityManager.createQuery("UPDATE Complaint c SET c.lastUpdatedBy = null WHERE c.lastUpdatedBy.id = :uId")
                        .setParameter("uId", residentUser.getId()).executeUpdate();
                entityManager.createQuery("DELETE FROM Alert a WHERE a.recipient.id = :uId")
                        .setParameter("uId", residentUser.getId()).executeUpdate();
                if (residentUser.getEmail() != null) {
                    entityManager.createQuery("DELETE FROM Notification n WHERE n.recipient = :email")
                            .setParameter("email", residentUser.getEmail()).executeUpdate();
                    entityManager.createQuery("DELETE FROM Invitation inv WHERE inv.email = :email")
                            .setParameter("email", residentUser.getEmail()).executeUpdate();
                }
                entityManager.createQuery("DELETE FROM ActivityLog al WHERE al.user.id = :uId")
                        .setParameter("uId", residentUser.getId()).executeUpdate();
            }
            entityManager.createQuery("DELETE FROM Alert a WHERE a.resident.id = :rId")
                    .setParameter("rId", resident.getId()).executeUpdate();

            entityManager.remove(resident);
            if (residentUser != null) {
                entityManager.remove(residentUser);
            }
        }

        // 2. Cascade delete all Community Admins in this Community
        List<com.water.monitoring_and_billing_platform.entity.CommunityAdminProfile> adminProfiles = communityAdminProfileRepository.findByCommunityId(id);
        for (com.water.monitoring_and_billing_platform.entity.CommunityAdminProfile adminProfile : adminProfiles) {
            com.water.monitoring_and_billing_platform.entity.User adminUser = adminProfile.getUser();

            entityManager.createQuery("DELETE FROM Invitation inv WHERE inv.admin.id = :aId")
                    .setParameter("aId", adminProfile.getId()).executeUpdate();

            if (adminUser != null) {
                entityManager.createQuery("UPDATE Complaint c SET c.assignedTo = null WHERE c.assignedTo.id = :uId")
                        .setParameter("uId", adminUser.getId()).executeUpdate();
                entityManager.createQuery("UPDATE Complaint c SET c.lastUpdatedBy = null WHERE c.lastUpdatedBy.id = :uId")
                        .setParameter("uId", adminUser.getId()).executeUpdate();
                entityManager.createQuery("DELETE FROM Alert a WHERE a.recipient.id = :uId")
                        .setParameter("uId", adminUser.getId()).executeUpdate();
                if (adminUser.getEmail() != null) {
                    entityManager.createQuery("DELETE FROM Notification n WHERE n.recipient = :email")
                            .setParameter("email", adminUser.getEmail()).executeUpdate();
                }
                entityManager.createQuery("DELETE FROM ActivityLog al WHERE al.user.id = :uId")
                        .setParameter("uId", adminUser.getId()).executeUpdate();
            }

            entityManager.remove(adminProfile);
            if (adminUser != null) {
                entityManager.remove(adminUser);
            }
        }

        // 3. Delete remaining Community structural entities
        entityManager.createQuery("DELETE FROM BulkWaterPurchase bwp WHERE bwp.community.id = :cId")
                .setParameter("cId", id).executeUpdate();

        List<com.water.monitoring_and_billing_platform.entity.TariffPlan> plans = entityManager.createQuery(
                "SELECT tp FROM TariffPlan tp WHERE tp.community.id = :cId", com.water.monitoring_and_billing_platform.entity.TariffPlan.class)
                .setParameter("cId", id).getResultList();
        for (com.water.monitoring_and_billing_platform.entity.TariffPlan tp : plans) {
            entityManager.remove(tp);
        }

        entityManager.createQuery("DELETE FROM Complaint c WHERE c.community.id = :cId")
                .setParameter("cId", id).executeUpdate();
        entityManager.createQuery("DELETE FROM Invitation inv WHERE inv.community.id = :cId")
                .setParameter("cId", id).executeUpdate();
        entityManager.createQuery("DELETE FROM Alert a WHERE a.community.id = :cId")
                .setParameter("cId", id).executeUpdate();
        entityManager.createQuery("DELETE FROM ActivityLog al WHERE al.community.id = :cId")
                .setParameter("cId", id).executeUpdate();

        entityManager.createQuery("DELETE FROM Unit u WHERE u.block.community.id = :cId")
                .setParameter("cId", id).executeUpdate();
        entityManager.createQuery("DELETE FROM Block b WHERE b.community.id = :cId")
                .setParameter("cId", id).executeUpdate();

        communityRepository.delete(community);
    }

    private CommunityResponse mapToResponse(Community community) {
        long adminCount = communityAdminProfileRepository.countByCommunityId(community.getId());
        long residentCount = residentProfileRepository.countByCommunityId(community.getId());
        long blockCount = blockRepository.countByCommunityId(community.getId());
        long unitCount = unitRepository.countByCommunityId(community.getId());

        return CommunityResponse.builder()
                .id(community.getId())
                .communityName(community.getCommunityName())
                .communityCode(community.getCommunityCode())
                .address(community.getAddress())
                .city(community.getCity())
                .state(community.getState())
                .pincode(community.getPincode())
                .active(community.isActive())
                .createdAt(community.getCreatedAt())
                .updatedAt(community.getUpdatedAt())
                .totalCommunityAdmins(adminCount)
                .totalResidents(residentCount)
                .totalBlocks(blockCount)
                .totalUnits(unitCount)
                .build();
    }
}
