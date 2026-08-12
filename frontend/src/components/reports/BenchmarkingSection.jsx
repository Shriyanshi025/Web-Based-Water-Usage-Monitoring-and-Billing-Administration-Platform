import React from "react";
import {
  Paper,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  CircularProgress,
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
  Switch,
  FormControlLabel,
  Alert
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import RefreshIcon from "@mui/icons-material/Refresh";
import InfoIcon from "@mui/icons-material/Info";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import OpacityIcon from "@mui/icons-material/Opacity";
import SpeedIcon from "@mui/icons-material/Speed";
import PaymentsIcon from "@mui/icons-material/Payments";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip
} from "recharts";
import SearchBar from "../common/SearchBar";
import EmptyState from "../common/EmptyState";
import SectionCard from "./SectionCard";
import KpiGrid from "./KpiGrid";
import ChartCard from "./ChartCard";

const CARD_BORDER_RADIUS = "14px";
const BAR_COLORS = ["#0288d1", "#2e7d32", "#ed6c02", "#7b1fa2", "#d32f2f"];

const fmtCurrency = (val) => {
  if (val == null || isNaN(val)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(val);
};

const fmtKL = (val) => {
  if (val == null || isNaN(val)) return "0 kL";
  return `${new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(val)} kL`;
};

const KpiCard = ({ title, value, subtitle, icon, iconColor, badgeText }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      border: "1px solid rgba(0,0,0,0.08)",
      borderLeft: `4px solid ${iconColor}`,
      borderRadius: 3,
      background: `linear-gradient(135deg, ${iconColor}0D 0%, #FFFFFF 60%)`,
      height: 165,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between"
    }}
  >
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
        {icon && (
          <Box sx={{ color: iconColor, fontSize: 20, display: "flex", alignItems: "center" }}>
            {React.cloneElement(icon, { sx: { fontSize: 20 } })}
          </Box>
        )}
        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h5" fontWeight={800} sx={{ color: iconColor, lineHeight: 1.2, my: 0.5 }}>
        {value}
      </Typography>
    </Box>

    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.73rem" }}>
        {subtitle}
      </Typography>
      {badgeText && <Chip size="small" label={badgeText} color="primary" variant="outlined" sx={{ fontSize: "0.68rem", height: 20 }} />}
    </Box>
  </Paper>
);

