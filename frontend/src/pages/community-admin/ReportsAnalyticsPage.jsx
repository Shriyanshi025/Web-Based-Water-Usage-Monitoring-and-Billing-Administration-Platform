import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";

// Icons
import AssessmentIcon from "@mui/icons-material/Assessment";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableChartIcon from "@mui/icons-material/TableChart";
import PrintIcon from "@mui/icons-material/Print";
import FilterListIcon from "@mui/icons-material/FilterList";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import PageSummaryHeader from "../../components/common/PageSummaryHeader";
import CommunityOpsService from "../../services/CommunityOpsService";
import { useNotification } from "../../context/NotificationContext";

// Modular Section Components
import ExecutiveSummarySection from "../../components/reports/ExecutiveSummarySection";
import WaterReportsSection from "../../components/reports/WaterReportsSection";
import BillingAnalyticsSection from "../../components/reports/BillingAnalyticsSection";
import BenchmarkingSection from "../../components/reports/BenchmarkingSection";
import HouseholdComparisonSection from "../../components/reports/HouseholdComparisonSection";
import InsightsSection from "../../components/reports/InsightsSection";
import DataTablesSection from "../../components/reports/DataTablesSection";
import HouseholdDrawer from "../../components/reports/HouseholdDrawer";
import MethodologyDialog from "../../components/reports/MethodologyDialog";
import { exportCommunityReportCSV, exportCommunityReportPDF } from "../../helpers/reportExportHelper";



