import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
import { IconButton, Button } from "@mui/material";

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
    const navigate = useNavigate();
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
                onClick={() => action.path && navigate(action.path)}
            />
        )), 
    []);

    const memoizedKpiCards = useMemo(() => [
        <StatCard 
            key="total-communities"
            title="Total Communities" 
            value={dashboard?.totalCommunities || 0} 
            icon={<BusinessIcon />} 
            trend={12.5} 
            trendLabel="vs last month"
            color="primary.main"
            onClick={() => navigate("/main-admin/communities")}
        />,
        <StatCard 
            key="active-residents"
            title="Active Residents" 
            value={dashboard?.totalResidents || 0} 
            icon={<PeopleIcon />} 
            trend={18.4} 
            trendLabel="vs last month"
            color="success.main"
            onClick={() => navigate("/main-admin/communities")}
        />,
        <StatCard 
            key="pending-approvals"
            title="Pending Approvals" 
            value={dashboard?.pendingCommunityAdmins || 0} 
            icon={<PendingActionsIcon />} 
            trend={-5.2} 
            trendLabel="vs last week"
            color="warning.main"
            onClick={() => navigate("/main-admin/approvals")}
        />,
        <StatCard 
            key="community-admins"
            title="Community Admins" 
            value={dashboard?.totalCommunityAdmins || 0} 
            icon={<SupervisorAccountIcon />} 
            trend={8.1} 
            trendLabel="vs last month"
            color="info.main"
            onClick={() => navigate("/main-admin/community-admins")}
        />,
        <StatCard 
            key="water-consumption"
            title="Water Consumption" 
            value={dashboard?.totalWaterConsumption || 0} 
            formatValue={(v) => `${v.toFixed(2)} Litres`}
            icon={<WaterDropIcon />} 
            trend={4.3} 
            trendLabel="vs last month"
            color="primary.main"
            onClick={() => navigate("/main-admin/communities")}
        />,
        <StatCard 
            key="revenue-summary"
            title="Revenue Summary" 
            value={dashboard?.totalRevenue || 0}
            formatValue={(v) => `$${v.toLocaleString()}`}
            icon={<AttachMoneyIcon />} 
            trend={15.2} 
            trendLabel="vs last month"
            color="success.main"
            onClick={() => navigate("/main-admin/communities")}
        />
    ], [dashboard]);

    const memoizedLeftColumn = useMemo(() => [
        <ChartCard 
            key="monthly-water"
            title="Monthly Water Consumption (Millions Litres)" 
            data={dashboard?.monthlyWaterConsumptionChart || []} 
            type="line" 
        />,
        <WidgetContainer 
            key="pending-approvals" 
            title="Pending Approvals"
            action={<Button size="small" variant="outlined" onClick={() => navigate("/main-admin/approvals")}>View All</Button>}
        >
            <DataGrid 
                rows={(dashboard?.pendingApprovals || []).map(admin => ({
                    id: admin.id,
                    name: admin.fullName,
                    role: 'Community Admin',
                    community: admin.communityName,
                    date: new Date().toLocaleDateString(),
                    status: admin.verified ? 'VERIFIED' : 'PENDING'
                }))} 
                columns={DATAGRID_COLUMNS.MAIN_ADMIN_APPROVALS} 
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
        />,
        <ChartCard 
            key="community-growth"
            title="Community Growth" 
            data={dashboard?.communityGrowth || []} 
            type="bar" 
            color="#10b981"
        />
    ], [dashboard]);

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
                headerAction={<ActionButton variant="contained" icon={<AddIcon />} onClick={() => navigate("/main-admin/communities")}>Create Community</ActionButton>}
                kpiCards={memoizedKpiCards}
                leftColumn={memoizedLeftColumn}
                rightColumn={memoizedRightColumn}
                quickActions={memoizedQuickActions}
            />
        </DashboardLayout>
    );
}

export default MainAdminDashboard;