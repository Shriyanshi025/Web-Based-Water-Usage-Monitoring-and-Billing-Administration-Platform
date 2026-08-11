package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.dto.chatbot.ChatMessageRequest;
import com.water.monitoring_and_billing_platform.dto.chatbot.ChatMessageResponse;
import com.water.monitoring_and_billing_platform.entity.*;
import com.water.monitoring_and_billing_platform.enums.*;
import com.water.monitoring_and_billing_platform.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class ChatbotServiceImplTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private ResidentProfileRepository residentProfileRepository;
    @Mock
    private CommunityAdminProfileRepository communityAdminProfileRepository;
    @Mock
    private CommunityRepository communityRepository;
    @Mock
    private WaterUsageRepository waterUsageRepository;
    @Mock
    private BillRepository billRepository;
    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private ComplaintRepository complaintRepository;
    @Mock
    private AlertRepository alertRepository;
    @Mock
    private WaterMeterRepository waterMeterRepository;

    @InjectMocks
    private ChatbotServiceImpl chatbotService;

    private User residentUser;
    private ResidentProfile residentProfile;
    private Community community;
    private Block block;
    private Unit unit;
    private WaterMeter waterMeter;
    private Bill billMay;
    private Bill billJuly;

    private User caUser;
    private CommunityAdminProfile caProfile;

    private User maUser;

    @BeforeEach
    void setUp() {
        community = Community.builder().id(1L).communityName("Green Valley Residency").city("Bangalore").active(true).build();
        block = Block.builder().id(1L).blockName("A").community(community).build();
        unit = Unit.builder().id(1L).unitNumber("A-101").block(block).community(community).build();

        residentUser = User.builder().id(10L).fullName("John Doe").email("resident@example.com").role(Role.USER).build();
        residentProfile = ResidentProfile.builder().id(100L).user(residentUser).community(community).block(block).unit(unit).build();

        waterMeter = WaterMeter.builder()
                .id(50L)
                .meterNumber("WM-000001")
                .meterStatus(MeterStatus.ACTIVE)
                .currentReading(150.0)
                .active(true)
                .residentProfile(residentProfile)
                .build();

        billMay = Bill.builder()
                .id(1L)
                .billNumber("BILL-MAY-01")
                .billingMonth(5)
                .billingYear(2026)
                .billDate(LocalDate.of(2026, 5, 1))
                .unitsConsumed(25.0)
                .amount(BigDecimal.valueOf(500.0))
                .totalAmount(BigDecimal.valueOf(500.0))
                .status(BillStatus.PAID)
                .paid(true)
                .residentProfile(residentProfile)
                .build();

        billJuly = Bill.builder()
                .id(2L)
                .billNumber("BILL-JUL-02")
                .billingMonth(7)
                .billingYear(2026)
                .billDate(LocalDate.of(2026, 7, 1))
                .unitsConsumed(30.0)
                .amount(BigDecimal.valueOf(650.0))
                .totalAmount(BigDecimal.valueOf(650.0))
                .status(BillStatus.UNPAID)
                .paid(false)
                .residentProfile(residentProfile)
                .build();

        caUser = User.builder().id(20L).fullName("Admin Smith").email("ca@example.com").role(Role.COMMUNITY_ADMIN).build();
        caProfile = CommunityAdminProfile.builder().id(200L).user(caUser).community(community).build();

        maUser = User.builder().id(30L).fullName("Super Admin").email("ma@example.com").role(Role.MAIN_ADMIN).build();

        // Default stubs
        when(userRepository.findByEmail("resident@example.com")).thenReturn(Optional.of(residentUser));
        when(residentProfileRepository.findByUserId(10L)).thenReturn(Optional.of(residentProfile));
        when(billRepository.findByResidentProfileId(100L)).thenReturn(List.of(billMay, billJuly));
        when(waterMeterRepository.findFirstByResidentProfileIdOrderByIdDesc(100L)).thenReturn(Optional.of(waterMeter));

        when(userRepository.findByEmail("ca@example.com")).thenReturn(Optional.of(caUser));
        when(communityAdminProfileRepository.findByUserId(20L)).thenReturn(Optional.of(caProfile));
        when(billRepository.findByResidentProfileCommunityId(1L)).thenReturn(List.of(billMay, billJuly));
        when(waterMeterRepository.findByResidentProfileCommunityId(1L)).thenReturn(List.of(waterMeter));
        when(residentProfileRepository.findByCommunityId(1L)).thenReturn(List.of(residentProfile));

        when(userRepository.findByEmail("ma@example.com")).thenReturn(Optional.of(maUser));
        when(billRepository.findAll()).thenReturn(List.of(billMay, billJuly));
        when(communityRepository.findAll()).thenReturn(List.of(community));
        when(waterMeterRepository.findAll()).thenReturn(List.of(waterMeter));
    }

    private ChatMessageResponse ask(String email, String message) {
        return chatbotService.handleChatMessage(
                ChatMessageRequest.builder().message(message).conversationId("test-conv-" + message.hashCode()).build(),
                email
        );
    }

    // ==========================================
    // 1. COMMUNITY ADMIN WATER METER TESTS
    // ==========================================

    @Test
    @DisplayName("CA 1. 'List of all water meters' returns table of records")
    void testCaListOfAllWaterMeters() {
        ChatMessageResponse res = ask("ca@example.com", "List of all water meters");
        assertNotNull(res.getAnswer());
        assertTrue(res.getAnswer().contains("All Water Meters"));
        assertTrue(res.getAnswer().contains("| Meter | Status | Resident | Block | Unit |"));
        assertTrue(res.getAnswer().contains("WM-000001"));
        assertFalse(res.getAnswer().contains("temporarily unable"));
    }

    @Test
    @DisplayName("CA 2. 'Water meter list' returns table of records")
    void testCaWaterMeterList() {
        ChatMessageResponse res = ask("ca@example.com", "Water meter list");
        assertNotNull(res.getAnswer());
        assertTrue(res.getAnswer().contains("All Water Meters"));
        assertTrue(res.getAnswer().contains("WM-000001"));
        assertFalse(res.getAnswer().contains("temporarily unable"));
    }

    @Test
    @DisplayName("CA 3. 'Meter list' returns table of records")
    void testCaMeterList() {
        ChatMessageResponse res = ask("ca@example.com", "Meter list");
        assertNotNull(res.getAnswer());
        assertTrue(res.getAnswer().contains("All Water Meters"));
        assertTrue(res.getAnswer().contains("WM-000001"));
        assertFalse(res.getAnswer().contains("temporarily unable"));
    }

    @Test
    @DisplayName("CA 4. 'Active water meters' returns active records")
    void testCaActiveWaterMeters() {
        ChatMessageResponse res = ask("ca@example.com", "Active water meters");
        assertNotNull(res.getAnswer());
        assertTrue(res.getAnswer().contains("Active Water Meters"));
        assertTrue(res.getAnswer().contains("WM-000001"));
        assertFalse(res.getAnswer().contains("temporarily unable"));
    }

    @Test
    @DisplayName("CA 5. 'All water meters that are active' returns active records")
    void testCaAllWaterMetersThatAreActive() {
        ChatMessageResponse res = ask("ca@example.com", "All water meters that are active");
        assertNotNull(res.getAnswer());
        assertTrue(res.getAnswer().contains("Active Water Meters"));
        assertTrue(res.getAnswer().contains("WM-000001"));
        assertFalse(res.getAnswer().contains("temporarily unable"));
    }

    @Test
    @DisplayName("CA 6. 'List all residents' returns residents table")
    void testCaListAllResidents() {
        ChatMessageResponse res = ask("ca@example.com", "List all residents");
        assertNotNull(res.getAnswer());
        assertTrue(res.getAnswer().contains("Residents"));
        assertTrue(res.getAnswer().contains("John Doe"));
    }

    @Test
    @DisplayName("CA 7. 'List all bills' returns billing history")
    void testCaListAllBills() {
        ChatMessageResponse res = ask("ca@example.com", "List all bills");
        assertNotNull(res.getAnswer());
        assertTrue(res.getAnswer().contains("Billing History"));
        assertTrue(res.getAnswer().contains("Green Valley Residency"));
    }

    @Test
    @DisplayName("CA 8. 'List monthly water usage' returns monthly consumption table")
    void testCaListMonthlyWaterUsage() {
        WaterUsage u1 = WaterUsage.builder()
                .readingDate(LocalDate.of(2026, 6, 15))
                .unitsConsumed(800.0)
                .build();
        when(waterUsageRepository.findByWaterMeterResidentProfileCommunityId(1L)).thenReturn(List.of(u1));

        ChatMessageResponse res = ask("ca@example.com", "List monthly water usage");
        assertNotNull(res.getAnswer());
        assertTrue(res.getAnswer().contains("Monthly Water Consumption"));
        assertTrue(res.getAnswer().contains("June 2026"));
    }

    // ==========================================
    // 2. RESIDENT BILLS & PROFILE TESTS
    // ==========================================

    @Test
    @DisplayName("Resident 9. 'List all bills' returns bill history table")
    void testResidentListAllBills() {
        ChatMessageResponse res = ask("resident@example.com", "List all bills");
        assertNotNull(res.getAnswer());
        assertTrue(res.getAnswer().contains("Your Bill History"));
        assertTrue(res.getAnswer().contains("| Period | Bill Number | Consumption | Amount | Status | Due Date |"));
        assertTrue(res.getAnswer().contains("BILL-MAY-01"));
        assertTrue(res.getAnswer().contains("BILL-JUL-02"));
        assertFalse(res.getAnswer().contains("temporarily unable"));
    }

    @Test
    @DisplayName("Resident 10. 'My bills' returns bill history table")
    void testResidentMyBills() {
        ChatMessageResponse res = ask("resident@example.com", "My bills");
        assertNotNull(res.getAnswer());
        assertTrue(res.getAnswer().contains("Your Bill History"));
        assertTrue(res.getAnswer().contains("BILL-MAY-01"));
        assertTrue(res.getAnswer().contains("BILL-JUL-02"));
        assertFalse(res.getAnswer().contains("temporarily unable"));
    }

    @Test
    @DisplayName("Resident 11. 'All bills' returns bill history table")
    void testResidentAllBills() {
        ChatMessageResponse res = ask("resident@example.com", "All bills");
        assertNotNull(res.getAnswer());
        assertTrue(res.getAnswer().contains("Your Bill History"));
        assertTrue(res.getAnswer().contains("BILL-MAY-01"));
    }

    @Test
    @DisplayName("Resident 12. 'Bill history' returns bill history table")
    void testResidentBillHistory() {
        ChatMessageResponse res = ask("resident@example.com", "Bill history");
        assertNotNull(res.getAnswer());
        assertTrue(res.getAnswer().contains("Your Bill History"));
    }

    @Test
    @DisplayName("Resident 13. 'List my water usage' returns water usage history")
    void testResidentListMyWaterUsage() {
        WaterUsage u1 = WaterUsage.builder()
                .readingDate(LocalDate.of(2026, 6, 1))
                .unitsConsumed(20.0)
                .waterMeter(waterMeter)
                .build();
        when(waterUsageRepository.findAll()).thenReturn(List.of(u1));

        ChatMessageResponse res = ask("resident@example.com", "List my water usage");
        assertNotNull(res.getAnswer());
        assertTrue(res.getAnswer().contains("Usage History") || res.getAnswer().contains("Usage"));
    }

    @Test
    @DisplayName("Resident 14. 'List monthly water consumption' returns monthly table")
    void testResidentListMonthlyWaterConsumption() {
        WaterUsage u1 = WaterUsage.builder()
                .readingDate(LocalDate.of(2026, 5, 10))
                .unitsConsumed(25.0)
                .waterMeter(waterMeter)
                .build();
        when(waterUsageRepository.findAll()).thenReturn(List.of(u1));

        ChatMessageResponse res = ask("resident@example.com", "List monthly water consumption");
        assertNotNull(res.getAnswer());
        assertTrue(res.getAnswer().contains("Monthly Water Consumption"));
        assertTrue(res.getAnswer().contains("May 2026"));
    }

    @Test
    @DisplayName("Resident 15. 'My meter' returns assigned meter")
    void testResidentMyMeter() {
        ChatMessageResponse res = ask("resident@example.com", "My meter");
        assertNotNull(res.getAnswer());
        assertTrue(res.getAnswer().contains("Your Water Meter"));
        assertTrue(res.getAnswer().contains("WM-000001"));
    }

    @Test
    @DisplayName("Resident 16. 'My complaints' returns complaints records")
    void testResidentMyComplaints() {
        Complaint c1 = Complaint.builder().id(1L).ticketNumber("CMP-001").description("Low water pressure").status(ComplaintStatus.OPEN).build();
        when(complaintRepository.findByResidentIdOrderByCreatedAtDesc(100L)).thenReturn(List.of(c1));

        ChatMessageResponse res = ask("resident@example.com", "My complaints");
        assertNotNull(res.getAnswer());
        assertTrue(res.getAnswer().contains("Complaints"));
    }

    @Test
    @DisplayName("Resident 17. 'My alerts' returns alerts records")
    void testResidentMyAlerts() {
        Alert a1 = Alert.builder().id(1L).alertNumber("ALT-001").alertType(AlertType.POSSIBLE_LEAK).severity(AlertSeverity.HIGH).status(AlertStatus.ACTIVE).message("Leak detected on meter").build();
        when(alertRepository.findByResidentId(100L)).thenReturn(List.of(a1));

        ChatMessageResponse res = ask("resident@example.com", "My alerts");
        assertNotNull(res.getAnswer());
        assertTrue(res.getAnswer().contains("Alerts"));
    }

    // ==========================================
    // 3. MAIN ADMIN TESTS
    // ==========================================

    @Test
    @DisplayName("Main Admin 18. 'List all communities'")
    void testMaListCommunities() {
        ChatMessageResponse res = ask("ma@example.com", "List all communities");
        assertNotNull(res.getAnswer());
        assertTrue(res.getAnswer().contains("All Communities"));
        assertTrue(res.getAnswer().contains("Green Valley Residency"));
    }

    @Test
    @DisplayName("Main Admin 19. 'List all water meters'")
    void testMaListWaterMeters() {
        ChatMessageResponse res = ask("ma@example.com", "List all water meters");
        assertNotNull(res.getAnswer());
        assertTrue(res.getAnswer().contains("All Water Meters — Platform"));
        assertTrue(res.getAnswer().contains("WM-000001"));
    }

    @Test
    @DisplayName("Main Admin 20. 'List all bills'")
    void testMaListAllBills() {
        ChatMessageResponse res = ask("ma@example.com", "List all bills");
        assertNotNull(res.getAnswer());
        assertTrue(res.getAnswer().contains("All Bills — Platform"));
        assertTrue(res.getAnswer().contains("BILL-MAY-01"));
    }

    @Test
    @DisplayName("Main Admin 21. 'List monthly water consumption'")
    void testMaListMonthlyWaterConsumption() {
        WaterUsage u1 = WaterUsage.builder()
                .readingDate(LocalDate.of(2026, 4, 1))
                .unitsConsumed(5000.0)
                .build();
        when(waterUsageRepository.findByWaterMeterResidentProfileCommunityId(1L)).thenReturn(List.of(u1));

        ChatMessageResponse res = ask("ma@example.com", "List monthly water consumption");
        assertNotNull(res.getAnswer());
        assertTrue(res.getAnswer().contains("Monthly Water Consumption — Platform"));
        assertTrue(res.getAnswer().contains("April 2026"));
    }
}
