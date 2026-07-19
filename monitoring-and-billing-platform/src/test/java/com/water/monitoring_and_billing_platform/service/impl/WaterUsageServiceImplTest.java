package com.water.monitoring_and_billing_platform.service.impl;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.water.monitoring_and_billing_platform.dto.WaterUsageRequest;
import com.water.monitoring_and_billing_platform.entity.Community;
import com.water.monitoring_and_billing_platform.entity.CommunityAdminProfile;
import com.water.monitoring_and_billing_platform.entity.ResidentProfile;
import com.water.monitoring_and_billing_platform.entity.User;
import com.water.monitoring_and_billing_platform.entity.WaterMeter;
import com.water.monitoring_and_billing_platform.exception.DuplicateWaterUsageException;
import com.water.monitoring_and_billing_platform.repository.CommunityAdminProfileRepository;
import com.water.monitoring_and_billing_platform.repository.UserRepository;
import com.water.monitoring_and_billing_platform.repository.WaterMeterRepository;
import com.water.monitoring_and_billing_platform.repository.WaterUsageRepository;

@ExtendWith(MockitoExtension.class)
class WaterUsageServiceImplTest {

    @Mock
    private WaterUsageRepository waterUsageRepository;

    @Mock
    private WaterMeterRepository waterMeterRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CommunityAdminProfileRepository communityAdminProfileRepository;

    @InjectMocks
    private WaterUsageServiceImpl waterUsageService;

    @Test
    void addReading_shouldRejectDuplicateEntryForSameMeterDateAndReading() {
        String adminEmail = "admin@example.com";
        WaterUsageRequest request = new WaterUsageRequest();
        request.setWaterMeterId(1L);
        request.setCurrentReading(125.0);
        request.setReadingDate(LocalDate.of(2026, 7, 10));

        User user = new User();
        user.setId(10L);
        user.setEmail(adminEmail);

        Community community = new Community();
        community.setId(99L);

        CommunityAdminProfile adminProfile = new CommunityAdminProfile();
        adminProfile.setCommunity(community);

        ResidentProfile residentProfile = new ResidentProfile();
        residentProfile.setCommunity(community);

        WaterMeter meter = new WaterMeter();
        meter.setId(1L);
        meter.setCurrentReading(100.0);
        meter.setResidentProfile(residentProfile);

        when(userRepository.findByEmail(adminEmail)).thenReturn(Optional.of(user));
        when(communityAdminProfileRepository.findByUserId(10L)).thenReturn(Optional.of(adminProfile));
        when(waterUsageRepository.existsByWaterMeterIdAndReadingDate(1L, request.getReadingDate()))
                .thenReturn(true);

        assertThrows(DuplicateWaterUsageException.class, () -> waterUsageService.addReading(adminEmail, request));
    }
}
