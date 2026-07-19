import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Grid, Typography, Chip, Stack, Button, Divider, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";

// Layout
import DashboardLayout from "../../components/layout/DashboardLayout";

// Common components
import PageHeader from "../../components/common/PageHeader";
import SectionHeader from "../../components/common/SectionHeader";
import ActionButton from "../../components/common/ActionButton";
import ErrorState from "../../components/common/ErrorState";
import DataGrid from "../../components/common/DataGrid";

// Widget components
import StatCard from "../../components/widgets/StatCard";
import ChartCard from "../../components/widgets/ChartCard";
import TimelineWidget from "../../components/widgets/TimelineWidget";
import WidgetContainer from "../../components/widgets/WidgetContainer";
import QuickActionCard from "../../components/widgets/QuickActionCard";

// Icons — KPIs
import PeopleIcon from "@mui/icons-material/People";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import SpeedIcon from "@mui/icons-material/Speed";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import ReceiptIcon from "@mui/icons-material/Receipt";

// Icons — UI
import RefreshIcon from "@mui/icons-material/Refresh";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import HowToRegIcon from "@mui/icons-material/HowToReg";

// Config and Services
import { QUICK_ACTIONS_CONFIG, DATAGRID_COLUMNS } from "../../constants/dashboardConfig";
import { getCommunityAdminDashboard } from "../../services/DashboardService";
import { formatCurrency, formatWaterUsage } from "../../helpers/numberHelper";
import { useAuth } from "../../context/AuthContext";

// ─── Status Summary Bar ───────────────────────────────────────────────────────
const StatusSummaryBar = ({ dashboard, loading }) => {
    const theme = useTheme();

    const meterUtilization =
        dashboard?.totalWaterMeters > 0
            ? Math.round((dashboard.activeWaterMeters / dashboard.totalWaterMeters) * 100)
            : 0;

    const pendingCount = dashboard?.pendingResidents || 0;
    const pendingUrgent = pendingCount > 5;

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1.5,
                mb: 3,
                px: 2,
                py: 1.25,
                bgcolor: "background.paper",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "0 1px 3px rgba(12,25,41,0.06)",
            }}
        >
            {/* System status indicator */}
            <Stack direction="row" alignItems="center" spacing={0.75}>
                <Box
                    sx={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        bgcolor: loading ? "warning.main" : "success.main",
                        boxShadow: loading
                            ? `0 0 0 3px ${alpha(theme.palette.warning.main, 0.18)}`
                            : `0 0 0 3px ${alpha(theme.palette.success.main, 0.18)}`,
                    }}
                />
                <Typography
                    sx={{ fontSize: "0.75rem", fontWeight: 600, color: loading ? "warning.main" : "success.main" }}
                >
                    {loading ? "Loading" : "System Operational"}
                </Typography>
            </Stack>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            {/* Meter utilization */}
            {!loading && dashboard && (
                <Stack direction="row" alignItems="center" spacing={0.75}>
                    <SpeedIcon sx={{ fontSize: "0.875rem", color: "text.secondary" }} />
                    <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", fontWeight: 500 }}>
                        Meter Utilization:{" "}
                        <Typography component="span" sx={{ fontWeight: 700, color: "text.primary", fontSize: "0.75rem" }}>
                            {meterUtilization}%
                        </Typography>
                    </Typography>
                </Stack>
            )}

            {!loading && dashboard && <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />}

            {/* Pending approvals alert */}
            {!loading && dashboard && (
                <Stack direction="row" alignItems="center" spacing={0.75}>
                    <PendingActionsIcon
                        sx={{ fontSize: "0.875rem", color: pendingUrgent ? "warning.main" : "text.secondary" }}
                    />
                    <Typography
                        sx={{
                            fontSize: "0.75rem",
                            color: pendingUrgent ? "warning.main" : "text.secondary",
                            fontWeight: 500,
                        }}
                    >
                        {pendingCount > 0 ? (
                            <>
                                <Typography
                                    component="span"
                                    sx={{
                                        fontWeight: 700,
                                        color: pendingUrgent ? "warning.main" : "text.primary",
                                        fontSize: "0.75rem",
                                    }}
                                >
                                    {pendingCount}
                                </Typography>{" "}
                                pending approval{pendingCount !== 1 ? "s" : ""}
                            </>
                        ) : (
                            "All approvals cleared"
                        )}
                    </Typography>
                </Stack>
            )}

            {/* Push community name to right */}
            <Box sx={{ flexGrow: 1 }} />

            {!loading && dashboard?.communityName && (
                <Chip
                    label={dashboard.communityName}
                    size="small"
                    sx={{
                        height: 22,
                        fontSize: "0.6875rem",
                        fontWeight: 600,
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        color: "primary.main",
                        border: "1px solid",
                        borderColor: alpha(theme.palette.primary.main, 0.18),
                        "& .MuiChip-label": { px: 1 },
                    }}
                />
            )}
        </Box>
    );
};

