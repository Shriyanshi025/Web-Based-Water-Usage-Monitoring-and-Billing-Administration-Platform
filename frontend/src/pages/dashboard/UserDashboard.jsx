import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import DashboardGrid from "../../components/layout/DashboardGrid";
import StatCard from "../../components/widgets/StatCard";
import ChartCard from "../../components/widgets/ChartCard";
import TimelineWidget from "../../components/widgets/TimelineWidget";
import WidgetContainer from "../../components/widgets/WidgetContainer";
import QuickActionCard from "../../components/widgets/QuickActionCard";
import LoadingScreen from "../../components/common/LoadingScreen";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";

// Icons
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SpeedIcon from "@mui/icons-material/Speed";
import HistoryIcon from "@mui/icons-material/History";

// Config and Services
import { QUICK_ACTIONS_CONFIG, EMPTY_STATE_CONFIG, CHART_CONFIG } from "../../constants/dashboardConfig";
import { getResidentDashboard } from "../../services/DashboardService";
import { getMyUsageHistory } from "../../services/ResidentOpsService";
import { formatCurrency, formatWaterUsage } from "../../helpers/numberHelper";
import { useAuth } from "../../context/AuthContext";

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
            const [dashboardRes, usageRes] = await Promise.all([
                getResidentDashboard(),
                getMyUsageHistory()
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

    const memoizedQuickActions = useMemo(() => 
        QUICK_ACTIONS_CONFIG.USER.filter(action => !action.hidden).map((action) => (
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

    const previousMonthUsage = useMemo(() => {
        if (usageHistory.length > 1) {
            return usageHistory[1].unitsConsumed;
        }
        return 0;
    }, [usageHistory]);

    const chartData = useMemo(() => {
        return usageHistory.map(u => ({
            name: new Date(u.readingDate).toLocaleString('default', { month: 'short' }),
            value: u.unitsConsumed
        })).reverse();
    }, [usageHistory]);

    const memoizedKpiCards = useMemo(() => [
        <StatCard 
            key="current-usage"
            title="Current Month Usage" 
            value={dashboard?.currentMonthWaterUsage || 0} 
            formatValue={formatWaterUsage}
            icon={<WaterDropIcon />} 
            color="info.main"
        />,
        <StatCard 
            key="current-bill"
            title="Estimated Bill" 
            value={dashboard?.currentBill || 0} 
            formatValue={formatCurrency}
            icon={<ReceiptIcon />} 
            color="warning.main"
        />,
        <StatCard 
            key="meter-status"
            title="Active Meter Status" 
            value={dashboard?.meterStatus || "Unknown"}
            icon={<SpeedIcon />} 
            color={dashboard?.meterStatus === "ACTIVE" ? "success.main" : "error.main"}
        />,
        <StatCard 
            key="previous-usage"
            title="Previous Month Usage" 
            value={previousMonthUsage}
            formatValue={formatWaterUsage}
            icon={<HistoryIcon />} 
            color="primary.main"
        />
    ], [dashboard, previousMonthUsage]);

    const memoizedLeftColumn = useMemo(() => [
        <ChartCard 
            key="usage-chart"
            title="Monthly Water Consumption" 
            data={chartData} 
            type={CHART_CONFIG.WATER_CONSUMPTION.type} 
            color={CHART_CONFIG.WATER_CONSUMPTION.color}
        />
    ], [chartData]);

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
                headerTitle={`Welcome back, ${dashboard?.fullName || user?.firstName || 'Resident'}`}
                headerSubtitle={`${dashboard?.communityName || ''} - ${dashboard?.blockName || ''} ${dashboard?.unitNumber || ''}`}
                kpiCards={memoizedKpiCards}
                leftColumn={memoizedLeftColumn}
                rightColumn={memoizedRightColumn}
                quickActions={memoizedQuickActions}
            />
        </DashboardLayout>
    );
}

export default UserDashboard;