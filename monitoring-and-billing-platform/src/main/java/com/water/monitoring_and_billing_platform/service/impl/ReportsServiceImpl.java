package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.dto.PeerBenchmarkingResponse;
import com.water.monitoring_and_billing_platform.dto.ReportAnalyticsDto;
import com.water.monitoring_and_billing_platform.entity.*;
import com.water.monitoring_and_billing_platform.enums.ApprovalStatus;
import com.water.monitoring_and_billing_platform.enums.BillStatus;
import com.water.monitoring_and_billing_platform.enums.ComplaintStatus;
import com.water.monitoring_and_billing_platform.repository.*;
import com.water.monitoring_and_billing_platform.service.ReportsService;
import com.water.monitoring_and_billing_platform.service.PeerBenchmarkingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportsServiceImpl implements ReportsService {

    private final CommunityAdminProfileRepository communityAdminProfileRepository;
    private final UserRepository userRepository;
    private final BulkWaterPurchaseRepository bulkWaterPurchaseRepository;
    private final WaterUsageRepository waterUsageRepository;
    private final BillRepository billRepository;
    private final PaymentRepository paymentRepository;
    private final ComplaintRepository complaintRepository;
    private final ResidentProfileRepository residentProfileRepository;
    private final WaterMeterRepository waterMeterRepository;
    private final PeerBenchmarkingService peerBenchmarkingService;

    /** Display formatter: "Jan 2025" */
    private static final DateTimeFormatter MONTH_LABEL_FMT = DateTimeFormatter.ofPattern("MMM yyyy");
    /** Parse formatter for sorting: reconstruct YearMonth from label */
    private static final DateTimeFormatter YEAR_MONTH_PARSE_FMT = DateTimeFormatter.ofPattern("MMM yyyy");

    @Override
    public ReportAnalyticsDto getCommunityReportAnalytics(
            String adminEmail,
            Long billingCycleId,
            Integer month,
            Integer year,
            LocalDate startDate,
            LocalDate endDate,
            String reportType
    ) {
        User user = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + adminEmail));

        CommunityAdminProfile adminProfile = communityAdminProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Community Admin profile not found."));

        Community community = adminProfile.getCommunity();
        Long communityId = community.getId();

        // ── 1. Fetch raw data filtered by community ──────────────────────────
        List<BulkWaterPurchase> purchases = bulkWaterPurchaseRepository.findByCommunityId(communityId);
        List<WaterUsage> usages = waterUsageRepository.findByWaterMeterResidentProfileCommunityId(communityId);
        List<Bill> bills = billRepository.findByResidentProfileCommunityId(communityId);
        List<Complaint> complaints = complaintRepository.findByCommunityIdOrderByCreatedAtDesc(communityId);
        List<ResidentProfile> residents = residentProfileRepository.findByCommunityId(communityId);
        List<WaterMeter> meters = waterMeterRepository.findByResidentProfileCommunityId(communityId);

        // ── 1b. EXCLUDE rejected / pending / suspended residents ─────────────
        // Only APPROVED + verified residents participate in analytics.
        // This prevents rejected registration requests from appearing in any
        // KPI, chart, table, or benchmark calculation.
        Set<Long> approvedResidentIds = residents.stream()
                .filter(rp -> rp.isVerified()
                        && rp.getUser() != null
                        && rp.getUser().getApprovalStatus() == ApprovalStatus.APPROVED)
                .map(ResidentProfile::getId)
                .collect(Collectors.toSet());

        residents = residents.stream()
                .filter(rp -> approvedResidentIds.contains(rp.getId()))
                .collect(Collectors.toList());

        // Filter water usages to approved residents only
        usages = usages.stream()
                .filter(u -> u.getWaterMeter() != null
                        && u.getWaterMeter().getResidentProfile() != null
                        && approvedResidentIds.contains(u.getWaterMeter().getResidentProfile().getId()))
                .collect(Collectors.toList());

        // Filter bills to approved residents only
        bills = bills.stream()
                .filter(b -> b.getResidentProfile() != null
                        && approvedResidentIds.contains(b.getResidentProfile().getId()))
                .collect(Collectors.toList());

        // Filter meters to approved residents only
        meters = meters.stream()
                .filter(m -> m.getResidentProfile() != null
                        && approvedResidentIds.contains(m.getResidentProfile().getId()))
                .collect(Collectors.toList());

        // Filter complaints to approved residents only (complaint.resident is the ResidentProfile)
        complaints = complaints.stream()
                .filter(c -> c.getResident() == null
                        || approvedResidentIds.contains(c.getResident().getId()))
                .collect(Collectors.toList());

        // ── 2. Apply optional filters ─────────────────────────────────────────
        if (billingCycleId != null) {
            purchases = purchases.stream()
                    .filter(p -> p.getBillingCycle() != null && p.getBillingCycle().getId().equals(billingCycleId))
                    .collect(Collectors.toList());
            bills = bills.stream()
                    .filter(b -> b.getBillingCycle() != null && b.getBillingCycle().getId().equals(billingCycleId))
                    .collect(Collectors.toList());
        }

        if (month != null) {
            final int m = month;
            purchases = purchases.stream()
                    .filter(p -> p.getPurchaseDate() != null && p.getPurchaseDate().getMonthValue() == m)
                    .collect(Collectors.toList());
            usages = usages.stream()
                    .filter(u -> u.getReadingDate() != null && u.getReadingDate().getMonthValue() == m)
                    .collect(Collectors.toList());
            bills = bills.stream()
                    .filter(b -> b.getBillingMonth() != null && b.getBillingMonth() == m)
                    .collect(Collectors.toList());
        }

        if (year != null) {
            final int y = year;
            purchases = purchases.stream()
                    .filter(p -> p.getPurchaseDate() != null && p.getPurchaseDate().getYear() == y)
                    .collect(Collectors.toList());
            usages = usages.stream()
                    .filter(u -> u.getReadingDate() != null && u.getReadingDate().getYear() == y)
                    .collect(Collectors.toList());
            bills = bills.stream()
                    .filter(b -> b.getBillingYear() != null && b.getBillingYear() == y)
                    .collect(Collectors.toList());
        }

        if (startDate != null && endDate != null) {
            purchases = purchases.stream()
                    .filter(p -> p.getPurchaseDate() != null
                            && !p.getPurchaseDate().isBefore(startDate)
                            && !p.getPurchaseDate().isAfter(endDate))
                    .collect(Collectors.toList());
            usages = usages.stream()
                    .filter(u -> u.getReadingDate() != null
                            && !u.getReadingDate().isBefore(startDate)
                            && !u.getReadingDate().isAfter(endDate))
                    .collect(Collectors.toList());
            bills = bills.stream()
                    .filter(b -> b.getBillDate() != null
                            && !b.getBillDate().isBefore(startDate)
                            && !b.getBillDate().isAfter(endDate))
                    .collect(Collectors.toList());
        }

        // ── 3. KPI Calculations ──────────────────────────────────────────────

        // Water balance
        double totalPurchased = purchases.stream()
                .mapToDouble(p -> p.getPurchasedVolume() != null ? p.getPurchasedVolume() : 0.0)
                .sum();
        double totalConsumed = usages.stream()
                .mapToDouble(WaterUsage::getUnitsConsumed)
                .sum();
        double waterLoss = Math.max(0.0, totalPurchased - totalConsumed);

        // Revenue — use totalAmount field (persisted final amount including tax/charges).
        // isPaid() / BillStatus.PAID or paymentStatus == "PAID" — check all three to be safe.
        double totalRevenueGenerated = bills.stream()
                .mapToDouble(b -> b.getTotalAmount() != null ? b.getTotalAmount().doubleValue() : 0.0)
                .sum();

        double totalRevenueCollected = bills.stream()
                .filter(this::isBillPaid)
                .mapToDouble(b -> b.getTotalAmount() != null ? b.getTotalAmount().doubleValue() : 0.0)
                .sum();

        double totalRevenuePending = Math.max(0.0, totalRevenueGenerated - totalRevenueCollected);
        double collectionEfficiency = totalRevenueGenerated > 0
                ? (totalRevenueCollected / totalRevenueGenerated) * 100.0
                : 100.0;

        // ── 4. Chart 1 & 2: Monthly Water Balance — sorted chronologically ──

        // Group purchases by YearMonth key
        Map<YearMonth, Double> purchasedByYM = new TreeMap<>();
        for (BulkWaterPurchase p : purchases) {
            if (p.getPurchaseDate() != null) {
                YearMonth ym = YearMonth.from(p.getPurchaseDate());
                purchasedByYM.merge(ym, p.getPurchasedVolume() != null ? p.getPurchasedVolume() : 0.0, Double::sum);
            }
        }

        // Group usages by YearMonth key
        Map<YearMonth, Double> consumedByYM = new TreeMap<>();
        for (WaterUsage u : usages) {
            if (u.getReadingDate() != null) {
                YearMonth ym = YearMonth.from(u.getReadingDate());
                consumedByYM.merge(ym, u.getUnitsConsumed(), Double::sum);
            }
        }

        // Union of all months, sorted (TreeMap guarantees order)
        Set<YearMonth> allWaterMonths = new TreeSet<>();
        allWaterMonths.addAll(purchasedByYM.keySet());
        allWaterMonths.addAll(consumedByYM.keySet());

        List<ReportAnalyticsDto.MonthlyWaterBalanceDto> waterBalanceTrend = new ArrayList<>();
        for (YearMonth ym : allWaterMonths) {
            double p = purchasedByYM.getOrDefault(ym, 0.0);
            double c = consumedByYM.getOrDefault(ym, 0.0);
            double l = Math.max(0.0, p - c);
            waterBalanceTrend.add(ReportAnalyticsDto.MonthlyWaterBalanceDto.builder()
                    .month(ym.format(MONTH_LABEL_FMT))
                    .purchased(round2(p))
                    .consumed(round2(c))
                    .loss(round2(l))
                    .build());
        }

        // ── 5. Chart 3: Revenue Trend — sorted chronologically ───────────────

        // Generated revenue grouped by bill date YearMonth
        Map<YearMonth, Double> generatedByYM = new TreeMap<>();
        for (Bill b : bills) {
            if (b.getBillDate() != null && b.getTotalAmount() != null) {
                YearMonth ym = YearMonth.from(b.getBillDate());
                generatedByYM.merge(ym, b.getTotalAmount().doubleValue(), Double::sum);
            }
        }

        // Collected revenue grouped by bill date YearMonth (for paid bills)
        Map<YearMonth, Double> collectedByYM = new TreeMap<>();
        for (Bill b : bills) {
            if (b.getBillDate() != null && b.getTotalAmount() != null && isBillPaid(b)) {
                YearMonth ym = YearMonth.from(b.getBillDate());
                collectedByYM.merge(ym, b.getTotalAmount().doubleValue(), Double::sum);
            }
        }

        Set<YearMonth> allRevenueMonths = new TreeSet<>();
        allRevenueMonths.addAll(generatedByYM.keySet());
        allRevenueMonths.addAll(collectedByYM.keySet());

        List<ReportAnalyticsDto.MonthlyRevenueTrendDto> revenueTrend = new ArrayList<>();
        for (YearMonth ym : allRevenueMonths) {
            double gen = generatedByYM.getOrDefault(ym, 0.0);
            double col = collectedByYM.getOrDefault(ym, 0.0);
            double pen = Math.max(0.0, gen - col);
            revenueTrend.add(ReportAnalyticsDto.MonthlyRevenueTrendDto.builder()
                    .month(ym.format(MONTH_LABEL_FMT))
                    .generated(round2(gen))
                    .collected(round2(col))
                    .pending(round2(pen))
                    .build());
        }

        // ── 6. Chart 4: Bill Payment Status Breakdown ────────────────────────
        long paidCount = bills.stream().filter(this::isBillPaid).count();
        long unpaidCount = bills.stream().filter(b -> !isBillPaid(b)).count();
        long overdueCount = bills.stream()
                .filter(b -> !isBillPaid(b) && b.getDueDate() != null && b.getDueDate().isBefore(LocalDate.now()))
                .count();
        long pendingCount = Math.max(0, unpaidCount - overdueCount);

        Map<String, Long> billPaymentStatusCounts = new LinkedHashMap<>();
        billPaymentStatusCounts.put("PAID", paidCount);
        billPaymentStatusCounts.put("PENDING", pendingCount);
        billPaymentStatusCounts.put("OVERDUE", overdueCount);

        // ── 7. Chart 5: Complaint Analytics ─────────────────────────────────
        Map<String, Long> complaintStatusCounts = new LinkedHashMap<>();
        for (ComplaintStatus cs : ComplaintStatus.values()) {
            long count = complaints.stream().filter(c -> c.getStatus() == cs).count();
            complaintStatusCounts.put(cs.name(), count);
        }

        // ── 8. Chart 6: Meter Reading Completion ────────────────────────────
        long totalMetersCount = meters.size();
        long metersWithReadings = meters.stream()
                .filter(m -> waterUsageRepository.findFirstByWaterMeterIdOrderByReadingDateDescIdDesc(m.getId()).isPresent())
                .count();
        long pendingMeters = Math.max(0, totalMetersCount - metersWithReadings);
        double completionPct = totalMetersCount > 0 ? (metersWithReadings * 100.0 / totalMetersCount) : 0.0;

        ReportAnalyticsDto.MeterCompletionDto meterCompletion = ReportAnalyticsDto.MeterCompletionDto.builder()
                .completedReadings(metersWithReadings)
                .pendingReadings(pendingMeters)
                .completionPercentage(round2(completionPct))
                .build();

        // ── 9. Chart 7 & 8: Top / Lowest Consumers (by summed unitsConsumed) ─
        // CRITICAL: Group by stable flat identity string (e.g. "A-A-101").
        // Grouping by flat key ensures each physical household flat number
        // appears EXACTLY ONCE in consumer rankings with all its meter readings aggregated.

        Map<String, Double> flatUsageMap = new HashMap<>();
        Map<String, String> flatResidentNameMap = new HashMap<>();

        for (WaterUsage u : usages) {
            if (u.getWaterMeter() != null && u.getWaterMeter().getResidentProfile() != null) {
                ResidentProfile rp = u.getWaterMeter().getResidentProfile();
                String bName = rp.getBlock() != null ? rp.getBlock().getBlockName() : "";
                String uNum = rp.getUnit() != null ? rp.getUnit().getUnitNumber() : "";
                String flatKey = (!bName.isEmpty() || !uNum.isEmpty()) ? bName + "-" + uNum : "Meter#" + u.getWaterMeter().getMeterNumber();

                flatUsageMap.merge(flatKey, u.getUnitsConsumed(), Double::sum);

                if (rp.getUser() != null && rp.getUser().getFullName() != null) {
                    flatResidentNameMap.putIfAbsent(flatKey, rp.getUser().getFullName());
                }
            }
        }

        List<ReportAnalyticsDto.ConsumerUsageDto> topHighest = flatUsageMap.entrySet().stream()
                .sorted((e1, e2) -> Double.compare(e2.getValue(), e1.getValue()))
                .limit(10)
                .map(e -> ReportAnalyticsDto.ConsumerUsageDto.builder()
                        .flatNumber(e.getKey())
                        .residentName(flatResidentNameMap.getOrDefault(e.getKey(), "Household"))
                        .unitsConsumed(round2(e.getValue()))
                        .build())
                .collect(Collectors.toList());

        List<ReportAnalyticsDto.ConsumerUsageDto> topLowest = flatUsageMap.entrySet().stream()
                .sorted(Comparator.comparingDouble(Map.Entry::getValue))
                .limit(10)
                .map(e -> ReportAnalyticsDto.ConsumerUsageDto.builder()
                        .flatNumber(e.getKey())
                        .residentName(flatResidentNameMap.getOrDefault(e.getKey(), "Household"))
                        .unitsConsumed(round2(e.getValue()))
                        .build())
                .collect(Collectors.toList());

        // ── 10. Community Benchmark Summary ──────────────────────────────────
        String bestBlock = "N/A";
        String worstBlock = "N/A";
        double avgScore = 0.0;

        if (!residents.isEmpty()) {
            List<Double> residentScores = new ArrayList<>();
            Map<String, List<Double>> blockScores = new HashMap<>();

            for (ResidentProfile rp : residents) {
                if (rp.getUser() != null && rp.getUser().getEmail() != null) {
                    try {
                        PeerBenchmarkingResponse resp = peerBenchmarkingService
                                .getResidentPeerBenchmarking(rp.getUser().getEmail());
                        if (resp != null) {
                            double score = resp.getWaterEfficiencyScore();
                            residentScores.add(score);
                            String bName = rp.getBlock() != null ? rp.getBlock().getBlockName() : "General";
                            blockScores.computeIfAbsent(bName, k -> new ArrayList<>()).add(score);
                        }
                    } catch (Exception ignored) {
                        // skip residents whose benchmarking cannot be computed
                    }
                }
            }

            if (!residentScores.isEmpty()) {
                avgScore = residentScores.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
            }

            if (!blockScores.isEmpty()) {
                Map<String, Double> blockAvgs = new HashMap<>();
                for (Map.Entry<String, List<Double>> entry : blockScores.entrySet()) {
                    double bAvg = entry.getValue().stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
                    blockAvgs.put(entry.getKey(), bAvg);
                }
                bestBlock = blockAvgs.entrySet().stream()
                        .max(Map.Entry.comparingByValue()).map(Map.Entry::getKey).orElse("N/A");
                worstBlock = blockAvgs.entrySet().stream()
                        .min(Map.Entry.comparingByValue()).map(Map.Entry::getKey).orElse("N/A");
            }
        }

        double avgRank = residents.isEmpty() ? 0.0 : (residents.size() + 1) / 2.0;
        ReportAnalyticsDto.BenchmarkSummaryDto benchmarkSummary = ReportAnalyticsDto.BenchmarkSummaryDto.builder()
                .averageScore(round1(avgScore))
                .bestPerformingBlock(bestBlock)
                .worstPerformingBlock(worstBlock)
                .averageRank(round1(avgRank))
                .build();

        // ── 11. Summary Tables ────────────────────────────────────────────────
        List<ReportAnalyticsDto.ResidentSummaryDto> residentSummaries = residents.stream().map(rp -> {
            WaterMeter m = waterMeterRepository.findFirstByResidentProfileIdOrderByIdDesc(rp.getId()).orElse(null);
            return ReportAnalyticsDto.ResidentSummaryDto.builder()
                    .officialUserId(rp.getOfficialUserId() != null ? rp.getOfficialUserId() : "-")
                    .name(rp.getUser() != null && rp.getUser().getFullName() != null ? rp.getUser().getFullName() : "N/A")
                    .email(rp.getUser() != null && rp.getUser().getEmail() != null ? rp.getUser().getEmail() : "N/A")
                    .block(rp.getBlock() != null ? rp.getBlock().getBlockName() : "-")
                    .unit(rp.getUnit() != null ? rp.getUnit().getUnitNumber() : "-")
                    .meterNumber(m != null ? m.getMeterNumber() : "N/A")
                    .currentReading(m != null && m.getCurrentReading() != null ? m.getCurrentReading() : 0.0)
                    .status(rp.isVerified() && rp.isActive() ? "ACTIVE" : "PENDING")
                    .build();
        }).collect(Collectors.toList());

        List<ReportAnalyticsDto.BillSummaryDto> billSummaries = bills.stream().map(b -> {
            String rName = (b.getResidentProfile() != null && b.getResidentProfile().getUser() != null)
                    ? b.getResidentProfile().getUser().getFullName() : "Resident";
            String bName = (b.getResidentProfile() != null && b.getResidentProfile().getBlock() != null)
                    ? b.getResidentProfile().getBlock().getBlockName() : "";
            String uNum = (b.getResidentProfile() != null && b.getResidentProfile().getUnit() != null)
                    ? b.getResidentProfile().getUnit().getUnitNumber() : "";
            String period = (b.getBillingMonth() != null ? b.getBillingMonth() : "-")
                    + "/" + (b.getBillingYear() != null ? b.getBillingYear() : "-");
            // Determine display status — prefer paymentStatus string, fall back to enum
            String displayStatus = "UNPAID";
            if (isBillPaid(b)) {
                displayStatus = "PAID";
            } else if (b.getDueDate() != null && b.getDueDate().isBefore(LocalDate.now())) {
                displayStatus = "OVERDUE";
            }
            return ReportAnalyticsDto.BillSummaryDto.builder()
                    .billNumber(b.getBillNumber() != null ? b.getBillNumber() : "-")
                    .residentName(rName)
                    .flatNumber(bName + "-" + uNum)
                    .billingPeriod(period)
                    .unitsConsumed(b.getUnitsConsumed() != null ? b.getUnitsConsumed() : 0.0)
                    .totalAmount(b.getTotalAmount() != null ? b.getTotalAmount().doubleValue() : 0.0)
                    .status(displayStatus)
                    .build();
        }).collect(Collectors.toList());

        DateTimeFormatter dtFmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        List<ReportAnalyticsDto.ComplaintSummaryDto> complaintSummaries = complaints.stream()
                .map(c -> ReportAnalyticsDto.ComplaintSummaryDto.builder()
                        .ticketNumber(c.getTicketNumber())
                        .residentName(c.getResident() != null && c.getResident().getUser() != null
                                ? c.getResident().getUser().getFullName() : "Resident")
                        .category(c.getCategory() != null ? c.getCategory().name() : "GENERAL")
                        .priority(c.getPriority() != null ? c.getPriority().name() : "MEDIUM")
                        .status(c.getStatus() != null ? c.getStatus().name() : "OPEN")
                        .createdAt(c.getCreatedAt() != null ? c.getCreatedAt().format(dtFmt) : "")
                        .build())
                .collect(Collectors.toList());

        // Block performance — group approved residents by block, sum their household flat consumption
        Map<String, List<ResidentProfile>> blockGroup = residents.stream()
                .filter(r -> r.getBlock() != null)
                .collect(Collectors.groupingBy(r -> r.getBlock().getBlockName()));

        List<ReportAnalyticsDto.BlockPerformanceDto> blockPerformances = new ArrayList<>();
        for (Map.Entry<String, List<ResidentProfile>> entry : blockGroup.entrySet()) {
            double blockUsage = entry.getValue().stream()
                    .mapToDouble(rp -> {
                        String bName = rp.getBlock() != null ? rp.getBlock().getBlockName() : "";
                        String uNum = rp.getUnit() != null ? rp.getUnit().getUnitNumber() : "";
                        String flatKey = (!bName.isEmpty() || !uNum.isEmpty()) ? bName + "-" + uNum : "N/A";
                        return flatUsageMap.getOrDefault(flatKey, 0.0);
                    })
                    .sum();
            double avgPerUnit = !entry.getValue().isEmpty() ? blockUsage / entry.getValue().size() : 0.0;
            blockPerformances.add(ReportAnalyticsDto.BlockPerformanceDto.builder()
                    .blockName(entry.getKey())
                    .totalUnitsCount((long) entry.getValue().size())
                    .totalConsumption(round2(blockUsage))
                    .averageConsumptionPerUnit(round2(avgPerUnit))
                    .build());
        }


        // ── Build and return DTO ──────────────────────────────────────────────
        return ReportAnalyticsDto.builder()
                .communityName(community.getCommunityName())
                .generatedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .totalWaterPurchased(round2(totalPurchased))
                .totalWaterConsumed(round2(totalConsumed))
                .totalWaterLoss(round2(waterLoss))
                .collectionEfficiencyPercentage(round2(collectionEfficiency))
                .totalRevenueGenerated(round2(totalRevenueGenerated))
                .totalRevenueCollected(round2(totalRevenueCollected))
                .totalRevenuePending(round2(totalRevenuePending))
                .waterBalanceTrend(waterBalanceTrend)
                .revenueTrend(revenueTrend)
                .billPaymentStatusCounts(billPaymentStatusCounts)
                .complaintStatusCounts(complaintStatusCounts)
                .meterCompletion(meterCompletion)
                .topHighestConsumers(topHighest)
                .topLowestConsumers(topLowest)
                .benchmarkSummary(benchmarkSummary)
                .residentSummaries(residentSummaries)
                .billSummaries(billSummaries)
                .complaintSummaries(complaintSummaries)
                .blockPerformances(blockPerformances)
                .build();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * A bill is considered PAID if any of the following are true:
     * - {@code bill.isPaid()} returns true
     * - {@code bill.getStatus()} == BillStatus.PAID
     * - {@code bill.getPaymentStatus()} equals "PAID" (case-insensitive)
     */
    private boolean isBillPaid(Bill b) {
        if (b.isPaid()) return true;
        if (b.getStatus() == BillStatus.PAID) return true;
        if ("PAID".equalsIgnoreCase(b.getPaymentStatus())) return true;
        return false;
    }

    private ReportAnalyticsDto.ConsumerUsageDto buildHouseholdConsumerDto(WaterMeter meter, double usage) {
        String name = "Household";
        String flat = "Meter #" + (meter != null && meter.getMeterNumber() != null ? meter.getMeterNumber() : "N/A");
        if (meter != null && meter.getResidentProfile() != null) {
            ResidentProfile rp = meter.getResidentProfile();
            if (rp.getUser() != null && rp.getUser().getFullName() != null) {
                name = rp.getUser().getFullName();
            }
            String bName = rp.getBlock() != null ? rp.getBlock().getBlockName() : "";
            String uNum = rp.getUnit() != null ? rp.getUnit().getUnitNumber() : "";
            if (!bName.isEmpty() || !uNum.isEmpty()) {
                flat = bName + "-" + uNum;
            }
        }
        return ReportAnalyticsDto.ConsumerUsageDto.builder()
                .residentName(name)
                .flatNumber(flat)
                .unitsConsumed(round2(usage))
                .build();
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

    private static double round1(double v) {
        return Math.round(v * 10.0) / 10.0;
    }
}

