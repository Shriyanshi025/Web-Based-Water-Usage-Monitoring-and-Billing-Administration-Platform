import React from "react";
import { Box, Typography, Stack, Divider } from "@mui/material";

/**
 * PageHeader — Standardized Top Page Header for Community Admin Design System.
 * Uses h4 for title, body2 for subtitle, and 24px bottom gap.
 */
const PageHeader = ({ title, subtitle, action }) => {
    return (
        <Box sx={{ mb: 3, mt: 0, pt: 0 }}>
            <Stack
                direction="row"
                gap={2}
                sx={{
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                    flexWrap: "wrap",
                    mb: subtitle ? 0.75 : 0,
                }}
            >
                {/* Title block */}
                <Box sx={{ flex: "1 1 auto", minWidth: 0 }}>
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{
                            fontWeight: 700,
                            color: "#0a1d37",
                            lineHeight: 1.2,
                            letterSpacing: "-0.5px",
                            fontSize: { xs: "1.5rem", sm: "1.75rem", md: "1.875rem" },
                            wordBreak: "break-word",
                        }}
                    >
                        {title}
                    </Typography>

                    {subtitle && (
                        <Typography
                            variant="body2"
                            sx={{
                                mt: 0.75,
                                lineHeight: 1.5,
                                color: "#1e293b",
                                fontWeight: 600,
                                fontSize: "0.9rem",
                                maxWidth: 700,
                                textShadow: "0 1px 2px rgba(255, 255, 255, 0.8)",
                            }}
                        >
                            {subtitle}
                        </Typography>
                    )}
                </Box>

                {/* Action slot */}
                {action && (
                    <Box sx={{ flex: "0 0 auto", display: "flex", alignItems: "center", gap: 1.5 }}>
                        {action}
                    </Box>
                )}
            </Stack>

            <Divider
                sx={{
                    mt: subtitle ? 1.75 : 1.5,
                    borderColor: "divider",
                    opacity: 0.8,
                }}
            />
        </Box>
    );
};

export default React.memo(PageHeader);
