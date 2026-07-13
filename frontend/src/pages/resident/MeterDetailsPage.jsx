import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import WidgetContainer from "../../components/widgets/WidgetContainer";
import ErrorState from "../../components/common/ErrorState";
import LoadingScreen from "../../components/common/LoadingScreen";
import { Grid, Typography, Stack, Box, Chip } from "@mui/material";
import { CHART_CONFIG } from "../../constants/dashboardConfig";
import { getMyMeterDetails, getMyUsageHistory } from "../../services/ResidentOpsService";

function MeterDetailsPage() {
    const [meter, setMeter] = useState(null);
    const [readings, setReadings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const [meterRes, usageRes] = await Promise.all([
                getMyMeterDetails(),
                getMyUsageHistory()
            ]);
            setMeter(meterRes);
            setReadings(usageRes || []);
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to load meter details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    if (loading) {
        return (
            <DashboardLayout>
                <LoadingScreen />
            </DashboardLayout>
        );
    }

    if (error && !meter) {
        return (
            <DashboardLayout>
                <ErrorState message={error} onRetry={loadData} />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <PageHeader 
                title="Meter Details" 
                subtitle="View your water meter status and technical specifications" 
            />
            
            <Grid container spacing={3} justifyContent="center" direction="column" alignItems="center">
                <Grid item xs={12} md={10} lg={8} sx={{ width: '100%', maxWidth: '800px !important' }}>
                    <WidgetContainer title="Meter Specifications">
                        {meter ? (
                            <Stack spacing={2} sx={{ p: 2, minHeight: '250px' }}>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography color="textSecondary">Meter Number:</Typography>
                                    <Typography fontWeight="bold">{meter.meterNumber}</Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography color="textSecondary">Current Reading:</Typography>
                                    <Typography fontWeight="bold">{meter.currentReading} units</Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography color="textSecondary">Status:</Typography>
                                    <Chip 
                                        label={meter.meterStatus} 
                                        color={meter.meterStatus === 'ACTIVE' ? 'success' : 'error'} 
                                        size="small" 
                                    />
                                </Box>
                            </Stack>
                        ) : (
                            <Typography>No meter assigned.</Typography>
                        )}
                    </WidgetContainer>
                </Grid>
                <Grid item xs={12} md={10} lg={8} sx={{ width: '100%', maxWidth: '800px !important' }}>
                    <WidgetContainer title="Recent Readings">
                        <Stack spacing={2} sx={{ p: 2, flex: 1, overflowY: 'auto', minHeight: '250px' }}>
                            {readings.length > 0 ? readings.slice(0, 5).map(r => (
                                <Box key={r.id} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                                    <Typography variant="body2" color="textSecondary">{r.readingDate}</Typography>
                                    <Typography variant="body1">Consumed: {r.unitsConsumed} units</Typography>
                                </Box>
                            )) : (
                                <Typography>No recent readings to display.</Typography>
                            )}
                        </Stack>
                    </WidgetContainer>
                </Grid>
            </Grid>
        </DashboardLayout>
    );
}

export default MeterDetailsPage;
