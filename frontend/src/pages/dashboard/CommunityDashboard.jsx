import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Grid } from "@mui/material";
import DashboardLayout from "../../components/layout/DashboardLayout";
import DashboardGrid from "../../components/layout/DashboardGrid";
import StatCard from "../../components/widgets/StatCard";
import ChartCard from "../../components/widgets/ChartCard";
import TimelineWidget from "../../components/widgets/TimelineWidget";
import DataGrid from "../../components/common/DataGrid";
import WidgetContainer from "../../components/widgets/WidgetContainer";
import QuickActionCard from "../../components/widgets/QuickActionCard";
import LoadingScreen from "../../components/common/LoadingScreen";
import ErrorState from "../../components/common/ErrorState";

// Icons
import PeopleIcon from "@mui/icons-material/People";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import SpeedIcon from "@mui/icons-material/Speed";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import ReceiptIcon from "@mui/icons-material/Receipt";

// Config and Services
import { QUICK_ACTIONS_CONFIG, DATAGRID_COLUMNS, CHART_CONFIG } from "../../constants/dashboardConfig";
import { getCommunityAdminDashboard } from "../../services/DashboardService";
import { formatCurrency, formatWaterUsage } from "../../helpers/numberHelper";
import { useAuth } from "../../context/AuthContext";

function CommunityDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const response = await getCommunityAdminDashboard();
            setDashboard(response.data);
        } catch (err) {
            console.error("Failed to fetch dashboard", err);
            setError("Failed to load dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    const memoizedQuickActions = useMemo(() => 
        QUICK_ACTIONS_CONFIG.COMMUNITY_ADMIN.filter(action => !action.hidden).map((action) => (
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
    [navigate]);

    const memoizedKpiCards = useMemo(() => [
        <StatCard 
            key="total-residents"
            title="Total Residents" 
            value={dashboard?.totalResidents || 0} 
            icon={<PeopleIcon />} 
            trend={5.2} 
            trendLabel="vs last month"
            color="info.main"
        />,
        <StatCard 
            key="pending-approvals"
            title="Pending Approvals" 
            value={dashboard?.pendingResidents || 0} 
            icon={<PendingActionsIcon />} 
            trend={-2.1} 
            trendLabel="vs last week"
            color="warning.main"
        />,
        <StatCard 
            key="total-meters"
            title="Total Water Meters" 
            value={dashboard?.totalWaterMeters || 0} 
            icon={<SpeedIcon />} 
            color="primary.main"
        />,
        <StatCard 
            key="active-meters"
            title="Active Meters" 
            value={dashboard?.activeWaterMeters || 0} 
            icon={<CheckCircleIcon />} 
            color="success.main"
        />,
        <StatCard 
            key="water-consumption"
            title="Water Consumption" 
            value={dashboard?.totalWaterConsumption || 0} 
            formatValue={(v) => `${v.toFixed(2)} Litres`}
            icon={<WaterDropIcon />} 
            trend={2.4} 
            trendLabel="vs last month"
            color="info.main"
        />,
        <StatCard 
            key="revenue-collected"
            title="Revenue Collected" 
            value={dashboard?.totalRevenue || 0}
            formatValue={(v) => `$${v.toLocaleString()}`}
            icon={<ReceiptIcon />} 
            trend={8.3} 
            trendLabel="vs last month"
            color="success.main"
        />
    ], [dashboard]);

    const memoizedLeftColumn = useMemo(() => [
        <Grid container spacing={3} key="charts-row">
            <Grid item xs={12} md={4}>
                <ChartCard 
                    key="water-usage-chart"
                    title="Monthly Water Usage" 
                    data={dashboard?.monthlyWaterUsage || []} 
                    type="bar" 
                    color="#2196f3"
                />
            </Grid>
            <Grid item xs={12} md={8}>
                <ChartCard 
                    key="meter-status"
                    title="Meter Status" 
                    data={dashboard?.meterStatusData || []} 
                    type="doughnut" 
                />
            </Grid>
        </Grid>,
        <WidgetContainer key="pending-approvals-table" title="Recent Pending Approvals">
            <DataGrid 
                rows={(dashboard?.pendingResidentsList || []).map(resident => ({
                    id: resident.id,
                    name: resident.fullName,
                    unit: resident.unitNumber || 'N/A',
                    email: resident.email,
                    date: new Date().toLocaleDateString(),
                    status: resident.verified ? 'VERIFIED' : 'PENDING'
                }))} 
                columns={DATAGRID_COLUMNS.COMMUNITY_ADMIN_APPROVALS} 
                pageSize={5} 
                autoHeight 
            />
        </WidgetContainer>
    ], [dashboard]);

    const memoizedRightColumn = useMemo(() => [
        <TimelineWidget 
            key="recent-activities"
            title="Recent Activities" 
            activities={dashboard?.recentActivities || []} 
        />
    ], [dashboard]);

    if (loading) {
        return (
            <DashboardLayout>
                <LoadingScreen />
            </DashboardLayout>
        );
    }

    if (error && !dashboard) {
        return (
            <DashboardLayout>
                <ErrorState message={error} onRetry={loadDashboard} />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <DashboardGrid 
                headerTitle={`Welcome back, ${user?.firstName || 'Administrator'}`}
                headerSubtitle={`Community: ${dashboard?.communityName || 'Unknown'}`}
                kpiCards={memoizedKpiCards}
                leftColumn={memoizedLeftColumn}
                rightColumn={memoizedRightColumn}
                quickActions={memoizedQuickActions}
            />
        </DashboardLayout>
    );
}

export default CommunityDashboard;