import React from "react";
import { Box, Typography, Stack } from "@mui/material";

/**
 * Reusable SectionHeader — sub-section titles within a page or card.
 */
const SectionHeader = ({ title, action, subtitle }) => {
    return (
        <Stack
            direction="row"
            sx={{
                justifyContent: "space-between",
                alignItems: subtitle ? "flex-start" : "center",
                mb: 2,
            }}
        >
            <Box sx={{ minWidth: 0 }}>
                <Typography
                    variant="subtitle1"
                    sx={{
                        fontWeight: 600,
                        fontSize: "0.9375rem",
                        color: "text.primary",
                        lineHeight: 1.4,
                        letterSpacing: "-0.1px",
                    }}
                >
                    {title}
                </Typography>
                {subtitle && (
                    <Typography
                        variant="caption"
                        sx={{
                            color: "text.secondary",
                            fontSize: "0.75rem",
                            lineHeight: 1.4,
                            display: "block",
                            mt: 0.25,
                        }}
                    >
                        {subtitle}
                    </Typography>
                )}
            </Box>
            {action && <Box sx={{ flexShrink: 0, ml: 2 }}>{action}</Box>}
        </Stack>
    );
};

export default React.memo(SectionHeader);
