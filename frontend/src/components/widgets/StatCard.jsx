import React from "react";
import { Box, Typography, Stack, Skeleton, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";

/**
 * AnimatedCounter — counts up from 0 to `value` using rAF.
 * For string values it renders directly.
 */
const AnimatedCounter = ({ value, formatValue }) => {
    const [count, setCount] = React.useState(0);

    React.useEffect(() => {
        if (typeof value !== "number") {
            setCount(value);
            return;
        }

        let startTime = null;
        const duration = 1200;
        const end = value;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            // Ease-out quart
            const easeOut = 1 - Math.pow(1 - progress, 4);
            setCount(end * easeOut);
            if (progress < 1) requestAnimationFrame(animate);
            else setCount(end);
        };

        requestAnimationFrame(animate);
    }, [value]);

    if (typeof value !== "number") return <>{value}</>;
    return <>{formatValue ? formatValue(count) : Math.round(count).toLocaleString()}</>;
};

// ─── Shared card shell sx ────────────────────────────────────────────────────
const cardShell = {
    p: "20px 24px",
    bgcolor: "background.paper",
    borderRadius: 2,
    border: "1px solid",
    borderColor: "divider",
    boxShadow: "0 1px 3px rgba(12, 25, 41, 0.06), 0 1px 2px rgba(12, 25, 41, 0.04)",
    height: "100%",
    transition: "box-shadow 180ms cubic-bezier(0.16, 1, 0.3, 1)",
    "&:hover": {
        boxShadow: "0 4px 12px rgba(12, 25, 41, 0.08)",
    },
};

/**
 * StatCard — top-level KPI card.
 *
 * Layout (top → bottom):
 *   Row:  [icon avatar]          [optional trend badge]
 *         [value]
 *         [title / label]
 *         [trend label text]
 *
 * @param {Object}           props
 * @param {string}           props.title
 * @param {string|number}    props.value
 * @param {React.ReactNode}  props.icon
 * @param {string}           [props.color="primary.main"] - Resolved theme color path
 * @param {number}           [props.trend]      - % change (positive or negative)
 * @param {string}           [props.trendLabel] - e.g. "vs last month"
 * @param {function}         [props.formatValue]
 * @param {boolean}          [props.loading]
 * @param {string}           [props.error]
 * @param {boolean}          [props.empty]
 */
const StatCard = ({
    title,
    value,
    icon,
    color = "primary.main",
    trend,
    trendLabel,
    formatValue,
    loading,
    error,
    empty,
    onClick,
}) => {
    const theme = useTheme();

    // Resolve color path string → actual hex from theme palette
    const resolveColor = (colorPath) => {
        const keys = colorPath.split(".");
        let resolved = theme.palette;
        for (const k of keys) {
            resolved = resolved?.[k];
        }
        return typeof resolved === "string" ? resolved : theme.palette.primary.main;
    };

    const resolvedColor = resolveColor(color);

    // ── Loading ──────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <Box sx={{ ...cardShell, "&:hover": undefined }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: "8px" }} />
                    <Skeleton variant="text" width="30%" height={20} />
                </Stack>
                <Skeleton variant="text" width="50%" height={36} sx={{ mb: 0.5 }} />
                <Skeleton variant="text" width="65%" height={16} />
            </Box>
        );
    }

    // ── Error ────────────────────────────────────────────────────────────────
    if (error) {
        return (
            <Box sx={{ ...cardShell, borderColor: "error.main" }}>
                <Typography variant="body2" color="error.main" fontWeight={500}>
                    {error}
                </Typography>
            </Box>
        );
    }

    // ── Empty ────────────────────────────────────────────────────────────────
    if (empty) {
        return (
            <Box sx={cardShell}>
                <Typography variant="body2" color="text.disabled">
                    No data available
                </Typography>
            </Box>
        );
    }

    // ── Trend visuals ────────────────────────────────────────────────────────
    const trendUp    = trend > 0;
    const trendDown  = trend < 0;
    const trendFlat  = trend === 0;
    const trendColor = trendUp ? "success.main" : trendDown ? "error.main" : "text.secondary";
    const TrendIcon  = trendUp ? TrendingUpIcon : trendDown ? TrendingDownIcon : TrendingFlatIcon;

    return (
        <Box 
            sx={{ 
                ...cardShell,
                cursor: onClick ? "pointer" : "default",
                transition: "transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease",
                "&:hover": {
                    boxShadow: "0 4px 12px rgba(12, 25, 41, 0.08)",
                    transform: onClick ? "translateY(-2px)" : "none",
                    borderColor: onClick ? "primary.light" : "divider"
                }
            }}
            onClick={onClick}
        >
            {/* ── Top row: icon mark + trend badge ── */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                {/* Icon container */}
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "8px",
                        bgcolor: alpha(resolvedColor, 0.12),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: resolvedColor,
                        flexShrink: 0,
                        "& .MuiSvgIcon-root": { fontSize: "1.25rem" },
                    }}
                >
                    {icon}
                </Box>

                {/* Trend badge (only if provided) */}
                {trend !== undefined && (
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={0.25}
                        sx={{
                            px: 0.75,
                            py: 0.25,
                            borderRadius: "4px",
                            bgcolor: trendUp
                                ? alpha(theme.palette.success.main, 0.10)
                                : trendDown
                                    ? alpha(theme.palette.error.main, 0.10)
                                    : "action.hover",
                        }}
                    >
                        <TrendIcon sx={{ fontSize: "0.875rem", color: trendColor }} />
                        <Typography
                            sx={{
                                fontSize: "0.6875rem",
                                fontWeight: 600,
                                color: trendColor,
                                lineHeight: 1,
                            }}
                        >
                            {Math.abs(trend)}%
                        </Typography>
                    </Stack>
                )}
            </Stack>

            {/* ── Value ── */}
            <Typography
                variant="h4"
                sx={{
                    fontWeight: 700,
                    color: "text.primary",
                    lineHeight: 1.1,
                    letterSpacing: "-0.5px",
                    mb: 0.5,
                }}
            >
                <AnimatedCounter value={value} formatValue={formatValue} />
            </Typography>

            {/* ── Title / Label ── */}
            <Typography
                variant="body2"
                sx={{
                    fontWeight: 500,
                    color: "text.secondary",
                    fontSize: "0.8125rem",
                    lineHeight: 1.4,
                }}
            >
                {title}
            </Typography>

            {/* ── Trend label text (below title) ── */}
            {trend !== undefined && trendLabel && (
                <Typography
                    variant="caption"
                    sx={{
                        display: "block",
                        mt: 0.5,
                        fontSize: "0.75rem",
                        color: "text.disabled",
                        lineHeight: 1.3,
                    }}
                >
                    {trendLabel}
                </Typography>
            )}
        </Box>
    );
};

export default React.memo(StatCard);
