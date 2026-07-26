import React from "react";
import { Paper, Box, Typography, Stack, Divider } from "@mui/material";

/**
 * SectionCard — Standardized Section Container for Community Admin Design System.
 * 
 * @param {Object} props
 * @param {string} [props.title] - Section title (variant="h6")
 * @param {string} [props.subtitle] - Section subtitle
 * @param {React.ReactNode} [props.action] - Header action slot
 * @param {React.ReactNode} props.children - Card content body
 * @param {boolean} [props.noPadding=false] - Remove internal padding for full-bleed tables
 * @param {Object} [props.sx] - Additional Paper sx overrides
 */
const SectionCard = ({
    title,
    subtitle,
    action,
    children,
    noPadding = false,
    sx = {},
}) => {
    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: "12px",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
                overflow: "hidden",
                mb: 3,
                ...sx,
            }}
        >
            {(title || action) && (
                <>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ px: "20px", py: 2 }}
                    >
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                            {title && (
                                <Typography variant="h6" fontWeight={700} color="text.primary">
                                    {title}
                                </Typography>
                            )}
                            {subtitle && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                                    {subtitle}
                                </Typography>
                            )}
                        </Box>

                        {action && <Box sx={{ flexShrink: 0, ml: 2 }}>{action}</Box>}
                    </Stack>
                    <Divider />
                </>
            )}

            <Box sx={{ p: noPadding ? 0 : "20px" }}>{children}</Box>
        </Paper>
    );
};

export default React.memo(SectionCard);
