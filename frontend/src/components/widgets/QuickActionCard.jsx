import React from "react";
import { Box, Typography, Card, CardActionArea, Chip, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

/**
 * QuickActionCard — navigable action tile for the dashboard.
 *
 * @param {Object}          props
 * @param {string}          props.title
 * @param {string}          props.description
 * @param {React.ReactNode} props.icon
 * @param {string}          [props.color="primary"]   - MUI palette key (e.g. "primary", "info")
 * @param {boolean}         [props.comingSoon]
 * @param {boolean}         [props.disabled]
 * @param {function}        [props.onClick]
 */
const QuickActionCard = ({
    title,
    description,
    icon,
    color = "primary",
    comingSoon = false,
    disabled = false,
    onClick,
}) => {
    const theme = useTheme();
    const isDisabled = comingSoon || disabled;

    // Safely resolve the palette color
    const resolvedColor =
        theme.palette[color]?.main ?? theme.palette.primary.main;

    return (
        <Card
            elevation={0}
            sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                height: "100%",
                bgcolor: "background.paper",
                boxShadow: "0 1px 3px rgba(12,25,41,0.06), 0 1px 2px rgba(12,25,41,0.04)",
                opacity: isDisabled ? 0.65 : 1,
                transition: "border-color 160ms ease, box-shadow 160ms ease",
                ...(!isDisabled && {
                    "&:hover": {
                        borderColor: alpha(resolvedColor, 0.45),
                        boxShadow: `0 4px 12px ${alpha(resolvedColor, 0.08)}`,
                    },
                }),
            }}
        >
            <CardActionArea
                onClick={isDisabled ? undefined : onClick}
                disabled={isDisabled}
                disableRipple={isDisabled}
                sx={{
                    height: "100%",
                    p: "20px 20px 18px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "flex-start",
                    // Override default CardActionArea hover so our Card hover takes over
                    "&:hover": { bgcolor: "transparent" },
                }}
            >
                {/* ── Top row: icon + coming-soon badge ── */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        width: "100%",
                        mb: 1.75,
                    }}
                >
                    {/* Icon mark */}
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "8px",
                            bgcolor: alpha(resolvedColor, 0.10),
                            color: resolvedColor,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            "& .MuiSvgIcon-root": { fontSize: "1.25rem" },
                        }}
                    >
                        {icon}
                    </Box>

                    {/* Coming Soon badge */}
                    {comingSoon && (
                        <Chip
                            label="Soon"
                            size="small"
                            sx={{
                                height: 20,
                                fontSize: "0.6875rem",
                                fontWeight: 600,
                                bgcolor: "action.selected",
                                color: "text.secondary",
                                border: "1px solid",
                                borderColor: "divider",
                                "& .MuiChip-label": { px: 0.75 },
                            }}
                        />
                    )}
                </Box>

                {/* ── Title ── */}
                <Typography
                    sx={{
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        color: "text.primary",
                        lineHeight: 1.35,
                        mb: 0.5,
                    }}
                >
                    {title}
                </Typography>

                {/* ── Description ── */}
                <Typography
                    sx={{
                        fontSize: "0.75rem",
                        color: "text.secondary",
                        lineHeight: 1.5,
                        flexGrow: 1,
                    }}
                >
                    {description}
                </Typography>

                {/* ── Arrow indicator (active cards only) ── */}
                {!isDisabled && (
                    <Box
                        sx={{
                            mt: 1.5,
                            display: "flex",
                            alignItems: "center",
                            gap: 0.25,
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: "0.6875rem",
                                fontWeight: 600,
                                color: resolvedColor,
                                lineHeight: 1,
                            }}
                        >
                            Open
                        </Typography>
                        <ArrowForwardIcon sx={{ fontSize: "0.75rem", color: resolvedColor }} />
                    </Box>
                )}
            </CardActionArea>
        </Card>
    );
};

export default React.memo(QuickActionCard);
