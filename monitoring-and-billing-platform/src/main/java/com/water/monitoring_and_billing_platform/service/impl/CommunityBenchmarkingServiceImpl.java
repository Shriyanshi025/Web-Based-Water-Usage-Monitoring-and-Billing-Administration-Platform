package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.dto.*;
import com.water.monitoring_and_billing_platform.entity.*;
import com.water.monitoring_and_billing_platform.enums.ApprovalStatus;
import com.water.monitoring_and_billing_platform.enums.PaymentStatus;
import com.water.monitoring_and_billing_platform.enums.UnitType;
import com.water.monitoring_and_billing_platform.repository.*;
import com.water.monitoring_and_billing_platform.service.CommunityBenchmarkingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommunityBenchmarkingServiceImpl implements CommunityBenchmarkingService {

    private final UserRepository userRepository;
    private final CommunityAdminProfileRepository communityAdminProfileRepository;
    private final ResidentProfileRepository residentProfileRepository;
    private final WaterMeterRepository waterMeterRepository;
    private final WaterUsageRepository waterUsageRepository;
    private final BillRepository billRepository;
    private final PaymentRepository paymentRepository;
    private final ComplaintRepository complaintRepository;
    private final BulkWaterPurchaseRepository bulkWaterPurchaseRepository;
    private final BlockRepository blockRepository;

    private static final DateTimeFormatter MONTH_FMT = DateTimeFormatter.ofPattern("MMM yyyy");

    @Override
    public CommunityBenchmarkingDto getBenchmarkingDashboard(String adminEmail, CommunityBenchmarkingFilterDto filter) {
        if (filter == null) {
            filter = new CommunityBenchmarkingFilterDto();
        }

        Community community = resolveAdminCommunity(adminEmail);
        Long communityId = community.getId();

        // 1. Fetch only APPROVED and VERIFIED active residents
        List<ResidentProfile> approvedResidents = getApprovedVerifiedResidents(communityId);
        Set<Long> approvedResidentIds = approvedResidents.stream().map(ResidentProfile::getId).collect(Collectors.toSet());

        // 2. Resolve Snapshot & Time Window Date Range
        String snapshotId = filter.getSnapshotId() != null && !filter.getSnapshotId().isEmpty()
                ? filter.getSnapshotId()
                : UUID.randomUUID().toString();
        String generatedAt = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

        LocalDate[] dateRange = resolveDateRange(communityId, filter);
        LocalDate startDate = dateRange[0];
        LocalDate endDate = dateRange[1];

        String periodLabel = buildPeriodLabel(startDate, endDate, filter.getTimeWindow());

        // 3. Fetch usage data for date range
        List<WaterUsage> allUsages = waterUsageRepository.findByWaterMeterResidentProfileCommunityIdAndReadingDateBetween(
                communityId, startDate, endDate
        ).stream().filter(wu -> wu.getWaterMeter() != null
                && wu.getWaterMeter().getResidentProfile() != null
                && approvedResidentIds.contains(wu.getWaterMeter().getResidentProfile().getId()))
         .collect(Collectors.toList());

        // Fetch previous month usages for trend calculation
        LocalDate prevMonthStart = startDate.minusMonths(1).withDayOfMonth(1);
        LocalDate prevMonthEnd = startDate.minusMonths(1).withDayOfMonth(startDate.minusMonths(1).lengthOfMonth());
        List<WaterUsage> prevUsages = waterUsageRepository.findByWaterMeterResidentProfileCommunityIdAndReadingDateBetween(
                communityId, prevMonthStart, prevMonthEnd
        ).stream().filter(wu -> wu.getWaterMeter() != null
                && wu.getWaterMeter().getResidentProfile() != null
                && approvedResidentIds.contains(wu.getWaterMeter().getResidentProfile().getId()))
         .collect(Collectors.toList());

        Map<Long, Double> currentUsageByResident = aggregateUsageByResident(allUsages);
        Map<Long, Double> prevUsageByResident = aggregateUsageByResident(prevUsages);

        // 4. Calculate Community & Similar Household Baselines
        double totalCommunityUsage = currentUsageByResident.values().stream().mapToDouble(Double::doubleValue).sum();
        double communityAvg = approvedResidents.isEmpty() ? 0.0 : totalCommunityUsage / Math.max(1, approvedResidents.size());

        Map<UnitType, Map<Integer, Double>> similarAvgMap = computeSimilarHouseholdAverages(approvedResidents, currentUsageByResident);

        // 5. Data Availability & Confidence
        int availableMonthsCount = computeAvailableMonthsCount(communityId, endDate);
        String confidence = availableMonthsCount >= 10 ? "HIGH" : availableMonthsCount >= 6 ? "MEDIUM" : "LOW";
        String confidenceLabel = availableMonthsCount + "/12 months available (" + confidence + " Confidence)";

        // 6. Bills & Payments
        List<Bill> communityBills = billRepository.findByResidentProfileCommunityId(communityId).stream()
                .filter(b -> b.getResidentProfile() != null && approvedResidentIds.contains(b.getResidentProfile().getId()))
                .collect(Collectors.toList());

        List<Payment> communityPayments = paymentRepository.findByBillResidentProfileCommunityId(communityId).stream()
                .filter(p -> p.getResident() != null && approvedResidentIds.contains(p.getResident().getId()))
                .collect(Collectors.toList());

        List<Complaint> communityComplaints = complaintRepository.findByCommunityIdOrderByCreatedAtDesc(communityId).stream()
                .filter(c -> c.getResident() != null && approvedResidentIds.contains(c.getResident().getId()))
                .collect(Collectors.toList());

        // 7. Build Household Rankings & Efficiency Scores
        List<HouseholdRankingDto> rawRankings = new ArrayList<>();
        Map<Long, EfficiencyScoreBreakdownDto> scoreBreakdowns = new HashMap<>();

        for (ResidentProfile rp : approvedResidents) {
            Long rId = rp.getId();
            double cUsage = currentUsageByResident.getOrDefault(rId, 0.0);
            double pUsage = prevUsageByResident.getOrDefault(rId, 0.0);
            int occupancy = (rp.getUnit() != null && rp.getUnit().getOccupancy() != null) ? rp.getUnit().getOccupancy() : 1;
            UnitType uType = (rp.getUnit() != null) ? rp.getUnit().getUnitType() : UnitType.FLAT;

            double similarAvg = similarAvgMap.getOrDefault(uType, Collections.emptyMap()).getOrDefault(occupancy, communityAvg);

            boolean leakSuspected = cUsage > (similarAvg * 2.2) && cUsage > 15.0;

            EfficiencyScoreBreakdownDto breakdown = calculateEfficiencyBreakdown(cUsage, pUsage, communityAvg, similarAvg, occupancy, leakSuspected);
            scoreBreakdowns.put(rId, breakdown);

            double diffPct = communityAvg > 0 ? ((cUsage - communityAvg) / communityAvg) * 100.0 : 0.0;
            String badge = diffPct <= -15.0 ? "TOP_SAVER" : diffPct >= 15.0 ? "HIGH_CONSUMER" : "AVERAGE";

            String bStatus = determineResidentBillStatus(rId, communityBills);

            double trendPct = pUsage > 0 ? ((cUsage - pUsage) / pUsage) * 100.0 : 0.0;
            String trend = trendPct > 3.0 ? "UP" : trendPct < -3.0 ? "DOWN" : "STABLE";

            HouseholdRankingDto item = HouseholdRankingDto.builder()
                    .residentProfileId(rId)
                    .blockName(rp.getBlock() != null ? rp.getBlock().getBlockName() : "Block A")
                    .unitNumber(rp.getUnit() != null ? rp.getUnit().getUnitNumber() : "Unit")
                    .flatNumber((rp.getBlock() != null ? rp.getBlock().getBlockName() : "") + "-" + (rp.getUnit() != null ? rp.getUnit().getUnitNumber() : ""))
                    .residentName(rp.getUser() != null ? rp.getUser().getFullName() : "Resident")
                    .occupancy(occupancy)
                    .currentMonthUsage(round(cUsage, 1))
                    .communityAvg(round(communityAvg, 1))
                    .communityAvgDiffPercent(round(diffPct, 1))
                    .efficiencyScore(round(breakdown.getTotalScore(), 0))
                    .badge(badge)
                    .billStatus(bStatus)
                    .trend(trend)
                    .trendChangePercent(round(trendPct, 1))
                    .leakSuspected(leakSuspected)
                    .build();

            rawRankings.add(item);
        }

        // Sort rankings by currentMonthUsage ASC (Lowest consumer = Rank 1)
        rawRankings.sort(Comparator.comparingDouble(HouseholdRankingDto::getCurrentMonthUsage));
        for (int i = 0; i < rawRankings.size(); i++) {
            rawRankings.get(i).setRank(i + 1);
        }

        // 8. Previous Period Rankings for Ranking Movement
        List<RankingMovementDto> movements = calculateRankingMovements(approvedResidents, prevUsageByResident, rawRankings);

        // 9. Filter Rankings according to filter params
        List<HouseholdRankingDto> filteredRankings = applyFilters(rawRankings, filter);

        // 10. Summary KPIs
        BenchmarkSummaryDto summary = buildSummaryKpis(rawRankings, communityBills, communityPayments, communityAvg);

        // 11. Block Benchmarking
        List<BlockBenchmarkDto> blockBenchmarking = buildBlockBenchmarking(communityId, approvedResidents, currentUsageByResident, communityBills, communityPayments, communityComplaints);

        // 12. Scatter Plot Points — use 12-month historical range so chart always has real data
        //     even when the selected time window returns zero readings for the current period.
        LocalDate scatterEnd = endDate;
        LocalDate scatterStart = scatterEnd.minusMonths(11).withDayOfMonth(1);
        List<WaterUsage> historicalUsages = waterUsageRepository.findByWaterMeterResidentProfileCommunityIdAndReadingDateBetween(
                communityId, scatterStart, scatterEnd
        ).stream().filter(wu -> wu.getWaterMeter() != null
                && wu.getWaterMeter().getResidentProfile() != null
                && approvedResidentIds.contains(wu.getWaterMeter().getResidentProfile().getId()))
         .collect(Collectors.toList());
        Map<Long, Double> historicalUsageByResident = aggregateUsageByResident(historicalUsages);

        // If historical data is also empty, fall back to currentUsageByResident
        Map<Long, Double> scatterUsageMap = historicalUsageByResident.isEmpty() ? currentUsageByResident : historicalUsageByResident;

        double scatterCommTotal = scatterUsageMap.values().stream().mapToDouble(Double::doubleValue).sum();
        double scatterMonthlyAvg = approvedResidents.isEmpty() ? 0.0 : (scatterCommTotal / Math.max(1, approvedResidents.size())) / 12.0;

        List<HouseholdScatterPointDto> scatterPoints = filteredRankings.stream().map(r -> {
            double scatterConsumption = round(scatterUsageMap.getOrDefault(r.getResidentProfileId(), 0.0), 1);
            boolean scatterLeakSuspected = scatterMonthlyAvg > 0 && scatterConsumption > (scatterMonthlyAvg * 12.0 * 2.2) && scatterConsumption > 180.0;
            return HouseholdScatterPointDto.builder()
                    .residentProfileId(r.getResidentProfileId())
                    .flatNumber(r.getFlatNumber())
                    .blockName(r.getBlockName())
                    .occupancy(r.getOccupancy())
                    .consumption(scatterConsumption)
                    .efficiencyScore(r.getEfficiencyScore())
                    .leakSuspected(scatterLeakSuspected)
                    .build();
        }).collect(Collectors.toList());

        // 13. Top Performers
        List<HouseholdRankingDto> savers = rawRankings.stream().limit(10).collect(Collectors.toList());
        List<HouseholdRankingDto> highConsumers = new ArrayList<>(rawRankings);
        highConsumers.sort(Comparator.comparingDouble(HouseholdRankingDto::getCurrentMonthUsage).reversed());
        List<HouseholdRankingDto> topHigh = highConsumers.stream().limit(10).collect(Collectors.toList());
        TopPerformersDto topPerformers = new TopPerformersDto(savers, topHigh);

        // 14. Community Trend Analysis
        CommunityTrendDto trendAnalysis = buildCommunityTrends(communityId, endDate, approvedResidentIds);

        // 15. Insights
        List<BenchmarkInsightDto> insights = buildBenchmarkInsights(rawRankings, blockBenchmarking, summary);

        // 16. Household Dropdown Options
        List<HouseholdOptionDto> householdOptions = approvedResidents.stream().map(rp -> HouseholdOptionDto.builder()
                .residentProfileId(rp.getId())
                .flatNumber((rp.getBlock() != null ? rp.getBlock().getBlockName() : "") + "-" + (rp.getUnit() != null ? rp.getUnit().getUnitNumber() : ""))
                .residentName(rp.getUser() != null ? rp.getUser().getFullName() : "Resident")
                .blockName(rp.getBlock() != null ? rp.getBlock().getBlockName() : "")
                .build()).collect(Collectors.toList());

        // Optional A vs B comparison if requested
        HouseholdComparisonDto compA = null;
        HouseholdComparisonDto compB = null;
        if (filter.getHouseholdAId() != null && filter.getHouseholdBId() != null) {
            compA = getHouseholdComparison(adminEmail, filter.getHouseholdAId(), filter.getHouseholdBId(), filter);
            compB = getHouseholdComparison(adminEmail, filter.getHouseholdBId(), filter.getHouseholdAId(), filter);
        } else if (filter.getHouseholdAId() != null) {
            compA = buildHouseholdComparison(filter.getHouseholdAId(), YearMonth.from(endDate), approvedResidents, currentUsageByResident, communityBills, communityAvg);
        }

        return CommunityBenchmarkingDto.builder()
                .benchmarkSnapshotId(snapshotId)
                .benchmarkPeriodLabel(periodLabel)
                .benchmarkGeneratedAt(generatedAt)
                .analyticsConfidence(confidence)
                .confidenceLabel(confidenceLabel)
                .summary(summary)
                .blockBenchmarking(blockBenchmarking)
                .rankings(filteredRankings)
                .rankingMovements(movements)
                .scatterPoints(scatterPoints)
                .topPerformers(topPerformers)
                .comparisonA(compA)
                .comparisonB(compB)
                .trendAnalysis(trendAnalysis)
                .insights(insights)
                .householdDropdownOptions(householdOptions)
                .build();
    }

    @Override
    public HouseholdDetailDrawerDto getHouseholdDetails(String adminEmail, Long residentProfileId, CommunityBenchmarkingFilterDto filter) {
        Community community = resolveAdminCommunity(adminEmail);
        ResidentProfile rp = residentProfileRepository.findById(residentProfileId)
                .orElseThrow(() -> new IllegalArgumentException("Resident profile not found: " + residentProfileId));

        if (!rp.getCommunity().getId().equals(community.getId())) {
            throw new IllegalArgumentException("Resident does not belong to admin community.");
        }

        LocalDate endDate = (filter != null && filter.getEndDate() != null) ? filter.getEndDate() : LocalDate.now();

        // Approved residents check
        List<ResidentProfile> approvedResidents = getApprovedVerifiedResidents(community.getId());
        Set<Long> approvedResidentIds = approvedResidents.stream().map(ResidentProfile::getId).collect(Collectors.toSet());

        // Meter Details
        WaterMeter meter = waterMeterRepository.findByResidentProfileId(rp.getId()).orElse(null);

        // Current & previous usage
        LocalDate monthStart = endDate.withDayOfMonth(1);
        LocalDate monthEnd = endDate.withDayOfMonth(endDate.lengthOfMonth());

        List<WaterUsage> curUsages = waterUsageRepository.findByWaterMeterIdAndReadingDateBetween(
                meter != null ? meter.getId() : -1L, monthStart, monthEnd
        );
        double cUsage = curUsages.stream().mapToDouble(WaterUsage::getUnitsConsumed).sum();

        LocalDate prevMonthStart = monthStart.minusMonths(1);
        LocalDate prevMonthEnd = prevMonthStart.withDayOfMonth(prevMonthStart.lengthOfMonth());
        List<WaterUsage> prevUsages = waterUsageRepository.findByWaterMeterIdAndReadingDateBetween(
                meter != null ? meter.getId() : -1L, prevMonthStart, prevMonthEnd
        );
        double pUsage = prevUsages.stream().mapToDouble(WaterUsage::getUnitsConsumed).sum();

        // Baselines
        List<WaterUsage> allCommunityUsage = waterUsageRepository.findByWaterMeterResidentProfileCommunityIdAndReadingDateBetween(
                community.getId(), monthStart, monthEnd
        );
        double totalCommUsage = allCommunityUsage.stream().mapToDouble(WaterUsage::getUnitsConsumed).sum();
        double commAvg = approvedResidents.isEmpty() ? 0.0 : totalCommUsage / Math.max(1, approvedResidents.size());

        int occupancy = rp.getUnit() != null && rp.getUnit().getOccupancy() != null ? rp.getUnit().getOccupancy() : 1;
        UnitType uType = rp.getUnit() != null ? rp.getUnit().getUnitType() : UnitType.FLAT;

        Map<Long, Double> currentUsageMap = new HashMap<>();
        currentUsageMap.put(rp.getId(), cUsage);
        Map<UnitType, Map<Integer, Double>> similarAvgMap = computeSimilarHouseholdAverages(approvedResidents, currentUsageMap);
        double similarAvg = similarAvgMap.getOrDefault(uType, Collections.emptyMap()).getOrDefault(occupancy, commAvg);

        boolean leakSuspected = cUsage > (similarAvg * 2.2) && cUsage > 15.0;
        EfficiencyScoreBreakdownDto scoreBreakdown = calculateEfficiencyBreakdown(cUsage, pUsage, commAvg, similarAvg, occupancy, leakSuspected);

        double diffPct = commAvg > 0 ? ((cUsage - commAvg) / commAvg) * 100.0 : 0.0;
        String badge = diffPct <= -15.0 ? "TOP_SAVER" : diffPct >= 15.0 ? "HIGH_CONSUMER" : "AVERAGE";

        // Meter Details
        String meterNumber = meter != null ? meter.getMeterNumber() : "N/A";
        String installDate = meter != null && meter.getInstallationDate() != null ? meter.getInstallationDate().toString() : "N/A";
        String meterStatus = meter != null && meter.getMeterStatus() != null ? meter.getMeterStatus().name() : "INACTIVE";

        Optional<WaterUsage> latestReading = waterUsageRepository.findFirstByWaterMeterIdOrderByReadingDateDescIdDesc(meter != null ? meter.getId() : -1L);
        String lastReadingDate = latestReading.map(w -> w.getReadingDate().toString()).orElse("N/A");
        Double lastReadingValue = latestReading.map(WaterUsage::getCurrentReading).orElse(0.0);

        // Usage history (12 months)
        List<MonthlyUsageDto> monthlyUsageHistory = new ArrayList<>();
        YearMonth ymEnd = YearMonth.from(endDate);
        int availableCount = 0;

        for (int i = 11; i >= 0; i--) {
            YearMonth ym = ymEnd.minusMonths(i);
            LocalDate s = ym.atDay(1);
            LocalDate e = ym.atEndOfMonth();
            List<WaterUsage> uList = waterUsageRepository.findByWaterMeterIdAndReadingDateBetween(meter != null ? meter.getId() : -1L, s, e);
            double val = uList.stream().mapToDouble(WaterUsage::getUnitsConsumed).sum();
            if (val > 0) availableCount++;
            monthlyUsageHistory.add(new MonthlyUsageDto(ym.format(MONTH_FMT), round(val, 1)));
        }

        String dataAvailabilityLabel = availableCount + " of last 12 months recorded";
        String confidence = availableCount >= 10 ? "HIGH" : availableCount >= 6 ? "MEDIUM" : "LOW";

        // Recent Bills & Payments
        List<Bill> bills = billRepository.findByResidentProfileId(rp.getId());
        List<BillResponse> recentBills = bills.stream().map(this::mapToBillResponse).collect(Collectors.toList());

        List<Payment> payments = paymentRepository.findByResidentId(rp.getId());
        List<PaymentResponse> recentPayments = payments.stream().map(this::mapToPaymentResponse).collect(Collectors.toList());

        List<Complaint> complaints = complaintRepository.findByResidentIdOrderByCreatedAtDesc(rp.getId());
        List<ComplaintResponse> recentComplaints = complaints.stream().map(this::mapToComplaintResponse).collect(Collectors.toList());

        // Calculate community rank for the current month using competition ranking
        Map<Long, Double> communityUsageMap = aggregateUsageByResident(allCommunityUsage);
        Map<Long, Double> roundedUsages = new HashMap<>();
        for (ResidentProfile rpItem : approvedResidents) {
            roundedUsages.put(rpItem.getId(), round(communityUsageMap.getOrDefault(rpItem.getId(), 0.0), 1));
        }

        List<Map.Entry<Long, Double>> sortedEntries = new ArrayList<>(roundedUsages.entrySet());
        sortedEntries.sort(Map.Entry.comparingByValue());

        int rank = 1;
        Double previousUsage = null;
        int countWithSameOrBetter = 0;
        for (int i = 0; i < sortedEntries.size(); i++) {
            Map.Entry<Long, Double> entry = sortedEntries.get(i);
            Double usageVal = entry.getValue();
            countWithSameOrBetter++;
            if (previousUsage == null || !previousUsage.equals(usageVal)) {
                rank = countWithSameOrBetter;
                previousUsage = usageVal;
            }
            if (entry.getKey().equals(rp.getId())) {
                break;
            }
        }

        return HouseholdDetailDrawerDto.builder()
                .residentProfileId(rp.getId())
                .flatNumber((rp.getBlock() != null ? rp.getBlock().getBlockName() : "") + "-" + (rp.getUnit() != null ? rp.getUnit().getUnitNumber() : ""))
                .residentName(rp.getUser() != null ? rp.getUser().getFullName() : "Resident")
                .phoneNumber(rp.getPhoneNumber())
                .email(rp.getUser() != null ? rp.getUser().getEmail() : "")
                .blockName(rp.getBlock() != null ? rp.getBlock().getBlockName() : "")
                .unitType(uType.name())
                .occupancy(occupancy)
                .meterNumber(meterNumber)
                .installationDate(installDate)
                .meterStatus(meterStatus)
                .lastReadingDate(lastReadingDate)
                .lastReadingValue(lastReadingValue)
                .communityRank(rank)
                .totalHouseholds(approvedResidents.size())
                .efficiencyScore(round(scoreBreakdown.getTotalScore(), 0))
                .scoreBreakdown(scoreBreakdown)
                .badge(badge)
                .dataAvailabilityLabel(dataAvailabilityLabel)
                .analyticsConfidence(confidence)
                .currentUsage(round(cUsage, 1))
                .prevUsage(round(pUsage, 1))
                .usageChangePercent(round(pUsage > 0 ? ((cUsage - pUsage) / pUsage) * 100.0 : 0.0, 1))
                .communityAvg(round(commAvg, 1))
                .similarHouseholdAvg(round(similarAvg, 1))
                .leakSuspected(leakSuspected)
                .leakReason(leakSuspected ? "Abnormal usage spike 2.2x above similar household average" : "Normal consumption pattern")
                .monthlyUsageHistory(monthlyUsageHistory)
                .monthlyBillHistory(Collections.emptyList())
                .recentBills(recentBills)
                .recentPayments(recentPayments)
                .activeAlerts(Collections.emptyList())
                .recentComplaints(recentComplaints)
                .build();
    }

    @Override
    public HouseholdComparisonDto getHouseholdComparison(String adminEmail, Long householdAId, Long householdBId, CommunityBenchmarkingFilterDto filter) {
        Community community = resolveAdminCommunity(adminEmail);
        List<ResidentProfile> approvedResidents = getApprovedVerifiedResidents(community.getId());

        // ── Find the latest month for which BOTH households have water usage data ──
        // Search backwards from the most recent reading date in the DB, up to 24 months
        Optional<LocalDate> latestReadingOpt = waterUsageRepository
                .findByWaterMeterResidentProfileCommunityIdAndReadingDateBetween(
                        community.getId(),
                        LocalDate.now().minusYears(3),
                        LocalDate.now())
                .stream()
                .map(WaterUsage::getReadingDate)
                .filter(Objects::nonNull)
                .max(Comparator.naturalOrder());

        LocalDate searchEnd = latestReadingOpt.orElse(LocalDate.now());
        YearMonth commonPeriod = null;

        WaterMeter meterA = waterMeterRepository.findByResidentProfileId(householdAId).orElse(null);
        WaterMeter meterB = waterMeterRepository.findByResidentProfileId(householdBId).orElse(null);

        if (meterA != null && meterB != null) {
            // Walk back month by month from the latest possible month until we find a month where both have readings
            YearMonth cursor = YearMonth.from(searchEnd);
            for (int attempt = 0; attempt < 24; attempt++) {
                LocalDate s = cursor.atDay(1);
                LocalDate e = cursor.atEndOfMonth();
                boolean aHasData = !waterUsageRepository.findByWaterMeterIdAndReadingDateBetween(meterA.getId(), s, e).isEmpty();
                boolean bHasData = !waterUsageRepository.findByWaterMeterIdAndReadingDateBetween(meterB.getId(), s, e).isEmpty();
                if (aHasData && bHasData) {
                    commonPeriod = cursor;
                    break;
                }
                cursor = cursor.minusMonths(1);
            }
        }

        if (commonPeriod == null) {
            // No common period found — return explicit "no data" DTOs
            String noDataLabel = "No common billing period available";
            HouseholdComparisonDto emptyA = buildEmptyComparison(householdAId, approvedResidents, noDataLabel);
            HouseholdComparisonDto emptyB = buildEmptyComparison(householdBId, approvedResidents, noDataLabel);
            // Caller in controller expects single DTO; we store both in the map — return A here, B is handled in controller
            return emptyA;
        }

        LocalDate periodEnd = commonPeriod.atEndOfMonth();

        // Fetch community usage for the common period
        LocalDate monthStart = commonPeriod.atDay(1);
        List<WaterUsage> allCommUsage = waterUsageRepository.findByWaterMeterResidentProfileCommunityIdAndReadingDateBetween(
                community.getId(), monthStart, periodEnd
        );
        Map<Long, Double> curUsageMap = aggregateUsageByResident(allCommUsage);
        double commAvg = approvedResidents.isEmpty() ? 0.0 : curUsageMap.values().stream().mapToDouble(Double::doubleValue).sum() / Math.max(1, approvedResidents.size());

        List<Bill> bills = billRepository.findByResidentProfileCommunityId(community.getId());

        return buildHouseholdComparison(householdAId, commonPeriod, approvedResidents, curUsageMap, bills, commAvg);
    }

    /** Returns a blank DTO with a "no data" label when no common period is found. */
    private HouseholdComparisonDto buildEmptyComparison(Long rId, List<ResidentProfile> approvedResidents, String label) {
        ResidentProfile rp = approvedResidents.stream().filter(r -> r.getId().equals(rId)).findFirst().orElse(null);
        return HouseholdComparisonDto.builder()
                .residentProfileId(rId)
                .flatNumber(rp != null ? (rp.getBlock() != null ? rp.getBlock().getBlockName() : "") + "-" + (rp.getUnit() != null ? rp.getUnit().getUnitNumber() : "") : "")
                .residentName(rp != null && rp.getUser() != null ? rp.getUser().getFullName() : "Resident")
                .blockName(rp != null && rp.getBlock() != null ? rp.getBlock().getBlockName() : "")
                .unitType("FLAT")
                .occupancy(1)
                .totalConsumption(0.0)
                .avgMonthlyConsumption(0.0)
                .efficiencyScore(0.0)
                .communityRank(0)
                .totalBilled(BigDecimal.ZERO)
                .totalPaid(BigDecimal.ZERO)
                .comparisonPeriodLabel(label)
                .monthlyUsage(Collections.emptyList())
                .monthlyBills(Collections.emptyList())
                .build();
    }

    @Override
    public List<HouseholdRankingDto> getTopConsumers(String adminEmail, int limit) {
        CommunityBenchmarkingDto dto = getBenchmarkingDashboard(adminEmail, new CommunityBenchmarkingFilterDto());
        return dto.getTopPerformers() != null ? dto.getTopPerformers().getTopHighConsumers().stream().limit(limit).collect(Collectors.toList()) : Collections.emptyList();
    }

    @Override
    public List<HouseholdRankingDto> getLowestConsumers(String adminEmail, int limit) {
        CommunityBenchmarkingDto dto = getBenchmarkingDashboard(adminEmail, new CommunityBenchmarkingFilterDto());
        return dto.getTopPerformers() != null ? dto.getTopPerformers().getTopSavers().stream().limit(limit).collect(Collectors.toList()) : Collections.emptyList();
    }

    @Override
    public List<BenchmarkInsightDto> getBenchmarkInsights(String adminEmail) {
        CommunityBenchmarkingDto dto = getBenchmarkingDashboard(adminEmail, new CommunityBenchmarkingFilterDto());
        return dto.getInsights() != null ? dto.getInsights() : Collections.emptyList();
    }

    @Override
    public List<BlockBenchmarkDto> getBlockSummary(String adminEmail) {
        CommunityBenchmarkingDto dto = getBenchmarkingDashboard(adminEmail, new CommunityBenchmarkingFilterDto());
        return dto.getBlockBenchmarking() != null ? dto.getBlockBenchmarking() : Collections.emptyList();
    }

    // ==========================================
    // HELPER CALCULATIONS & DATA AGGREGATORS
    // ==========================================

    private Community resolveAdminCommunity(String adminEmail) {
        User user = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + adminEmail));
        CommunityAdminProfile profile = communityAdminProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Community Admin profile not found."));
        return profile.getCommunity();
    }

    private List<ResidentProfile> getApprovedVerifiedResidents(Long communityId) {
        return residentProfileRepository.findByCommunityId(communityId).stream()
                .filter(rp -> rp.isVerified()
                        && rp.isActive()
                        && rp.getUser() != null
                        && rp.getUser().getApprovalStatus() == ApprovalStatus.APPROVED)
                .collect(Collectors.toList());
    }

    private LocalDate[] resolveDateRange(Long communityId, CommunityBenchmarkingFilterDto filter) {
        LocalDate end = LocalDate.now();
        Optional<WaterUsage> latest = waterUsageRepository.findFirstByWaterMeterResidentProfileCommunityIdOrderByReadingDateDescIdDesc(communityId);
        if (latest.isPresent() && latest.get().getReadingDate() != null) {
            end = latest.get().getReadingDate();
        }

        if (filter.getMonth() != null && filter.getYear() != null) {
            YearMonth ym = YearMonth.of(filter.getYear(), filter.getMonth());
            return new LocalDate[]{ym.atDay(1), ym.atEndOfMonth()};
        }

        String window = filter.getTimeWindow() != null ? filter.getTimeWindow() : "CURRENT_MONTH";
        LocalDate start;

        switch (window) {
            case "PREVIOUS_MONTH":
                YearMonth prev = YearMonth.from(end).minusMonths(1);
                return new LocalDate[]{prev.atDay(1), prev.atEndOfMonth()};
            case "LAST_3_MONTHS":
                start = end.minusMonths(2).withDayOfMonth(1);
                break;
            case "LAST_6_MONTHS":
                start = end.minusMonths(5).withDayOfMonth(1);
                break;
            case "LAST_12_MONTHS":
                start = end.minusMonths(11).withDayOfMonth(1);
                break;
            case "CURRENT_MONTH":
            default:
                start = end.withDayOfMonth(1);
                end = end.withDayOfMonth(end.lengthOfMonth());
                break;
        }

        return new LocalDate[]{start, end};
    }

    private String buildPeriodLabel(LocalDate start, LocalDate end, String window) {
        if (start.getMonth() == end.getMonth() && start.getYear() == end.getYear()) {
            return YearMonth.from(start).format(MONTH_FMT) + " (Latest Available Reading)";
        }
        return YearMonth.from(start).format(MONTH_FMT) + " - " + YearMonth.from(end).format(MONTH_FMT);
    }

    private Map<Long, Double> aggregateUsageByResident(List<WaterUsage> usages) {
        Map<Long, Double> map = new HashMap<>();
        for (WaterUsage wu : usages) {
            if (wu.getWaterMeter() != null && wu.getWaterMeter().getResidentProfile() != null) {
                Long rId = wu.getWaterMeter().getResidentProfile().getId();
                map.put(rId, map.getOrDefault(rId, 0.0) + (wu.getUnitsConsumed() != null ? wu.getUnitsConsumed() : 0.0));
            }
        }
        return map;
    }

    private Map<UnitType, Map<Integer, Double>> computeSimilarHouseholdAverages(
            List<ResidentProfile> residents, Map<Long, Double> currentUsages) {
        Map<UnitType, Map<Integer, List<Double>>> grouped = new HashMap<>();

        for (ResidentProfile rp : residents) {
            UnitType uType = rp.getUnit() != null ? rp.getUnit().getUnitType() : UnitType.FLAT;
            int occupancy = rp.getUnit() != null && rp.getUnit().getOccupancy() != null ? rp.getUnit().getOccupancy() : 1;
            double usage = currentUsages.getOrDefault(rp.getId(), 0.0);

            grouped.computeIfAbsent(uType, k -> new HashMap<>())
                    .computeIfAbsent(occupancy, k -> new ArrayList<>())
                    .add(usage);
        }

        Map<UnitType, Map<Integer, Double>> result = new HashMap<>();
        for (Map.Entry<UnitType, Map<Integer, List<Double>>> entry : grouped.entrySet()) {
            Map<Integer, Double> occMap = new HashMap<>();
            for (Map.Entry<Integer, List<Double>> sub : entry.getValue().entrySet()) {
                double avg = sub.getValue().stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
                occMap.put(sub.getKey(), avg);
            }
            result.put(entry.getKey(), occMap);
        }

        return result;
    }

    private EfficiencyScoreBreakdownDto calculateEfficiencyBreakdown(
            double cUsage, double pUsage, double commAvg, double similarAvg, int occupancy, boolean leakSuspected) {

        // 1. Community Avg Score (Max 40)
        double commScore = commAvg > 0 ? Math.max(0.0, 40.0 * (1.0 - (cUsage / (2.0 * commAvg)))) : 40.0;

        // 2. Similar Household Score (Max 25)
        double similarScore = similarAvg > 0 ? Math.max(0.0, 25.0 * (1.0 - (cUsage / (2.0 * similarAvg)))) : 25.0;

        // 3. Occupancy Adjustment Score (Max 15)
        double perPersonNorm = occupancy > 0 ? cUsage / occupancy : cUsage;
        double occScore = perPersonNorm <= 5.0 ? 15.0 : Math.max(0.0, 15.0 * (1.0 - ((perPersonNorm - 5.0) / 15.0)));

        // 4. Monthly Improvement Score (Max 10)
        double impScore = 5.0;
        if (pUsage > 0) {
            double impRatio = (pUsage - cUsage) / pUsage;
            impScore = Math.min(10.0, Math.max(0.0, 5.0 + (impRatio * 5.0)));
        }

        // 5. Leak Penalty Score (Max 10)
        double leakScore = leakSuspected ? 0.0 : 10.0;

        double total = commScore + similarScore + occScore + impScore + leakScore;

        return EfficiencyScoreBreakdownDto.builder()
                .communityAvgScore(round(commScore, 1))
                .similarHouseholdScore(round(similarScore, 1))
                .occupancyAdjustmentScore(round(occScore, 1))
                .monthlyImprovementScore(round(impScore, 1))
                .leakPenaltyScore(round(leakScore, 1))
                .totalScore(round(total, 0))
                .build();
    }

    private List<RankingMovementDto> calculateRankingMovements(
            List<ResidentProfile> approvedResidents, Map<Long, Double> prevUsages, List<HouseholdRankingDto> currentRankings) {

        Map<Long, Integer> currentRankMap = currentRankings.stream()
                .collect(Collectors.toMap(HouseholdRankingDto::getResidentProfileId, HouseholdRankingDto::getRank));

        List<HouseholdRankingDto> prevRankList = new ArrayList<>();
        for (ResidentProfile rp : approvedResidents) {
            double usage = prevUsages.getOrDefault(rp.getId(), 0.0);
            prevRankList.add(HouseholdRankingDto.builder()
                    .residentProfileId(rp.getId())
                    .flatNumber((rp.getBlock() != null ? rp.getBlock().getBlockName() : "") + "-" + (rp.getUnit() != null ? rp.getUnit().getUnitNumber() : ""))
                    .residentName(rp.getUser() != null ? rp.getUser().getFullName() : "Resident")
                    .blockName(rp.getBlock() != null ? rp.getBlock().getBlockName() : "")
                    .currentMonthUsage(usage)
                    .build());
        }

        prevRankList.sort(Comparator.comparingDouble(HouseholdRankingDto::getCurrentMonthUsage));

        List<RankingMovementDto> result = new ArrayList<>();
        for (int i = 0; i < prevRankList.size(); i++) {
            Long rId = prevRankList.get(i).getResidentProfileId();
            int pRank = i + 1;
            int cRank = currentRankMap.getOrDefault(rId, pRank);

            int diff = pRank - cRank; // positive = moved up in ranking
            String mov = diff > 0 ? "UP" : diff < 0 ? "DOWN" : "NO_CHANGE";

            result.add(RankingMovementDto.builder()
                    .residentProfileId(rId)
                    .flatNumber(prevRankList.get(i).getFlatNumber())
                    .residentName(prevRankList.get(i).getResidentName())
                    .blockName(prevRankList.get(i).getBlockName())
                    .previousRank(pRank)
                    .currentRank(cRank)
                    .rankChange(diff)
                    .movement(mov)
                    .build());
        }

        return result;
    }

    private List<HouseholdRankingDto> applyFilters(List<HouseholdRankingDto> rankings, CommunityBenchmarkingFilterDto filter) {
        return rankings.stream().filter(r -> {
            if (filter.getBlockName() != null && !filter.getBlockName().isEmpty() && !filter.getBlockName().equalsIgnoreCase("ALL")
                    && !r.getBlockName().equalsIgnoreCase(filter.getBlockName())) {
                return false;
            }
            if (filter.getBadge() != null && !filter.getBadge().isEmpty() && !filter.getBadge().equalsIgnoreCase("ALL")
                    && !r.getBadge().equalsIgnoreCase(filter.getBadge())) {
                return false;
            }
            if (filter.getBillStatus() != null && !filter.getBillStatus().isEmpty() && !filter.getBillStatus().equalsIgnoreCase("ALL")
                    && !r.getBillStatus().equalsIgnoreCase(filter.getBillStatus())) {
                return false;
            }
            if (filter.getMinEfficiency() != null && r.getEfficiencyScore() < filter.getMinEfficiency()) {
                return false;
            }
            if (filter.getMaxEfficiency() != null && r.getEfficiencyScore() > filter.getMaxEfficiency()) {
                return false;
            }
            if (Boolean.TRUE.equals(filter.getLeakSuspectedOnly()) && !r.isLeakSuspected()) {
                return false;
            }
            return true;
        }).collect(Collectors.toList());
    }

    private BenchmarkSummaryDto buildSummaryKpis(
            List<HouseholdRankingDto> rankings, List<Bill> bills, List<Payment> payments, double communityAvg) {

        int totalHouseholds = rankings.size();
        double avgEff = rankings.isEmpty() ? 0.0 : rankings.stream().mapToDouble(HouseholdRankingDto::getEfficiencyScore).average().orElse(0.0);

        Map<String, Double> blockAvgs = rankings.stream()
                .collect(Collectors.groupingBy(HouseholdRankingDto::getBlockName, Collectors.averagingDouble(HouseholdRankingDto::getCurrentMonthUsage)));

        String bestBlock = blockAvgs.entrySet().stream().min(Map.Entry.comparingByValue()).map(Map.Entry::getKey).orElse("N/A");
        String worstBlock = blockAvgs.entrySet().stream().max(Map.Entry.comparingByValue()).map(Map.Entry::getKey).orElse("N/A");

        String mostImproved = rankings.stream().min(Comparator.comparingDouble(HouseholdRankingDto::getTrendChangePercent)).map(HouseholdRankingDto::getFlatNumber).orElse("N/A");
        String highestSpike = rankings.stream().max(Comparator.comparingDouble(HouseholdRankingDto::getTrendChangePercent)).map(HouseholdRankingDto::getFlatNumber).orElse("N/A");

        BigDecimal totalBillAmount = bills.stream().map(Bill::getTotalAmount).filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal avgBill = bills.isEmpty() ? BigDecimal.ZERO : totalBillAmount.divide(BigDecimal.valueOf(bills.size()), 2, RoundingMode.HALF_UP);

        long capturedCount = payments.stream().filter(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS).count();
        double collectionRate = bills.isEmpty() ? 100.0 : ((double) capturedCount / bills.size()) * 100.0;

        return BenchmarkSummaryDto.builder()
                .totalActiveHouseholds(totalHouseholds)
                .communityAvgConsumption(round(communityAvg, 1))
                .avgEfficiencyScore(round(avgEff, 0))
                .bestBlock(bestBlock)
                .worstBlock(worstBlock)
                .mostImprovedHousehold(mostImproved)
                .highestSpikeHousehold(highestSpike)
                .avgBillAmount(avgBill)
                .avgCollectionRate(round(collectionRate, 1))
                .build();
    }

    private List<BlockBenchmarkDto> buildBlockBenchmarking(
            Long communityId, List<ResidentProfile> residents, Map<Long, Double> currentUsages,
            List<Bill> bills, List<Payment> payments, List<Complaint> complaints) {

        List<Block> blocks = blockRepository.findByCommunityId(communityId);
        List<BlockBenchmarkDto> result = new ArrayList<>();

        for (Block b : blocks) {
            List<ResidentProfile> bResidents = residents.stream().filter(r -> r.getBlock() != null && r.getBlock().getId().equals(b.getId())).collect(Collectors.toList());
            Set<Long> bResIds = bResidents.stream().map(ResidentProfile::getId).collect(Collectors.toSet());

            int totalH = bResidents.size();
            double totalCons = bResidents.stream().mapToDouble(r -> currentUsages.getOrDefault(r.getId(), 0.0)).sum();
            double avgCons = totalH > 0 ? totalCons / totalH : 0.0;

            List<Bill> bBills = bills.stream().filter(bill -> bill.getResidentProfile() != null && bResIds.contains(bill.getResidentProfile().getId())).collect(Collectors.toList());
            List<Payment> bPayments = payments.stream().filter(p -> p.getResident() != null && bResIds.contains(p.getResident().getId())).collect(Collectors.toList());
            long bComplaints = complaints.stream().filter(c -> c.getResident() != null && bResIds.contains(c.getResident().getId())).count();

            BigDecimal bTotalBilled = bBills.stream().map(Bill::getTotalAmount).filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal bTotalPaid = bPayments.stream().filter(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS).map(Payment::getAmount).filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal bAvgBill = bBills.isEmpty() ? BigDecimal.ZERO : bTotalBilled.divide(BigDecimal.valueOf(bBills.size()), 2, RoundingMode.HALF_UP);

            double bCollection = bBills.isEmpty() ? 100.0 : (bTotalBilled.compareTo(BigDecimal.ZERO) > 0 ? bTotalPaid.doubleValue() / bTotalBilled.doubleValue() * 100.0 : 100.0);

            long leakCount = bResidents.stream().filter(r -> {
                double u = currentUsages.getOrDefault(r.getId(), 0.0);
                return u > (avgCons * 2.2) && u > 15.0;
            }).count();

            double blockEff = Math.max(0.0, 100.0 - (avgCons * 3.0));

            result.add(BlockBenchmarkDto.builder()
                    .blockId(b.getId())
                    .blockName(b.getBlockName())
                    .totalHouseholds(totalH)
                    .activeMetersCount(totalH)
                    .totalConsumption(round(totalCons, 1))
                    .avgConsumptionPerHousehold(round(avgCons, 1))
                    .waterLossVolume(round(totalCons * 0.05, 1))
                    .waterLossPercentage(5.0)
                    .blockEfficiencyScore(round(blockEff, 0))
                    .collectionRate(round(bCollection, 1))
                    .avgBillAmount(bAvgBill)
                    .totalBilledAmount(bTotalBilled)
                    .totalPaidAmount(bTotalPaid)
                    .complaintCount((int) bComplaints)
                    .leakCount((int) leakCount)
                    .build());
        }

        return result;
    }

    private HouseholdComparisonDto buildHouseholdComparison(
            Long rId, YearMonth normalizedPeriod, List<ResidentProfile> approvedResidents, Map<Long, Double> currentUsageMap, List<Bill> bills, double commAvg) {
        ResidentProfile rp = approvedResidents.stream().filter(r -> r.getId().equals(rId)).findFirst().orElse(null);
        if (rp == null) return null;

        // Period-specific consumption (already aggregated for normalizedPeriod by caller)
        double cUsage = currentUsageMap.getOrDefault(rId, 0.0);
        int occupancy = rp.getUnit() != null && rp.getUnit().getOccupancy() != null ? rp.getUnit().getOccupancy() : 1;
        UnitType uType = rp.getUnit() != null ? rp.getUnit().getUnitType() : UnitType.FLAT;

        WaterMeter meter = waterMeterRepository.findByResidentProfileId(rId).orElse(null);

        // Fetch previous month's usage for efficiency calculation
        YearMonth prevMonth = normalizedPeriod.minusMonths(1);
        List<WaterUsage> prevMonthUsages = waterUsageRepository.findByWaterMeterIdAndReadingDateBetween(
                meter != null ? meter.getId() : -1L, prevMonth.atDay(1), prevMonth.atEndOfMonth()
        );
        double pUsage = prevMonthUsages.stream().mapToDouble(WaterUsage::getUnitsConsumed).sum();

        // Calculate similar average and leak detection for the comparison period
        Map<UnitType, Map<Integer, Double>> similarAvgMap = computeSimilarHouseholdAverages(approvedResidents, currentUsageMap);
        double similarAvg = similarAvgMap.getOrDefault(uType, Collections.emptyMap()).getOrDefault(occupancy, commAvg);
        boolean leakSuspected = similarAvg > 0 && cUsage > (similarAvg * 2.2) && cUsage > 15.0;

        EfficiencyScoreBreakdownDto score = calculateEfficiencyBreakdown(cUsage, pUsage, commAvg, similarAvg, occupancy, leakSuspected);

        // Period-specific bill: find the bill for normalizedPeriod
        List<Bill> rBills = bills.stream()
                .filter(b -> b.getResidentProfile() != null && b.getResidentProfile().getId().equals(rId))
                .filter(b -> {
                    if (b.getBillingMonth() != null && b.getBillingYear() != null) {
                        return b.getBillingMonth().equals(normalizedPeriod.getMonthValue()) && b.getBillingYear().equals(normalizedPeriod.getYear());
                    }
                    if (b.getBillDate() != null) {
                        return YearMonth.from(b.getBillDate()).equals(normalizedPeriod);
                    }
                    if (b.getCreatedAt() != null) {
                        return YearMonth.from(b.getCreatedAt()).equals(normalizedPeriod);
                    }
                    return false;
                })
                .collect(Collectors.toList());

        BigDecimal totalBilled = rBills.stream().map(Bill::getTotalAmount).filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalPaid = rBills.stream().filter(b -> b.getStatus() == com.water.monitoring_and_billing_platform.enums.BillStatus.PAID)
                .map(Bill::getTotalAmount).filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);

        // 6-month usage trend ending at normalizedPeriod
        List<MonthlyUsageDto> usageTrend = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            YearMonth ym = normalizedPeriod.minusMonths(i);
            LocalDate s = ym.atDay(1);
            LocalDate e = ym.atEndOfMonth();
            List<WaterUsage> uList = waterUsageRepository.findByWaterMeterIdAndReadingDateBetween(meter != null ? meter.getId() : -1L, s, e);
            double val = uList.stream().mapToDouble(WaterUsage::getUnitsConsumed).sum();
            usageTrend.add(new MonthlyUsageDto(ym.format(MONTH_FMT), round(val, 1)));
        }

        // Calculate average monthly consumption over the 6-month period
        double avgConsumption = usageTrend.stream().mapToDouble(MonthlyUsageDto::getValue).average().orElse(cUsage);

        // Calculate actual community rank for the comparison period (using competition ranking tie-breaking strategy)
        Map<Long, Double> residentUsages = new HashMap<>();
        for (ResidentProfile rpItem : approvedResidents) {
            residentUsages.put(rpItem.getId(), round(currentUsageMap.getOrDefault(rpItem.getId(), 0.0), 1));
        }

        List<Map.Entry<Long, Double>> sortedEntries = new ArrayList<>(residentUsages.entrySet());
        sortedEntries.sort(Map.Entry.comparingByValue()); // Ascending order: lower consumption is better rank

        Map<Long, Integer> competitionRanks = new HashMap<>();
        int currentRank = 1;
        Double previousUsage = null;
        int countWithSameOrBetter = 0;

        for (int i = 0; i < sortedEntries.size(); i++) {
            Map.Entry<Long, Double> entry = sortedEntries.get(i);
            Double usageVal = entry.getValue();
            
            countWithSameOrBetter++;
            if (previousUsage == null || !previousUsage.equals(usageVal)) {
                currentRank = countWithSameOrBetter;
                previousUsage = usageVal;
            }
            competitionRanks.put(entry.getKey(), currentRank);
        }

        int actualRank = competitionRanks.getOrDefault(rId, sortedEntries.size() + 1);

        String periodLabel = normalizedPeriod.format(MONTH_FMT);

        return HouseholdComparisonDto.builder()
                .residentProfileId(rId)
                .flatNumber((rp.getBlock() != null ? rp.getBlock().getBlockName() : "") + "-" + (rp.getUnit() != null ? rp.getUnit().getUnitNumber() : ""))
                .residentName(rp.getUser() != null ? rp.getUser().getFullName() : "Resident")
                .blockName(rp.getBlock() != null ? rp.getBlock().getBlockName() : "")
                .unitType(uType.name())
                .occupancy(occupancy)
                .totalConsumption(round(cUsage, 1))
                .avgMonthlyConsumption(round(avgConsumption, 1))
                .efficiencyScore(round(score.getTotalScore(), 0))
                .communityRank(actualRank)
                .totalBilled(totalBilled)
                .totalPaid(totalPaid)
                .comparisonPeriodLabel(periodLabel)
                .monthlyUsage(usageTrend)
                .monthlyBills(Collections.emptyList())
                .build();
    }

    private CommunityTrendDto buildCommunityTrends(Long communityId, LocalDate endDate, Set<Long> approvedResidentIds) {
        List<MonthlyUsageDto> commAvg = new ArrayList<>();
        List<MonthlyUsageDto> highest = new ArrayList<>();
        List<MonthlyUsageDto> lowest = new ArrayList<>();
        List<CommunityTrendDto.AvgVsMedianPointDto> avgVsMedian = new ArrayList<>();

        YearMonth ymEnd = YearMonth.from(endDate);

        for (int i = 11; i >= 0; i--) {
            YearMonth ym = ymEnd.minusMonths(i);
            LocalDate s = ym.atDay(1);
            LocalDate e = ym.atEndOfMonth();

            List<WaterUsage> uList = waterUsageRepository.findByWaterMeterResidentProfileCommunityIdAndReadingDateBetween(communityId, s, e).stream()
                    .filter(w -> w.getWaterMeter() != null && w.getWaterMeter().getResidentProfile() != null && approvedResidentIds.contains(w.getWaterMeter().getResidentProfile().getId()))
                    .collect(Collectors.toList());

            Map<Long, Double> rMap = aggregateUsageByResident(uList);
            List<Double> vals = new ArrayList<>(rMap.values());
            Collections.sort(vals);

            double mean = vals.isEmpty() ? 0.0 : vals.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
            double max = vals.isEmpty() ? 0.0 : vals.get(vals.size() - 1);
            double min = vals.isEmpty() ? 0.0 : vals.get(0);
            double median = vals.isEmpty() ? 0.0 : (vals.size() % 2 == 0 ? (vals.get(vals.size() / 2 - 1) + vals.get(vals.size() / 2)) / 2.0 : vals.get(vals.size() / 2));

            String label = ym.format(MONTH_FMT);
            commAvg.add(new MonthlyUsageDto(label, round(mean, 1)));
            highest.add(new MonthlyUsageDto(label, round(max, 1)));
            lowest.add(new MonthlyUsageDto(label, round(min, 1)));
            avgVsMedian.add(new CommunityTrendDto.AvgVsMedianPointDto(label, round(mean, 1), round(median, 1)));
        }

        return CommunityTrendDto.builder()
                .monthlyCommunityAvg(commAvg)
                .monthlyHighest(highest)
                .monthlyLowest(lowest)
                .avgVsMedian(avgVsMedian)
                .seasonalTrend(commAvg)
                .build();
    }

    private List<BenchmarkInsightDto> buildBenchmarkInsights(
            List<HouseholdRankingDto> rankings, List<BlockBenchmarkDto> blockBenchmarking, BenchmarkSummaryDto summary) {

        List<BenchmarkInsightDto> insights = new ArrayList<>();

        // Insight 1: Excellent
        insights.add(BenchmarkInsightDto.builder()
                .id("INS-001")
                .category("EFFICIENCY")
                .severity("EXCELLENT")
                .title("Community Conservation Goal")
                .message("Overall community efficiency score is " + (int) summary.getAvgEfficiencyScore() + "/100 with " + summary.getAvgCollectionRate() + "% collection rate.")
                .actionable(false)
                .build());

        // Insight 2: Notice (Block Comparison)
        if (!summary.getBestBlock().equals("N/A") && !summary.getWorstBlock().equals("N/A")) {
            insights.add(BenchmarkInsightDto.builder()
                    .id("INS-002")
                    .category("BLOCK")
                    .severity("NOTICE")
                    .title("Block Performance Variation")
                    .message(summary.getBestBlock() + " is currently the most efficient block, while " + summary.getWorstBlock() + " shows higher average consumption.")
                    .actionable(true)
                    .build());
        }

        // Insight 3: Alert (Leak Detection)
        long leakCount = rankings.stream().filter(HouseholdRankingDto::isLeakSuspected).count();
        if (leakCount > 0) {
            insights.add(BenchmarkInsightDto.builder()
                    .id("INS-003")
                    .category("LEAK")
                    .severity("ALERT")
                    .title("Potential Leak Warnings")
                    .message(leakCount + " household(s) display usage >2.2x above similar household averages indicating possible pipe leakage.")
                    .actionable(true)
                    .build());
        } else {
            insights.add(BenchmarkInsightDto.builder()
                    .id("INS-003")
                    .category("LEAK")
                    .severity("EXCELLENT")
                    .title("Zero Leakage Anomaly")
                    .message("No active pipe leakage or continuous abnormal flow detected across community households.")
                    .actionable(false)
                    .build());
        }

        return insights;
    }

    private int computeAvailableMonthsCount(Long communityId, LocalDate endDate) {
        YearMonth ymEnd = YearMonth.from(endDate);
        int count = 0;
        for (int i = 0; i < 12; i++) {
            YearMonth ym = ymEnd.minusMonths(i);
            LocalDate s = ym.atDay(1);
            LocalDate e = ym.atEndOfMonth();
            List<WaterUsage> u = waterUsageRepository.findByWaterMeterResidentProfileCommunityIdAndReadingDateBetween(communityId, s, e);
            if (!u.isEmpty()) count++;
        }
        return Math.max(1, count);
    }

    private String determineResidentBillStatus(Long rId, List<Bill> bills) {
        List<Bill> rBills = bills.stream().filter(b -> b.getResidentProfile() != null && b.getResidentProfile().getId().equals(rId)).collect(Collectors.toList());
        if (rBills.isEmpty()) return "PAID";

        boolean hasUnpaid = rBills.stream().anyMatch(b -> b.getStatus() == com.water.monitoring_and_billing_platform.enums.BillStatus.UNPAID);
        boolean hasOverdue = rBills.stream().anyMatch(b -> b.getDueDate() != null && b.getDueDate().isBefore(LocalDate.now()) && !b.isPaid());

        if (hasOverdue) return "OVERDUE";
        if (hasUnpaid) return "UNPAID";
        return "PAID";
    }

    private BillResponse mapToBillResponse(Bill b) {
        return BillResponse.builder()
                .id(b.getId())
                .billNumber(b.getBillNumber())
                .unitsConsumed(b.getUnitsConsumed())
                .totalAmount(b.getTotalAmount())
                .billDate(b.getBillDate())
                .dueDate(b.getDueDate())
                .status(b.getStatus() != null ? b.getStatus().name() : "PAID")
                .billStatus(b.getStatus() != null ? b.getStatus().name() : "PAID")
                .paymentStatus(b.isPaid() ? "PAID" : "UNPAID")
                .build();
    }

    private PaymentResponse mapToPaymentResponse(Payment p) {
        return PaymentResponse.builder()
                .id(p.getId())
                .paymentNumber(p.getPaymentNumber())
                .amount(p.getAmount())
                .paymentMethod(p.getPaymentMethod())
                .paymentStatus(p.getPaymentStatus() != null ? p.getPaymentStatus().name() : "SUCCESS")
                .transactionDate(p.getTransactionDate())
                .build();
    }

    private ComplaintResponse mapToComplaintResponse(Complaint c) {
        return ComplaintResponse.builder()
                .id(c.getId())
                .ticketNumber("CMP-" + c.getId())
                .description(c.getDescription())
                .status(c.getStatus() != null ? c.getStatus() : com.water.monitoring_and_billing_platform.enums.ComplaintStatus.OPEN)
                .category(c.getCategory() != null ? c.getCategory() : com.water.monitoring_and_billing_platform.enums.ComplaintCategory.WATER_SUPPLY)
                .priority(c.getPriority() != null ? c.getPriority() : com.water.monitoring_and_billing_platform.enums.ComplaintPriority.MEDIUM)
                .createdAt(c.getCreatedAt())
                .build();
    }

    private double round(double val, int decimals) {
        if (Double.isNaN(val) || Double.isInfinite(val)) return 0.0;
        BigDecimal bd = BigDecimal.valueOf(val).setScale(decimals, RoundingMode.HALF_UP);
        return bd.doubleValue();
    }
}
