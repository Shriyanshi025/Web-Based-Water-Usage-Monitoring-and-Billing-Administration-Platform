package com.water.monitoring_and_billing_platform.service.impl;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.water.monitoring_and_billing_platform.dto.ResidentProfileUpdateRequest;
import com.water.monitoring_and_billing_platform.dto.WaterMeterUpdateRequest;
import com.water.monitoring_and_billing_platform.entity.Community;
import com.water.monitoring_and_billing_platform.entity.CommunityAdminProfile;
import com.water.monitoring_and_billing_platform.entity.ResidentProfile;
import com.water.monitoring_and_billing_platform.entity.User;
import com.water.monitoring_and_billing_platform.entity.WaterMeter;
import com.water.monitoring_and_billing_platform.enums.MeterStatus;
import com.water.monitoring_and_billing_platform.repository.BlockRepository;
import com.water.monitoring_and_billing_platform.repository.CommunityAdminProfileRepository;
import com.water.monitoring_and_billing_platform.repository.CommunityRepository;
import com.water.monitoring_and_billing_platform.repository.ResidentProfileRepository;
import com.water.monitoring_and_billing_platform.repository.UnitRepository;
import com.water.monitoring_and_billing_platform.repository.UserRepository;
import com.water.monitoring_and_billing_platform.repository.WaterMeterRepository;

@ExtendWith(MockitoExtension.class)
class HouseholdManagementServiceImplTest {

    @Mock
    private ResidentProfileRepository residentProfileRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CommunityRepository communityRepository;

    @Mock
    private BlockRepository blockRepository;

    @Mock
    private UnitRepository unitRepository;

    @Mock
    private CommunityAdminProfileRepository communityAdminProfileRepository;

    @Mock
    private WaterMeterRepository waterMeterRepository;

    @Mock
    private com.water.monitoring_and_billing_platform.repository.ActivityLogRepository activityLogRepository;

    @InjectMocks
    private ResidentProfileServiceImpl residentProfileService;

    @InjectMocks
    private WaterMeterServiceImpl waterMeterService;

    @Test
    void updateResident_shouldUpdatePhoneNumberAndActiveState() {
        String adminEmail = "admin@example.com";
        User adminUser = new User();
        adminUser.setId(10L);
        adminUser.setEmail(adminEmail);

        Community community = new Community();
        community.setId(99L);
        community.setCommunityName("Oakwood");

        CommunityAdminProfile adminProfile = new CommunityAdminProfile();
        adminProfile.setCommunity(community);

        ResidentProfile resident = new ResidentProfile();
        resident.setId(22L);
        resident.setCommunity(community);
        resident.setActive(true);
        resident.setVerified(false);
        resident.setPhoneNumber("1111111111");

        User residentUser = new User();
        residentUser.setId(11L);
        residentUser.setFullName("Jamie Doe");
        residentUser.setEmail("resident@example.com");
        resident.setUser(residentUser);

        ResidentProfileUpdateRequest request = new ResidentProfileUpdateRequest();
        request.setPhoneNumber("2222222222");
        request.setActive(false);
        request.setVerified(true);

        when(userRepository.findByEmail(adminEmail)).thenReturn(Optional.of(adminUser));
        when(communityAdminProfileRepository.findByUserId(10L)).thenReturn(Optional.of(adminProfile));
        when(residentProfileRepository.findById(22L)).thenReturn(Optional.of(resident));
        when(residentProfileRepository.save(resident)).thenReturn(resident);

        var response = residentProfileService.updateResident(adminEmail, 22L, request);

        assertEquals("2222222222", response.getPhoneNumber());
        assertEquals(false, response.isActive());
        assertEquals(true, response.isVerified());
    }

    @Test
    void updateWaterMeter_shouldUpdateAssignmentAndStatus() {
        String adminEmail = "admin@example.com";
        User adminUser = new User();
        adminUser.setId(10L);
        adminUser.setEmail(adminEmail);

        Community community = new Community();
        community.setId(99L);

        CommunityAdminProfile adminProfile = new CommunityAdminProfile();
        adminProfile.setCommunity(community);

        ResidentProfile resident = new ResidentProfile();
        resident.setId(5L);
        resident.setCommunity(community);
        resident.setOfficialUserId("R-100");
        User residentUser = new User();
        residentUser.setFullName("Alex Stone");
        resident.setUser(residentUser);

        WaterMeter meter = new WaterMeter();
        meter.setId(3L);
        meter.setMeterNumber("M-001");
        meter.setResidentProfile(resident);
        meter.setMeterStatus(MeterStatus.ACTIVE);
        meter.setInitialReading(10.0);
        meter.setCurrentReading(20.0);
        meter.setActive(true);

        WaterMeterUpdateRequest request = new WaterMeterUpdateRequest();
        request.setResidentProfileId(5L);
        request.setMeterStatus("INACTIVE");
        request.setCurrentReading(35.0);
        request.setActive(false);

        when(userRepository.findByEmail(adminEmail)).thenReturn(Optional.of(adminUser));
        when(communityAdminProfileRepository.findByUserId(10L)).thenReturn(Optional.of(adminProfile));
        when(waterMeterRepository.findById(3L)).thenReturn(Optional.of(meter));
        when(residentProfileRepository.findById(5L)).thenReturn(Optional.of(resident));
        when(waterMeterRepository.existsByResidentProfileId(5L)).thenReturn(false);
        when(waterMeterRepository.save(meter)).thenReturn(meter);

        var response = waterMeterService.updateWaterMeter(adminEmail, 3L, request);

        assertEquals("INACTIVE", response.getMeterStatus());
        assertEquals(35.0, response.getCurrentReading());
        assertEquals(false, response.isActive());
    }
}
