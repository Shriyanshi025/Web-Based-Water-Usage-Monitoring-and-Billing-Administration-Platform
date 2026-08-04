import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Stack,
  CircularProgress,
  Alert,
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Divider
} from "@mui/material";

// Icons
import AssessmentIcon from "@mui/icons-material/Assessment";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import OpacityIcon from "@mui/icons-material/Opacity";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import PaymentsIcon from "@mui/icons-material/Payments";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableChartIcon from "@mui/icons-material/TableChart";
import PrintIcon from "@mui/icons-material/Print";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FilterListIcon from "@mui/icons-material/FilterList";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RefreshIcon from "@mui/icons-material/Refresh";

// Recharts
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend
} from "recharts";

import DashboardLayout from "../../components/layout/DashboardLayout";
import PageSummaryHeader from "../../components/common/PageSummaryHeader";
import SearchBar from "../../components/common/SearchBar";
import CommunityOpsService from "../../services/CommunityOpsService";
import { useNotification } from "../../context/NotificationContext";

// ─── Constants ────────────────────────────────────────────────────────────────
const CARD_BORDER_RADIUS = "14px";
const PIE_COLORS = ["#2e7d32", "#ed6c02", "#d32f2f", "#0288d1", "#7b1fa2"];

// ─── Formatters ───────────────────────────────────────────────────────────────
/**
 * Format a number as Indian currency: ₹4,58,220
 */
const fmtCurrency = (val) => {
  if (val == null || isNaN(val)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(val);
};

/**
 * Format kilolitres with comma grouping: 12,480 kL
 */
const fmtKL = (val) => {
  if (val == null || isNaN(val)) return "0 kL";
  return `${new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(val)} kL`;
};

/**
 * Format a percentage: 98.6%
 */
const fmtPct = (val) => {
  if (val == null || isNaN(val)) return "0%";
  return `${Number(val).toFixed(1)}%`;
};

// ─── Trend indicator ──────────────────────────────────────────────────────────
const TrendBadge = ({ value, suffix = "", positiveIsGood = true }) => {
  if (value == null) return null;
  const isPositive = value > 0;
  const isNeutral = value === 0;
  const isGood = positiveIsGood ? isPositive : !isPositive;
  const color = isNeutral ? "text.secondary" : isGood ? "#2e7d32" : "#d32f2f";
  const Icon = isNeutral ? TrendingFlatIcon : isPositive ? TrendingUpIcon : TrendingDownIcon;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, mt: 0.5 }}>
      <Icon sx={{ fontSize: 15, color }} />
      <Typography variant="caption" sx={{ color, fontWeight: 600, lineHeight: 1 }}>
        {isPositive ? "+" : ""}{value?.toFixed(1)}{suffix}
      </Typography>
    </Box>
  );
};

// ─── Premium KPI Card ─────────────────────────────────────────────────────────
const KpiCard = ({ title, value, subtitle, icon, iconColor, iconBg, trend, trendSuffix, positiveIsGood }) => (
  <Card
    variant="outlined"
    sx={{
      borderRadius: CARD_BORDER_RADIUS,
      height: "100%",
      minHeight: 155,
      bgcolor: "background.paper",
      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      border: "1.5px solid",
      borderColor: "divider",
      transition: "box-shadow 0.2s, transform 0.15s",
      "&:hover": {
        boxShadow: "0 6px 22px rgba(0,0,0,0.11)",
        transform: "translateY(-2px)"
      }
    }}
  >
    <CardContent sx={{ p: "22px 24px 18px", "&:last-child": { pb: "18px" } }}>
      {/* Icon + Title row */}
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 1.8 }}>
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: "50%",
            bgcolor: iconBg,
            color: iconColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            mt: 0.2
          }}
        >
          {React.cloneElement(icon, { sx: { fontSize: 22 } })}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontWeight: 500,
              fontSize: "0.8rem",
              lineHeight: 1.3,
              mb: 0.6
            }}
          >
            {title}
          </Typography>
          {/* Large bold value – never truncated */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1.3rem", sm: "1.55rem" },
              lineHeight: 1.15,
              color: "text.primary",
              wordBreak: "break-all",
              overflowWrap: "anywhere"
            }}
          >
            {value}
          </Typography>
        </Box>
      </Box>

      {/* Divider */}
      <Divider sx={{ mb: 1.2 }} />

      {/* Subtitle + Trend */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 0.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.73rem" }}>
          {subtitle}
        </Typography>
        {trend != null && (
          <TrendBadge value={trend} suffix={trendSuffix} positiveIsGood={positiveIsGood} />
        )}
      </Box>
    </CardContent>
  </Card>
);