// ─── KPI Card row skeleton ─────────────────────────────────────────────────────
const KPI_SKELETON_COUNT = 6;

// ─── Main Dashboard Component ─────────────────────────────────────────────────
function CommunityDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadDashboard = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getCommunityAdminDashboard();
            setDashboard(response.data);
        } catch (err) {
            console.error("Failed to fetch community dashboard", err);
            setError(
                err?.response?.data?.message ||
                    "Unable to load dashboard data. Please check your connection and try again."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    // ── Computed helpers ──────────────────────────────────────────────────────
    const todayLabel = useMemo(
        () =>
            new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            }),
        []
    );

    const pendingCount = dashboard?.pendingResidents || 0;

    // ── Quick Actions ─────────────────────────────────────────────────────────
    const quickActions = useMemo(
        () =>
            QUICK_ACTIONS_CONFIG.COMMUNITY_ADMIN.filter((a) => !a.hidden).map((action) => (
                <QuickActionCard
                    key={action.id}
                    title={action.title}
                    description={action.description}
                    icon={action.icon}
                    color={action.color}
                    comingSoon={action.comingSoon}
                    disabled={action.disabled}
                    onClick={() => navigate(action.path)}
                />
            )),
        [navigate]
    );

    // ── Pending approvals rows ─────────────────────────────────────────────────
    const pendingRows = useMemo(
        () =>
            (dashboard?.pendingResidentsList || []).map((resident) => ({
                id: resident.id,
                name: resident.fullName,
                unit: resident.unitNumber || "—",
                email: resident.email,
                date: new Date().toLocaleDateString("en-IN"),
                status: resident.verified ? "VERIFIED" : "PENDING",
            })),
        [dashboard]
    );

    // ─── Full-page error (no prior data) ─────────────────────────────────────
    if (error && !dashboard) {
        return (
            <DashboardLayout>
                <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 600, mx: "auto", mt: 6 }}>
                    <ErrorState
                        title="Dashboard Unavailable"
                        message={error}
                        onRetry={loadDashboard}
                    />
                </Box>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <Box sx={{ pb: 4 }}>

                {/* ── 1. Page Header ─────────────────────────────────────────── */}
                <PageHeader
                    title={`Welcome back, ${user?.firstName || "Administrator"}`}
                    subtitle={todayLabel}
                    action={
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            {pendingCount > 0 && (
                                <Button
                                    size="small"
                                    variant="outlined"
                                    color="warning"
                                    startIcon={<HowToRegIcon />}
                                    onClick={() => navigate("/community-admin/approvals")}
                                    sx={{
                                        borderRadius: "8px",
                                        textTransform: "none",
                                        fontWeight: 600,
                                        fontSize: "0.8125rem",
                                    }}
                                >
                                    {pendingCount} Pending Approval{pendingCount !== 1 ? "s" : ""}
                                </Button>
                            )}
                            <ActionButton
                                variant="outlined"
                                color="primary"
                                startIcon={<RefreshIcon />}
                                onClick={loadDashboard}
                                disabled={loading}
                                sx={{ fontSize: "0.8125rem" }}
                            >
                                Refresh
                            </ActionButton>
                        </Stack>
                    }
                />

                {/* ── 2. Status Summary Bar ──────────────────────────────────── */}
                <StatusSummaryBar dashboard={dashboard} loading={loading} />

                {/* ── 3. Primary KPIs ────────────────────────────────────────── */}
                <Box sx={{ mb: 4 }}>
                    <SectionHeader title="Community Overview" />
                    <Grid container spacing={2.5}>
                        {/* Row 1: Resident Health */}
                        <Grid item xs={12} sm={6} lg={4}>
                            <StatCard
                                title="Total Residents"
                                value={loading ? 0 : (dashboard?.totalResidents || 0)}
                                icon={<PeopleIcon />}
                                color="info.main"
                                loading={loading}
                                onClick={() => navigate("/community-admin/residents")}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={4}>
                            <StatCard
                                title="Pending Approvals"
                                value={loading ? 0 : pendingCount}
                                icon={<PendingActionsIcon />}
                                color="warning.main"
                                loading={loading}
                                onClick={() => navigate("/community-admin/approvals")}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={4}>
                            <StatCard
                                title="Revenue Collected"
                                value={loading ? 0 : (dashboard?.totalRevenue || 0)}
                                formatValue={(v) => formatCurrency(v)}
                                icon={<ReceiptIcon />}
                                color="success.main"
                                loading={loading}
                                onClick={() => navigate("/community-admin/bills")}
                            />
                        </Grid>

                        {/* Row 2: Infrastructure + Usage */}
                        <Grid item xs={12} sm={6} lg={4}>
                            <StatCard
                                title="Total Water Meters"
                                value={loading ? 0 : (dashboard?.totalWaterMeters || 0)}
                                icon={<SpeedIcon />}
                                color="primary.main"
                                loading={loading}
                                onClick={() => navigate("/community-admin/meters")}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={4}>
                            <StatCard
                                title="Active Meters"
                                value={loading ? 0 : (dashboard?.activeWaterMeters || 0)}
                                icon={<CheckCircleIcon />}
                                color="success.main"
                                loading={loading}
                                onClick={() => navigate("/community-admin/meters")}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={4}>
                            <StatCard
                                title="Total Water Consumption"
                                value={loading ? 0 : (dashboard?.totalWaterConsumption || 0)}
                                formatValue={(v) => formatWaterUsage(v)}
                                icon={<WaterDropIcon />}
                                color="info.main"
                                loading={loading}
                                onClick={() => navigate("/community-admin/usage")}
                            />
                        </Grid>
                    </Grid>
                </Box>

                {/* ── 4. Water Usage Overview + Recent Activity ──────────────── */}
                <Box sx={{ mb: 4 }}>
                    <SectionHeader
                        title="Water Usage Overview"
                        action={
                            <Button
                                size="small"
                                variant="text"
                                color="primary"
                                endIcon={<OpenInNewIcon sx={{ fontSize: "0.875rem" }} />}
                                onClick={() => navigate("/admin/water-usage")}
                                sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.75rem" }}
                            >
                                Full Report
                            </Button>
                        }
                    />
                    <Grid container spacing={2.5}>
                        {/* Monthly Water Usage — bar chart — wider */}
                        <Grid item xs={12} lg={8}>
                            <ChartCard
                                title="Monthly Water Consumption"
                                data={dashboard?.monthlyWaterUsage || []}
                                type="bar"
                                color={theme.palette.primary.main}
                                unit="L"
                                height={260}
                                loading={loading}
                                empty={!loading && !(dashboard?.monthlyWaterUsage?.length > 0)}
                                onRefresh={loadDashboard}
                            />
                        </Grid>

                        {/* Meter Status — doughnut — narrower */}
                        <Grid item xs={12} lg={4}>
                            <ChartCard
                                title="Meter Status Distribution"
                                data={dashboard?.meterStatusData || []}
                                type="doughnut"
                                height={260}
                                loading={loading}
                                empty={!loading && !(dashboard?.meterStatusData?.length > 0)}
                                onRefresh={loadDashboard}
                            />
                        </Grid>
                    </Grid>
                </Box>

                {/* ── 5. Operational Panels: Approvals + Activity ────────────── */}
                <Box sx={{ mb: 4 }}>
                    <SectionHeader
                        title="Community Operations"
                        action={
                            <Button
                                size="small"
                                variant="text"
                                color="primary"
                                endIcon={<OpenInNewIcon sx={{ fontSize: "0.875rem" }} />}
                                onClick={() => navigate("/admin/approvals")}
                                sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.75rem" }}
                            >
                                All Approvals
                            </Button>
                        }
                    />
                    <Grid container spacing={2.5} alignItems="flex-start">
                        {/* Pending Approvals Table — wider */}
                        <Grid item xs={12} lg={7}>
                            <WidgetContainer
                                title="Recent Pending Approvals"
                                loading={loading}
                                empty={!loading && pendingRows.length === 0}
                                onRefresh={loadDashboard}
                                action={
                                    pendingRows.length > 0 && !loading ? (
                                        <Chip
                                            label={`${pendingRows.length} pending`}
                                            size="small"
                                            color="warning"
                                            sx={{
                                                height: 20,
                                                fontSize: "0.6875rem",
                                                fontWeight: 700,
                                                "& .MuiChip-label": { px: 0.75 },
                                            }}
                                        />
                                    ) : null
                                }
                                sx={{ minHeight: 280 }}
                            >
                                <DataGrid
                                    rows={pendingRows}
                                    columns={DATAGRID_COLUMNS.COMMUNITY_ADMIN_APPROVALS}
                                    pageSize={5}
                                    autoHeight
                                />
                            </WidgetContainer>
                        </Grid>

                        {/* Recent Activities — narrower */}
                        <Grid item xs={12} lg={5}>
                            <TimelineWidget
                                title="Recent Activities"
                                activities={dashboard?.recentActivities || []}
                                loading={loading}
                                maxHeight={320}
                            />
                        </Grid>
                    </Grid>
                </Box>

                {/* ── 6. Quick Actions ───────────────────────────────────────── */}
                <Box>
                    <SectionHeader title="Quick Actions" />
                    <Grid container spacing={2.5}>
                        {quickActions.map((card, index) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={`action-${index}`}>
                                {card}
                            </Grid>
                        ))}
                    </Grid>
                </Box>

            </Box>
        </DashboardLayout>
    );
}

export default CommunityDashboard;