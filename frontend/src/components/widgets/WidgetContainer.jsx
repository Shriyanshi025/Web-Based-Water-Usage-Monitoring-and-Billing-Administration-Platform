import React from "react";
import { Box, Typography, IconButton, Tooltip, Stack } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import SkeletonCard from "../common/SkeletonCard";
import ErrorState from "../common/ErrorState";
import EmptyState from "../common/EmptyState";

/**
 * Reusable WidgetContainer — consistent card shell for all dashboard widgets.
 *
 * @param {Object}           props
 * @param {string}           [props.title]
 * @param {React.ReactNode}  props.children
 * @param {boolean}          [props.loading]
 * @param {string}           [props.error]
 * @param {boolean}          [props.empty]
 * @param {function}         [props.onRefresh]
 * @param {function}         [props.onFullscreen]
 * @param {function}         [props.onExport]
 * @param {React.ReactNode}  [props.action]  - Custom header action slot
 * @param {object}           [props.sx]      - sx overrides on the outer Box
 */
const WidgetContainer = ({
    title,
    children,
    loading = false,
    error = null,
    empty = false,
    onRefresh,
    onFullscreen,
    onExport,
    action,
    sx = {},
}) => {
    if (loading) return <SkeletonCard />;

    return (
        <Box
            sx={{
                bgcolor: "background.paper",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "0 1px 3px rgba(12, 25, 41, 0.06), 0 1px 2px rgba(12, 25, 41, 0.04)",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                overflow: "hidden",
                transition: "box-shadow 180ms cubic-bezier(0.16, 1, 0.3, 1)",
                "&:hover": {
                    boxShadow: "0 4px 12px rgba(12, 25, 41, 0.08)",
                },
                ...sx,
            }}
        >
            {/* ── Card header ── */}
            {(title || action || onRefresh || onExport || onFullscreen) && (
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                        px: 3,
                        py: 1.5,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        minHeight: 52,
                        flexShrink: 0,
                    }}
                >
                    {title && (
                        <Typography
                            sx={{
                                fontWeight: 600,
                                fontSize: "0.9375rem",
                                color: "text.primary",
                                lineHeight: 1.4,
                                flexGrow: 1,
                                mr: 1,
                            }}
                        >
                            {title}
                        </Typography>
                    )}

                    <Stack direction="row" spacing={0.5} alignItems="center" flexShrink={0}>
                        {action}
                        {onRefresh && (
                            <Tooltip title="Refresh" arrow>
                                <IconButton
                                    size="small"
                                    onClick={onRefresh}
                                    aria-label="Refresh widget"
                                    sx={{ borderRadius: "6px" }}
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
                                    sx={{ borderRadius: "6px" }}
                                >
                                    <FileDownloadIcon sx={{ fontSize: "1rem" }} />
                                </IconButton>
                            </Tooltip>
                        )}
                        {onFullscreen && (
                            <Tooltip title="Fullscreen" arrow>
                                <IconButton
                                    size="small"
                                    onClick={onFullscreen}
                                    aria-label="Toggle fullscreen"
                                    sx={{ borderRadius: "6px" }}
                                >
                                    <FullscreenIcon sx={{ fontSize: "1rem" }} />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Stack>
                </Stack>
            )}

            {/* ── Card body ── */}
            <Box
                sx={{
                    p: "16px 24px",
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
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
