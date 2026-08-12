import React from "react";
import {
    Box,
    Typography,
    Stack,
    Chip,
    Divider,
    useTheme,
} from "@mui/material";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { resolveColor, safeAlpha } from "../../helpers/colorHelper";

/**
 * Helper to render icons consistently whether passed as:
 * - A React component reference: icon={PeopleIcon}
 * - A React JSX element: icon={<PeopleIcon />}
 */
const renderIcon = (iconSymbol, sxProps = { fontSize: "1.25rem" }) => {
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
 * PageSummaryHeader — Enterprise Page Header with Integrated Inline Metadata
 */
const PageSummaryHeader = ({
    title,
    subtitle,
    metadata = [],
    action,
    secondaryActions,
    statusText,
    icon,
}) => {
    const theme = useTheme();

    return (
        <Box sx={{ mb: 3, mt: 0, pt: 0 }}>
            <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                sx={{
                    mb: 1.5,
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", md: "center" },
                }}
            >
                {/* Title & Subtitle Section */}
                <Box sx={{ flex: "1 1 auto", minWidth: 0 }}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 0.5 }}>
                        {icon && (
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: 36,
                                    height: 36,
                                    borderRadius: "8px",
                                    bgcolor: safeAlpha(theme, "primary.main", 0.08),
                                    color: "primary.main",
                                    flexShrink: 0,
                                }}
                            >
                                {renderIcon(icon, { fontSize: "1.25rem" })}
                            </Box>
                        )}
                        <Typography
                            variant="h4"
                            component="h1"
                            sx={{
                                fontWeight: 700,
                                color: "#0a1d37",
                                lineHeight: 1.2,
                                letterSpacing: "-0.5px",
                                fontSize: { xs: "1.5rem", sm: "1.75rem", md: "1.875rem" },
                            }}
                        >
                            {title}
                        </Typography>

                        {statusText && (
                            <Chip
                                icon={
                                    <FiberManualRecordIcon
                                        sx={{
                                            fontSize: "0.6rem !important",
                                            color: `${theme.palette.success.main} !important`,
                                        }}
                                    />
                                }
                                label={statusText}
                                size="small"
                                sx={{
                                    height: 22,
                                    fontSize: "0.725rem",
                                    fontWeight: 600,
                                    bgcolor: safeAlpha(theme, "success.main", 0.08),
                                    color: "success.main",
                                    border: `1px solid ${safeAlpha(theme, "success.main", 0.2)}`,
                                    textTransform: "none",
                                }}
                            />
                        )}
                    </Stack>

                    {subtitle && (
                        <Typography
                            variant="body2"
                            sx={{
                                color: "#1e293b",
                                fontWeight: 600,
                                fontSize: "0.9rem",
                                lineHeight: 1.5,
                                maxWidth: 720,
                                textShadow: "0 1px 2px rgba(255, 255, 255, 0.8)",
                            }}
                        >
                            {subtitle}
                        </Typography>
                    )}

                    {/* Inline Metadata Chips / Badges */}
                    {metadata && metadata.length > 0 && (
                        <Stack
                            direction="row"
                            sx={{
                                mt: 1.25,
                                alignItems: "center",
                                flexWrap: "wrap",
                                gap: 1,
                            }}
                        >
                            {metadata.map((item, idx) => {
                                if (typeof item === "string") {
                                    return (
                                        <Typography
                                            key={idx}
                                            variant="caption"
                                            sx={{
                                                fontWeight: 700,
                                                color: "#334155",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 0.75,
                                                fontSize: "0.8125rem",
                                                textShadow: "0 1px 2px rgba(255, 255, 255, 0.8)",
                                            }}
                                        >
                                            {idx > 0 && (
                                                <Box
                                                    component="span"
                                                    sx={{
                                                        width: 4,
                                                        height: 4,
                                                        borderRadius: "50%",
                                                        bgcolor: "text.disabled",
                                                        display: "inline-block",
                                                    }}
                                                />
                                            )}
                                            {item}
                                        </Typography>
                                    );
                                }

                                const baseColor = resolveColor(theme, item.color || "primary");
                                const chipBg = safeAlpha(theme, baseColor, 0.08);
                                const chipBorder = safeAlpha(theme, baseColor, 0.18);

                                return (
                                    <Chip
                                        key={idx}
                                        label={
                                            <Box component="span" sx={{ display: "inline-flex", gap: 0.5 }}>
                                                <Box component="span" sx={{ fontWeight: 700 }}>
                                                    {item.value}
                                                </Box>
                                                <Box component="span" sx={{ fontWeight: 500, opacity: 0.85 }}>
                                                    {item.label}
                                                </Box>
                                            </Box>
                                        }
                                        size="small"
                                        sx={{
                                            height: 24,
                                            px: 0.5,
                                            fontSize: "0.775rem",
                                            bgcolor: chipBg,
                                            color: baseColor,
                                            border: `1px solid ${chipBorder}`,
                                            textTransform: "none",
                                            borderRadius: "6px",
                                        }}
                                    />
                                );
                            })}
                        </Stack>
                    )}
                </Box>

                {/* Actions Slot */}
                {(action || secondaryActions) && (
                    <Stack
                        direction="row"
                        spacing={1.5}
                        sx={{
                            flexShrink: 0,
                            alignSelf: { xs: "flex-start", md: "center" },
                            alignItems: "center",
                        }}
                    >
                        {secondaryActions}
                        {action}
                    </Stack>
                )}
            </Stack>

            <Divider
                sx={{
                    mt: 1.5,
                    borderColor: "divider",
                    opacity: 0.75,
                }}
            />
        </Box>
    );
};

export default React.memo(PageSummaryHeader);
