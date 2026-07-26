import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Grid, Box, Typography, Chip, Divider, Paper, Button, Stack, Card, CardContent } from "@mui/material";

// Layout
import DashboardLayout from "../../components/layout/DashboardLayout";

// Shared components
import PageHeader from "../../components/common/PageHeader";
import AdminStatCard from "../../components/common/AdminStatCard";
import StatCard from "../../components/widgets/StatCard";
import ChartCard from "../../components/widgets/ChartCard";
import TimelineWidget from "../../components/widgets/TimelineWidget";
import SkeletonCard from "../../components/common/SkeletonCard";
import ErrorState from "../../components/common/ErrorState";

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

// Config and Services
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

// ─── Inline skeleton grid for initial load ───────────────────────────────────
const DashboardSkeleton = () => (
    <Box>
        {/* KPI row skeleton */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
            {[1, 2, 3, 4].map((i) => (
                <Grid item xs={12} sm={6} lg={3} key={i}>
                    <SkeletonCard />
                </Grid>
            ))}
        </Grid>
        {/* Main content skeleton */}
        <Grid container spacing={2.5}>
            <Grid item xs={12} lg={8}>
                <SkeletonCard />
            </Grid>
            <Grid item xs={12} lg={4}>
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

    // ── Derived data ─────────────────────────────────────────────────────────
    const previousMonthUsage = useMemo(() => {
        if (usageHistory.length > 1) return usageHistory[1].unitsConsumed;
        return 0;
    }, [usageHistory]);

    const chartData = useMemo(() => {
        return [...usageHistory]
            .sort((a, b) => new Date(a.readingDate) - new Date(b.readingDate))
            .map((u) => ({
                name: new Date(u.readingDate).toLocaleString("default", { month: "short" }),
                value: u.unitsConsumed,
            }));
    }, [usageHistory]);


    const activeAlerts = useMemo(() => {
        return alerts.filter(a => a.status !== "RESOLVED");
    }, [alerts]);

    // ── Header metadata ───────────────────────────────────────────────────────
    const welcomeTitle = `Welcome back, ${dashboard?.fullName || user?.firstName || "Resident"}`;
    const locationSubtitle = [
        dashboard?.communityName,
        [dashboard?.blockName, dashboard?.unitNumber].filter(Boolean).join(" "),
    ]
        .filter(Boolean)
        .join(" · ");

    // ── Error (full page) ─────────────────────────────────────────────────────
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
                    {/* Section 1 — KPI Cards */}
                    <Grid container spacing={2.5} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={6} lg={3}>
                            <AdminStatCard
                                title="Current Month Usage"
                                value={formatWaterUsage(dashboard?.currentMonthWaterUsage || 0)}
                                icon={<WaterDropIcon />}
                                iconColor="info.main"
                                onClick={() => navigate("/user/usage")}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <AdminStatCard
                                title="Estimated Bill"
                                value={formatCurrency(dashboard?.currentBill || 0)}
                                icon={<ReceiptIcon />}
                                iconColor="warning.main"
                                onClick={() => navigate("/user/bills")}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <AdminStatCard
                                title="Meter Status"
                                value={dashboard?.meterStatus || "Unknown"}
                                icon={<SpeedIcon />}
                                iconColor={
                                    dashboard?.meterStatus === "ACTIVE"
                                        ? "success.main"
                                        : "error.main"
                                }
                                onClick={() => navigate("/user/meter")}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <AdminStatCard
                                title="Previous Month Usage"
                                value={formatWaterUsage(previousMonthUsage)}
                                icon={<HistoryIcon />}
                                iconColor="primary.main"
                                onClick={() => navigate("/user/usage")}
                            />
                        </Grid>
                    </Grid>

                    {/* Section 2 — Resident Alert Center */}
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
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
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
                                            {/* Header row: Severity, Status, Title, Timestamp */}
                                            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} flexWrap="wrap">
                                                <Stack direction="row" alignItems="center" spacing={1.5}>
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

                                            {/* Message body: wraps naturally */}
                                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                                {alert.message}
                                            </Typography>

                                            {/* Action buttons footer: aligned identically on right */}
                                            <Stack direction="row" spacing={1.5} justifyContent="flex-end" alignItems="center">
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
                                                    sx={{ px: 2, py: 0.5, fontSize: "0.75rem", fontWeight: 600, textTransform: "none", color: "text.secondary" }}
                                                >
                                                    Dismiss Alert
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </Paper>
                                ))}
                            </Stack>
                        )}
                    </Paper>

                    {/* Section 3 — Chart + Activity feed */}
                    <Grid container spacing={2.5} sx={{ mb: 0 }}>
                        <Grid item xs={12} lg={8}>
                            <ChartCard
                                title="Monthly Water Consumption"
                                data={chartData}
                                type={CHART_CONFIG.WATER_CONSUMPTION.type}
                                color={CHART_CONFIG.WATER_CONSUMPTION.color}
                            />
                        </Grid>

                        <Grid item xs={12} lg={4}>
                            <TimelineWidget
                                title="Recent Activities"
                                activities={dashboard?.recentActivities || []}
                            />
                        </Grid>
                    </Grid>


                </>
            )}
        </DashboardLayout>
    );
}

export default UserDashboard;