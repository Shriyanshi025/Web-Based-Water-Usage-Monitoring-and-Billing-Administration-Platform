import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import DashboardGrid from "../../components/layout/DashboardGrid";
import StatCard from "../../components/widgets/StatCard";
import ChartCard from "../../components/widgets/ChartCard";
import TimelineWidget from "../../components/widgets/TimelineWidget";
import DataGrid from "../../components/common/DataGrid";
import WidgetContainer from "../../components/widgets/WidgetContainer";
import QuickActionCard from "../../components/widgets/QuickActionCard";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingScreen from "../../components/common/LoadingScreen";
import ActionButton from "../../components/common/ActionButton";
import { IconButton } from "@mui/material";

// Icons
import BusinessIcon from "@mui/icons-material/Business";
import PeopleIcon from "@mui/icons-material/People";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import AddIcon from "@mui/icons-material/Add";
import ReceiptIcon from "@mui/icons-material/Receipt";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import { QUICK_ACTIONS_CONFIG, DATAGRID_COLUMNS } from "../../constants/dashboardConfig";
import { getMainDashboard } from "../../services/DashboardService";

function MainAdminDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const response = await getMainDashboard();
            setDashboard(response.data);
        } catch (err) {
            setError(err.response?.data?.message || "Unable to load dashboard.");
        } finally {
            setLoading(false);
        }
    };

    // Dummy Data for charts
    const waterUsageData = useMemo(() => [
        { name: "Jan", value: 1.1 }, { name: "Feb", value: 1.15 }, { name: "Mar", value: 1.05 },
        { name: "Apr", value: 1.2 }, { name: "May", value: 1.28 }, { name: "Jun", value: 1.4 }
    ], []);

    const communityGrowthData = useMemo(() => [
        { name: "Q1", value: 12 }, { name: "Q2", value: 18 }, { name: "Q3", value: 24 }, { name: "Q4", value: 32 }
    ], []);

    const recentActivities = useMemo(() => [
        { id: 1, title: 'Community "Green Valley" created', description: "By Admin", time: "2 hours ago", icon: <BusinessIcon />, color: "primary" },
        { id: 2, title: 'Resident Registered', description: "Unit A-102 at Sunset Heights", time: "5 hours ago", icon: <PeopleIcon />, color: "success" },
        { id: 3, title: 'Water Meter Added', description: "Device #WM-8893 activated", time: "Yesterday", icon: <WaterDropIcon />, color: "info" },
        { id: 4, title: 'Billing Generated', description: "For cycle Oct 2023", time: "2 days ago", icon: <ReceiptIcon />, color: "warning" },
    ], []);
    
    const dummyApprovals = useMemo(() => [
        { id: 1, name: 'Alice Smith', role: 'Resident', community: 'Green Valley', date: '2023-10-25', status: 'Pending' },
        { id: 2, name: 'Bob Johnson', role: 'Comm Admin', community: 'Sunset Heights', date: '2023-10-24', status: 'Pending' },
        { id: 3, name: 'Carol Williams', role: 'Resident', community: 'Oceanview', date: '2023-10-23', status: 'Pending' }
    ], []);

    const memoizedQuickActions = useMemo(() => 
        QUICK_ACTIONS_CONFIG.MAIN_ADMIN.filter(action => !action.hidden).map((action) => (
            <QuickActionCard 
                key={action.id}
                title={action.title} 
                description={action.description}
                icon={action.icon}
                color={action.color}
                comingSoon={action.comingSoon}
                disabled={action.disabled}
                onClick={() => console.log(`Navigate to ${action.path}`)}
            />
        )), 
    []);

    const memoizedKpiCards = useMemo(() => [
        <StatCard 
            key="total-communities"
            title="Total Communities" 
            value={dashboard?.totalCommunities || 32} 
            icon={<BusinessIcon />} 
            trend={12.5} 
            trendLabel="vs last month"
            color="primary.main"
        />,
        <StatCard 
            key="active-residents"
            title="Active Residents" 
            value={dashboard?.totalResidents || 12486} 
            icon={<PeopleIcon />} 
            trend={18.4} 
            trendLabel="vs last month"
            color="success.main"
        />,
        <StatCard 
            key="pending-approvals"
            title="Pending Approvals" 
            value={14} 
            icon={<PendingActionsIcon />} 
            trend={-5.2} 
            trendLabel="vs last week"
            color="warning.main"
        />,
        <StatCard 
            key="community-admins"
            title="Community Admins" 
            value={45} 
            icon={<SupervisorAccountIcon />} 
            trend={8.1} 
            trendLabel="vs last month"
            color="info.main"
        />,
        <StatCard 
            key="water-consumption"
            title="Water Consumption" 
            value={1.28} 
            formatValue={(v) => `${v.toFixed(2)}M Litres`}
            icon={<WaterDropIcon />} 
            trend={4.3} 
            trendLabel="vs last month"
            color="primary.main"
        />,
        <StatCard 
            key="revenue-summary"
            title="Revenue Summary" 
            value={84500}
            formatValue={(v) => `$${v.toLocaleString()}`}
            icon={<AttachMoneyIcon />} 
            trend={15.2} 
            trendLabel="vs last month"
            color="success.main"
        />
    ], [dashboard]);

    const memoizedLeftColumn = useMemo(() => [
        <ChartCard 
            key="monthly-water"
            title="Monthly Water Consumption (Millions Litres)" 
            data={waterUsageData} 
            type="line" 
        />,
        <WidgetContainer key="pending-approvals" title="Pending Approvals">
            <DataGrid 
                rows={dummyApprovals} 
                columns={DATAGRID_COLUMNS.MAIN_ADMIN_APPROVALS} 
                pageSize={5} 
                autoHeight 
            />
        </WidgetContainer>
    ], [waterUsageData, dummyApprovals]);

    const memoizedRightColumn = useMemo(() => [
        <TimelineWidget 
            key="recent-activities"
            title="Recent Activities" 
            activities={recentActivities} 
        />,
        <ChartCard 
            key="community-growth"
            title="Community Growth" 
            data={communityGrowthData} 
            type="bar" 
            color="#10b981"
        />
    ], [recentActivities, communityGrowthData]);

    if (loading) {
        return (
            <DashboardLayout>
                <LoadingScreen />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <DashboardGrid 
                headerTitle="Welcome back, Administrator"
                headerSubtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                headerAction={<ActionButton variant="contained" icon={<AddIcon />}>Create Community</ActionButton>}
                kpiCards={memoizedKpiCards}
                leftColumn={memoizedLeftColumn}
                rightColumn={memoizedRightColumn}
                quickActions={memoizedQuickActions}
            />
        </DashboardLayout>
    );
}

export default MainAdminDashboard;