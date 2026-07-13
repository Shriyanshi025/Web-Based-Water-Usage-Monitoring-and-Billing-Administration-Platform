import React from "react";
import { Box, Typography, IconButton, Tooltip, Stack } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import SkeletonCard from "../common/SkeletonCard";
import ErrorState from "../common/ErrorState";
import EmptyState from "../common/EmptyState";
import { motion } from "framer-motion";

/**
 * Reusable WidgetContainer for dashboard cards
 * @param {Object} props
 * @param {string} props.title
 * @param {React.ReactNode} props.children
 * @param {boolean} [props.loading]
 * @param {string} [props.error]
 * @param {boolean} [props.empty]
 * @param {function} [props.onRefresh]
 * @param {function} [props.onFullscreen] (future)
 * @param {function} [props.onExport] (future)
 * @param {React.ReactNode} [props.action] Custom header action
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
    sx = {}
}) => {
    if (loading) return <SkeletonCard />;

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            sx={{
                bgcolor: "background.paper",
                borderRadius: 3,
                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.03)",
                border: "1px solid",
                borderColor: "divider",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                overflow: "hidden",
                transition: "box-shadow 0.2s ease-in-out",
                "&:hover": {
                    boxShadow: "0px 6px 24px rgba(0, 0, 0, 0.06)",
                },
                ...sx
            }}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={600} color="text.primary">
                    {title}
                </Typography>
                <Stack direction="row" spacing={1}>
                    {action}
                    {onRefresh && (
                        <Tooltip title="Refresh">
                            <IconButton size="small" onClick={onRefresh} aria-label="Refresh widget"><RefreshIcon fontSize="small" /></IconButton>
                        </Tooltip>
                    )}
                    {onExport && (
                        <Tooltip title="Export">
                            <IconButton size="small" onClick={onExport} aria-label="Export widget data"><FileDownloadIcon fontSize="small" /></IconButton>
                        </Tooltip>
                    )}
                    {onFullscreen && (
                        <Tooltip title="Fullscreen">
                            <IconButton size="small" onClick={onFullscreen} aria-label="Toggle widget fullscreen"><FullscreenIcon fontSize="small" /></IconButton>
                        </Tooltip>
                    )}
                </Stack>
            </Stack>

            <Box sx={{ p: 2, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                {error ? (
                    <ErrorState message={error} onRetry={onRefresh} />
                ) : empty ? (
                    <EmptyState title="No Data" message="No data available for this widget." />
                ) : (
                    children
                )}
            </Box>
        </Box>
    );
};

export default React.memo(WidgetContainer);
