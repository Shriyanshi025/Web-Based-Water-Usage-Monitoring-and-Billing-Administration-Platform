import React from "react";
import { Box, Stack, Grid } from "@mui/material";

/**
 * DashboardOverview — Grid & Stack Container for SaaS Dashboard Analytics
 * 
 * Arranges Hero panel, Insight cards, and Quick Actions with visual hierarchy.
 */
const DashboardOverview = ({ hero, insights = [], children }) => {
    return (
        <Stack spacing={2.5} sx={{ mb: 3 }}>
            {/* Hero Operational / Platform Focus Panel */}
            {hero && <Box>{hero}</Box>}

            {/* Secondary Insights & Metrics Grid */}
            {insights && insights.length > 0 && (
                <Grid container spacing={2}>
                    {insights.map((insight, idx) => (
                        <Grid
                            size={{
                                xs: 12,
                                sm: insights.length === 1 ? 12 : 6,
                                md: insights.length === 4 ? 3 : insights.length === 3 ? 4 : 6,
                            }}
                            key={idx}
                        >
                            {insight}
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Custom Content Slot */}
            {children}
        </Stack>
    );
};

export default React.memo(DashboardOverview);
