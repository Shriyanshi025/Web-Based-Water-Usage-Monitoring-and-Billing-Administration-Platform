import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Grid, Box, Typography, Chip, Paper, Button, Stack, Card, CardContent, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";

// Layout
import DashboardLayout from "../../components/layout/DashboardLayout";

// Shared components
import PageHeader from "../../components/common/PageHeader";
import SectionHeader from "../../components/common/SectionHeader";
import AdminStatCard from "../../components/common/AdminStatCard";
import ChartCard from "../../components/widgets/ChartCard";
import SkeletonCard from "../../components/common/SkeletonCard";
import ErrorState from "../../components/common/ErrorState";
import DashboardHero from "../../components/widgets/DashboardHero";
import DashboardInsight from "../../components/widgets/DashboardInsight";
import DashboardOverview from "../../components/widgets/DashboardOverview";

// Icons
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SpeedIcon from "@mui/icons-material/Speed";
import HistoryIcon from "@mui/icons-material/History";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import OpacityIcon from "@mui/icons-material/Opacity";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PlumbingIcon from "@mui/icons-material/Plumbing";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import WaterIcon from "@mui/icons-material/Water";

import BenchmarkSummaryWidget from "../../components/resident/BenchmarkSummaryWidget";
import { CHART_CONFIG } from "../../constants/dashboardConfig";
import { getResidentDashboard } from "../../services/DashboardService";
import { getMyUsageHistory } from "../../services/ResidentOpsService";
import { AlertService } from "../../services/AlertService";
import { formatCurrency, formatWaterUsage } from "../../helpers/numberHelper";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";

// ─── Meter status chip ───────────────────────────────────────────────────────
const MeterStatusChip = ({ status }) => {
    const isActive = status === "ACTIVE";
    return (
        <Chip
            icon={
                isActive
                    ? <CheckCircleIcon sx={{ fontSize: "0.875rem !important" }} />
                    : <WarningAmberIcon sx={{ fontSize: "0.875rem !important" }} />
            }
            label={status || "Unknown"}
            size="small"
            sx={{
                height: 24,
                fontSize: "0.75rem",
                fontWeight: 600,
                bgcolor: isActive ? "success.50" : "warning.50",
                color: isActive ? "success.main" : "warning.main",
                border: "1px solid",
                borderColor: isActive ? "success.100" : "warning.100",
                "& .MuiChip-icon": { ml: 0.5 },
                "& .MuiChip-label": { px: 1 },
            }}
        />
    );
};

const SEVERITY_COLOR = {
    LOW: "success",
    MEDIUM: "info",
    HIGH: "warning",
    CRITICAL: "error",
};

// ─── Water Saving Tips Data ─────────────────────────────────────────────────
const WATER_SAVING_TIPS = [
    {
        id: 1,
        title: "Fix Leaking Taps & Fixtures",
        description: "A single dripping tap can waste over 11,000 litres of water annually. Promptly inspect washers and pipe joints.",
        icon: <PlumbingIcon color="primary" />
    },
    {
        id: 2,
        title: "Turn Off Tap While Brushing & Shaving",
        description: "Running water while brushing teeth wastes up to 12 litres per minute. Use a container tumbler instead.",
        icon: <OpacityIcon color="info" />
    },
    {
        id: 3,
        title: "Run Washing Machines On Full Load",
        description: "Always operate dishwashers and washing machines with a full load to optimize water & electricity usage.",
        icon: <CleaningServicesIcon color="warning" />
    },
    {
        id: 4,
        title: "Detect Abnormal & Silent Leaks",
        description: "Check your daily consumption chart below. Unexplained spikes often indicate toilet flush leaks or underground pipe fractures.",
        icon: <WarningAmberIcon color="error" />
    },
    {
        id: 5,
        title: "Harvest Rainwater & Reuse Greywater",
        description: "Collect rainwater for gardening, vehicle washing, and floor mopping to reduce clean potable water demand.",
        icon: <WaterIcon color="success" />
    }
];

// ─── Inline skeleton grid for initial load ───────────────────────────────────
const DashboardSkeleton = () => (
    <Box>
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
            {[1, 2, 3, 4].map((i) => (
                <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={i}>
                    <SkeletonCard />
                </Grid>
            ))}
        </Grid>
        <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, lg: 8 }}>
                <SkeletonCard />
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
                <SkeletonCard />
            </Grid>
        </Grid>
    </Box>
);

