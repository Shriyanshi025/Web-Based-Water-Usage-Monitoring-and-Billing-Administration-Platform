import { useEffect, useState } from "react";

import DashboardLayout from "../../components/layout/DashboardLayout";

import { getMainDashboard } from "../../services/DashboardService";

import {
    Alert,
    CircularProgress,
    Grid,
    Paper,
    Typography,
} from "@mui/material";

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

        }

        catch (err) {

            setError(

                err.response?.data?.message ||

                "Unable to load dashboard."

            );

        }

        finally {

            setLoading(false);

        }

    };

    if (loading) {

        return (

            <DashboardLayout>

                <CircularProgress />

            </DashboardLayout>

        );

    }

    return (

        <DashboardLayout>

            <Typography
                variant="h4"
                fontWeight="bold"
                mb={4}
            >
                Main Admin Dashboard
            </Typography>

            {error &&

                <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                >
                    {error}
                </Alert>

            }

            <Grid container spacing={3}>

                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h3">
                            {dashboard.totalCommunities}
                        </Typography>

                        <Typography>
                            Communities
                        </Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h3">
                            {dashboard.totalBlocks}
                        </Typography>

                        <Typography>
                            Blocks
                        </Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h3">
                            {dashboard.totalUnits}
                        </Typography>

                        <Typography>
                            Units
                        </Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h3">
                            {dashboard.totalResidents}
                        </Typography>

                        <Typography>
                            Residents
                        </Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h3">
                            {dashboard.totalWaterMeters}
                        </Typography>

                        <Typography>
                            Water Meters
                        </Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h3">
                            {dashboard.totalWaterReadings}
                        </Typography>

                        <Typography>
                            Readings
                        </Typography>
                    </Paper>
                </Grid>

            </Grid>

        </DashboardLayout>

    );

}

export default MainAdminDashboard;