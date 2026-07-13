package com.water.monitoring_and_billing_platform.config;

import com.water.monitoring_and_billing_platform.entity.CommunityAdminProfile;
import com.water.monitoring_and_billing_platform.entity.ResidentProfile;
import com.water.monitoring_and_billing_platform.repository.CommunityAdminProfileRepository;
import com.water.monitoring_and_billing_platform.repository.ResidentProfileRepository;
import com.water.monitoring_and_billing_platform.util.IdGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataIntegrator implements CommandLineRunner {

    private final CommunityAdminProfileRepository communityAdminProfileRepository;
    private final ResidentProfileRepository residentProfileRepository;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Running Data Integrity Check for missing Official IDs...");

        List<CommunityAdminProfile> admins = communityAdminProfileRepository.findAll();
        for (CommunityAdminProfile admin : admins) {
            if (admin.isVerified() && (admin.getOfficialAdminId() == null || admin.getOfficialAdminId().isEmpty())) {
                long verifiedCount = communityAdminProfileRepository.countByCommunityIdAndVerifiedTrue(admin.getCommunity().getId());
                String officialAdminId = IdGenerator.generateOfficialCommunityAdminId(
                        admin.getCommunity().getCommunityCode(),
                        verifiedCount > 0 ? verifiedCount : 1
                );
                admin.setOfficialAdminId(officialAdminId);
                communityAdminProfileRepository.save(admin);
            }
        }

        List<ResidentProfile> residents = residentProfileRepository.findAll();
        for (ResidentProfile profile : residents) {
            if (profile.isVerified() && (profile.getOfficialUserId() == null || profile.getOfficialUserId().isEmpty())) {
                long verifiedCount = residentProfileRepository.countByCommunityIdAndVerifiedTrue(profile.getCommunity().getId());
                String officialUserId = IdGenerator.generateOfficialResidentId(
                        profile.getCommunity().getCommunityCode(),
                        profile.getBlock().getBlockName(),
                        profile.getUnit().getUnitNumber(),
                        verifiedCount > 0 ? verifiedCount : 1
                );
                profile.setOfficialUserId(officialUserId);
                residentProfileRepository.save(profile);
            }
        }
        System.out.println("Data Integrity Check completed.");
    }
}
