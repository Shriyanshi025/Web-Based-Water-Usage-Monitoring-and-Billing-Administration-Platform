import React from "react";
import { Box, Typography, IconButton, Tooltip, Stack, Chip } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import SkeletonCard from "../common/SkeletonCard";
import ErrorState from "../common/ErrorState";
import EmptyState from "../common/EmptyState";

/**
 * Reusable WidgetContainer — consistent card shell for all dashboard widgets.
 */
const WidgetContainer = ({
    title,
    subtitle,
    badge,
    children,
    loading = false,
    error = null,
    empty = false,
    onRefresh,
    onExport,
    action,
    sx = {},
    bodyPadding,
}) => {
    if (loading) return <SkeletonCard />;

    return (
        <Box
            sx={{
                bgcolor: "background.paper",
                borderRadius: "12px",
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "0 1px 4px rgba(12, 25, 41, 0.05), 0 1px 2px rgba(12, 25, 41, 0.03)",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                overflow: "hidden",
                transition: "box-shadow 200ms ease",
                "&:hover": {
                    boxShadow: "0 4px 16px rgba(12, 25, 41, 0.08)",
                },
                ...sx,
            }}
        >
            {/* ── Card header ── */}
            {(title || action || onRefresh || onExport) && (
                <Stack
                    direction="row"
                    sx={{
                        justifyContent: "space-between",
                        alignItems: "center",
                        px: 3,
                        py: 1.75,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        minHeight: 56,
                        flexShrink: 0,
                        gap: 1.5,
                    }}
                >
                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                        {title && (
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: "0.9375rem",
                                        color: "text.primary",
                                        lineHeight: 1.4,
                                        letterSpacing: "-0.1px",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                >
                                    {title}
                                </Typography>
                                {badge !== undefined && (
                                    <Chip
                                        label={badge}
                                        size="small"
                                        sx={{
                                            height: 20,
                                            fontSize: "0.6875rem",
                                            fontWeight: 600,
                                            bgcolor: "action.selected",
                                            color: "text.secondary",
                                            "& .MuiChip-label": { px: 0.75 },
                                        }}
                                    />
                                )}
                            </Stack>
                        )}
                        {subtitle && (
                            <Typography
                                sx={{
                                    fontSize: "0.75rem",
                                    color: "text.disabled",
                                    lineHeight: 1.3,
                                    mt: 0.25,
                                }}
                            >
                                {subtitle}
                            </Typography>
                        )}
                    </Box>

                    <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", flexShrink: 0 }}>
                        {action}
                        {onRefresh && (
                            <Tooltip title="Refresh" arrow>
                                <IconButton
                                    size="small"
                                    onClick={onRefresh}
                                    aria-label="Refresh widget"
                                    sx={{ borderRadius: "6px", color: "text.secondary", "&:hover": { color: "text.primary" } }}
                                >
                                    <RefreshIcon sx={{ fontSize: "1rem" }} />
                                </IconButton>
                            </Tooltip>
                        )}
                        {onExport && (
                            <Tooltip title="Export data" arrow>
                                <IconButton
                                    size="small"
                                    onClick={onExport}
                                    aria-label="Export widget data"
                                    sx={{ borderRadius: "6px", color: "text.secondary", "&:hover": { color: "text.primary" } }}
                                >
                                    <FileDownloadIcon sx={{ fontSize: "1rem" }} />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Stack>
                </Stack>
            )}

            {/* ── Card body ── */}
            <Box
                sx={{
                    p: bodyPadding !== undefined ? bodyPadding : "20px 24px",
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "auto",
                    minHeight: 0,
                }}
            >
                {error ? (
                    <ErrorState message={error} onRetry={onRefresh} />
                ) : empty ? (
                    <EmptyState
                        title="No data available"
                        message="There is no data to display for this widget."
                    />
                ) : (
                    children
                )}
            </Box>
        </Box>
    );
};

export default React.memo(WidgetContainer);
