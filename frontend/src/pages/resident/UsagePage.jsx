import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import WidgetContainer from "../../components/widgets/WidgetContainer";
import TableToolbar from "../../components/common/TableToolbar";
import EmptyState from "../../components/common/EmptyState";
import DataGrid from "../../components/common/DataGrid";
import ChartCard from "../../components/widgets/ChartCard";
import { Box, Grid, Typography } from "@mui/material";
import AdminStatCard from "../../components/common/AdminStatCard";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import SpeedIcon from "@mui/icons-material/Speed";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import EqualizerIcon from "@mui/icons-material/Equalizer";
import { formatWaterUsage } from "../../helpers/numberHelper";
import { CHART_CONFIG } from "../../constants/dashboardConfig";
import { getMyUsageHistory } from "../../services/ResidentOpsService";

function UsagePage() {
    const [usage, setUsage] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");

    const loadUsage = async () => {
        try {
            setLoading(true);
            const data = await getMyUsageHistory();
            setUsage(data || []);
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to load usage history");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsage();
    }, []);

    const latestUsage = useMemo(() => (usage.length > 0 ? usage[0]?.unitsConsumed || 0 : 0), [usage]);
    const averageUsage = useMemo(() => {
        if (!usage.length) return 0;
        const total = usage.reduce((sum, u) => sum + (u.unitsConsumed || 0), 0);
        return Math.round(total / usage.length);
    }, [usage]);
    const peakUsage = useMemo(() => {
        if (!usage.length) return 0;
        return Math.max(...usage.map(u => u.unitsConsumed || 0));
    }, [usage]);

    const chartData = useMemo(() => {
        return [...usage]
            .sort((a, b) => new Date(a.readingDate) - new Date(b.readingDate))
            .map(u => ({
                name: new Date(u.readingDate).toLocaleString('default', { month: 'short' }),
                value: u.unitsConsumed
            }));
    }, [usage]);

    const columns = useMemo(() => [
        {
            field: "readingDate",
            headerName: "Reading Date",
            width: 160,
            renderCell: (params) => params.value
                ? new Date(params.value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                : "—",
        },
        {
            field: "previousReading",
            headerName: "Previous (units)",
            width: 160,
            renderCell: (params) => params.value != null ? params.value.toLocaleString() : "—",
        },
        {
            field: "currentReading",
            headerName: "Current (units)",
            width: 160,
            renderCell: (params) => params.value != null ? params.value.toLocaleString() : "—",
        },
        {
            field: "unitsConsumed",
            headerName: "Consumed (units)",
            width: 160,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={600} color="primary.main" sx={{ fontSize: "0.8125rem" }}>
                    {params.value != null ? params.value.toLocaleString() : "—"}
                </Typography>
            ),
        },
    ], []);

    const filteredUsage = useMemo(() => {
        if (!search.trim()) return usage;
        const term = search.toLowerCase();
        return usage.filter((u) => {
            const dateStr = u.readingDate ? new Date(u.readingDate).toLocaleDateString() : "";
            return (
                dateStr.toLowerCase().includes(term) ||
                String(u.unitsConsumed || "").includes(term) ||
                String(u.currentReading || "").includes(term) ||
                String(u.previousReading || "").includes(term)
            );
        });
    }, [usage, search]);

    const handleExport = () => {
        if (!usage || usage.length === 0) return;
        
        const headers = ["Date", "Previous Reading", "Current Reading", "Units Consumed"];
        const csvContent = [
            headers.join(","),
            ...usage.map(row => [
                row.readingDate,
                row.previousReading,
                row.currentReading,
                row.unitsConsumed
            ].join(","))
        ].join("\n");
        
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `HydroSync-Usage-${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const memoizedToolbar = useMemo(() => (
        <TableToolbar 
            searchPlaceholder="Search usage records..."
            onSearch={setSearch}
            filterOptions={[{ label: "Month", value: "month" }, { label: "Year", value: "year" }]}
            onFilter={() => {}}
            onExport={handleExport}
        />
    ), [usage]);

    return (
        <DashboardLayout>
            <PageHeader 
                title="Water Usage History" 
                subtitle="Track your water consumption trends over time" 
            />
            
            {/* KPI Summary Strip */}
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <AdminStatCard
                        title="Latest Consumption"
                        value={formatWaterUsage(latestUsage)}
                        icon={<WaterDropIcon />}
                        iconColor="info.main"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <AdminStatCard
                        title="Average Monthly"
                        value={formatWaterUsage(averageUsage)}
                        icon={<ShowChartIcon />}
                        iconColor="primary.main"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <AdminStatCard
                        title="Peak Consumption"
                        value={formatWaterUsage(peakUsage)}
                        icon={<SpeedIcon />}
                        iconColor="warning.main"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <AdminStatCard
                        title="Recorded Cycles"
                        value={usage.length}
                        icon={<EqualizerIcon />}
                        iconColor="success.main"
                    />
                </Grid>
            </Grid>

            <Box sx={{ mb: 3 }}>
                <ChartCard 
                    title="Monthly Consumption Trends" 
                    data={chartData} 
                    type={CHART_CONFIG.WATER_CONSUMPTION.type} 
                    color={CHART_CONFIG.WATER_CONSUMPTION.color}
                />
            </Box>

            <WidgetContainer title="Usage Records">
                {memoizedToolbar}
                <Box sx={{ mt: 3, height: 400 }}>
                    <DataGrid 
                        rows={filteredUsage}
                        columns={columns}
                        loading={loading}
                        error={error}
                        onRetry={loadUsage}
                    />
                </Box>
            </WidgetContainer>
        </DashboardLayout>
    );
}

export default UsagePage;
