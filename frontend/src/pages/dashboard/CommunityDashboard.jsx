import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Grid, Typography, Chip, Stack, Button, Divider, Paper, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { safeAlpha } from "../../helpers/colorHelper";

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
import AdminStatCard from "../../components/common/AdminStatCard";
import ChartCard from "../../components/widgets/ChartCard";
import TimelineWidget from "../../components/widgets/TimelineWidget";
import WidgetContainer from "../../components/widgets/WidgetContainer";
import DashboardHero from "../../components/widgets/DashboardHero";
import DashboardInsight from "../../components/widgets/DashboardInsight";
import DashboardOverview from "../../components/widgets/DashboardOverview";

// Icons — KPIs
import PeopleIcon from "@mui/icons-material/People";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import SpeedIcon from "@mui/icons-material/Speed";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ApartmentIcon from "@mui/icons-material/Apartment";

// Icons — UI
import RefreshIcon from "@mui/icons-material/Refresh";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import SensorsIcon from "@mui/icons-material/Sensors";

// Config and Services
import { DATAGRID_COLUMNS } from "../../constants/dashboardConfig";
import { getCommunityAdminDashboard } from "../../services/DashboardService";
import { formatCurrency, formatWaterUsage } from "../../helpers/numberHelper";
import { useAuth } from "../../context/AuthContext";