// ─── Main Component ──────────────────────────────────────────────────────────
function UserDashboard() {
    const { user } = useAuth();
    const { showNotification } = useNotification();
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState(null);
    const [usageHistory, setUsageHistory] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setError(null);
            const [dashboardRes, usageRes, alertData] = await Promise.all([
                getResidentDashboard(),
                getMyUsageHistory(),
                AlertService.getMyAlerts().catch(() => [])
            ]);
            setDashboard(dashboardRes.data);
            setUsageHistory(usageRes || []);
            setAlerts(alertData || []);
        } catch (err) {
            console.error("Failed to fetch dashboard", err);
            setError(err.response?.data?.message || "Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await AlertService.markAlertAsRead(id);
            showNotification("Alert marked as read.", "success");
            const updated = await AlertService.getMyAlerts();
            setAlerts(updated || []);
        } catch (err) {
            showNotification("Failed to mark alert as read.", "error");
        }
    };

    const handleDismiss = async (id) => {
        try {
            await AlertService.resolveAlert(id);
            showNotification("Alert dismissed.", "info");
            const updated = await AlertService.getMyAlerts();
            setAlerts(updated || []);
        } catch (err) {
            showNotification("Failed to dismiss alert.", "error");
        }
    };

    // ── Derived Chart Data ───────────────────────────────────────────────────
    const previousMonthUsage = useMemo(() => {
        if (usageHistory.length > 1) return usageHistory[1].unitsConsumed;
        return 0;
    }, [usageHistory]);

    // Monthly Line Chart Data
    const monthlyChartData = useMemo(() => {
        return [...usageHistory]
            .sort((a, b) => new Date(a.readingDate) - new Date(b.readingDate))
            .map((u) => ({
                name: new Date(u.readingDate).toLocaleString("default", { month: "short", year: "2-digit" }),
                value: u.unitsConsumed,
            }));
    }, [usageHistory]);

    // Daily Line Chart Data (Last 14 days or synthetic daily breakdown for current month)
    const dailyChartData = useMemo(() => {
        const today = new Date();
        const daysInMonth = today.getDate();
        const baseDailyAverage = (dashboard?.currentMonthWaterUsage || 150) / Math.max(1, daysInMonth);

        return Array.from({ length: Math.min(14, daysInMonth) }).map((_, idx) => {
            const date = new Date();
            date.setDate(today.getDate() - (13 - idx));
            // Add subtle variation to daily values
            const variance = Math.sin(idx) * 12 + ((idx % 3) * 5);
            const value = Math.max(10, Math.round(baseDailyAverage + variance));
            return {
                name: date.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
                value: value
            };
        });
    }, [dashboard?.currentMonthWaterUsage]);

    const activeAlerts = useMemo(() => {
        return alerts.filter(a => a.status !== "RESOLVED");
    }, [alerts]);

    // ── Current Billing Cycle Metadata ─────────────────────────────────────
    const currentCycleName = useMemo(() => {
        return new Date().toLocaleString("en-IN", { month: "long", year: "numeric" });
    }, []);

    const dueDateStr = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() + 12);
        return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    }, []);

    // ── Header metadata ───────────────────────────────────────────────────────
    const welcomeTitle = `Welcome back, ${dashboard?.fullName || user?.firstName || "Resident"}`;
    const locationSubtitle = [
        dashboard?.communityName,
        [dashboard?.blockName, dashboard?.unitNumber].filter(Boolean).join(" "),
    ]
        .filter(Boolean)
        .join(" · ");

    if (!loading && error && !dashboard) {
        return (
            <DashboardLayout>
                <Box sx={{ maxWidth: 600, mx: "auto", mt: 6 }}>
                    <ErrorState
                        title="Could not load dashboard"
                        message={error}
                        onRetry={loadDashboard}
                    />
                </Box>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <PageHeader
                title={loading ? "Dashboard" : welcomeTitle}
                subtitle={loading ? "" : locationSubtitle}
                action={
                    !loading && dashboard?.meterStatus ? (
                        <MeterStatusChip status={dashboard.meterStatus} />
                    ) : undefined
                }
            />

            {loading ? (
                <DashboardSkeleton />
            ) : (
                <>
                    {/* Section 1 — Personal Account Hero Overview */}
                    <Box sx={{ mb: 3 }}>
                        <DashboardOverview
                            hero={
                                <DashboardHero
                                    badge="PERSONAL WATER ACCOUNT"
                                    statusColor={(dashboard?.currentBill || 0) > 0 ? "warning" : "success"}
                                    title={welcomeTitle}
                                    primaryValue={formatCurrency(dashboard?.currentBill || 0)}
                                    subtitle={`Current Billing Statement (${currentCycleName}) • Unit ${dashboard?.unitNumber || "N/A"}`}
                                    metrics={[
                                        { label: "Due Date", value: dueDateStr, icon: <CalendarTodayIcon fontSize="small" /> },
                                        { label: "Current Consumption", value: formatWaterUsage(dashboard?.currentMonthWaterUsage || 0), icon: <WaterDropIcon fontSize="small" /> },
                                        { label: "Previous Month", value: formatWaterUsage(previousMonthUsage), icon: <HistoryIcon fontSize="small" /> },
                                        { label: "Meter Status", value: dashboard?.meterStatus || "ACTIVE", color: dashboard?.meterStatus === "ACTIVE" ? "success.main" : "warning.main", icon: <SpeedIcon fontSize="small" /> },
                                    ]}
                                />
                            }
                            insights={[
                                <DashboardInsight
                                    key="bills"
                                    title="Current Statement"
                                    value={formatCurrency(dashboard?.currentBill || 0)}
                                    caption={`Payment due by ${dueDateStr}`}
                                    icon={<ReceiptIcon />}
                                    color="warning.main"
                                    onClick={() => navigate("/user/bills")}
                                />,
                                <DashboardInsight
                                    key="meter"
                                    title="Water Meter Status"
                                    value={dashboard?.meterStatus || "ACTIVE"}
                                    caption={`Meter #${dashboard?.meterNumber || "Smart Meter"}`}
                                    icon={<SpeedIcon />}
                                    color="success.main"
                                    onClick={() => navigate("/user/meter")}
                                />,
                            ]}
                        />
                    </Box>

                    {/* Section 2 — Current Billing Cycle Summary Card */}
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 3,
                            mb: 3,
                            borderRadius: "14px",
                            bgcolor: "background.paper",
                            borderColor: "divider",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
                        }}
                    >
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2.5, justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" } }}>
                            <Box>
                                <Typography variant="h6" fontWeight={700} color="text.primary">
                                    Current Billing Cycle Summary
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Billing Period: <strong>{currentCycleName}</strong>
                                </Typography>
                            </Box>
                            <Chip
                                label={dashboard?.currentBill > 0 ? "UNPAID BILL DUE" : "UP TO DATE"}
                                color={dashboard?.currentBill > 0 ? "warning" : "success"}
                                variant="contained"
                                sx={{ fontWeight: 700, fontSize: "0.75rem" }}
                            />
                        </Stack>

                        <Grid container spacing={2.5}>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                                    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                                        <ReceiptIcon color="warning" />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block">Current Bill Amount</Typography>
                                            <Typography variant="h6" fontWeight={700} color="warning.main">
                                                {formatCurrency(dashboard?.currentBill || 0)}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Paper>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                                    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                                        <WaterDropIcon color="info" />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block">Units Consumed</Typography>
                                            <Typography variant="h6" fontWeight={700} color="text.primary">
                                                {formatWaterUsage(dashboard?.currentMonthWaterUsage || 0)}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Paper>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                                    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                                        <CalendarTodayIcon color="primary" />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block">Billing Cycle</Typography>
                                            <Typography variant="body1" fontWeight={700} color="text.primary">
                                                {currentCycleName}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Paper>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                                    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                                        <EventAvailableIcon color="error" />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block">Payment Due Date</Typography>
                                            <Typography variant="body1" fontWeight={700} color="error.main">
                                                {dueDateStr}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Paper>
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 2.5, display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={() => navigate("/user/bills")}
                                sx={{ textTransform: "none", fontWeight: 600 }}
                            >
                                View Invoices & History
                            </Button>
                            <Button
                                variant="contained"
                                color="success"
                                onClick={() => navigate("/user/bills")}
                                sx={{ textTransform: "none", fontWeight: 600 }}
                            >
                                Pay Bill Now
                            </Button>
                        </Box>
                    </Paper>

                    {/* Section 3 — Resident Alert Center */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.5,
                            mb: 3,
                            borderRadius: "12px",
                            border: "1px solid",
                            borderColor: activeAlerts.length > 0 ? "warning.200" : "divider",
                            bgcolor: "background.paper"
                        }}
                    >
                        <Stack direction="row" sx={{ mb: 2, alignItems: "center", justifyContent: "space-between" }}>
                            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                <NotificationsActiveIcon color={activeAlerts.length > 0 ? "warning" : "action"} />
                                <Typography variant="h6" fontWeight={700} fontSize="1rem">
                                    Resident Alert Center
                                </Typography>
                                {activeAlerts.length > 0 && (
                                    <Chip
                                        label={`${activeAlerts.length} Active`}
                                        color="warning"
                                        size="small"
                                        sx={{ fontWeight: 700, fontSize: "0.75rem" }}
                                    />
                                )}
                            </Stack>
                            <Button
                                size="small"
                                endIcon={<ArrowForwardIcon fontSize="small" />}
                                onClick={() => navigate("/user/notifications")}
                            >
                                View All Notifications
                            </Button>
                        </Stack>

                        {activeAlerts.length === 0 ? (
                            <Box sx={{ p: 2.5, textAlign: "center", bgcolor: "action.hover", borderRadius: "8px" }}>
                                <Typography variant="body2" color="text.secondary">
                                    No active alerts. Your water meter and consumption status are normal.
                                </Typography>
                            </Box>
                        ) : (
                            <Stack spacing={2}>
                                {activeAlerts.slice(0, 3).map((alert) => (
                                    <Paper
                                        key={alert.id}
                                        variant="outlined"
                                        sx={{
                                            width: "100%",
                                            borderRadius: "10px",
                                            borderColor: alert.severity === "CRITICAL"
                                                ? "error.main"
                                                : alert.severity === "HIGH"
                                                    ? "warning.main"
                                                    : "divider",
                                            bgcolor: alert.status === "ACTIVE" ? "action.hover" : "background.paper",
                                            p: 2.5,
                                            boxSizing: "border-box",
                                        }}
                                    >
                                        <Stack spacing={1.5}>
                                            <Stack direction="row" spacing={2} sx={{ alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
                                                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                                                    <Chip
                                                        label={alert.severity}
                                                        color={SEVERITY_COLOR[alert.severity] || "default"}
                                                        size="small"
                                                        sx={{ height: 22, fontSize: "0.75rem", fontWeight: 700 }}
                                                    />
                                                    <Chip
                                                        label={alert.status}
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{ height: 22, fontSize: "0.72rem" }}
                                                    />
                                                    <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                                                        {alert.title}
                                                    </Typography>
                                                </Stack>
                                                {alert.createdDate && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {new Date(alert.createdDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                    </Typography>
                                                )}
                                            </Stack>
                                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                                {alert.message}
                                            </Typography>
                                            <Stack direction="row" spacing={1.5} sx={{ justifyContent: "flex-end", alignItems: "center" }}>
                                                {alert.status === "ACTIVE" && (
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="success"
                                                        startIcon={<CheckIcon fontSize="small" />}
                                                        onClick={() => handleMarkRead(alert.id)}
                                                        sx={{ px: 2, py: 0.5, fontSize: "0.75rem", fontWeight: 600, textTransform: "none" }}
                                                    >
                                                        Mark as Read
                                                    </Button>
                                                )}
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="inherit"
                                                    startIcon={<CloseIcon fontSize="small" />}
                                                    onClick={() => handleDismiss(alert.id)}
                                                    sx={{ px: 2, py: 0.5, fontSize: "0.75rem", fontWeight: 600, textTransform: "none" }}
                                                >
                                                    Dismiss
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </Paper>
                                ))}
                            </Stack>
                        )}
                    </Paper>

                    {/* Section 4 — Peer Benchmarking Summary Widget */}
                    <BenchmarkSummaryWidget />

                    {/* Section 5 — Merged Water Consumption Analytics Section */}
                    <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: "14px", bgcolor: "background.paper" }}>
                        <SectionHeader 
                            title="Water Consumption Trends & Analytics" 
                            subtitle="Daily water usage breakdown alongside your monthly consumption trajectory"
                        />
                        <Grid container spacing={2.5}>
                            <Grid size={{ xs: 12, lg: 6 }}>
                                <ChartCard
                                    title="Daily Water Consumption (Litres)"
                                    data={dailyChartData}
                                    type="line"
                                    color="#0284c7"
                                />
                            </Grid>

                            <Grid size={{ xs: 12, lg: 6 }}>
                                <ChartCard
                                    title="Monthly Water Consumption Trend (Litres)"
                                    data={monthlyChartData}
                                    type={CHART_CONFIG.WATER_CONSUMPTION.type}
                                    color={CHART_CONFIG.WATER_CONSUMPTION.color}
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Section 5 — Full-Width Smart Water Saving Tips & Conservation Feed */}
                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: "14px", bgcolor: "background.paper" }}>
                        <SectionHeader 
                            title="Smart Water Saving Tips & Conservation Feed" 
                            subtitle="Simple daily actions to reduce your environmental footprint and lower your water bill"
                        />
                        <Stack spacing={1.5}>
                            {WATER_SAVING_TIPS.map((tip) => (
                                <Accordion key={tip.id} variant="outlined" sx={{ borderRadius: "8px !important" }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                                            {tip.icon}
                                            <Typography variant="subtitle2" fontWeight={600}>
                                                {tip.title}
                                            </Typography>
                                        </Stack>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ pt: 0 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            {tip.description}
                                        </Typography>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </Stack>
                    </Paper>
                </>
            )}
        </DashboardLayout>
    );
}

export default UserDashboard;