// ─── RechartsTooltip custom formatter ─────────────────────────────────────────
const WaterTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Paper variant="outlined" sx={{ p: 1.5, fontSize: 13, minWidth: 160 }}>
      <Typography variant="caption" fontWeight={700} display="block" mb={0.5}>{label}</Typography>
      {payload.map((p) => (
        <Box key={p.dataKey} sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
          <Typography variant="caption" sx={{ color: p.color }}>{p.name}</Typography>
          <Typography variant="caption" fontWeight={600}>
            {typeof p.value === "number" ? `${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 }).format(p.value)} kL` : p.value}
          </Typography>
        </Box>
      ))}
    </Paper>
  );
};

const RevenueTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Paper variant="outlined" sx={{ p: 1.5, fontSize: 13, minWidth: 180 }}>
      <Typography variant="caption" fontWeight={700} display="block" mb={0.5}>{label}</Typography>
      {payload.map((p) => (
        <Box key={p.dataKey} sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
          <Typography variant="caption" sx={{ color: p.color }}>{p.name}</Typography>
          <Typography variant="caption" fontWeight={600}>{fmtCurrency(p.value)}</Typography>
        </Box>
      ))}
    </Paper>
  );
};

// ─── Custom Pie Tooltip with Status, Count, Percentage ─────────────────────
const PieTooltip = ({ active, payload, total }) => {
  if (!active || !payload?.length) return null;
  const dataItem = payload[0];
  const count = dataItem.value || 0;
  const pct = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
  return (
    <Paper variant="outlined" sx={{ p: 1.5, fontSize: 13, minWidth: 170, boxShadow: "0 4px 14px rgba(0,0,0,0.1)" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.8 }}>
        <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: dataItem.color || dataItem.fill }} />
        <Typography variant="caption" fontWeight={700} sx={{ fontSize: "0.85rem" }}>
          {dataItem.name}
        </Typography>
      </Box>
      <Divider sx={{ my: 0.5 }} />
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 0.3 }}>
        <Typography variant="caption" color="text.secondary">Count / Bills:</Typography>
        <Typography variant="caption" fontWeight={700}>{count}</Typography>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
        <Typography variant="caption" color="text.secondary">Percentage:</Typography>
        <Typography variant="caption" fontWeight={700} color="primary.main">{pct}%</Typography>
      </Box>
    </Paper>
  );
};

