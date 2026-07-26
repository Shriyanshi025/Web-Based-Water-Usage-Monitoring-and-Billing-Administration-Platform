import React from "react";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";

/**
 * AdminStatCard — Standardized KPI Summary Card for Community Admin Design System.
 * 
 * @param {Object} props
 * @param {string} props.title - Card title/label
 * @param {string|number} props.value - Metric value display
 * @param {React.ReactNode} props.icon - MUI Icon component
 * @param {string} [props.color="primary"] - Palette color key ('primary', 'success', 'warning', 'error', 'info', 'secondary')
 * @param {string|number} [props.badge] - Optional badge tag
 * @param {string} [props.subtitle] - Optional subtitle note
 * @param {function} [props.onClick] - Optional click handler
 */
const AdminStatCard = ({
    title,
    value,
    icon: IconComponent,
    color = "primary",
    badge,
    subtitle,
    onClick,
}) => {
    // Map theme palette color paths
    const colorThemeMap = {
        primary: { main: "primary.main", bg: "primary.lighter", border: "divider", text: "primary.main" },
        success: { main: "success.main", bg: "success.lighter", border: "success.light", text: "success.dark" },
        warning: { main: "warning.main", bg: "warning.lighter", border: "warning.light", text: "warning.dark" },
        error: { main: "error.main", bg: "error.lighter", border: "error.light", text: "error.dark" },
        info: { main: "info.main", bg: "info.lighter", border: "info.light", text: "info.dark" },
        secondary: { main: "secondary.main", bg: "secondary.lighter", border: "secondary.light", text: "secondary.dark" },
        default: { main: "text.secondary", bg: "action.hover", border: "divider", text: "text.primary" },
    };

    const scheme = colorThemeMap[color] || colorThemeMap.primary;

    return (
        <Card
            onClick={onClick}
            sx={{
                height: "100%",
                borderRadius: "12px",
                border: "1px solid",
                borderColor: scheme.border,
                bgcolor: scheme.bg || "background.paper",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
                transition: "all 0.2s ease-in-out",
                cursor: onClick ? "pointer" : "default",
                "&:hover": onClick
                    ? {
                          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
                          transform: "translateY(-2px)",
                      }
                    : undefined,
            }}
        >
            <CardContent sx={{ p: "20px", "&:last-child": { pb: "20px" } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                            variant="subtitle2"
                            fontWeight={600}
                            color={color === "default" ? "text.secondary" : scheme.text}
                            noWrap
                        >
                            {title}
                        </Typography>

                        <Typography
                            variant="h4"
                            fontWeight={800}
                            color={color === "default" ? "text.primary" : scheme.text}
                            sx={{ mt: 0.5, lineHeight: 1.15, letterSpacing: "-0.5px" }}
                        >
                            {value}
                        </Typography>

                        {subtitle && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                                {subtitle}
                            </Typography>
                        )}
                    </Box>

                    {IconComponent && (
                        <Box
                            sx={{
                                color: scheme.main,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                "& .MuiSvgIcon-root": { fontSize: "2rem" },
                            }}
                        >
                            {IconComponent}
                        </Box>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
};

export default React.memo(AdminStatCard);
