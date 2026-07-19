import React, { memo } from "react";
import { Grid, Box } from "@mui/material";
import PageHeader from "../common/PageHeader";

/**
 * DashboardGrid — shared shell used by CommunityDashboard and MainAdminDashboard.
 * Resident dashboard (UserDashboard) composes its own layout directly.
 *
 * @param {Object}           props
 * @param {string}           [props.headerTitle]
 * @param {string}           [props.headerSubtitle]
 * @param {React.ReactNode}  [props.headerAction]
 * @param {React.ReactNode[]} [props.kpiCards]
 * @param {React.ReactNode[]} [props.leftColumn]
 * @param {React.ReactNode[]} [props.rightColumn]
 * @param {React.ReactNode[]} [props.quickActions]
 */
const DashboardGrid = ({
    headerTitle,
    headerSubtitle,
    headerAction,
    kpiCards,
    leftColumn,
    rightColumn,
    quickActions,
}) => {
    return (
        <Box>
            {/* Page Header */}
            <PageHeader
                title={headerTitle}
                subtitle={headerSubtitle}
                action={headerAction}
            />

            {/* KPI Cards */}
            {kpiCards && kpiCards.length > 0 && (
                <Grid container spacing={2.5} sx={{ mb: 3 }}>
                    {kpiCards.map((card, index) => (
                        <Grid item xs={12} sm={6} md={4} lg={4} key={`kpi-${index}`}>
                            {card}
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Main Content — left (wider) + right (narrower) columns */}
            {(leftColumn || rightColumn) && (
                <Grid container spacing={2.5} sx={{ mb: 3 }}>
                    {leftColumn && (
                        <Grid item xs={12} lg={8}>
                            <Grid container spacing={2.5}>
                                {React.Children.map(leftColumn, (child, index) => (
                                    <Grid item xs={12} key={`left-${index}`}>
                                        {child}
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>
                    )}

                    {rightColumn && (
                        <Grid item xs={12} lg={4}>
                            <Grid container spacing={2.5}>
                                {React.Children.map(rightColumn, (child, index) => (
                                    <Grid item xs={12} key={`right-${index}`}>
                                        {child}
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>
                    )}
                </Grid>
            )}

            {/* Quick Actions */}
            {quickActions && quickActions.length > 0 && (
                <Box sx={{ mt: 1 }}>
                    <PageHeader title="Quick Actions" />
                    <Grid container spacing={2.5}>
                        {quickActions.map((action, index) => (
                            <Grid item xs={12} sm={6} md={4} lg={4} key={`quick-action-${index}`}>
                                {action}
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}
        </Box>
    );
};

export default memo(DashboardGrid);
