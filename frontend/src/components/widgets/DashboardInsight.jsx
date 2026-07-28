import React from "react";
import {
    Box,
    Paper,
    Typography,
    Stack,
    Chip,
    useTheme,
} from "@mui/material";
import { resolveColor, safeAlpha } from "../../helpers/colorHelper";

/**
 * Helper to render icons consistently whether passed as:
 * - A React component reference: icon={ReceiptIcon}
 * - A React JSX element: icon={<ReceiptIcon />}
 */
const renderIcon = (iconSymbol, sxProps = { fontSize: "1.1rem" }) => {
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
 * DashboardInsight — Secondary Metric / Insight Card for SaaS Dashboards
 */
const DashboardInsight = ({
    title,
    value,
    subtitle,
    caption,
    icon,
    color = "primary",
    trend,
    statusText,
    onClick,
}) => {
    const theme = useTheme();

    const displaySubtitle = subtitle || caption;
    const mainColor = resolveColor(theme, color);
    const lightBg = safeAlpha(theme, mainColor, 0.08);

    return (
        <Paper
            elevation={0}
            onClick={onClick}
            sx={{
                p: 2.25,
                borderRadius: "12px",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                boxShadow: "0 2px 8px rgba(12, 25, 41, 0.03)",
                cursor: onClick ? "pointer" : "default",
                transition: "all 180ms ease-in-out",
                position: "relative",
                overflow: "hidden",
                "&:hover": onClick
                    ? {
                          borderColor: safeAlpha(theme, mainColor, 0.4),
                          boxShadow: "0 6px 20px rgba(12, 25, 41, 0.07)",
                          transform: "translateY(-1px)",
                      }
                    : {},
            }}
        >
            <Stack spacing={1.5}>
                {/* Header: Title + Icon */}
                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                    <Typography
                        variant="caption"
                        sx={{
                            fontWeight: 700,
                            fontSize: "0.725rem",
                            color: "text.secondary",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                        }}
                    >
                        {title}
                    </Typography>

                    {icon && (
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 32,
                                height: 32,
                                borderRadius: "8px",
                                bgcolor: lightBg,
                                color: mainColor,
                                flexShrink: 0,
                            }}
                        >
                            {renderIcon(icon, { fontSize: "1.1rem" })}
                        </Box>
                    )}
                </Stack>

                {/* Main Metric Value & Trend / Status */}
                <Stack direction="row" spacing={1} sx={{ alignItems: "baseline", justifyContent: "space-between" }}>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 800,
                            fontSize: { xs: "1.35rem", sm: "1.5rem" },
                            color: "text.primary",
                            letterSpacing: "-0.5px",
                            lineHeight: 1.1,
                        }}
                    >
                        {value}
                    </Typography>

                    {statusText && (
                        <Chip
                            label={statusText}
                            size="small"
                            sx={{
                                height: 18,
                                fontSize: "0.625rem",
                                fontWeight: 700,
                                bgcolor: lightBg,
                                color: mainColor,
                                textTransform: "none",
                                borderRadius: "4px",
                            }}
                        />
                    )}

                    {trend && !statusText && (
                        <Typography
                            variant="caption"
                            sx={{
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                color: String(trend).startsWith("+") ? "success.main" : "text.secondary",
                            }}
                        >
                            {trend}
                        </Typography>
                    )}
                </Stack>

                {/* Subtitle / Helper description */}
                {displaySubtitle && (
                    <Typography
                        variant="caption"
                        sx={{
                            fontSize: "0.75rem",
                            color: "text.secondary",
                            lineHeight: 1.3,
                            display: "block",
                        }}
                    >
                        {displaySubtitle}
                    </Typography>
                )}
            </Stack>
        </Paper>
    );
};

export default React.memo(DashboardInsight);