export default function ReportsAnalyticsPage() {
  const { showNotification } = useNotification();

  // Primary Reports State
  const [loadingReports, setLoadingReports] = useState(true);
  const [reportsError, setReportsError] = useState(null);
  const [reportsData, setReportsData] = useState(null);
  const [billingCycles, setBillingCycles] = useState([]);

  // Reports Filters
  const [selectedCycle, setSelectedCycle] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportType, setReportType] = useState("ALL");

  // Primary Table State
  const [activeTableTab, setActiveTableTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [reportsPage, setReportsPage] = useState(0);
  const [reportsRowsPerPage, setReportsRowsPerPage] = useState(10);

  // Benchmarking Module State
  const [loadingBenchmarking, setLoadingBenchmarking] = useState(true);
  const [benchmarkingData, setBenchmarkingData] = useState(null);
  const [refreshingBenchmarking, setRefreshingBenchmarking] = useState(false);

  // Benchmarking Filters
  const [timeWindow, setTimeWindow] = useState("CURRENT_MONTH");
  const [blockName, setBlockName] = useState("ALL");
  const [unitType, setUnitType] = useState("ALL");
  const [badgeFilter, setBadgeFilter] = useState("ALL");
  const [billStatusFilter, setBillStatusFilter] = useState("ALL");
  const [leakSuspectedOnly, setLeakSuspectedOnly] = useState(false);
  const [bmSearchQuery, setBmSearchQuery] = useState("");

  // Benchmarking Table & Movements State
  const [bmPage, setBmPage] = useState(0);
  const [bmRowsPerPage, setBmRowsPerPage] = useState(10);
  const [bmOrderBy, setBmOrderBy] = useState("rank");
  const [bmOrder, setBmOrder] = useState("asc");
  const [bmTableTab, setBmTableTab] = useState(0);

  // Household Comparison State
  const [householdAId, setHouseholdAId] = useState("");
  const [householdBId, setHouseholdBId] = useState("");
  const [comparisonData, setComparisonData] = useState(null);
  const [comparing, setComparing] = useState(false);

  // Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedHouseholdId, setSelectedHouseholdId] = useState(null);
  const [drawerData, setDrawerData] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // Methodology Modal State
  const [methodologyOpen, setMethodologyOpen] = useState(false);

  // ── Fetch Billing Cycles ──
  useEffect(() => {
    const fetchBillingCycles = async () => {
      try {
        const res = await CommunityOpsService.getBillingCycles();
        if (res?.success) setBillingCycles(res.data || []);
      } catch (err) {
        console.error("Failed to fetch billing cycles", err);
      }
    };
    fetchBillingCycles();
  }, []);

  // ── Fetch Primary Reports Analytics Data ──
  const fetchAnalyticsData = useCallback(async (filterParams) => {
    setLoadingReports(true);
    setReportsError(null);
    try {
      const res = await CommunityOpsService.getReportAnalytics(filterParams);
      if (res?.success) {
        setReportsData(res.data);
      } else {
        setReportsError(res?.message || "Failed to load report analytics.");
      }
    } catch (err) {
      setReportsError(err?.response?.data?.message || "Failed to connect to backend service.");
    } finally {
      setLoadingReports(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalyticsData({});
  }, [fetchAnalyticsData]);

  // ── Fetch Benchmarking Analytics Data ──
  const fetchBenchmarkingData = useCallback(async (snapshotIdParam = null) => {
    if (!refreshingBenchmarking) setLoadingBenchmarking(true);
    try {
      const params = {
        timeWindow,
        blockName: blockName !== "ALL" ? blockName : undefined,
        unitType: unitType !== "ALL" ? unitType : undefined,
        badge: badgeFilter !== "ALL" ? badgeFilter : undefined,
        billStatus: billStatusFilter !== "ALL" ? billStatusFilter : undefined,
        leakSuspectedOnly: leakSuspectedOnly ? true : undefined,
        snapshotId: snapshotIdParam || benchmarkingData?.benchmarkSnapshotId || undefined
      };
      const res = await CommunityOpsService.getBenchmarkingDashboard(params);
      if (res && res.success && res.data) {
        setBenchmarkingData(res.data);
      } else {
        showNotification("Failed to load benchmarking data.", "error");
      }
    } catch (err) {
      showNotification(err.message || "Error loading benchmarking analytics.", "error");
    } finally {
      setLoadingBenchmarking(false);
      setRefreshingBenchmarking(false);
    }
  }, [timeWindow, blockName, unitType, badgeFilter, billStatusFilter, leakSuspectedOnly, benchmarkingData?.benchmarkSnapshotId, refreshingBenchmarking, showNotification]);

  useEffect(() => {
    fetchBenchmarkingData();
  }, [timeWindow, blockName, unitType, badgeFilter, billStatusFilter, leakSuspectedOnly]);

  // ── Filter Actions for Reports ──
  const handleApplyReportsFilters = () => {
    const params = {};
    if (selectedCycle) params.billingCycleId = selectedCycle;
    if (selectedMonth) params.month = selectedMonth;
    if (selectedYear) params.year = selectedYear;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (reportType && reportType !== "ALL") params.reportType = reportType;
    fetchAnalyticsData(params);
  };

  const handleResetReportsFilters = () => {
    setSelectedCycle("");
    setSelectedMonth("");
    setSelectedYear("");
    setStartDate("");
    setEndDate("");
    setReportType("ALL");
    fetchAnalyticsData({});
  };

  // ── Benchmarking Handlers ──
  const handleRefreshBenchmarking = () => {
    setRefreshingBenchmarking(true);
    fetchBenchmarkingData("new-snapshot-" + Date.now());
  };

  const handleOpenDrawer = async (residentProfileId) => {
    setSelectedHouseholdId(residentProfileId);
    setDrawerOpen(true);
    setDrawerLoading(true);
    try {
      const res = await CommunityOpsService.getBenchmarkingHouseholdDetails(residentProfileId);
      if (res && res.success && res.data) {
        setDrawerData(res.data);
      } else {
        showNotification("Unable to load household details.", "error");
      }
    } catch (err) {
      showNotification("Error loading household details.", "error");
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleCompareHouseholds = async () => {
    if (!householdAId || !householdBId) {
      showNotification("Please select both Household A and Household B to compare.", "warning");
      return;
    }
    if (householdAId === householdBId) {
      showNotification("Please select two different households to compare.", "warning");
      return;
    }
    setComparing(true);
    try {
      const res = await CommunityOpsService.getBenchmarkingComparison({ householdAId, householdBId });
      if (res && res.success && res.data) {
        setComparisonData(res.data);
      } else {
        showNotification("Failed to fetch comparison.", "error");
      }
    } catch (err) {
      showNotification("Error fetching household comparison.", "error");
    } finally {
      setComparing(false);
    }
  };

  // ── Reports Exports ──
  const handleExportCSV = () => {
    if (!reportsData) {
      showNotification("Reports data is not loaded yet.", "error");
      return;
    }
    try {
      exportCommunityReportCSV({
        reportsData,
        benchmarkingData,
        comparisonData,
        insights,
        filters: { billingCycleId: selectedCycle, month: selectedMonth, year: selectedYear, startDate, endDate }
      });
      showNotification("CSV Report exported successfully!", "success");
    } catch (e) {
      showNotification("Failed to export CSV: " + e.message, "error");
    }
  };

  const handleExportPDF = () => {
    if (!reportsData) {
      showNotification("Reports data is not loaded yet.", "error");
      return;
    }
    try {
      exportCommunityReportPDF({
        reportsData,
        benchmarkingData,
        comparisonData,
        insights,
        filters: { billingCycleId: selectedCycle, month: selectedMonth, year: selectedYear, startDate, endDate }
      });
      showNotification("PDF Report exported successfully!", "success");
    } catch (e) {
      showNotification("Failed to export PDF: " + e.message, "error");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // ── Reports Data Tables Filtering ──
  const currentTableData = useMemo(() => {
    if (!reportsData) return [];
    let list = [];
    if (activeTableTab === 0) list = reportsData.residentSummaries || [];
    else if (activeTableTab === 1) list = reportsData.billSummaries || [];
    else if (activeTableTab === 2) list = reportsData.complaintSummaries || [];
    else if (activeTableTab === 3) list = reportsData.blockPerformances || [];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter((item) => Object.values(item).some((val) => String(val).toLowerCase().includes(term)));
    }
    return list;
  }, [reportsData, activeTableTab, searchTerm]);

  // ── Benchmarking Sorting & Search Filtering ──
  const filteredRankings = useMemo(() => {
    if (!benchmarkingData || !benchmarkingData.rankings) return [];
    return benchmarkingData.rankings.filter((row) => {
      if (!bmSearchQuery) return true;
      const q = bmSearchQuery.toLowerCase();
      return (
        row.flatNumber?.toLowerCase().includes(q) ||
        row.residentName?.toLowerCase().includes(q) ||
        row.blockName?.toLowerCase().includes(q)
      );
    });
  }, [benchmarkingData?.rankings, bmSearchQuery]);

  const sortedRankings = useMemo(() => {
    return [...filteredRankings].sort((a, b) => {
      let aVal = a[bmOrderBy];
      let bVal = b[bmOrderBy];
      if (aVal < bVal) return bmOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return bmOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredRankings, bmOrderBy, bmOrder]);

  const householdOptions = useMemo(() => {
    if (benchmarkingData?.householdDropdownOptions?.length) {
      return benchmarkingData.householdDropdownOptions.map((opt) => ({
        id: opt.residentProfileId,
        label: `${opt.flatNumber} — ${opt.residentName} (${opt.blockName})`
      }));
    }
    if (benchmarkingData?.rankings?.length) {
      return benchmarkingData.rankings.map((r) => ({
        id: r.residentProfileId,
        label: `${r.flatNumber} — ${r.residentName} (${r.blockName})`
      }));
    }
    return [];
  }, [benchmarkingData]);
  const movements = benchmarkingData?.rankingMovements || [];
  const insights = benchmarkingData?.insights || [];

  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2, md: 3 }, background: "transparent", minHeight: "100vh" }}>
        {/* ── Page Summary Header ── */}
        <PageSummaryHeader
          title="Reports & Analytics"
          subtitle="Unified operational analytics platform combining executive indicators, revenue realization, water balance, and peer benchmarking."
          icon={<AssessmentIcon sx={{ fontSize: 32, color: "primary.main" }} />}
          action={
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              <Button variant="outlined" color="primary" startIcon={<PictureAsPdfIcon />} onClick={handleExportPDF} sx={{ borderRadius: "8px", fontWeight: 600 }}>
                Export PDF
              </Button>
              <Button variant="outlined" color="success" startIcon={<TableChartIcon />} onClick={handleExportCSV} sx={{ borderRadius: "8px", fontWeight: 600 }}>
                Export CSV
              </Button>
              <Button variant="contained" color="primary" startIcon={<PrintIcon />} onClick={handlePrint} sx={{ borderRadius: "8px", fontWeight: 600 }}>
                Print Report
              </Button>
            </Box>
          }
        />

        {/* ── Toolbar / Global Filter Bar ── */}
        <Paper elevation={0} sx={{ p: 2.5, mb: 4, borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)", bgcolor: "background.paper" }}>
          <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <FilterListIcon fontSize="small" /> Operational Report Filters
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              alignItems: "center",
              width: "100%"
            }}
          >
            <FormControl fullWidth size="small" sx={{ minWidth: 150, flex: "1 1 200px" }}>
              <InputLabel id="billing-cycle-label">Billing Cycle</InputLabel>
              <Select labelId="billing-cycle-label" value={selectedCycle} label="Billing Cycle" onChange={(e) => setSelectedCycle(e.target.value)}>
                <MenuItem value="">All Cycles</MenuItem>
                {billingCycles.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.cycleName || `Cycle #${c.id}`}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" sx={{ minWidth: 150, flex: "1 1 200px" }}>
              <InputLabel id="report-month-label">Month</InputLabel>
              <Select labelId="report-month-label" value={selectedMonth} label="Month" onChange={(e) => setSelectedMonth(e.target.value)}>
                <MenuItem value="">All Months</MenuItem>
                {[
                  { val: 1, name: "January" }, { val: 2, name: "February" }, { val: 3, name: "March" },
                  { val: 4, name: "April" }, { val: 5, name: "May" }, { val: 6, name: "June" },
                  { val: 7, name: "July" }, { val: 8, name: "August" }, { val: 9, name: "September" },
                  { val: 10, name: "October" }, { val: 11, name: "November" }, { val: 12, name: "December" }
                ].map((m) => (
                  <MenuItem key={m.val} value={m.val}>{m.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" sx={{ minWidth: 150, flex: "1 1 200px" }}>
              <InputLabel id="report-year-label">Year</InputLabel>
              <Select labelId="report-year-label" value={selectedYear} label="Year" onChange={(e) => setSelectedYear(e.target.value)}>
                <MenuItem value="">All Years</MenuItem>
                {[2024, 2025, 2026].map((y) => (
                  <MenuItem key={y} value={y}>{y}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField fullWidth size="small" type="date" label="Start Date" value={startDate} onChange={(e) => setStartDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ minWidth: 150, flex: "1 1 200px" }} />
            <TextField fullWidth size="small" type="date" label="End Date" value={endDate} onChange={(e) => setEndDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ minWidth: 150, flex: "1 1 200px" }} />

            <Box sx={{ display: "flex", gap: 1, flex: "1 1 auto", justifyContent: { xs: "stretch", sm: "flex-end" } }}>
              <Button variant="contained" color="primary" onClick={handleApplyReportsFilters} sx={{ fontWeight: 600, px: 3, height: 40 }}>
                Apply
              </Button>
              <Button variant="outlined" color="inherit" onClick={handleResetReportsFilters} sx={{ minWidth: 40, height: 40, p: 0 }}>
                <RestartAltIcon />
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* 1. Executive Summary */}
        <ExecutiveSummarySection data={reportsData} loading={loadingReports} />

        {/* 2. Community Operations & Water Reports */}
        <WaterReportsSection data={reportsData} />

        {/* 3. Financial & Billing Analytics */}
        <BillingAnalyticsSection data={reportsData} />

        {/* 4. Community Benchmarking */}
        <BenchmarkingSection
          benchmarkingData={benchmarkingData}
          timeWindow={timeWindow}
          setTimeWindow={setTimeWindow}
          blockName={blockName}
          setBlockName={setBlockName}
          unitType={unitType}
          setUnitType={setUnitType}
          badgeFilter={badgeFilter}
          setBadgeFilter={setBadgeFilter}
          leakSuspectedOnly={leakSuspectedOnly}
          setLeakSuspectedOnly={setLeakSuspectedOnly}
          refreshingBenchmarking={refreshingBenchmarking}
          handleRefreshBenchmarking={handleRefreshBenchmarking}
          setMethodologyOpen={setMethodologyOpen}
          bmSearchQuery={bmSearchQuery}
          setBmSearchQuery={setBmSearchQuery}
          bmTableTab={bmTableTab}
          setBmTableTab={setBmTableTab}
          sortedRankings={sortedRankings}
          movements={movements}
          bmPage={bmPage}
          setBmPage={setBmPage}
          bmRowsPerPage={bmRowsPerPage}
          setBmRowsPerPage={setBmRowsPerPage}
          handleOpenDrawer={handleOpenDrawer}
        />

        {/* 5. Household Comparison */}
        <HouseholdComparisonSection
          householdAId={householdAId}
          setHouseholdAId={setHouseholdAId}
          householdBId={householdBId}
          setHouseholdBId={setHouseholdBId}
          householdOptions={householdOptions}
          handleCompareHouseholds={handleCompareHouseholds}
          comparing={comparing}
          comparisonData={comparisonData}
        />

        {/* 6. AI Insights & Advisory */}
        <InsightsSection insights={insights} />

        {/* 7. Detailed Data Tables */}
        <DataTablesSection
          activeTableTab={activeTableTab}
          setActiveTableTab={setActiveTableTab}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          currentTableData={currentTableData}
          reportsPage={reportsPage}
          setReportsPage={setReportsPage}
          reportsRowsPerPage={reportsRowsPerPage}
          setReportsRowsPerPage={setReportsRowsPerPage}
        />

        {/* Household Deep-Dive Drawer */}
        <HouseholdDrawer
          drawerOpen={drawerOpen}
          setDrawerOpen={setDrawerOpen}
          drawerLoading={drawerLoading}
          drawerData={drawerData}
        />

        {/* Methodology Dialog */}
        <MethodologyDialog
          methodologyOpen={methodologyOpen}
          setMethodologyOpen={setMethodologyOpen}
        />
      </Box>
    </DashboardLayout>
  );
}
