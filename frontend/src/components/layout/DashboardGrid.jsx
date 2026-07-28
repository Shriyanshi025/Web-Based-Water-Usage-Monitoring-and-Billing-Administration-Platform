import React, { memo } from "react";
import { Grid, Box, Stack } from "@mui/material";
import PageHeader from "../common/PageHeader";

/**
 * DashboardGrid — shared shell used by CommunityDashboard and MainAdminDashboard.
 * 
 * Top analytics remain unchanged in kpiCards.
 * All main content sections below stack as full-width enterprise sections.
 */
const DashboardGrid = ({
    headerTitle,
    headerSubtitle,
    headerAction,
    kpiCards,
    sections,
    leftColumn,
    rightColumn,
    quickActions,
}) => {
    // Combine leftColumn and rightColumn or custom sections into full-width stacked sections
    const contentSections = sections || [
        ...(leftColumn ? (Array.isArray(leftColumn) ? leftColumn : [leftColumn]) : []),
        ...(rightColumn ? (Array.isArray(rightColumn) ? rightColumn : [rightColumn]) : []),
    ];

    return (
        <Box>
            {/* Page Header */}
            {headerTitle && (
                <PageHeader
                    title={headerTitle}
                    subtitle={headerSubtitle}
                    action={headerAction}
                />
            )}

            {/* Top Analytics Hero Overview (Unchanged) */}
            {kpiCards && (
                <Box sx={{ mb: 3 }}>
                    {Array.isArray(kpiCards) ? (
                        <Grid container spacing={2.5}>
                            {kpiCards.map((card, index) => (
                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={`kpi-${index}`}>
                                    {card}
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        kpiCards
                    )}
                </Box>
            )}

            {/* Main Content — Full-Width Enterprise Sections */}
            {contentSections && contentSections.length > 0 && (
                <Stack spacing={3} sx={{ mb: 3 }}>
                    {contentSections.map((section, index) => (
                        <Box key={`section-${index}`} sx={{ width: "100%" }}>
                            {section}
                        </Box>
                    ))}
                </Stack>
            )}

            {/* Quick Actions */}
            {quickActions && quickActions.length > 0 && (
                <Box sx={{ mt: 1 }}>
                    <PageHeader title="Quick Actions" />
                    <Grid container spacing={2.5}>
                        {quickActions.map((action, index) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }} key={`quick-action-${index}`}>
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
