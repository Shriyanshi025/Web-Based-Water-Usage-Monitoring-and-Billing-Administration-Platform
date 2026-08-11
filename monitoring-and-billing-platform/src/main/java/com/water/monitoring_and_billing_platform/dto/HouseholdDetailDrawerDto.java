package com.water.monitoring_and_billing_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HouseholdDetailDrawerDto {
    private Long residentProfileId;
    private String flatNumber;
    private String residentName;
    private String phoneNumber;
    private String email;
    private String blockName;
    private String unitType;
    private int occupancy;

    // Meter Details
    private String meterNumber;
    private String installationDate;
    private String meterStatus;
    private String lastReadingDate;
    private Double lastReadingValue;

    // Benchmark & Score
    private int communityRank;
    private int totalHouseholds;
    private double efficiencyScore;
    private EfficiencyScoreBreakdownDto scoreBreakdown;
    private String badge;
    private String dataAvailabilityLabel;
    private String analyticsConfidence; // HIGH, MEDIUM, LOW

    // Usage & Averages
    private double currentUsage;
    private double prevUsage;
    private double usageChangePercent;
    private double communityAvg;
    private double similarHouseholdAvg;
    private boolean leakSuspected;
    private String leakReason;

    // Mini Chart Histories
    private List<MonthlyUsageDto> monthlyUsageHistory;
    private List<ChartDataDto> monthlyBillHistory;

    // Recent Records
    private List<BillResponse> recentBills;
    private List<PaymentResponse> recentPayments;
    private List<AlertResponse> activeAlerts;
    private List<ComplaintResponse> recentComplaints;
}