export default function BenchmarkingSection({
  benchmarkingData,
  timeWindow,
  setTimeWindow,
  blockName,
  setBlockName,
  unitType,
  setUnitType,
  badgeFilter,
  setBadgeFilter,
  leakSuspectedOnly,
  setLeakSuspectedOnly,
  refreshingBenchmarking,
  handleRefreshBenchmarking,
  setMethodologyOpen,
  bmSearchQuery,
  setBmSearchQuery,
  bmTableTab,
  setBmTableTab,
  sortedRankings,
  movements,
  bmPage,
  setBmPage,
  bmRowsPerPage,
  setBmRowsPerPage,
  handleOpenDrawer
}) {
  const summary = benchmarkingData?.summary || {};
  const blockBenchmarking = benchmarkingData?.blockBenchmarking || [];
  const scatterPoints = benchmarkingData?.scatterPoints || [];

  const renderBadgeChip = (badge) => {
    switch (badge) {
      case "TOP_SAVER":
        return <Chip size="small" label="★ Top Saver" color="success" sx={{ fontWeight: 600, fontSize: "0.75rem" }} />;
      case "HIGH_CONSUMER":
        return <Chip size="small" label="High Consumer" color="error" sx={{ fontWeight: 600, fontSize: "0.75rem" }} />;
      default:
        return <Chip size="small" label="Average" color="default" variant="outlined" sx={{ fontWeight: 500, fontSize: "0.75rem" }} />;
    }
  };

  const renderTrendIcon = (trend) => {
    if (trend === "UP") return <TrendingUpIcon color="error" fontSize="small" titleAccess="Consumption Increased" />;
    if (trend === "DOWN") return <TrendingDownIcon color="success" fontSize="small" titleAccess="Consumption Decreased" />;
    return <TrendingFlatIcon color="action" fontSize="small" titleAccess="Consumption Stable" />;
  };

  const headerAction = (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Chip icon={<EmojiEventsIcon />} label={benchmarkingData?.benchmarkPeriodLabel || "Current Month"} color="primary" sx={{ fontWeight: 600 }} />
      <Chip
        label={benchmarkingData?.confidenceLabel || "HIGH Confidence"}
        color={benchmarkingData?.analyticsConfidence === "HIGH" ? "success" : benchmarkingData?.analyticsConfidence === "MEDIUM" ? "warning" : "error"}
        variant="outlined"
        sx={{ fontWeight: 600 }}
      />
      <Button
        variant="outlined"
        startIcon={refreshingBenchmarking ? <CircularProgress size={16} /> : <RefreshIcon />}
        onClick={handleRefreshBenchmarking}
        disabled={refreshingBenchmarking}
        size="small"
      >
        Refresh
      </Button>
      <Button variant="outlined" color="info" startIcon={<InfoIcon />} onClick={() => setMethodologyOpen(true)} size="small">
        Methodology
      </Button>
    </Stack>
  );

  return (
    <SectionCard
      icon={<EmojiEventsIcon />}
      title="Community Benchmarking"
      description="Compare household performance, efficiency scores and identify water consumption anomalies."
      headerAction={headerAction}
    >
      <Stack spacing={3.5}>
        {/* Filter Toolbar */}
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)", bgcolor: "background.paper" }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(5, 1fr)" },
              gap: 2,
              alignItems: "center"
            }}
          >
            <FormControl fullWidth size="small" sx={{ minWidth: 170 }}>
              <InputLabel id="time-window-label">Time Window</InputLabel>
              <Select labelId="time-window-label" value={timeWindow} label="Time Window" onChange={(e) => setTimeWindow(e.target.value)}>
                <MenuItem value="CURRENT_MONTH">Current Month</MenuItem>
                <MenuItem value="PREVIOUS_MONTH">Previous Month</MenuItem>
                <MenuItem value="LAST_3_MONTHS">Last 3 Months</MenuItem>
                <MenuItem value="LAST_6_MONTHS">Last 6 Months</MenuItem>
                <MenuItem value="LAST_12_MONTHS">Last 12 Months</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" sx={{ minWidth: 170 }}>
              <InputLabel id="block-label">Block</InputLabel>
              <Select labelId="block-label" value={blockName} label="Block" onChange={(e) => setBlockName(e.target.value)}>
                <MenuItem value="ALL">All Blocks</MenuItem>
                <MenuItem value="Block A">Block A</MenuItem>
                <MenuItem value="Block B">Block B</MenuItem>
                <MenuItem value="Block C">Block C</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" sx={{ minWidth: 170 }}>
              <InputLabel id="unit-type-label">Unit Type</InputLabel>
              <Select labelId="unit-type-label" value={unitType} label="Unit Type" onChange={(e) => setUnitType(e.target.value)}>
                <MenuItem value="ALL">All Types</MenuItem>
                <MenuItem value="FLAT">Flat</MenuItem>
                <MenuItem value="VILLA">Villa</MenuItem>
                <MenuItem value="HOUSE">House</MenuItem>
                <MenuItem value="SHOP">Shop</MenuItem>
                <MenuItem value="OFFICE">Office</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" sx={{ minWidth: 170 }}>
              <InputLabel id="badge-label">Badge</InputLabel>
              <Select labelId="badge-label" value={badgeFilter} label="Badge" onChange={(e) => setBadgeFilter(e.target.value)}>
                <MenuItem value="ALL">All Badges</MenuItem>
                <MenuItem value="TOP_SAVER">Top Saver</MenuItem>
                <MenuItem value="AVERAGE">Average</MenuItem>
                <MenuItem value="HIGH_CONSUMER">High Consumer</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <FormControlLabel
                control={<Switch checked={leakSuspectedOnly} onChange={(e) => setLeakSuspectedOnly(e.target.checked)} color="error" />}
                label={<Typography variant="body2" fontWeight={600} color="error.main">Leak Suspected</Typography>}
              />
            </Box>
          </Box>
        </Paper>

        {/* 1. Summary KPIs */}
        <KpiGrid minWidth={240}>
          <KpiCard title="Active Households" value={summary.totalActiveHouseholds || 0} icon={<WaterDropIcon />} iconColor="#0288d1" iconBg="#e0f7fa" subtitle="Approved & Verified" />
          <KpiCard title="Community Avg Usage" value={fmtKL(summary.communityAvgConsumption)} icon={<OpacityIcon />} iconColor="#2e7d32" iconBg="#e8f5e9" subtitle="Per Household Baseline" />
          <KpiCard title="Average Efficiency" value={`${summary.avgEfficiencyScore || 0} / 100`} icon={<SpeedIcon />} iconColor="#ed6c02" iconBg="#fff3e0" badgeText="Weighted Index" />
          <KpiCard title="Collection Rate" value={`${summary.avgCollectionRate || 0}%`} icon={<PaymentsIcon />} iconColor="#7b1fa2" iconBg="#f3e5f5" subtitle="Paid Bills Ratio" />
        </KpiGrid>

        {/* 2. Block Benchmarking */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)", bgcolor: "background.paper" }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Block Benchmarking (Block vs Block Performance)
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 600 }}>
                Average Consumption by Block (kL)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={blockBenchmarking} margin={{ top: 15, right: 20, left: 10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="blockName" dy={8} />
                  <YAxis unit=" kL" width={55} />
                  <RechartsTooltip formatter={(val) => [`${val} kL`, "Avg Usage"]} />
                  <Bar dataKey="avgConsumptionPerHousehold" fill="#0288d1" radius={[6, 6, 0, 0]}>
                    {blockBenchmarking.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Grid>

            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 600 }}>
                Block Operations Performance Overview
              </Typography>
              <TableContainer sx={{ overflowX: { xs: "auto", md: "visible" }, width: "100%", border: "1px solid rgba(0,0,0,0.06)", borderRadius: "8px" }}>
                <Table size="small" sx={{ width: "100%", tableLayout: "fixed" }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "action.hover" }}>
                      <TableCell sx={{ fontWeight: 700, py: 1.5, width: "15%" }}>Block</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, width: "15%" }}>Households</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, width: "20%" }}>Avg Usage</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, width: "20%" }}>Avg Bill</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, width: "15%" }}>Collection %</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, width: "15%" }}>Efficiency</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {blockBenchmarking.map((row) => (
                      <TableRow key={row.blockId} hover sx={{ "& td": { py: 1.2 } }}>
                        <TableCell sx={{ fontWeight: 600 }}>{row.blockName}</TableCell>
                        <TableCell align="right">{row.totalHouseholds}</TableCell>
                        <TableCell align="right">{fmtKL(row.avgConsumptionPerHousehold)}</TableCell>
                        <TableCell align="right">{fmtCurrency(row.avgBillAmount)}</TableCell>
                        <TableCell align="right">
                          <Chip size="small" label={`${row.collectionRate}%`} color={row.collectionRate >= 90 ? "success" : "warning"} variant="outlined" />
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={700} color={row.blockEfficiencyScore >= 75 ? "success.main" : "warning.main"}>
                            {row.blockEfficiencyScore} / 100
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </Paper>

        {/* 3. Household Benchmark Rankings & Movement */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)", bgcolor: "background.paper" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 2 }}>
            <Typography variant="h6" fontWeight={700}>
              Household Benchmark Rankings & Rank Movement
            </Typography>
            <Box sx={{ width: 300 }}>
              <SearchBar placeholder="Search Flat or Resident..." value={bmSearchQuery} onChange={(e) => setBmSearchQuery(e.target.value)} />
            </Box>
          </Box>

          <Tabs value={bmTableTab} onChange={(e, val) => setBmTableTab(val)} sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}>
            <Tab label={`Current Rankings (${sortedRankings.length})`} sx={{ fontWeight: 600 }} />
            <Tab label={`Rank Shifts (${movements.length})`} sx={{ fontWeight: 600 }} />
          </Tabs>

          {bmTableTab === 0 && (
            <>
              {sortedRankings.length === 0 ? (
                <EmptyState message="No households found matching selected filters." />
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: "action.hover" }}>
                        <TableCell sx={{ fontWeight: 700 }}>Rank</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Block</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Flat</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Resident</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Occupancy</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Current Usage</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Comm. Diff</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Efficiency</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>Badge</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>Bill Status</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>Trend</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortedRankings.slice(bmPage * bmRowsPerPage, bmPage * bmRowsPerPage + bmRowsPerPage).map((row) => (
                        <TableRow key={row.residentProfileId} hover onClick={() => handleOpenDrawer(row.residentProfileId)} sx={{ cursor: "pointer" }}>
                          <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>#{row.rank}</TableCell>
                          <TableCell>{row.blockName}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{row.flatNumber}</TableCell>
                          <TableCell>{row.residentName}</TableCell>
                          <TableCell align="right">{row.occupancy} pers.</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>{fmtKL(row.currentMonthUsage)}</TableCell>
                          <TableCell align="right" sx={{ color: row.communityAvgDiffPercent <= 0 ? "success.main" : "error.main", fontWeight: 600 }}>
                            {row.communityAvgDiffPercent > 0 ? `+${row.communityAvgDiffPercent}%` : `${row.communityAvgDiffPercent}%`}
                          </TableCell>
                          <TableCell align="right">
                            <Typography fontWeight={700} color={row.efficiencyScore >= 80 ? "success.main" : row.efficiencyScore >= 50 ? "warning.main" : "error.main"}>
                              {row.efficiencyScore} / 100
                            </Typography>
                          </TableCell>
                          <TableCell align="center">{renderBadgeChip(row.badge)}</TableCell>
                          <TableCell align="center">
                            <Chip size="small" label={row.billStatus} color={row.billStatus === "PAID" ? "success" : row.billStatus === "UNPAID" ? "warning" : "error"} variant="outlined" />
                          </TableCell>
                          <TableCell align="center">{renderTrendIcon(row.trend)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={sortedRankings.length}
                rowsPerPage={bmRowsPerPage}
                page={bmPage}
                onPageChange={(e, p) => setBmPage(p)}
                onRowsPerPageChange={(e) => setBmRowsPerPage(parseInt(e.target.value, 10))}
              />
            </>
          )}

          {bmTableTab === 1 && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "action.hover" }}>
                    <TableCell sx={{ fontWeight: 700 }}>Flat</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Resident</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Block</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Previous Rank</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Current Rank</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Movement</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {movements.map((m) => (
                    <TableRow key={m.residentProfileId} hover onClick={() => handleOpenDrawer(m.residentProfileId)} sx={{ cursor: "pointer" }}>
                      <TableCell sx={{ fontWeight: 600 }}>{m.flatNumber}</TableCell>
                      <TableCell>{m.residentName}</TableCell>
                      <TableCell>{m.blockName}</TableCell>
                      <TableCell align="center">#{m.previousRank}</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: "primary.main" }}>#{m.currentRank}</TableCell>
                      <TableCell align="center">
                        {m.rankChange > 0 && <Chip size="small" icon={<TrendingUpIcon />} label={`+${m.rankChange} (Climbed)`} color="success" />}
                        {m.rankChange < 0 && <Chip size="small" icon={<TrendingDownIcon />} label={`${m.rankChange} (Dropped)`} color="error" />}
                        {m.rankChange === 0 && <Chip size="small" icon={<TrendingFlatIcon />} label="No Change" color="default" variant="outlined" />}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* 4. Outliers & Scatter Plot */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)", bgcolor: "background.paper" }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Outlier Detection & Consumption vs Occupancy Scatter Plot
          </Typography>
          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", alignItems: "flex-start" }}>
            {/* Chart — takes 60% on wide screens, full width on narrow */}
            <Box sx={{ flex: "1.5 1 450px", minWidth: 0, height: 420 }}>
              <ResponsiveContainer width="100%" height={420} debounce={50}>
                <ScatterChart margin={{ top: 20, right: 30, bottom: 45, left: 35 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
                  <XAxis
                    type="number"
                    dataKey="occupancy"
                    name="Occupancy"
                    unit=" pers"
                    dy={8}
                    label={{
                      value: "Occupancy (residents)",
                      position: "insideBottom",
                      offset: -20,
                      style: { textAnchor: "middle", fill: "#666", fontSize: 12 }
                    }}
                  />
                  <YAxis
                    type="number"
                    dataKey="consumption"
                    name="Consumption"
                    unit=" kL"
                    width={90}
                    label={{
                      value: "12-Month Total (kL)",
                      angle: -90,
                      position: "insideLeft",
                      offset: 0,
                      style: { textAnchor: "middle", fill: "#666", fontSize: 12 }
                    }}
                  />
                  <RechartsTooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    content={({ payload }) => {
                      if (!payload || !payload.length) return null;
                      const d = payload[0]?.payload;
                      if (!d) return null;
                      return (
                        <div style={{ background: "rgba(255,255,255,0.95)", border: "1px solid #ccc", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>
                          <div style={{ fontWeight: 700, marginBottom: 4 }}>{d.flatNumber} — {d.blockName}</div>
                          <div>Occupancy: <strong>{d.occupancy}</strong></div>
                          <div>12-Month Total: <strong>{d.consumption} kL</strong></div>
                          <div>Efficiency: <strong>{d.efficiencyScore}/100</strong></div>
                          {d.leakSuspected && <div style={{ color: "#d32f2f", fontWeight: 700, marginTop: 4 }}>⚠ Leak / Outlier Suspected</div>}
                        </div>
                      );
                    }}
                  />
                  <Scatter name="Households" data={scatterPoints} fill="#0288d1">
                    {scatterPoints.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.leakSuspected ? "#d32f2f" : "#0288d1"} opacity={0.85} r={6} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </Box>

            {/* Legend / Stats — takes 35% on wide screens */}
            <Box sx={{ flex: "1 1 300px", maxWidth: { xs: "100%", md: 380 } }}>
              <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                Outlier Detection: Red dots = households with 12-month total &gt;2.2x peer average (Leak / Overuse Suspected). Based on last 12 months of readings.
              </Alert>
              <Stack spacing={1.5}>
                <Paper
                  elevation={0}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 2,
                    bgcolor: "action.hover",
                    borderRadius: 2,
                    border: "1px solid rgba(0,0,0,0.06)"
                  }}
                >
                  <Typography variant="body2" fontWeight={600} color="text.primary">0 – 60 kL / yr (Low)</Typography>
                  <Typography variant="body2" fontWeight={700} color="success.main">
                    {scatterPoints.filter((s) => s.consumption <= 60).length} Households
                  </Typography>
                </Paper>
                <Paper
                  elevation={0}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 2,
                    bgcolor: "action.hover",
                    borderRadius: 2,
                    border: "1px solid rgba(0,0,0,0.06)"
                  }}
                >
                  <Typography variant="body2" fontWeight={600} color="text.primary">60 – 180 kL / yr (Normal)</Typography>
                  <Typography variant="body2" fontWeight={700} color="primary.main">
                    {scatterPoints.filter((s) => s.consumption > 60 && s.consumption <= 180).length} Households
                  </Typography>
                </Paper>
                <Paper
                  elevation={0}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 2,
                    bgcolor: "action.hover",
                    borderRadius: 2,
                    border: "1px solid rgba(0,0,0,0.06)"
                  }}
                >
                  <Typography variant="body2" fontWeight={600} color="text.primary">180+ kL / yr (High / Alert)</Typography>
                  <Typography variant="body2" fontWeight={700} color="error.main">
                    {scatterPoints.filter((s) => s.consumption > 180).length} Households
                  </Typography>
                </Paper>
                <Paper
                  elevation={0}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 2,
                    bgcolor: "action.hover",
                    borderRadius: 2,
                    border: "1px solid rgba(0,0,0,0.06)"
                  }}
                >
                  <Typography variant="body2" fontWeight={600} color="text.primary">⚠ Outliers Detected</Typography>
                  <Typography variant="body2" fontWeight={700} color="error.main">
                    {scatterPoints.filter((s) => s.leakSuspected).length} Households
                  </Typography>
                </Paper>
              </Stack>
            </Box>
          </Box>
        </Paper>
      </Stack>
    </SectionCard>
  );
}
