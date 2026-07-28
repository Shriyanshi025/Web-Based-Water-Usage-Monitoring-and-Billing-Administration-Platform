import React from "react";
import {
    Box,
    Paper,
    Typography,
    Stack,
    Chip,
    Button,
    useTheme,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ShieldCheckIcon from "@mui/icons-material/ShieldOutlined";
import { resolveColor, safeAlpha } from "../../helpers/colorHelper";

/**
 * Helper to render icons consistently whether passed as:
 * - A React component reference: icon={WaterDropIcon}
 * - A React JSX element: icon={<WaterDropIcon />}
 */
const renderIcon = (iconSymbol, sxProps = { fontSize: "1rem" }) => {
    if (!iconSymbol) return null;
    if (React.isValidElement(iconSymbol)) {
        return React.cloneElement(iconSymbol, {
            sx: { ...sxProps, ...(iconSymbol.props.sx || {}) },
        });
    }
    if (typeof iconSymbol === "function" || typeof iconSymbol === "object") {
        const IconComp = iconSymbol;
        return <IconComp sx={sxProps} />;
    }
    return null;
};

/**
 * DashboardHero — Hero Analytics Panel for SaaS Dashboard Primary Focus
 */
const DashboardHero = ({
    title,
    subtitle,
    tag,
    badge = "OVERVIEW",
    primaryMetric,
    primaryValue,
    primaryLabel,
    secondaryMetrics,
    metrics = [],
    actionLabel,
    onAction,
    statusText = "System Normal",
    statusColor = "success",
    icon,
}) => {
    const theme = useTheme();

    const displayBadge = tag || badge;
    const displayPrimary = primaryMetric !== undefined ? primaryMetric : primaryValue;
    const displayMetrics = secondaryMetrics || metrics;

    return (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: "14px",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                boxShadow: "0 4px 20px rgba(12, 25, 41, 0.04)",
                position: "relative",
                overflow: "hidden",
                transition: "all 200ms ease-in-out",
                "&:hover": {
                    boxShadow: "0 8px 30px rgba(12, 25, 41, 0.08)",
                },
                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "3px",
                    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                },
            }}
        >
            <Stack spacing={2.5}>
                {/* Top Bar: Tag, Title & Action */}
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    sx={{
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", sm: "center" },
                    }}
                >
                    <Box sx={{ minWidth: 0 }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5 }}>
                            {icon && (
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: 28,
                                        height: 28,
                                        borderRadius: "6px",
                                        bgcolor: safeAlpha(theme, "primary.main", 0.1),
                                        color: "primary.main",
                                    }}
                                >
                                    {renderIcon(icon, { fontSize: "1rem" })}
                                </Box>
                            )}
                            <Chip
                                label={displayBadge}
                                size="small"
                                sx={{
                                    height: 20,
                                    fontSize: "0.65rem",
                                    fontWeight: 800,
                                    letterSpacing: "0.6px",
                                    bgcolor: safeAlpha(theme, "primary.main", 0.1),
                                    color: "primary.main",
                                    borderRadius: "4px",
                                }}
                            />
                            {statusText && (
                                <Chip
                                    icon={<ShieldCheckIcon sx={{ fontSize: "0.75rem !important" }} />}
                                    label={statusText}
                                    size="small"
                                    color={statusColor}
                                    variant="outlined"
                                    sx={{
                                        height: 20,
                                        fontSize: "0.65rem",
                                        fontWeight: 700,
                                        borderRadius: "4px",
                                    }}
                                />
                            )}
                        </Stack>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: "text.primary", letterSpacing: "-0.3px" }}>
                            {title}
                        </Typography>
                        {subtitle && (
                            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25, fontSize: "0.85rem" }}>
                                {subtitle}
                            </Typography>
                        )}
                    </Box>

                    {actionLabel && (
                        <Button
                            variant="outlined"
                            size="small"
                            color="primary"
                            endIcon={<ArrowForwardIcon sx={{ fontSize: "0.9rem" }} />}
                            onClick={onAction}
                            sx={{
                                borderRadius: "8px",
                                textTransform: "none",
                                fontWeight: 700,
                                fontSize: "0.8125rem",
                                px: 2,
                                whiteSpace: "nowrap",
                            }}
                        >
                            {actionLabel}
                        </Button>
                    )}
                </Stack>

                {/* Primary Metric & Secondary Details */}
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={3}
                    sx={{
                        pt: 1,
                        borderTop: "1px solid",
                        borderColor: "divider",
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", md: "baseline" },
                    }}
                >
                    {/* Primary Highlight */}
                    {displayPrimary !== undefined && (
                        <Box sx={{ flexShrink: 0 }}>
                            <Typography
                                variant="caption"
                                sx={{
                                    textTransform: "uppercase",
                                    letterSpacing: "0.8px",
                                    fontWeight: 700,
                                    fontSize: "0.7rem",
                                    color: "text.secondary",
                                    display: "block",
                                    mb: 0.5,
                                }}
                            >
                                {primaryLabel || "PRIMARY METRIC"}
                            </Typography>
                            <Typography
                                variant="h3"
                                sx={{
                                    fontWeight: 900,
                                    color: "text.primary",
                                    letterSpacing: "-1px",
                                    lineHeight: 1.1,
                                    fontSize: { xs: "1.75rem", sm: "2.25rem" },
                                }}
                            >
                                {displayPrimary}
                            </Typography>
                        </Box>
                    )}

                    {/* Secondary Metrics Strip */}
                    {displayMetrics && displayMetrics.length > 0 && (
                        <Stack
                            direction="row"
                            sx={{
                                flexWrap: "wrap",
                                gap: { xs: 2, sm: 3.5 },
                                flexGrow: 1,
                                alignItems: "center",
                                justifyContent: { xs: "flex-start", md: "flex-end" },
                            }}
                        >
                            {displayMetrics.map((item, idx) => {
                                const itemColor = resolveColor(theme, item.color || "text.primary");
                                return (
                                    <Box key={idx} sx={{ minWidth: 100 }}>
                                        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                                            {item.icon && (
                                                <Box sx={{ color: "text.secondary", display: "inline-flex" }}>
                                                    {renderIcon(item.icon, { fontSize: "0.85rem" })}
                                                </Box>
                                            )}
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontSize: "0.7rem",
                                                    fontWeight: 600,
                                                    color: "text.secondary",
                                                    display: "block",
                                                }}
                                            >
                                                {item.label}
                                            </Typography>
                                        </Stack>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 800,
                                                color: itemColor,
                                                fontSize: "1.1rem",
                                                lineHeight: 1.3,
                                            }}
                                        >
                                            {item.value}
                                        </Typography>
                                        {item.trend && (
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontSize: "0.6875rem",
                                                    color: String(item.trend).startsWith("+") ? "success.main" : "text.secondary",
                                                    fontWeight: 700,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 0.25,
                                                }}
                                            >
                                                <TrendingUpIcon sx={{ fontSize: "0.75rem" }} />
                                                {item.trend}
                                            </Typography>
                                        )}
                                    </Box>
                                );
                            })}
                        </Stack>
                    )}
                </Stack>
            </Stack>
        </Paper>
    );
};

export default React.memo(DashboardHero);
