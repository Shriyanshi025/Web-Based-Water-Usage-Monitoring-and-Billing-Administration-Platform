import React from "react";
import { Box, Typography, Stack, Skeleton } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import WidgetContainer from "./WidgetContainer";
import EmptyState from "../common/EmptyState";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SpeedIcon from "@mui/icons-material/Speed";
import HistoryIcon from "@mui/icons-material/History";
import BuildIcon from "@mui/icons-material/Build";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import NotificationsIcon from "@mui/icons-material/Notifications";
import HistoryToggleOffIcon from "@mui/icons-material/HistoryToggleOff";

// ─── Icon resolver ────────────────────────────────────────────────────────────
const renderIcon = (iconName) => {
    switch (iconName) {
        case "WaterDropIcon":       return <WaterDropIcon />;
        case "ReceiptIcon":         return <ReceiptIcon />;
        case "SpeedIcon":           return <SpeedIcon />;
        case "HistoryIcon":         return <HistoryIcon />;
        case "BuildIcon":           return <BuildIcon />;
        case "PendingActionsIcon":  return <PendingActionsIcon />;
        case "AttachMoneyIcon":     return <AttachMoneyIcon />;
        default:                    return <NotificationsIcon />;
    }
};

// ─── Loading skeleton ─────────────────────────────────────────────────────────
const TimelineSkeleton = ({ count = 4 }) => (
    <Box>
        {Array.from({ length: count }).map((_, i) => (
            <Stack key={i} direction="row" spacing={1.5} sx={{ mb: i < count - 1 ? 2.5 : 0 }}>
                <Skeleton
                    variant="rounded"
                    width={32}
                    height={32}
                    sx={{ borderRadius: "8px", flexShrink: 0 }}
                />
                <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="55%" height={14} sx={{ mb: 0.5 }} />
                    <Skeleton variant="text" width="80%" height={12} sx={{ mb: 0.25 }} />
                    <Skeleton variant="text" width="35%" height={11} />
                </Box>
            </Stack>
        ))}
    </Box>
);

// ─── Single timeline item ─────────────────────────────────────────────────────
const TimelineItem = ({ item, isLast }) => {
    const theme = useTheme();

    // Resolve palette color from string key like "primary", "info", "success" …
    const base = theme.palette[item.color] || theme.palette.primary;
    const resolvedColor = typeof base.main === "string"
        ? base.main
        : theme.palette.primary.main;

    return (
        <Stack
            direction="row"
            spacing={1.5}
            sx={{ position: "relative", pb: isLast ? 0 : 2.5 }}
        >
            {/* Connector line — runs from bottom of icon down to next item */}
            {!isLast && (
                <Box
                    sx={{
                        position: "absolute",
                        top: 32,     // icon height
                        bottom: 0,
                        left: 15,    // (32 / 2) - (2 / 2)
                        width: 2,
                        bgcolor: "divider",
                        zIndex: 0,
                    }}
                />
            )}

            {/* Icon mark */}
            <Box sx={{ zIndex: 1, flexShrink: 0 }}>
                <Box
                    sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "8px",
                        bgcolor: alpha(resolvedColor, 0.10),
                        color: resolvedColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        "& .MuiSvgIcon-root": { fontSize: "1rem" },
                    }}
                >
                    {typeof item.icon === "string" ? renderIcon(item.icon) : item.icon}
                </Box>
            </Box>

            {/* Text content */}
            <Box sx={{ pt: 0.5, flex: 1, minWidth: 0 }}>
                <Typography
                    sx={{
                        fontWeight: 600,
                        fontSize: "0.8125rem",
                        color: "text.primary",
                        lineHeight: 1.35,
                        mb: 0.25,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                >
                    {item.title}
                </Typography>
                {item.description && (
                    <Typography
                        sx={{
                            fontSize: "0.75rem",
                            color: "text.secondary",
                            lineHeight: 1.4,
                            mb: 0.25,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {item.description}
                    </Typography>
                )}
                <Typography
                    sx={{
                        fontSize: "0.6875rem",
                        color: "text.disabled",
                        lineHeight: 1.3,
                    }}
                >
                    {item.time}
                </Typography>
            </Box>
        </Stack>
    );
};

/**
 * TimelineWidget — recent activities feed inside WidgetContainer.
 *
 * @param {Object}   props
 * @param {string}   [props.title]
 * @param {Array}    props.activities   - [{ id, title, description, time, icon, color }]
 * @param {boolean}  [props.loading]
 * @param {string}   [props.error]
 * @param {boolean}  [props.empty]
 * @param {number}   [props.maxHeight]  - scrollable list max height px (default 360)
 */
const TimelineWidget = ({
    title,
    activities = [],
    loading,
    error,
    empty,
    maxHeight = 360,
}) => {
    const hasActivities = activities.length > 0;

    return (
        <WidgetContainer
            title={title}
            loading={loading}
            error={error}
            empty={false}   /* handled locally for contextual messaging */
            sx={{ height: "100%" }}
        >
            {/* ── Inline loading skeleton ── */}
            {loading ? (
                <TimelineSkeleton count={4} />
            ) : (!hasActivities || empty) ? (
                /* Contextual empty state */
                <EmptyState
                    title="No recent activity"
                    message="Your activity feed will appear here once you start using water services."
                    icon={<HistoryToggleOffIcon />}
                />
            ) : (
                /* Scrollable activity list */
                <Box
                    sx={{
                        overflowY: "auto",
                        maxHeight,
                        pr: 0.5,
                        "&::-webkit-scrollbar": { width: 4 },
                        "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
                        "&::-webkit-scrollbar-thumb": {
                            bgcolor: "divider",
                            borderRadius: 2,
                        },
                    }}
                >
                    {activities.map((item, index) => (
                        <TimelineItem
                            key={item.id ?? index}
                            item={item}
                            isLast={index === activities.length - 1}
                        />
                    ))}
                </Box>
            )}
        </WidgetContainer>
    );
};

export default React.memo(TimelineWidget);
