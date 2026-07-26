import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import DashboardGrid from "../../components/layout/DashboardGrid";
import AdminStatCard from "../../components/common/AdminStatCard";
import PageHeader from "../../components/common/PageHeader";
import ChartCard from "../../components/widgets/ChartCard";
import TimelineWidget from "../../components/widgets/TimelineWidget";
import DataGrid from "../../components/common/DataGrid";
import WidgetContainer from "../../components/widgets/WidgetContainer";
import QuickActionCard from "../../components/widgets/QuickActionCard";
import LoadingScreen from "../../components/common/LoadingScreen";
import ActionButton from "../../components/common/ActionButton";
import { Button } from "@mui/material";

// Icons
import BusinessIcon from "@mui/icons-material/Business";
import PeopleIcon from "@mui/icons-material/People";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import AddIcon from "@mui/icons-material/Add";

import { QUICK_ACTIONS_CONFIG, DATAGRID_COLUMNS } from "../../constants/dashboardConfig";
import { getMainDashboard } from "../../services/DashboardService";
import { formatCurrency, formatWaterUsage } from "../../helpers/numberHelper";

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
        <AdminStatCard 
            key="total-communities"
            title="Total Communities" 
            value={dashboard?.totalCommunities || 0} 
            icon={<BusinessIcon />} 
            iconColor="primary.main"
            onClick={() => navigate("/main-admin/communities")}
        />,
        <AdminStatCard 
            key="active-residents"
            title="Active Residents" 
            value={dashboard?.totalResidents || 0} 
            icon={<PeopleIcon />} 
            iconColor="success.main"
            onClick={() => navigate("/main-admin/communities")}
        />,
        <AdminStatCard 
            key="pending-approvals"
            title="Pending Approvals" 
            value={dashboard?.pendingCommunityAdmins || 0} 
            icon={<PendingActionsIcon />} 
            iconColor="warning.main"
            onClick={() => navigate("/main-admin/approvals")}
        />,
        <AdminStatCard 
            key="community-admins"
            title="Community Admins" 
            value={dashboard?.totalCommunityAdmins || 0} 
            icon={<SupervisorAccountIcon />} 
            iconColor="info.main"
            onClick={() => navigate("/main-admin/community-admins")}
        />,
        <AdminStatCard 
            key="water-consumption"
            title="Water Consumption" 
            value={formatWaterUsage(dashboard?.totalWaterConsumption || 0)} 
            icon={<WaterDropIcon />} 
            iconColor="primary.main"
            onClick={() => navigate("/main-admin/communities")}
        />,
        <AdminStatCard 
            key="revenue-summary"
            title="Revenue Summary" 
            value={formatCurrency(dashboard?.totalRevenue || 0)}
            icon={<AttachMoneyIcon />} 
            iconColor="success.main"
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