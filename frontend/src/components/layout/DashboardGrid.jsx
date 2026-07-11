import React, { memo } from "react";
import { Grid, Box } from "@mui/material";
import { motion } from "framer-motion";
import PageHeader from "../common/PageHeader";

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const DashboardGrid = ({
    headerTitle,
    headerSubtitle,
    headerAction,
    kpiCards,
    leftColumn,
    rightColumn,
    quickActions
}) => {
    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
            {/* Welcome Header */}
            <motion.div variants={itemVariants}>
                <PageHeader 
                    title={headerTitle} 
                    subtitle={headerSubtitle}
                    action={headerAction}
                />
            </motion.div>

            {/* KPI Cards */}
            {kpiCards && kpiCards.length > 0 && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {kpiCards.map((card, index) => (
                        <Grid item xs={12} sm={6} md={4} lg={4} component={motion.div} variants={itemVariants} key={`kpi-${index}`}>
                            {card}
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Main Content Area */}
            {(leftColumn || rightColumn) && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {/* Left Column */}
                    {leftColumn && (
                        <Grid item xs={12} lg={8}>
                            <Grid container spacing={3}>
                                {React.Children.map(leftColumn, (child, index) => (
                                    <Grid item xs={12} component={motion.div} variants={itemVariants} key={`left-${index}`}>
                                        {child}
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>
                    )}

                    {/* Right Column */}
                    {rightColumn && (
                        <Grid item xs={12} lg={4}>
                            <Grid container spacing={3}>
                                {React.Children.map(rightColumn, (child, index) => (
                                    <Grid item xs={12} component={motion.div} variants={itemVariants} key={`right-${index}`}>
                                        {child}
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>
                    )}
                </Grid>
            )}

            {/* Quick Actions Grid */}
            {quickActions && quickActions.length > 0 && (
                <Box component={motion.div} variants={itemVariants}>
                    <PageHeader title="Quick Actions" />
                    <Grid container spacing={3}>
                        {quickActions.map((action, index) => (
                            <Grid item xs={12} sm={6} md={4} lg={4} key={`quick-action-${index}`}>
                                {action}
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}
        </motion.div>
    );
};

export default memo(DashboardGrid);