// ─── Interactive Pie Chart Component (Zoom In, Zoom Out, Reset, Wheel Zoom, Legend Toggle) ──
const InteractivePieChart = ({ data, colors }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hiddenSlices, setHiddenSlices] = useState({});

  const totalCount = useMemo(() => {
    return (data || []).reduce((acc, curr) => acc + (curr.value || 0), 0);
  }, [data]);

  const visibleData = useMemo(() => {
    return (data || []).filter(item => !hiddenSlices[item.name]);
  }, [data, hiddenSlices]);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 2.2));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.6));
  const handleReset = () => {
    setZoomLevel(1);
    setHiddenSlices({});
  };

  const handleWheel = (e) => {
    if (e.deltaY < 0) handleZoomIn();
    else if (e.deltaY > 0) handleZoomOut();
  };

  const toggleSlice = (name) => {
    setHiddenSlices(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const baseInnerRadius = 60 * zoomLevel;
  const baseOuterRadius = 92 * zoomLevel;

  return (
    <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Interactive Toolbar for Pie Chart */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1, px: 0.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          Zoom: {Math.round(zoomLevel * 100)}%
        </Typography>
        <Stack direction="row" spacing={0.5}>
          <Button size="small" variant="outlined" onClick={handleZoomIn} sx={{ minWidth: 32, p: 0.4 }} title="Zoom In">
            <ZoomInIcon fontSize="small" />
          </Button>
          <Button size="small" variant="outlined" onClick={handleZoomOut} sx={{ minWidth: 32, p: 0.4 }} title="Zoom Out">
            <ZoomOutIcon fontSize="small" />
          </Button>
          <Button size="small" variant="outlined" onClick={handleReset} sx={{ minWidth: 32, p: 0.4 }} title="Reset View">
            <RefreshIcon fontSize="small" />
          </Button>
        </Stack>
      </Box>

      {/* Pie Chart Canvas with Mouse Wheel Support */}
      <Box onWheel={handleWheel} sx={{ flex: 1, minHeight: 230, cursor: "grab", "&:active": { cursor: "grabbing" } }}>
        <ResponsiveContainer width="100%" height={230}>
          <PieChart margin={{ top: 0, right: 10, bottom: 0, left: 10 }}>
            <Pie
              data={visibleData}
              cx="50%"
              cy="50%"
              innerRadius={Math.max(20, baseInnerRadius)}
              outerRadius={Math.max(35, baseOuterRadius)}
              paddingAngle={3}
              dataKey="value"
              animationDuration={500}
            >
              {visibleData.map((entry, index) => {
                const colorIdx = (data || []).findIndex(d => d.name === entry.name);
                return (
                  <Cell key={`cell-${index}`} fill={colors[colorIdx % colors.length]} />
                );
              })}
            </Pie>
            <RechartsTooltip content={<PieTooltip total={totalCount} />} />
          </PieChart>
        </ResponsiveContainer>
      </Box>

      {/* Interactive Legend with Enable/Disable Toggle Controls */}
      <Box sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 1.5, pt: 1 }}>
        {(data || []).map((entry, index) => {
          const isHidden = !!hiddenSlices[entry.name];
          const color = colors[index % colors.length];
          const count = entry.value || 0;
          const pct = totalCount > 0 ? ((count / totalCount) * 100).toFixed(0) : 0;
          return (
            <Chip
              key={entry.name}
              size="small"
              onClick={() => toggleSlice(entry.name)}
              label={`${entry.name}: ${count} (${pct}%)`}
              sx={{
                bgcolor: isHidden ? "action.disabledBackground" : `${color}18`,
                color: isHidden ? "text.disabled" : color,
                borderColor: color,
                borderWidth: isHidden ? 0 : 1,
                borderStyle: "solid",
                fontWeight: 700,
                fontSize: "0.74rem",
                cursor: "pointer",
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
};




// ─── Chart section wrapper ────────────────────────────────────────────────────

const ChartCard = ({ title, subtitle, children, height = 290 }) => (
  <Paper
    variant="outlined"
    sx={{
      p: 3,
      borderRadius: CARD_BORDER_RADIUS,
      height: "100%",
      display: "flex",
      flexDirection: "column"
    }}
  >
    <Typography variant="h6" fontWeight={700} sx={{ mb: 0.3, fontSize: "0.95rem" }}>
      {title}
    </Typography>
    {subtitle && (
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
        {subtitle}
      </Typography>
    )}
    <Box sx={{ flex: 1, mt: subtitle ? 0 : 1.5 }}>
      <ResponsiveContainer width="100%" height={height}>
        {children}
      </ResponsiveContainer>
    </Box>
  </Paper>
);


// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReportsAnalyticsPage() {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [billingCycles, setBillingCycles] = useState([]);

  // Filters
  const [selectedCycle, setSelectedCycle] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportType, setReportType] = useState("ALL");

  // Table State
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchBillingCycles();
    fetchAnalyticsData({});
  }, []);

  const fetchBillingCycles = async () => {
    try {
      const res = await CommunityOpsService.getBillingCycles();
      if (res?.success) setBillingCycles(res.data || []);
    } catch (err) {
      console.error("Failed to fetch billing cycles", err);
    }
  };

  const fetchAnalyticsData = async (filterParams) => {
    setLoading(true);
    setError(null);
    try {
      const res = await CommunityOpsService.getReportAnalytics(filterParams);
      if (res?.success) {
        setData(res.data);
      } else {
        setError(res?.message || "Failed to load report analytics.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to connect to backend service.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    const params = {};
    if (selectedCycle) params.billingCycleId = selectedCycle;
    if (selectedMonth) params.month = selectedMonth;
    if (selectedYear) params.year = selectedYear;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (reportType && reportType !== "ALL") params.reportType = reportType;
    fetchAnalyticsData(params);
  };

  const handleResetFilters = () => {
    setSelectedCycle("");
    setSelectedMonth("");
    setSelectedYear("");
    setStartDate("");
    setEndDate("");
    setReportType("ALL");
    fetchAnalyticsData({});
  };

  // ─── Export handlers ───────────────────────────────────────────────────────
  const handleExportCSV = () => {
    if (!data) return;
    let csv = "data:text/csv;charset=utf-8,";
    csv += "Metric,Value\n";
    csv += `Community,${data.communityName}\n`;
    csv += `Generated At,${data.generatedAt}\n`;
    csv += `Total Water Purchased,${data.totalWaterPurchased} kL\n`;
    csv += `Total Water Consumed,${data.totalWaterConsumed} kL\n`;
    csv += `Water Loss,${data.totalWaterLoss} kL\n`;
    csv += `Collection Efficiency,${data.collectionEfficiencyPercentage?.toFixed(1)}%\n`;
    csv += `Total Revenue Generated,${data.totalRevenueGenerated}\n`;
    csv += `Total Revenue Collected,${data.totalRevenueCollected}\n`;
    csv += `Total Revenue Pending,${data.totalRevenuePending}\n`;
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", `Community_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification("CSV report downloaded successfully!", "success");
  };

  const handlePrint = () => window.print();
  const handleExportPDF = () => handlePrint();
  const handleExportExcel = () => handleExportCSV();

  // ─── Table data ────────────────────────────────────────────────────────────
  const currentTableData = useMemo(() => {
    if (!data) return [];
    let list = [];
    if (activeTab === 0) list = data.residentSummaries || [];
    else if (activeTab === 1) list = data.billSummaries || [];
    else if (activeTab === 2) list = data.complaintSummaries || [];
    else if (activeTab === 3) list = data.blockPerformances || [];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter((item) =>
        Object.values(item).some((val) => String(val).toLowerCase().includes(term))
      );
    }
    return list;
  }, [data, activeTab, searchTerm]);

  // ─── KPI definitions ───────────────────────────────────────────────────────
  const kpiCards = data
    ? [
        {
          title: "Total Water Purchased",
          value: fmtKL(data.totalWaterPurchased),
          subtitle: "Bulk source water supply",
          icon: <WaterDropIcon />,
          iconColor: "#0288d1",
          iconBg: "#e0f7fa",
          trend: null
        },
        {
          title: "Total Water Consumed",
          value: fmtKL(data.totalWaterConsumed),
          subtitle: "Aggregate metered consumption",
          icon: <OpacityIcon />,
          iconColor: "#1565c0",
          iconBg: "#e3f2fd",
          trend: null
        },
        {
          title: "Water Loss / NRW",
          value: fmtKL(data.totalWaterLoss),
          subtitle: "Purchased minus consumed",
          icon: <WarningAmberIcon />,
          iconColor: "#c62828",
          iconBg: "#ffebee",
          // water loss % of purchased as trend – lower is better
          trend:
            data.totalWaterPurchased > 0
              ? -((data.totalWaterLoss / data.totalWaterPurchased) * 100)
              : null,
          trendSuffix: "% of supply",
          positiveIsGood: false
        },
        {
          title: "Collection Efficiency",
          value: fmtPct(data.collectionEfficiencyPercentage),
          subtitle: "Revenue collected vs billed",
          icon: <PaymentsIcon />,
          iconColor: "#2e7d32",
          iconBg: "#e8f5e9",
          trend: null
        },
        {
          title: "Revenue Generated",
          value: fmtCurrency(data.totalRevenueGenerated),
          subtitle: "Total amount billed to residents",
          icon: <ReceiptLongIcon />,
          iconColor: "#e65100",
          iconBg: "#fff3e0",
          trend: null
        },
        {
          title: "Pending Revenue",
          value: fmtCurrency(data.totalRevenuePending),
          subtitle: "Uncollected outstanding amount",
          icon: <AccountBalanceWalletIcon />,
          iconColor: "#6a1b9a",
          iconBg: "#f3e5f5",
          trend: null
        }
      ]
    : [];

  // ─── Pie data ─────────────────────────────────────────────────────────────
  const billPieData = data
    ? Object.entries(data.billPaymentStatusCounts || {}).map(([name, value]) => ({ name, value }))
    : [];

  const complaintBarData = data
    ? Object.entries(data.complaintStatusCounts || {}).map(([status, count]) => ({ status, count }))
    : [];

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 1.5, md: 2 } }}>
        {/* ── Header ── */}
        <PageSummaryHeader
          title="Community Reports & Analytics"
          subtitle="Comprehensive analytics, usage trends, revenue collection, water balance, and downloadable community performance reports."
          icon={<AssessmentIcon sx={{ fontSize: 32, color: "primary.main" }} />}
          action={
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              <Button variant="outlined" color="primary" startIcon={<PictureAsPdfIcon />} onClick={handleExportPDF} sx={{ borderRadius: "8px", fontWeight: 600 }}>
                Export PDF
              </Button>
              <Button variant="outlined" color="success" startIcon={<TableChartIcon />} onClick={handleExportExcel} sx={{ borderRadius: "8px", fontWeight: 600 }}>
                Export Excel
              </Button>
              <Button variant="outlined" color="secondary" startIcon={<FileDownloadIcon />} onClick={handleExportCSV} sx={{ borderRadius: "8px", fontWeight: 600 }}>
                CSV Export
              </Button>
              <Button variant="contained" color="primary" startIcon={<PrintIcon />} onClick={handlePrint} sx={{ borderRadius: "8px", fontWeight: 600 }}>
                Print Report
              </Button>
            </Box>
          }
        />

        {/* ── Filters ── */}
        <Paper
          variant="outlined"
          sx={{ p: 2.5, mb: 3.5, borderRadius: CARD_BORDER_RADIUS, bgcolor: "background.paper" }}
        >
          <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <FilterListIcon fontSize="small" /> Analytics Filters
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Billing Cycle</InputLabel>
                <Select value={selectedCycle} label="Billing Cycle" onChange={(e) => setSelectedCycle(e.target.value)}>
                  <MenuItem value="">All Cycles</MenuItem>
                  {billingCycles.map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.cycleName || `Cycle #${c.id}`}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Month</InputLabel>
                <Select value={selectedMonth} label="Month" onChange={(e) => setSelectedMonth(e.target.value)}>
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
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Year</InputLabel>
                <Select value={selectedYear} label="Year" onChange={(e) => setSelectedYear(e.target.value)}>
                  <MenuItem value="">All Years</MenuItem>
                  {[2024, 2025, 2026].map((y) => (
                    <MenuItem key={y} value={y}>{y}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField fullWidth size="small" type="date" label="Start Date" value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField fullWidth size="small" type="date" label="End Date" value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 12, md: 2.5 }} sx={{ display: "flex", gap: 1 }}>
              <Button fullWidth variant="contained" color="primary" onClick={handleApplyFilters} sx={{ fontWeight: 600 }}>
                Apply
              </Button>
              <Button variant="outlined" color="inherit" onClick={handleResetFilters} sx={{ minWidth: 44, p: 1 }}>
                <RestartAltIcon />
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* ── Loading / Error ── */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress size={50} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>
        ) : data ? (
          <>
            {/* ════════════════════════════════════════════════════════════
                KPI CARDS — 2 rows × 3 cards
            ════════════════════════════════════════════════════════════ */}
            <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
              {kpiCards.map((kpi, idx) => (
                <Grid key={idx} size={{ xs: 12, sm: 6, md: 4 }}>
                  <KpiCard {...kpi} />
                </Grid>
              ))}
            </Grid>

            {/* ════════════════════════════════════════════════════════════
                GROUPED ANALYTICS SECTIONS (PART 3, 4, 5, 6, 7)
            ════════════════════════════════════════════════════════════ */}
            <Stack spacing={3.5} sx={{ mb: 3.5 }}>

              {/* ── SECTION 1: WATER BALANCE & LOSS ANALYTICS ── */}
              <Paper
                variant="outlined"
                sx={{
                  borderRadius: CARD_BORDER_RADIUS,
                  overflow: "hidden",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  borderColor: "divider"
                }}
              >
                <Box sx={{ px: 3, pt: 2.5, pb: 1, borderBottom: "1px solid", borderColor: "divider", bgcolor: "rgba(0,0,0,0.01)" }}>
                  <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1.05rem", display: "flex", alignItems: "center", gap: 1 }}>
                    <WaterDropIcon color="primary" fontSize="small" /> Water Balance & Loss Analytics
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Aggregated volume comparison and non-revenue water (NRW) loss calculations
                  </Typography>
                </Box>
                
                <Grid container>
                  {/* Left Chart: Monthly Purchase vs Consumption */}
                  <Grid size={{ xs: 12, md: 6 }} sx={{ p: 3 }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.3 }}>
                      Monthly Water Purchase vs Consumption
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                      Actual database aggregate — kL per month
                    </Typography>
                    <ResponsiveContainer width="100%" height={320}>
                      <LineChart data={data.waterBalanceTrend || []} margin={{ top: 5, right: 25, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} padding={{ left: 10, right: 10 }} />
                        <YAxis tick={{ fontSize: 12 }} width={65} tickFormatter={(v) => `${v} kL`} />
                        <RechartsTooltip content={<WaterTooltip />} />
                        <Legend verticalAlign="bottom" height={36} />
                        <Line type="monotone" dataKey="purchased" name="Purchased (kL)" stroke="#0288d1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="consumed" name="Consumed (kL)" stroke="#2e7d32" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Grid>

                  {/* Vertical Separator Divider on Desktop */}
                  <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" }, mr: "-1px" }} />

                  {/* Right Chart: Water Loss Analysis */}
                  <Grid size={{ xs: 12, md: 6 }} sx={{ p: 3, borderTop: { xs: "1px solid #e0e0e0", md: "none" } }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.3 }}>
                      Water Loss Analysis (NRW)
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                      Purchased − Consumed = Unaccounted Water Loss per month
                    </Typography>
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={data.waterBalanceTrend || []} margin={{ top: 5, right: 25, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} padding={{ left: 10, right: 10 }} />
                        <YAxis tick={{ fontSize: 12 }} width={65} tickFormatter={(v) => `${v} kL`} />
                        <RechartsTooltip content={<WaterTooltip />} />
                        <Legend verticalAlign="bottom" height={36} />
                        <Bar dataKey="purchased" name="Purchased" fill="#0288d1" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="consumed" name="Consumed" fill="#2e7d32" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="loss" name="Water Loss" fill="#d32f2f" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Grid>
                </Grid>
              </Paper>


              {/* ── SECTION 2: REVENUE & COMPLAINT ANALYTICS ── */}
              <Paper
                variant="outlined"
                sx={{
                  borderRadius: CARD_BORDER_RADIUS,
                  overflow: "hidden",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  borderColor: "divider"
                }}
              >
                <Box sx={{ px: 3, pt: 2.5, pb: 1, borderBottom: "1px solid", borderColor: "divider", bgcolor: "rgba(0,0,0,0.01)" }}>
                  <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1.05rem", display: "flex", alignItems: "center", gap: 1 }}>
                    <ReceiptLongIcon color="primary" fontSize="small" /> Revenue Collection & Complaint Operations
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Financial performance, bill realization status, and operational ticket resolution
                  </Typography>
                </Box>

                {/* Top Row: Full-width Revenue Collection Trend */}
                <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "divider" }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.3 }}>
                    Revenue Collection & Realization Trend (₹)
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                    Month-wise generated, collected, and pending outstanding revenue
                  </Typography>
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={data.revenueTrend || []} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} padding={{ left: 10, right: 10 }} />
                      <YAxis tick={{ fontSize: 12 }} width={75} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                      <RechartsTooltip content={<RevenueTooltip />} />
                      <Legend verticalAlign="bottom" height={36} />
                      <Line type="monotone" dataKey="generated" name="Billed / Generated" stroke="#ed6c02" strokeWidth={2.5} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="collected" name="Realized / Collected" stroke="#2e7d32" strokeWidth={2.5} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="pending" name="Outstanding Pending" stroke="#d32f2f" strokeWidth={2.5} dot={{ r: 4 }} strokeDasharray="5 3" />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>

                {/* Bottom Row: Bill Status + Complaint Status split (50 / 50) */}
                <Grid container>
                  <Grid size={{ xs: 12, md: 6 }} sx={{ p: 3 }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.3 }}>
                      Bill Payment Breakdown
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                      Proportion of Paid, Pending, and Overdue bills
                    </Typography>
                    <Box sx={{ minHeight: 290 }}>
                      <InteractivePieChart data={billPieData} colors={PIE_COLORS} />
                    </Box>

                  </Grid>

                  <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" }, mr: "-1px" }} />

                  <Grid size={{ xs: 12, md: 6 }} sx={{ p: 3, borderTop: { xs: "1px solid #e0e0e0", md: "none" } }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.3 }}>
                      Complaint Ticket Status
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                      Distribution of active and resolved complaint tickets
                    </Typography>
                    <ResponsiveContainer width="100%" height={290}>
                      <BarChart data={complaintBarData} margin={{ top: 5, right: 20, left: 10, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="status" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" interval={0} />
                        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                        <RechartsTooltip />
                        <Bar dataKey="count" name="Complaints" radius={[5, 5, 0, 0]}>
                          {complaintBarData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Grid>
                </Grid>
              </Paper>


              {/* ── SECTION 3: HOUSEHOLD CONSUMPTION RANKINGS ── */}
              <Paper
                variant="outlined"
                sx={{
                  borderRadius: CARD_BORDER_RADIUS,
                  overflow: "hidden",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  borderColor: "divider"
                }}
              >
                <Box sx={{ px: 3, pt: 2.5, pb: 1, borderBottom: "1px solid", borderColor: "divider", bgcolor: "rgba(0,0,0,0.01)" }}>
                  <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1.05rem", display: "flex", alignItems: "center", gap: 1 }}>
                    <AssessmentIcon color="primary" fontSize="small" /> Household Consumption Rankings
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Household-level meter aggregates — approved active households only
                  </Typography>
                </Box>

                <Grid container>
                  {/* Top Highest Household Consumers */}
                  <Grid size={{ xs: 12, md: 6 }} sx={{ p: 3 }}>
                    <Typography variant="subtitle2" fontWeight={700} color="error.main" sx={{ mb: 0.3 }}>
                      Top 10 Highest Consuming Households
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                      Sorted by total meter consumption (kL) descending
                    </Typography>
                    <ResponsiveContainer width="100%" height={340}>
                      <BarChart layout="vertical" data={data.topHighestConsumers || []} margin={{ top: 5, left: 15, right: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                        <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `${v} kL`} />
                        <YAxis type="category" dataKey="flatNumber" width={95} tick={{ fontSize: 12 }} />
                        <RechartsTooltip content={<WaterTooltip />} />
                        <Legend verticalAlign="top" height={28} />
                        <Bar dataKey="unitsConsumed" name="Consumption (kL)" fill="#d32f2f" radius={[0, 5, 5, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Grid>

                  <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" }, mr: "-1px" }} />

                  {/* Top Most Efficient Household Consumers */}
                  <Grid size={{ xs: 12, md: 6 }} sx={{ p: 3, borderTop: { xs: "1px solid #e0e0e0", md: "none" } }}>
                    <Typography variant="subtitle2" fontWeight={700} color="success.main" sx={{ mb: 0.3 }}>
                      Top 10 Most Efficient Households
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                      Sorted by total meter consumption (kL) ascending
                    </Typography>
                    <ResponsiveContainer width="100%" height={340}>
                      <BarChart layout="vertical" data={data.topLowestConsumers || []} margin={{ top: 5, left: 15, right: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                        <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `${v} kL`} />
                        <YAxis type="category" dataKey="flatNumber" width={95} tick={{ fontSize: 12 }} />
                        <RechartsTooltip content={<WaterTooltip />} />
                        <Legend verticalAlign="top" height={28} />
                        <Bar dataKey="unitsConsumed" name="Consumption (kL)" fill="#2e7d32" radius={[0, 5, 5, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Grid>
                </Grid>
              </Paper>

            </Stack>


            {/* ════════════════════════════════════════════════════════════
                DATA TABLES
            ════════════════════════════════════════════════════════════ */}
            <Paper variant="outlined" sx={{ p: 3, borderRadius: CARD_BORDER_RADIUS }}>
              <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
                <Tabs value={activeTab} onChange={(_, val) => { setActiveTab(val); setPage(0); }}>
                  <Tab label="Resident Summary" />
                  <Tab label="Billing Summary" />
                  <Tab label="Complaint Summary" />
                  <Tab label="Block Performance" />
                </Tabs>
              </Box>

              <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                <SearchBar
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search table records..."
                />
                <Typography variant="caption" color="text.secondary">
                  {currentTableData.length} records
                </Typography>
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "action.hover" }}>
                      {activeTab === 0 && (
                        <>
                          <TableCell sx={{ fontWeight: 700 }}>Resident Code</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Block / Unit</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Meter No.</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Current Reading</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        </>
                      )}
                      {activeTab === 1 && (
                        <>
                          <TableCell sx={{ fontWeight: 700 }}>Bill No</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Resident Name</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Flat</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Period</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Usage (kL)</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Amount (₹)</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        </>
                      )}
                      {activeTab === 2 && (
                        <>
                          <TableCell sx={{ fontWeight: 700 }}>Ticket No</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Resident</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Created Date</TableCell>
                        </>
                      )}
                      {activeTab === 3 && (
                        <>
                          <TableCell sx={{ fontWeight: 700 }}>Block Name</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Total Households</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Total Consumption (kL)</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Avg / Flat (kL)</TableCell>
                        </>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentTableData
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row, idx) => (
                        <TableRow key={idx} hover>
                          {activeTab === 0 && (
                            <>
                              <TableCell>{row.officialUserId}</TableCell>
                              <TableCell>{row.name}</TableCell>
                              <TableCell sx={{ fontSize: "0.78rem", color: "text.secondary" }}>{row.email}</TableCell>
                              <TableCell>{row.block} - {row.unit}</TableCell>
                              <TableCell>{row.meterNumber}</TableCell>
                              <TableCell>{row.currentReading} kL</TableCell>
                              <TableCell>
                                <Chip size="small" label={row.status} color={row.status === "ACTIVE" ? "success" : "default"} />
                              </TableCell>
                            </>
                          )}
                          {activeTab === 1 && (
                            <>
                              <TableCell>{row.billNumber}</TableCell>
                              <TableCell>{row.residentName}</TableCell>
                              <TableCell>{row.flatNumber}</TableCell>
                              <TableCell>{row.billingPeriod}</TableCell>
                              <TableCell>{row.unitsConsumed?.toFixed(2)}</TableCell>
                              <TableCell>{fmtCurrency(row.totalAmount)}</TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  label={row.status}
                                  color={row.status === "PAID" ? "success" : row.status === "OVERDUE" ? "error" : "warning"}
                                />
                              </TableCell>
                            </>
                          )}
                          {activeTab === 2 && (
                            <>
                              <TableCell>{row.ticketNumber}</TableCell>
                              <TableCell>{row.residentName}</TableCell>
                              <TableCell>{row.category}</TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  label={row.priority}
                                  color={row.priority === "HIGH" ? "error" : row.priority === "MEDIUM" ? "warning" : "default"}
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>
                                <Chip size="small" label={row.status} color={row.status === "RESOLVED" ? "success" : row.status === "REJECTED" ? "error" : "info"} />
                              </TableCell>
                              <TableCell sx={{ fontSize: "0.78rem", color: "text.secondary" }}>{row.createdAt}</TableCell>
                            </>
                          )}
                          {activeTab === 3 && (
                            <>
                              <TableCell sx={{ fontWeight: 600 }}>{row.blockName}</TableCell>
                              <TableCell>{row.totalUnitsCount}</TableCell>
                              <TableCell>{row.totalConsumption?.toFixed(1)} kL</TableCell>
                              <TableCell>{row.averageConsumptionPerUnit?.toFixed(1)} kL</TableCell>
                            </>
                          )}
                        </TableRow>
                      ))}
                    {currentTableData.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4, color: "text.secondary" }}>
                          No records found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={currentTableData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
              />
            </Paper>
          </>
        ) : null}
      </Box>
    </DashboardLayout>
  );
}
