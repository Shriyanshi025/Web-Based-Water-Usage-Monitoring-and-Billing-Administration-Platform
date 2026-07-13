import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import WidgetContainer from "../../components/widgets/WidgetContainer";
import TableToolbar from "../../components/common/TableToolbar";
import EmptyState from "../../components/common/EmptyState";
import DataGrid from "../../components/common/DataGrid";
import ChartCard from "../../components/widgets/ChartCard";
import { Box, Grid } from "@mui/material";
import { CHART_CONFIG, EMPTY_STATE_CONFIG } from "../../constants/dashboardConfig";
import { getMyUsageHistory } from "../../services/ResidentOpsService";

function UsagePage() {
    const [usage, setUsage] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    const chartData = useMemo(() => {
        return usage.map(u => ({
            name: new Date(u.readingDate).toLocaleString('default', { month: 'short' }),
            value: u.unitsConsumed
        })).reverse(); // Assuming descending order from API
    }, [usage]);

    const columns = useMemo(() => [
        { field: "readingDate", headerName: "Date", width: 150 },
        { field: "previousReading", headerName: "Previous Reading", width: 180 },
        { field: "currentReading", headerName: "Current Reading", width: 180 },
        { field: "unitsConsumed", headerName: "Units Consumed", width: 180 },
    ], []);

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
        link.setAttribute("download", "usage_records.csv");
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const memoizedToolbar = useMemo(() => (
        <TableToolbar 
            searchPlaceholder="Search usage records..."
            onSearch={() => {}}
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
            
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12}>
                    <ChartCard 
                        title="Monthly Consumption Trends" 
                        data={chartData} 
                        type={CHART_CONFIG.WATER_CONSUMPTION.type} 
                        color={CHART_CONFIG.WATER_CONSUMPTION.color}
                    />
                </Grid>
            </Grid>

            <WidgetContainer title="Usage Records">
                {memoizedToolbar}
                <Box sx={{ mt: 3, height: 400 }}>
                    <DataGrid 
                        rows={usage}
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
