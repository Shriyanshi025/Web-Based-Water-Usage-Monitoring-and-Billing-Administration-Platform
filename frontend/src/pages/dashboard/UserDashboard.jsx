import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Grid, Box, Typography, Chip, Divider } from "@mui/material";

// Layout
import DashboardLayout from "../../components/layout/DashboardLayout";

// Shared components
import PageHeader from "../../components/common/PageHeader";
import SectionHeader from "../../components/common/SectionHeader";
import StatCard from "../../components/widgets/StatCard";
import ChartCard from "../../components/widgets/ChartCard";
import TimelineWidget from "../../components/widgets/TimelineWidget";
import QuickActionCard from "../../components/widgets/QuickActionCard";
import SkeletonCard from "../../components/common/SkeletonCard";
import ErrorState from "../../components/common/ErrorState";

// Icons
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SpeedIcon from "@mui/icons-material/Speed";
import HistoryIcon from "@mui/icons-material/History";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

// Config and Services
import { QUICK_ACTIONS_CONFIG, CHART_CONFIG } from "../../constants/dashboardConfig";
import { getResidentDashboard } from "../../services/DashboardService";
import { getMyUsageHistory } from "../../services/ResidentOpsService";
import { formatCurrency, formatWaterUsage } from "../../helpers/numberHelper";
import { useAuth } from "../../context/AuthContext";

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
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState(null);
    const [usageHistory, setUsageHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setError(null);
            const [dashboardRes, usageRes] = await Promise.all([
                getResidentDashboard(),
                getMyUsageHistory(),
            ]);
            setDashboard(dashboardRes.data);
            setUsageHistory(usageRes || []);
        } catch (err) {
            console.error("Failed to fetch dashboard", err);
            setError(err.response?.data?.message || "Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    // ── Derived data (same logic as before) ──────────────────────────────────
    const previousMonthUsage = useMemo(() => {
        if (usageHistory.length > 1) return usageHistory[1].unitsConsumed;
        return 0;
    }, [usageHistory]);

    const chartData = useMemo(() => {
        return usageHistory
            .map((u) => ({
                name: new Date(u.readingDate).toLocaleString("default", { month: "short" }),
                value: u.unitsConsumed,
            }))
            .reverse();
    }, [usageHistory]);

    const visibleQuickActions = useMemo(
        () => QUICK_ACTIONS_CONFIG.USER.filter((a) => !a.hidden),
        []
    );

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
            {/* ─────────────────────────────────────────────────────────────── */}
            {/* Page Header                                                     */}
            {/* ─────────────────────────────────────────────────────────────── */}
            <PageHeader
                title={loading ? "Dashboard" : welcomeTitle}
                subtitle={loading ? "" : locationSubtitle}
                action={
                    !loading && dashboard?.meterStatus ? (
                        <MeterStatusChip status={dashboard.meterStatus} />
                    ) : undefined
                }
            />

            {/* ─────────────────────────────────────────────────────────────── */}
            {/* Loading skeleton                                                */}
            {/* ─────────────────────────────────────────────────────────────── */}
            {loading ? (
                <DashboardSkeleton />
            ) : (
                <>
                    {/* ─────────────────────────────────────────────────────── */}
                    {/* Section 1 — KPI Cards                                   */}
                    {/* ─────────────────────────────────────────────────────── */}
                    <Grid container spacing={2.5} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={6} lg={3}>
                            <StatCard
                                title="Current Month Usage"
                                value={dashboard?.currentMonthWaterUsage || 0}
                                formatValue={formatWaterUsage}
                                icon={<WaterDropIcon />}
                                color="info.main"
                                onClick={() => navigate("/user/usage")}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <StatCard
                                title="Estimated Bill"
                                value={dashboard?.currentBill || 0}
                                formatValue={formatCurrency}
                                icon={<ReceiptIcon />}
                                color="warning.main"
                                onClick={() => navigate("/user/bills")}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <StatCard
                                title="Meter Status"
                                value={dashboard?.meterStatus || "Unknown"}
                                icon={<SpeedIcon />}
                                color={
                                    dashboard?.meterStatus === "ACTIVE"
                                        ? "success.main"
                                        : "error.main"
                                }
                                onClick={() => navigate("/user/meter")}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <StatCard
                                title="Previous Month Usage"
                                value={previousMonthUsage}
                                formatValue={formatWaterUsage}
                                icon={<HistoryIcon />}
                                color="primary.main"
                                onClick={() => navigate("/user/usage")}
                            />
                        </Grid>
                    </Grid>

                    {/* ─────────────────────────────────────────────────────── */}
                    {/* Section 2 — Chart + Activity feed                       */}
                    {/* ─────────────────────────────────────────────────────── */}
                    <Grid container spacing={2.5} sx={{ mb: 3 }}>
                        {/* Consumption chart — 2/3 width on desktop */}
                        <Grid item xs={12} lg={8}>
                            <ChartCard
                                title="Monthly Water Consumption"
                                data={chartData}
                                type={CHART_CONFIG.WATER_CONSUMPTION.type}
                                color={CHART_CONFIG.WATER_CONSUMPTION.color}
                            />
                        </Grid>

                        {/* Recent activity — 1/3 width on desktop */}
                        <Grid item xs={12} lg={4}>
                            <TimelineWidget
                                title="Recent Activities"
                                activities={dashboard?.recentActivities || []}
                            />
                        </Grid>
                    </Grid>

                    {/* ─────────────────────────────────────────────────────── */}
                    {/* Section 3 — Quick Actions                               */}
                    {/* ─────────────────────────────────────────────────────── */}
                    <Box>
                        <SectionHeader title="Quick Actions" />
                        <Grid container spacing={2.5}>
                            {visibleQuickActions.map((action) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={action.id}>
                                    <QuickActionCard
                                        title={action.title}
                                        description={action.description}
                                        icon={action.icon}
                                        color={action.color}
                                        comingSoon={action.comingSoon}
                                        disabled={action.disabled}
                                        onClick={() => navigate(action.path)}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </>
            )}
        </DashboardLayout>
    );
}

export default UserDashboard;