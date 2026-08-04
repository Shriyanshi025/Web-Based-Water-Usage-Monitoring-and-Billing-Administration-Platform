package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.dto.PeerBenchmarkingResponse;
import com.water.monitoring_and_billing_platform.entity.*;
import com.water.monitoring_and_billing_platform.enums.UnitType;
import com.water.monitoring_and_billing_platform.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PeerBenchmarkingServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ResidentProfileRepository residentProfileRepository;

    @Mock
    private WaterMeterRepository waterMeterRepository;

    @Mock
    private WaterUsageRepository waterUsageRepository;

    @InjectMocks
    private PeerBenchmarkingServiceImpl peerBenchmarkingService;

    private User testUser;
    private ResidentProfile testResident;
    private Community testCommunity;
    private Unit testUnit;
    private WaterMeter testMeter;

    @BeforeEach
    void setUp() {
        testUser = User.builder().id(1L).email("resident@hydrosync.com").build();
        testCommunity = Community.builder().id(10L).communityName("Green Oasis").communityCode("GO100").build();
        testUnit = Unit.builder().id(100L).occupancy(3).unitType(UnitType.FLAT).build();
        testResident = ResidentProfile.builder()
                .id(5L)
                .user(testUser)
                .community(testCommunity)
                .unit(testUnit)
                .active(true)
                .build();
        testMeter = WaterMeter.builder().id(50L).residentProfile(testResident).build();
    }

    @Test
    void testGetResidentPeerBenchmarking_Success() {
        when(userRepository.findByEmail("resident@hydrosync.com")).thenReturn(Optional.of(testUser));
        when(residentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(testResident));
        when(residentProfileRepository.findByCommunityIdAndActiveTrue(10L)).thenReturn(List.of(testResident));

        WaterUsage usage = WaterUsage.builder()
                .waterMeter(testMeter)
                .unitsConsumed(45.0)
                .readingDate(LocalDate.now())
                .build();

        when(waterUsageRepository.findByWaterMeterResidentProfileCommunityIdAndReadingDateBetween(anyLong(), any(), any()))
                .thenReturn(List.of(usage));

        PeerBenchmarkingResponse response = peerBenchmarkingService.getResidentPeerBenchmarking("resident@hydrosync.com");

        assertNotNull(response);
        assertTrue(response.isSufficientData());
        assertEquals(1, response.getCommunityRank());
        assertEquals(1, response.getTotalHouseholdsInCommunity());
        assertNotNull(response.getWaterEfficiencyScore());
        assertNotNull(response.getBadgeName());
        assertFalse(response.getDynamicConservationTips().isEmpty());
    }

    @Test
    void testGetResidentPeerBenchmarking_InsufficientData() {
        when(userRepository.findByEmail("resident@hydrosync.com")).thenReturn(Optional.of(testUser));
        when(residentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(testResident));
        when(residentProfileRepository.findByCommunityIdAndActiveTrue(10L)).thenReturn(List.of(testResident));
        when(waterUsageRepository.findByWaterMeterResidentProfileCommunityIdAndReadingDateBetween(anyLong(), any(), any()))
                .thenReturn(Collections.emptyList());

        PeerBenchmarkingResponse response = peerBenchmarkingService.getResidentPeerBenchmarking("resident@hydrosync.com");

        assertNotNull(response);
        assertFalse(response.isSufficientData());
        assertNull(response.getWaterEfficiencyScore());
        assertNull(response.getBadgeName());
        assertNull(response.getCommunityRank());
        assertTrue(response.getStatusMessage().contains("Insufficient Benchmark Data"));
    }
}
