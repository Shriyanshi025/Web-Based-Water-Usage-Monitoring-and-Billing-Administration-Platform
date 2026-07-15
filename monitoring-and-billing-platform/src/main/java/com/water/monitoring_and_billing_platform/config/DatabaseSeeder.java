package com.water.monitoring_and_billing_platform.config;

import com.water.monitoring_and_billing_platform.entity.*;
import com.water.monitoring_and_billing_platform.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.context.annotation.Profile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import com.water.monitoring_and_billing_platform.enums.MeterStatus;

@Component
@Profile("dev")
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final ActivityLogRepository activityLogRepository;
    private final CommunityRepository communityRepository;
    private final UserRepository userRepository;
    private final ResidentProfileRepository residentProfileRepository;
    private final WaterMeterRepository waterMeterRepository;
    private final WaterUsageRepository waterUsageRepository;
    private final CommunityAdminProfileRepository communityAdminProfileRepository;
    private final BlockRepository blockRepository;
    private final UnitRepository unitRepository;

    @Override
    public void run(String... args) throws Exception {
        if (activityLogRepository.count() == 0) {
            System.out.println("Seeding Activity Logs...");
            
            List<Community> communities = communityRepository.findAll();
            List<User> users = userRepository.findAll();
            
            if (!communities.isEmpty()) {
                Community c = communities.get(0);
                
                activityLogRepository.save(ActivityLog.builder()
                        .title("Bill Generated")
                        .description("Monthly water bill generated for community.")
                        .timestamp(LocalDateTime.now().minusDays(1))
                        .icon("ReceiptIcon")
                        .color("info")
                        .community(c)
                        .build());
                        
                activityLogRepository.save(ActivityLog.builder()
                        .title("Meter Maintenance")
                        .description("Meter replaced for Block A, Unit 101.")
                        .timestamp(LocalDateTime.now().minusDays(3))
                        .icon("BuildIcon")
                        .color("warning")
                        .community(c)
                        .build());
                        
                activityLogRepository.save(ActivityLog.builder()
                        .title("Approval Request")
                        .description("New resident registration pending approval.")
                        .timestamp(LocalDateTime.now().minusHours(5))
                        .icon("PendingActionsIcon")
                        .color("primary")
                        .community(c)
                        .build());
            }
            
            if (!users.isEmpty()) {
                User u = users.stream().filter(user -> user.getRole().name().equals("USER")).findFirst().orElse(null);
                if (u != null && activityLogRepository.findTop5ByUserIdOrderByTimestampDesc(u.getId()).isEmpty()) {
                    activityLogRepository.save(ActivityLog.builder()
                            .title("Usage Recorded")
                            .description("Monthly meter reading recorded successfully.")
                            .timestamp(LocalDateTime.now().minusDays(2))
                            .icon("WaterDropIcon")
                            .color("success")
                            .user(u)
                            .build());
                            
                    activityLogRepository.save(ActivityLog.builder()
                            .title("Payment Received")
                            .description("Bill payment processed.")
                            .timestamp(LocalDateTime.now().minusDays(10))
                            .icon("AttachMoneyIcon")
                            .color("success")
                            .user(u)
                            .build());
                }
            }
            
            System.out.println("Activity Logs seeded.");
        } else {
            // Check if resident activities are missing and seed them
            List<User> users = userRepository.findAll();
            User u = users.stream().filter(user -> user.getRole().name().equals("USER")).findFirst().orElse(null);
            if (u != null && activityLogRepository.findTop5ByUserIdOrderByTimestampDesc(u.getId()).isEmpty()) {
                activityLogRepository.save(ActivityLog.builder()
                        .title("Usage Recorded")
                        .description("Monthly meter reading recorded successfully.")
                        .timestamp(LocalDateTime.now().minusDays(2))
                        .icon("WaterDropIcon")
                        .color("success")
                        .user(u)
                        .build());
                        
                activityLogRepository.save(ActivityLog.builder()
                        .title("Payment Received")
                        .description("Bill payment processed.")
                        .timestamp(LocalDateTime.now().minusDays(10))
                        .icon("AttachMoneyIcon")
                        .color("success")
                        .user(u)
                        .build());
                System.out.println("Resident Activity Logs seeded.");
            }
        }

        if (waterMeterRepository.count() == 0) {
            System.out.println("Seeding Water Meters and Usage...");
            List<ResidentProfile> residents = residentProfileRepository.findAll();
            for (ResidentProfile resident : residents) {
                if (resident.isVerified()) {
                    WaterMeter meter = WaterMeter.builder()
                            .residentProfile(resident)
                            .meterNumber("WM-" + resident.getId() + "-" + System.currentTimeMillis() % 1000)
                            .meterStatus(MeterStatus.ACTIVE)
                            .initialReading(0.0)
                            .currentReading(0.0)
                            .installationDate(LocalDate.now().minusMonths(6))
                            .active(true)
                            .build();
                    waterMeterRepository.save(meter);

                    // Seed past 6 months of usage
                    for (int i = 5; i >= 0; i--) {
                        LocalDate date = LocalDate.now().minusMonths(i);
                        WaterUsage usage = WaterUsage.builder()
                                .waterMeter(meter)
                                .readingDate(date)
                                .previousReading(i * 150.0)
                                .currentReading((i + 1) * 150.0)
                                .unitsConsumed(150.0)
                                .billed(false)
                                .build();
                        waterUsageRepository.save(usage);
                    }
                    
                    meter.setCurrentReading(1200.0);
                    waterMeterRepository.save(meter);
                }
            }
            System.out.println("Water Meters and Usage seeded.");
        }
        
        // Seed Pending Users for Dashboards
        if (userRepository.findByEmail("pending.admin@test.com").isEmpty()) {
            List<Community> communities = communityRepository.findAll();
            if (!communities.isEmpty()) {
                Community c = communities.get(0);
                
                // Pending Community Admin
                User pendingAdminUser = User.builder()
                        .email("pending.admin@test.com")
                        .password("password")
                        .fullName("Pending Admin")
                        .role(com.water.monitoring_and_billing_platform.enums.Role.COMMUNITY_ADMIN)
                        .approvalStatus(com.water.monitoring_and_billing_platform.enums.ApprovalStatus.PENDING)
                        .build();
                userRepository.save(pendingAdminUser);
                
                CommunityAdminProfile pendingAdminProfile = CommunityAdminProfile.builder()
                        .user(pendingAdminUser)
                        .community(c)
                        .phoneNumber("+1234567890")
                        .verified(false)
                        .build();
                communityAdminProfileRepository.save(pendingAdminProfile);
                
                // Pending Resident
                User pendingResidentUser = User.builder()
                        .email("pending.resident@test.com")
                        .password("password")
                        .fullName("Pending Resident")
                        .role(com.water.monitoring_and_billing_platform.enums.Role.USER)
                        .approvalStatus(com.water.monitoring_and_billing_platform.enums.ApprovalStatus.PENDING)
                        .build();
                userRepository.save(pendingResidentUser);
                
                List<Block> blocks = blockRepository.findAll();
                List<Unit> units = unitRepository.findAll();
                if (!blocks.isEmpty() && !units.isEmpty()) {
                    ResidentProfile pendingResidentProfile = ResidentProfile.builder()
                            .user(pendingResidentUser)
                            .community(c)
                            .block(blocks.get(0))
                            .unit(units.get(0))
                            .phoneNumber("+1987654321")
                            .verified(false)
                            .build();
                    residentProfileRepository.save(pendingResidentProfile);
                }
            }
        }
    }
}
