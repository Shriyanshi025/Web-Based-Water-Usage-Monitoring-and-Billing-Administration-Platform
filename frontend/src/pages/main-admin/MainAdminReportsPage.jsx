import { useEffect, useState, useMemo } from "react";
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
  primary: "#1565C0",
  primaryLight: "#42A5F5",
  success: "#2E7D32",
  successLight: "#66BB6A",
  warning: "#E65100",
  warningLight: "#FFA726",
  info: "#0277BD",
  infoLight: "#29B6F6",
  purple: "#6A1B9A",
  purpleLight: "#CE93D8",
  teal: "#00695C",
  tealLight: "#4DB6AC",
  bg: "#F0F4F8",
  cardBg: "#FFFFFF",
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

  useEffect(() => {
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
      .catch(err => setError(err?.response?.data?.message || "Failed to load reports data."))
      .finally(() => setLoading(false));
  }, []);

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
      households: c.totalHouseholds ?? c.householdCount ?? "—",
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

        {/* ── Page Header ─────────────────────────────────────── */}
        <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={800} color="text.primary" gutterBottom>
              System-Wide Reports & Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Platform overview across all registered communities — consumption, revenue, and administration metrics.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
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
        </Box>

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
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <ReTooltip content={<CustomTooltip unit=" kL" />} />
                  <Legend />
                  <Line type="monotone" dataKey="usage" name="Total Usage (kL)" stroke={LINE_COLOR} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
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
                    <BarChart data={growthChart} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <ReTooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" name="Communities" fill={BAR_COLOR} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Admin Approval Status Pie */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${PALETTE.border}`, height: "100%" }}>
              <SectionTitle>3b — Admin Approval Status</SectionTitle>
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
                        innerRadius={55} outerRadius={90}
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
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">Community Activation Rate</Typography>
                  <Typography variant="caption" fontWeight={700} color={PALETTE.success}>
                    {dashData?.totalCommunities ? Math.round((totalActiveComm / dashData.totalCommunities) * 100) : 0}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={dashData?.totalCommunities ? (totalActiveComm / dashData.totalCommunities) * 100 : 0}
                  sx={{ height: 8, borderRadius: 4, backgroundColor: "rgba(0,0,0,0.08)", "& .MuiLinearProgress-bar": { backgroundColor: PALETTE.success, borderRadius: 4 } }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">Admin Approval Rate</Typography>
                  <Typography variant="caption" fontWeight={700} color={PALETTE.primary}>
                    {dashData?.totalCommunityAdmins ? Math.round((totalActiveAdmins / dashData.totalCommunityAdmins) * 100) : 0}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={dashData?.totalCommunityAdmins ? (totalActiveAdmins / dashData.totalCommunityAdmins) * 100 : 0}
                  sx={{ height: 8, borderRadius: 4, backgroundColor: "rgba(0,0,0,0.08)", "& .MuiLinearProgress-bar": { backgroundColor: PALETTE.primary, borderRadius: 4 } }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">Pending Approval Backlog</Typography>
                  <Typography variant="caption" fontWeight={700} color={dashData?.pendingCommunityAdmins > 0 ? PALETTE.warning : PALETTE.success}>
                    {dashData?.pendingCommunityAdmins ?? 0} pending
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={dashData?.totalCommunityAdmins ? Math.min(100, ((dashData?.pendingCommunityAdmins || 0) / dashData.totalCommunityAdmins) * 100) : 0}
                  sx={{ height: 8, borderRadius: 4, backgroundColor: "rgba(0,0,0,0.08)", "& .MuiLinearProgress-bar": { backgroundColor: PALETTE.warning, borderRadius: 4 } }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">Platform Revenue Utilisation</Typography>
                  <Typography variant="caption" fontWeight={700} color={PALETTE.teal}>
                    {formatCurrency(dashData?.totalRevenue ?? 0)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={100}
                  sx={{ height: 8, borderRadius: 4, backgroundColor: "rgba(0,0,0,0.08)", "& .MuiLinearProgress-bar": { backgroundColor: PALETTE.teal, borderRadius: 4 } }}
                />
              </Box>
            </Grid>
          </Grid>
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
                    <TableCell align="right">Households</TableCell>
                    <TableCell align="right">Residents</TableCell>
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
                      <TableCell align="right">{row.households}</TableCell>
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
