import React from "react";
import { Box, Typography, Stack, Skeleton, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { safeAlpha } from "../../helpers/colorHelper";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";

/**
 * AnimatedCounter — counts up from 0 to `value` using rAF.
 */
const AnimatedCounter = ({ value, formatValue }) => {
    const [count, setCount] = React.useState(0);

    React.useEffect(() => {
        if (typeof value !== "number") {
            setCount(value);
            return;
        }
        let startTime = null;
        const duration = 1000;
        const end = value;
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
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

// ─── Shared card shell ────────────────────────────────────────────────────────
const cardShell = {
    p: "20px 24px",
    bgcolor: "background.paper",
    borderRadius: "12px",
    border: "1px solid",
    borderColor: "divider",
    boxShadow: "0 1px 4px rgba(12, 25, 41, 0.05), 0 1px 2px rgba(12, 25, 41, 0.03)",
    height: "100%",
    transition: "box-shadow 200ms ease",
    "&:hover": {
        boxShadow: "0 4px 16px rgba(12, 25, 41, 0.08)",
    },
};

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

    const resolveColor = (colorPath) => {
        const keys = colorPath.split(".");
        let resolved = theme.palette;
        for (const k of keys) resolved = resolved?.[k];
        return typeof resolved === "string" ? resolved : theme.palette.primary.main;
    };

    const resolvedColor = resolveColor(color);

    // ── Loading ──────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <Box sx={{ ...cardShell, "&:hover": undefined }}>
                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
                    <Skeleton variant="rounded" width={42} height={42} sx={{ borderRadius: "10px" }} />
                    <Skeleton variant="text" width="28%" height={18} />
                </Stack>
                <Skeleton variant="text" width="55%" height={38} sx={{ mb: 0.5 }} />
                <Skeleton variant="text" width="70%" height={14} />
            </Box>
        );
    }

    // ── Error ────────────────────────────────────────────────────────────────
    if (error) {
        return (
            <Box sx={{ ...cardShell, borderColor: "error.light" }}>
                <Typography variant="body2" color="error.main" fontWeight={500} fontSize="0.8125rem">
                    {error}
                </Typography>
            </Box>
        );
    }

    // ── Empty ────────────────────────────────────────────────────────────────
    if (empty) {
        return (
            <Box sx={cardShell}>
                <Typography variant="body2" color="text.disabled" fontSize="0.8125rem">
                    No data available
                </Typography>
            </Box>
        );
    }

    const trendUp   = trend > 0;
    const trendDown = trend < 0;
    const trendColor = trendUp ? "success.main" : trendDown ? "error.main" : "text.secondary";
    const TrendIcon  = trendUp ? TrendingUpIcon : trendDown ? TrendingDownIcon : TrendingFlatIcon;

    return (
        <Box
            sx={{
                ...cardShell,
                cursor: onClick ? "pointer" : "default",
                "&:hover": {
                    boxShadow: "0 6px 20px rgba(12, 25, 41, 0.10)",
                    transform: onClick ? "translateY(-2px)" : "none",
                    borderColor: onClick ? alpha(resolvedColor, 0.3) : "divider",
                },
                transition: "transform 150ms ease, box-shadow 200ms ease, border-color 200ms ease",
            }}
            onClick={onClick}
        >
            {/* ── Top row: icon mark + trend badge ── */}
            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 2.5 }}>
                {/* Icon container */}
                <Box
                    sx={{
                        width: 42,
                        height: 42,
                        borderRadius: "10px",
                        bgcolor: alpha(resolvedColor, 0.10),
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

                {/* Trend badge */}
                {trend !== undefined && (
                    <Stack
                        direction="row"
                        spacing={0.25}
                        sx={{
                            alignItems: "center",
                            px: 0.875,
                            py: 0.375,
                            borderRadius: "6px",
                            bgcolor: trendUp
                                ? safeAlpha(theme, "success.main", 0.09)
                                : trendDown
                                    ? safeAlpha(theme, "error.main", 0.09)
                                    : "action.hover",
                        }}
                    >
                        <TrendIcon sx={{ fontSize: "0.8125rem", color: trendColor }} />
                        <Typography
                            sx={{
                                fontSize: "0.6875rem",
                                fontWeight: 700,
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
                    fontSize: { xs: "1.5rem", sm: "1.75rem" },
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

            {/* ── Trend label text ── */}
            {trend !== undefined && trendLabel && (
                <Typography
                    sx={{
                        display: "block",
                        mt: 0.75,
                        fontSize: "0.725rem",
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
