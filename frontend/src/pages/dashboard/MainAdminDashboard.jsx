import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import DashboardGrid from "../../components/layout/DashboardGrid";
import ChartCard from "../../components/widgets/ChartCard";
import DataGrid from "../../components/common/DataGrid";
import WidgetContainer from "../../components/widgets/WidgetContainer";
import LoadingScreen from "../../components/common/LoadingScreen";
import ActionButton from "../../components/common/ActionButton";
import SectionHeader from "../../components/common/SectionHeader";
import { Button, Grid, Paper } from "@mui/material";

// Icons
import BusinessIcon from "@mui/icons-material/Business";
import PeopleIcon from "@mui/icons-material/People";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import AddIcon from "@mui/icons-material/Add";

import { DATAGRID_COLUMNS } from "../../constants/dashboardConfig";
import { getMainDashboard } from "../../services/DashboardService";
import { formatCurrency, formatWaterUsage } from "../../helpers/numberHelper";
import DashboardHero from "../../components/widgets/DashboardHero";
import DashboardInsight from "../../components/widgets/DashboardInsight";
import DashboardOverview from "../../components/widgets/DashboardOverview";

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

    // Top Analytics Overview Hero Section (Unchanged)
    const overviewHero = useMemo(() => (
        <DashboardOverview
            hero={
                <DashboardHero
                    badge="SYSTEM PLATFORM HEALTH"
                    statusColor="success"
                    title="Enterprise Overview & Performance"
                    primaryValue={`${dashboard?.totalCommunities || 0} Registered Communities`}
                    subtitle="Platform operational status, active resident allocations, and water distribution telemetry across all managed properties."
                    metrics={[
                        { label: "Active Residents", value: (dashboard?.totalResidents || 0).toLocaleString(), icon: <PeopleIcon fontSize="small" /> },
                        { label: "Water Consumption", value: formatWaterUsage(dashboard?.totalWaterConsumption || 0), icon: <WaterDropIcon fontSize="small" /> },
                        { label: "Pending Approvals", value: dashboard?.pendingCommunityAdmins || 0, color: (dashboard?.pendingCommunityAdmins || 0) > 0 ? "warning.main" : "text.secondary", icon: <PendingActionsIcon fontSize="small" /> },
                        { label: "Community Admins", value: dashboard?.totalCommunityAdmins || 0, icon: <SupervisorAccountIcon fontSize="small" /> },
                    ]}
                />
            }
            insights={[
                <DashboardInsight
                    key="revenue"
                    title="Total Platform Revenue"
                    value={formatCurrency(dashboard?.totalRevenue || 0)}
                    caption="Aggregated billing volume across all communities"
                    icon={<CurrencyRupeeIcon />}
                    color="success.main"
                    onClick={() => navigate("/main-admin/communities")}
                />,
                <DashboardInsight
                    key="communities"
                    title="Active Communities"
                    value={dashboard?.totalCommunities || 0}
                    caption="Fully onboarded water management networks"
                    icon={<BusinessIcon />}
                    color="primary.main"
                    onClick={() => navigate("/main-admin/communities")}
                />,
            ]}
        />
    ), [dashboard, navigate]);

    // Full-Width Enterprise Content Sections
    const dashboardSections = useMemo(() => [
        // Section 1: Merged Analytics & Growth Telemetry
        <Paper key="analytics-section" variant="outlined" sx={{ p: 2.5, borderRadius: "14px", bgcolor: "background.paper" }}>
            <SectionHeader 
                title="Platform Analytics & Community Growth" 
                subtitle="Aggregated monthly water consumption telemetry alongside platform community onboarding velocity" 
            />
            <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, lg: 6 }}>
                    <ChartCard 
                        title="Monthly Water Consumption (Millions Litres)" 
                        data={dashboard?.monthlyWaterConsumptionChart || []} 
                        type="line" 
                    />
                </Grid>
                <Grid size={{ xs: 12, lg: 6 }}>
                    <ChartCard 
                        title="Community Onboarding Growth" 
                        data={dashboard?.communityGrowth || []} 
                        type="bar" 
                        color="#10b981"
                    />
                </Grid>
            </Grid>
        </Paper>,

        // Section 2: Pending Approvals & Governance
        <Paper key="approvals-section" variant="outlined" sx={{ p: 2.5, borderRadius: "14px", bgcolor: "background.paper" }}>
            <SectionHeader 
                title="Pending Approvals & Administrative Governance" 
                subtitle="Community Admin registrations awaiting verification and role assignment"
                action={<Button size="small" variant="outlined" onClick={() => navigate("/main-admin/approvals")}>View All Approvals</Button>}
            />
            <WidgetContainer bodyPadding={0}>
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
        </Paper>
    ], [dashboard, navigate]);

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
                kpiCards={overviewHero}
                sections={dashboardSections}
                quickActions={null}
            />
        </DashboardLayout>
    );
}

export default MainAdminDashboard;