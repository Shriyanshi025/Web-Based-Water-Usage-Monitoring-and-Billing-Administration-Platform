import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Box, Grid, Typography, Paper, Divider, Chip, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Alert, LinearProgress, Tooltip,
} from "@mui/material";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip as ReTooltip, Legend, PieChart, Pie, Cell,
} from "recharts";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import PageSummaryHeader from "../../components/common/PageSummaryHeader";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { getMainDashboard } from "../../services/DashboardService";
import MainAdminOpsService from "../../services/MainAdminOpsService";
import { formatCurrency, formatWaterUsage } from "../../helpers/numberHelper";
import { exportMainAdminReportCSV, exportMainAdminReportPDF } from "../../helpers/reportExportHelper";
import { Button } from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableChartIcon from "@mui/icons-material/TableChart";
import PrintIcon from "@mui/icons-material/Print";

// ── Design tokens ────────────────────────────────────────────────
const PALETTE = {
  primary: "#4F46E5",
  primaryLight: "#818CF8",
  success: "#16A34A",
  successLight: "#4ADE80",
  warning: "#CA8A04",
  warningLight: "#FDE047",
  info: "#06B6D4",
  infoLight: "#67E8F9",
  purple: "#8B5CF6",
  purpleLight: "#C084FC",
  teal: "#0D9488",
  tealLight: "#2DD4BF",
  bg: "transparent",
  cardBg: "rgba(255, 255, 255, 0.9)",
  border: "rgba(0,0,0,0.08)",
};

const PIE_COLORS = [PALETTE.primary, PALETTE.success, PALETTE.warning, PALETTE.info, PALETTE.purple, PALETTE.teal];
const LINE_COLOR = PALETTE.primaryLight;
const BAR_COLOR = PALETTE.tealLight;

// ── Helper components ────────────────────────────────────────────
function KpiCard({ label, value, sub, color = PALETTE.primary, icon }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5, border: `1px solid ${PALETTE.border}`, borderRadius: 3,
        background: `linear-gradient(135deg, ${color}0D 0%, ${PALETTE.cardBg} 60%)`,
        borderLeft: `4px solid ${color}`,
        height: "100%", display: "flex", flexDirection: "column", gap: 0.5,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
        {icon && <Box sx={{ color, fontSize: 20 }}>{icon}</Box>}
        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
          {label}
        </Typography>
      </Box>
      <Typography variant="h5" fontWeight={800} sx={{ color, lineHeight: 1.2 }}>
        {value}
      </Typography>
      {sub && (
        <Typography variant="caption" color="text.secondary">
          {sub}
        </Typography>
      )}
    </Paper>
  );
}

function SectionTitle({ children }) {
  return (
    <Typography variant="subtitle1" fontWeight={700} color="text.primary" sx={{ mb: 2, letterSpacing: 0.3 }}>
      {children}
    </Typography>
  );
}

function LoadingCard({ height = 200 }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height }}>
      <CircularProgress size={32} />
    </Box>
  );
}

// ── Custom recharts tooltip ──────────────────────────────────────
function CustomTooltip({ active, payload, label, unit = "" }) {
  if (!active || !payload?.length) return null;
  return (
    <Paper elevation={4} sx={{ p: 1.5, borderRadius: 2, minWidth: 140 }}>
      <Typography variant="caption" fontWeight={700} color="text.secondary">{label}</Typography>
      {payload.map((p, i) => (
        <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 0.8, mt: 0.5 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: "50%", background: p.color }} />
          <Typography variant="caption" color="text.primary">
            {p.name}: <strong>{typeof p.value === "number" ? p.value.toLocaleString() : p.value}{unit}</strong>
          </Typography>
        </Box>
      ))}
    </Paper>
  );
}