// ─── Status Summary Banner (Redesigned for Premium Professional Alignment) ───
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
                mb: 3.5,
                p: { xs: 1.75, sm: 2 },
                bgcolor: "background.paper",
                borderRadius: 3,
                border: "1px solid",
                borderColor: safeAlpha(theme, "primary.main", 0.12),
                boxShadow: "0 2px 12px rgba(12, 25, 41, 0.04)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 2
            }}
        >
            {/* Left Metrics Cluster */}
            <Stack direction="row" alignItems="center" spacing={{ xs: 1.5, sm: 3 }} flexWrap="wrap" sx={{ gap: 1.5 }}>
                {/* 1. System Operational Live Pulse */}
                <Stack direction="row" alignItems="center" spacing={1.25}>
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 2,
                            bgcolor: loading
                                ? safeAlpha(theme, "warning.main", 0.1)
                                : safeAlpha(theme, "success.main", 0.1),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: loading ? "warning.main" : "success.main"
                        }}
                    >
                        <SensorsIcon sx={{ fontSize: "1.1rem" }} />
                    </Box>

                    <Stack direction="row" alignItems="center" spacing={0.75}>
                        <Box
                            sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor: loading ? "warning.main" : "success.main",
                                boxShadow: loading
                                    ? `0 0 0 3px ${safeAlpha(theme, "warning.main", 0.2)}`
                                    : `0 0 0 3px ${safeAlpha(theme, "success.main", 0.2)}`,
                            }}
                        />
                        <Typography
                            sx={{
                                fontSize: "0.8125rem",
                                fontWeight: 700,
                                color: loading ? "warning.main" : "success.main",
                                letterSpacing: "-0.1px"
                            }}
                        >
                            {loading ? "Syncing..." : "System Operational"}
                        </Typography>
                    </Stack>
                </Stack>

                <Divider orientation="vertical" flexItem sx={{ height: 24, alignSelf: "center", display: { xs: "none", sm: "block" } }} />

                {/* 2. Smart Meter Utilization Metric */}
                {!loading && dashboard && (
                    <Stack direction="row" alignItems="center" spacing={1.25}>
                        <Box
                            sx={{
                                width: 32,
                                height: 32,
                                borderRadius: 2,
                                bgcolor: safeAlpha(theme, "info.main", 0.1),
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "info.main"
                            }}
                        >
                            <SpeedIcon sx={{ fontSize: "1.1rem" }} />
                        </Box>

                        <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary", fontWeight: 500 }}>
                            Meter Utilization:{" "}
                            <Typography component="span" sx={{ fontWeight: 800, color: "text.primary", fontSize: "0.85rem" }}>
                                {meterUtilization}%
                            </Typography>
                        </Typography>
                    </Stack>
                )}

                {!loading && dashboard && (
                    <Divider orientation="vertical" flexItem sx={{ height: 24, alignSelf: "center", display: { xs: "none", md: "block" } }} />
                )}

                {/* 3. Pending Approvals Status */}
                {!loading && dashboard && (
                    <Stack direction="row" alignItems="center" spacing={1.25}>
                        <Box
                            sx={{
                                width: 32,
                                height: 32,
                                borderRadius: 2,
                                bgcolor: pendingUrgent
                                    ? safeAlpha(theme, "warning.main", 0.12)
                                    : safeAlpha(theme, "primary.main", 0.08),
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: pendingUrgent ? "warning.main" : "primary.main"
                            }}
                        >
                            <PendingActionsIcon sx={{ fontSize: "1.1rem" }} />
                        </Box>

                        <Typography
                            sx={{
                                fontSize: "0.8125rem",
                                color: pendingUrgent ? "warning.main" : "text.secondary",
                                fontWeight: 500,
                            }}
                        >
                            {pendingCount > 0 ? (
                                <>
                                    <Typography
                                        component="span"
                                        sx={{
                                            fontWeight: 800,
                                            color: pendingUrgent ? "warning.main" : "text.primary",
                                            fontSize: "0.85rem",
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
            </Stack>

            {/* Right Side: Community Name Badge */}
            {!loading && dashboard?.communityName && (
                <Chip
                    icon={<ApartmentIcon sx={{ fontSize: "15px !important", color: `${theme.palette.primary.main} !important` }} />}
                    label={dashboard.communityName}
                    size="medium"
                    sx={{
                        height: 32,
                        fontSize: "0.8125rem",
                        fontWeight: 700,
                        bgcolor: safeAlpha(theme, "primary.main", 0.08),
                        color: "primary.main",
                        border: "1px solid",
                        borderColor: safeAlpha(theme, "primary.main", 0.2),
                        borderRadius: "8px",
                        px: 0.5,
                        "& .MuiChip-label": { px: 1 },
                    }}
                />
            )}
        </Box>
    );
};

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

                {/* ── 1. Page Header with Standardized Action Buttons ────────── */}
                <PageHeader
                    title={`Welcome back, ${user?.firstName || "Administrator"}`}
                    subtitle={todayLabel}
                    action={
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            {pendingCount > 0 && (
                                <Button
                                    size="medium"
                                    variant="outlined"
                                    color="warning"
                                    startIcon={<HowToRegIcon sx={{ fontSize: "1.1rem" }} />}
                                    onClick={() => navigate("/community-admin/approvals")}
                                    sx={{
                                        height: 38,
                                        px: 2,
                                        borderRadius: "8px",
                                        textTransform: "none",
                                        fontWeight: 600,
                                        fontSize: "0.85rem",
                                    }}
                                >
                                    {pendingCount} Pending Approval{pendingCount !== 1 ? "s" : ""}
                                </Button>
                            )}
                            <ActionButton
                                variant="outlined"
                                color="primary"
                                startIcon={<RefreshIcon sx={{ fontSize: "1.1rem" }} />}
                                onClick={loadDashboard}
                                disabled={loading}
                                sx={{ height: 38, px: 2, fontSize: "0.85rem" }}
                            >
                                Refresh
                            </ActionButton>
                        </Stack>
                    }
                />

                {/* ── 2. Redesigned Status Summary Banner ──────────────────────── */}
                <StatusSummaryBar dashboard={dashboard} loading={loading} />

                {/* ── 3. Community Operations Overview ─── */}
                <Box sx={{ mb: 4 }}>
                    <DashboardOverview
                        hero={
                            <DashboardHero
                                badge="COMMUNITY OPERATIONS"
                                statusColor="info"
                                title="Water Operations & Resident Telemetry"
                                primaryValue={formatWaterUsage(dashboard?.totalWaterConsumption || 0)}
                                subtitle="Total water consumption tracked across all active households and smart meters in your community."
                                metrics={[
                                    { label: "Active Residents", value: (dashboard?.totalResidents || 0).toLocaleString(), icon: <PeopleIcon fontSize="small" /> },
                                    { label: "Active Meters", value: `${dashboard?.activeWaterMeters || 0} / ${dashboard?.totalWaterMeters || 0}`, icon: <CheckCircleIcon fontSize="small" /> },
                                    { label: "Pending Approvals", value: pendingCount, color: pendingCount > 0 ? "warning.main" : "text.secondary", icon: <PendingActionsIcon fontSize="small" /> },
                                ]}
                            />
                        }
                        insights={[
                            <DashboardInsight
                                key="revenue"
                                title="Revenue Collected"
                                value={formatCurrency(dashboard?.totalRevenue || 0)}
                                caption="Total billed water usage payments collected"
                                icon={<ReceiptIcon />}
                                color="success.main"
                                onClick={() => navigate("/community-admin/bills")}
                            />,
                            <DashboardInsight
                                key="meters"
                                title="Smart Water Meters"
                                value={`${dashboard?.activeWaterMeters || 0} Online`}
                                caption={`${dashboard?.totalWaterMeters || 0} Total Installed Meters`}
                                icon={<SpeedIcon />}
                                color="primary.main"
                                onClick={() => navigate("/community-admin/meters")}
                            />,
                        ]}
                    />
                </Box>

                {/* ── 4. Merged Water Consumption & Meter Distribution Analytics Section ── */}
                <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: "14px", bgcolor: "background.paper" }}>
                    <SectionHeader
                        title="Water Consumption & Meter Distribution Analytics"
                        subtitle="Aggregated community monthly water consumption telemetry and operational meter status distribution"
                        action={
                            <Button
                                size="small"
                                variant="text"
                                color="primary"
                                endIcon={<OpenInNewIcon sx={{ fontSize: "0.9rem" }} />}
                                onClick={() => navigate("/community-admin/usage")}
                                sx={{
                                    height: 34,
                                    px: 1.75,
                                    borderRadius: "8px",
                                    textTransform: "none",
                                    fontWeight: 600,
                                    fontSize: "0.8125rem"
                                }}
                            >
                                Full Report
                            </Button>
                        }
                    />
                    <Grid container spacing={2.5}>
                        <Grid size={{ xs: 12, lg: 8 }}>
                            <ChartCard
                                title="Monthly Water Consumption"
                                data={dashboard?.monthlyWaterUsage || []}
                                type="bar"
                                color={theme.palette.primary.main}
                                unit="L"
                                height={280}
                                loading={loading}
                                empty={!loading && !(dashboard?.monthlyWaterUsage?.length > 0)}
                                onRefresh={loadDashboard}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, lg: 4 }}>
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
                </Paper>

                {/* ── 5. Full-Width Pending Approvals Governance Section ────────────── */}
                <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: "14px", bgcolor: "background.paper" }}>
                    <SectionHeader
                        title="Pending Resident Approvals & Governance"
                        subtitle="Resident registration and unit allocation requests awaiting administrator verification"
                        action={
                            <Button
                                size="small"
                                variant="text"
                                color="primary"
                                endIcon={<OpenInNewIcon sx={{ fontSize: "0.9rem" }} />}
                                onClick={() => navigate("/community-admin/approvals")}
                                sx={{
                                    height: 34,
                                    px: 1.75,
                                    borderRadius: "8px",
                                    textTransform: "none",
                                    fontWeight: 600,
                                    fontSize: "0.8125rem"
                                }}
                            >
                                All Approvals
                            </Button>
                        }
                    />
                    <WidgetContainer
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
                                        height: 22,
                                        fontSize: "0.75rem",
                                        fontWeight: 700,
                                        borderRadius: "6px",
                                        "& .MuiChip-label": { px: 1 },
                                    }}
                                />
                            ) : null
                        }
                        sx={{ minHeight: 240 }}
                        bodyPadding={0}
                    >
                        <DataGrid
                            rows={pendingRows}
                            columns={DATAGRID_COLUMNS.COMMUNITY_ADMIN_APPROVALS}
                            pageSize={5}
                            autoHeight
                        />
                    </WidgetContainer>
                </Paper>

                {/* ── 6. Full-Width Community Activity Log Section ────────────── */}
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: "14px", bgcolor: "background.paper" }}>
                    <SectionHeader
                        title="Recent Community Activities & Audit Trail"
                        subtitle="Real-time log of community management events, meter telemetry alerts, and resident updates"
                    />
                    <TimelineWidget
                        activities={dashboard?.recentActivities || []}
                        loading={loading}
                        maxHeight={340}
                    />
                </Paper>
            </Box>
        </DashboardLayout>
    );
}

export default CommunityDashboard;