// ── Main Page ────────────────────────────────────────────────────
export default function MainAdminReportsPage() {
  const [dashData, setDashData] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [communityAdmins, setCommunityAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approvalZoom, setApprovalZoom] = useState(1.0);

  const fetchData = useCallback((isSilent = false) => {
    if (!isSilent) setLoading(true);
    Promise.all([
      getMainDashboard().then(r => r.data),
      MainAdminOpsService.getAllCommunities().catch(() => []),
      MainAdminOpsService.getAllCommunityAdmins().catch(() => []),
    ])
      .then(([dash, comms, admins]) => {
        setDashData(dash);
        setCommunities(Array.isArray(comms) ? comms : comms?.data ?? []);
        setCommunityAdmins(Array.isArray(admins) ? admins : admins?.data ?? []);
      })
      .catch(err => {
        if (!isSilent) setError(err?.response?.data?.message || "Failed to load reports data.");
      })
      .finally(() => {
        if (!isSilent) setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchData(false);
    const interval = setInterval(() => {
      fetchData(true);
    }, 15000); // 15 seconds polling interval
    return () => clearInterval(interval);
  }, [fetchData]);

  // ── Derived Metrics ─────────────────────────────────────────
  const totalActiveComm = useMemo(() => communities.filter(c => c.active !== false).length, [communities]);
  const totalInactiveComm = useMemo(() => communities.filter(c => c.active === false).length, [communities]);
  const totalActiveAdmins = useMemo(() => communityAdmins.filter(a => a.active !== false && a.approvalStatus === "APPROVED").length, [communityAdmins]);

  const avgConsumptionPerCommunity = useMemo(() => {
    if (!dashData?.totalWaterConsumption || !totalActiveComm) return 0;
    return dashData.totalWaterConsumption / totalActiveComm;
  }, [dashData, totalActiveComm]);

  const avgRevenuePerCommunity = useMemo(() => {
    if (!dashData?.totalRevenue || !totalActiveComm) return 0;
    return dashData.totalRevenue / totalActiveComm;
  }, [dashData, totalActiveComm]);

  // ── Monthly consumption chart ─────────────────────────────
  const monthlyChart = useMemo(() => {
    const raw = dashData?.monthlyWaterConsumptionChart ?? [];
    return raw.map(d => ({ ...d, usage: +(d.usage ?? d.value ?? 0).toFixed(2) }));
  }, [dashData]);

  // ── Community growth chart ────────────────────────────────
  const growthChart = useMemo(() => {
    const raw = dashData?.communityGrowth ?? [];
    return raw.map(d => ({ ...d, count: +(d.count ?? d.value ?? 0) }));
  }, [dashData]);

  // ── Per-community consumption table ──────────────────────
  const commTableRows = useMemo(() => {
    if (!communities.length) return [];
    return communities.slice(0, 15).map(c => ({
      name: c.name || c.communityName || "—",
      city: c.city || c.location || "—",
      active: c.active !== false,
      residents: c.totalResidents ?? c.residentCount ?? "—",
    }));
  }, [communities]);

  // ── Community Admin status breakdown for Pie chart ───────
  const adminStatusPie = useMemo(() => {
    const counts = {};
    communityAdmins.forEach(a => {
      const s = a.approvalStatus || "UNKNOWN";
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [communityAdmins]);

  // ── Approval pipeline breakdown for Pie chart ────────────
  const approvalPie = useMemo(() => [
    { name: "Active Admins", value: totalActiveAdmins },
    { name: "Pending", value: dashData?.pendingCommunityAdmins || 0 },
    { name: "Others", value: Math.max(0, (dashData?.totalCommunityAdmins || 0) - totalActiveAdmins - (dashData?.pendingCommunityAdmins || 0)) },
  ].filter(d => d.value > 0), [dashData, totalActiveAdmins]);

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  const handleExportCSV = () => {
    try {
      exportMainAdminReportCSV({ dashData, communities, communityAdmins });
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportPDF = () => {
    try {
      exportMainAdminReportPDF({ dashData, communities, communityAdmins });
    } catch (e) {
      console.error(e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2, md: 3 }, background: PALETTE.bg, minHeight: "100vh" }}>

        {/* ── Page Summary Header ── */}
        <PageSummaryHeader
          title="Reports & Analytics"
          subtitle="Platform overview across all registered communities — consumption, revenue, and administration metrics."
          icon={<AssessmentIcon sx={{ fontSize: 32, color: "primary.main" }} />}
          metadata={[
            { label: "Total Communities", value: dashData?.totalCommunities ?? 0 },
            { label: "Active Admins", value: totalActiveAdmins, color: "success" }
          ]}
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


        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SECTION 1 — Executive Summary KPIs
        ═══════════════════════════════════════════════════════════ */}
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: `1px solid ${PALETTE.border}` }}>
          <SectionTitle>1 — Executive Summary</SectionTitle>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiCard
                label="Total Communities"
                value={(dashData?.totalCommunities ?? 0).toLocaleString()}
                sub={`${totalActiveComm} active · ${totalInactiveComm} inactive`}
                color={PALETTE.primary}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiCard
                label="Total Residents"
                value={(dashData?.totalResidents ?? 0).toLocaleString()}
                sub="Registered across all communities"
                color={PALETTE.teal}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiCard
                label="Total Water Consumption"
                value={formatWaterUsage(dashData?.totalWaterConsumption ?? 0)}
                sub={`Avg ${formatWaterUsage(avgConsumptionPerCommunity)} per community`}
                color={PALETTE.info}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiCard
                label="Total Platform Revenue"
                value={formatCurrency(dashData?.totalRevenue ?? 0)}
                sub={`Avg ${formatCurrency(avgRevenuePerCommunity)} per community`}
                color={PALETTE.success}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2.5 }} />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiCard
                label="Community Admins"
                value={(dashData?.totalCommunityAdmins ?? 0).toLocaleString()}
                sub={`${totalActiveAdmins} active approved admins`}
                color={PALETTE.purple}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiCard
                label="Pending Admin Approvals"
                value={(dashData?.pendingCommunityAdmins ?? 0).toLocaleString()}
                sub="Awaiting MAIN_ADMIN action"
                color={dashData?.pendingCommunityAdmins > 0 ? PALETTE.warning : PALETTE.success}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiCard
                label="Avg Residents / Community"
                value={totalActiveComm > 0 ? Math.round((dashData?.totalResidents ?? 0) / totalActiveComm).toLocaleString() : "—"}
                sub="Active communities only"
                color={PALETTE.teal}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiCard
                label="Avg Revenue / Community"
                value={formatCurrency(avgRevenuePerCommunity)}
                sub="Aggregated billing across all"
                color={PALETTE.successLight}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* ═══════════════════════════════════════════════════════════
            SECTION 2 — Platform Consumption Trend
        ═══════════════════════════════════════════════════════════ */}
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: `1px solid ${PALETTE.border}` }}>
          <SectionTitle>2 — Platform Water Consumption Trend</SectionTitle>
          {monthlyChart.length === 0 ? (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">No monthly consumption data available.</Typography>
            </Box>
          ) : (
            <Box sx={{ width: "100%", height: 300 }}>
              <ResponsiveContainer width="99%" height="100%" debounce={50}>
                <LineChart data={monthlyChart} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <ReTooltip content={<CustomTooltip unit=" kL" />} />
                  <Legend />
                  <Line type="monotone" dataKey="usage" name="Total Usage (kL)" stroke={LINE_COLOR} strokeWidth={2.5} dot={{ r: 4, fill: LINE_COLOR, strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          )}
        </Paper>

        {/* ═══════════════════════════════════════════════════════════
            SECTION 3 — Community Growth + Admin Status
        ═══════════════════════════════════════════════════════════ */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Community Growth Bar Chart */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${PALETTE.border}`, height: "100%" }}>
              <SectionTitle>3a — Community Growth Over Time</SectionTitle>
              {growthChart.length === 0 ? (
                <Box sx={{ py: 4, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">No community growth data available.</Typography>
                </Box>
              ) : (
                <Box sx={{ width: "100%", height: 260 }}>
                  <ResponsiveContainer width="99%" height="100%" debounce={50}>
                    <LineChart data={growthChart} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <ReTooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="count" name="Communities" stroke={BAR_COLOR} strokeWidth={2.5} dot={{ r: 4, fill: BAR_COLOR, strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Admin Approval Status Pie */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${PALETTE.border}`, height: "100%" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 1, mb: 2 }}>
                <SectionTitle>3b — Admin Approval Status</SectionTitle>
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setApprovalZoom(z => Math.max(z - 0.15, 0.5))}
                    sx={{ minWidth: 32, p: 0.5, borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700 }}
                  >
                    −
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setApprovalZoom(1.0)}
                    sx={{ minWidth: 48, p: 0.5, borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700 }}
                  >
                    Reset
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setApprovalZoom(z => Math.min(z + 0.15, 1.5))}
                    sx={{ minWidth: 32, p: 0.5, borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700 }}
                  >
                    +
                  </Button>
                </Box>
              </Box>
              {approvalPie.length === 0 ? (
                <Box sx={{ py: 4, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">No admin data available.</Typography>
                </Box>
              ) : (
                <Box sx={{ width: "100%", height: 260, display: "block" }}>
                  <ResponsiveContainer width="99%" height="100%" debounce={50}>
                    <PieChart>
                      <Pie
                        data={approvalPie}
                        cx="50%" cy="50%"
                        innerRadius={55 * approvalZoom}
                        outerRadius={90 * approvalZoom}
                        dataKey="value"
                        paddingAngle={3}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={true}
                      >
                        {approvalPie.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <ReTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* ═══════════════════════════════════════════════════════════
            SECTION 4 — Platform Health Indicators
        ═══════════════════════════════════════════════════════════ */}
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: `1px solid ${PALETTE.border}` }}>
          <SectionTitle>4 — Platform Health Indicators</SectionTitle>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5, mt: 1 }}>
            {[
              {
                label: "Community Activation Rate",
                value: `${dashData?.totalCommunities ? Math.round((totalActiveComm / dashData.totalCommunities) * 100) : 0}%`,
                progress: dashData?.totalCommunities ? (totalActiveComm / dashData.totalCommunities) * 100 : 0,
                color: PALETTE.success,
                desc: `${totalActiveComm} active of ${dashData?.totalCommunities || 0} total`
              },
              {
                label: "Admin Approval Rate",
                value: `${dashData?.totalCommunityAdmins ? Math.round((totalActiveAdmins / dashData.totalCommunityAdmins) * 100) : 0}%`,
                progress: dashData?.totalCommunityAdmins ? (totalActiveAdmins / dashData.totalCommunityAdmins) * 100 : 0,
                color: PALETTE.primary,
                desc: `${totalActiveAdmins} active approved admins`
              },
              {
                label: "Pending Approval Backlog",
                value: `${dashData?.pendingCommunityAdmins ?? 0} pending`,
                progress: dashData?.totalCommunityAdmins ? Math.min(100, ((dashData?.pendingCommunityAdmins || 0) / dashData.totalCommunityAdmins) * 100) : 0,
                color: dashData?.pendingCommunityAdmins > 0 ? PALETTE.warning : PALETTE.success,
                desc: "Awaiting MAIN_ADMIN action"
              },
              {
                label: "Platform Revenue Utilisation",
                value: formatCurrency(dashData?.totalRevenue ?? 0),
                progress: 100,
                color: PALETTE.teal,
                desc: "Aggregated billing across all"
              }
            ].map((item, idx) => (
              <Box key={idx} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "250px 1fr 120px" }, alignItems: "center", gap: 2 }}>
                <Box>
                  <Typography variant="body2" fontWeight={600} color="text.primary">
                    {item.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.desc}
                  </Typography>
                </Box>
                <Box sx={{ width: "100%" }}>
                  <LinearProgress
                    variant="determinate"
                    value={item.progress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: "rgba(0,0,0,0.06)",
                      "& .MuiLinearProgress-bar": { backgroundColor: item.color, borderRadius: 4 }
                    }}
                  />
                </Box>
                <Box sx={{ textAlign: { xs: "left", md: "right" } }}>
                  <Chip
                    label={item.value}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      bgcolor: `${item.color}15`,
                      color: item.color,
                      border: `1px solid ${item.color}30`
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* ═══════════════════════════════════════════════════════════
            SECTION 5 — Communities Directory Table
        ═══════════════════════════════════════════════════════════ */}
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: `1px solid ${PALETTE.border}` }}>
          <SectionTitle>5 — Communities Directory</SectionTitle>
          {commTableRows.length === 0 ? (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">No community data available.</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ "& th": { fontWeight: 700, fontSize: 12, color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5, py: 1.5, borderBottom: `2px solid ${PALETTE.border}` } }}>
                    <TableCell>#</TableCell>
                    <TableCell>Community</TableCell>
                    <TableCell>City</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Households / Residents</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {commTableRows.map((row, i) => (
                    <TableRow
                      key={i}
                      hover
                      sx={{ "&:last-child td": { border: 0 }, "& td": { fontSize: 13, py: 1.2 } }}
                    >
                      <TableCell sx={{ color: "text.secondary" }}>{i + 1}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{row.name}</TableCell>
                      <TableCell>{row.city}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.active ? "Active" : "Inactive"}
                          size="small"
                          sx={{
                            fontSize: 11, height: 20, fontWeight: 700,
                            background: row.active ? "#E8F5E9" : "#FFF3E0",
                            color: row.active ? PALETTE.success : PALETTE.warning,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">{row.residents}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {communities.length > 15 && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
              Showing top 15 of {communities.length} communities.
            </Typography>
          )}
        </Paper>

        {/* ═══════════════════════════════════════════════════════════
            SECTION 6 — Community Admins Summary Table
        ═══════════════════════════════════════════════════════════ */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${PALETTE.border}` }}>
          <SectionTitle>6 — Community Admins Overview</SectionTitle>
          {communityAdmins.length === 0 ? (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">No admin data available.</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ "& th": { fontWeight: 700, fontSize: 12, color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5, py: 1.5, borderBottom: `2px solid ${PALETTE.border}` } }}>
                    <TableCell>#</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Community</TableCell>
                    <TableCell>Approval Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {communityAdmins.slice(0, 15).map((a, i) => {
                    const status = a.approvalStatus || "UNKNOWN";
                    const colorMap = {
                      APPROVED: { bg: "#E8F5E9", text: PALETTE.success },
                      PENDING: { bg: "#FFF3E0", text: PALETTE.warning },
                      REJECTED: { bg: "#FFEBEE", text: "#C62828" },
                    };
                    const c = colorMap[status] || { bg: "#F5F5F5", text: "text.secondary" };
                    return (
                      <TableRow key={i} hover sx={{ "&:last-child td": { border: 0 }, "& td": { fontSize: 13, py: 1.2 } }}>
                        <TableCell sx={{ color: "text.secondary" }}>{i + 1}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{a.fullName || a.name || "—"}</TableCell>
                        <TableCell sx={{ color: "text.secondary" }}>{a.email || "—"}</TableCell>
                        <TableCell>{a.communityName || a.community?.name || "—"}</TableCell>
                        <TableCell>
                          <Chip
                            label={status}
                            size="small"
                            sx={{ fontSize: 11, height: 20, fontWeight: 700, background: c.bg, color: c.text }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {communityAdmins.length > 15 && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
              Showing top 15 of {communityAdmins.length} admins.
            </Typography>
          )}
        </Paper>

      </Box>
    </DashboardLayout>
  );
}
