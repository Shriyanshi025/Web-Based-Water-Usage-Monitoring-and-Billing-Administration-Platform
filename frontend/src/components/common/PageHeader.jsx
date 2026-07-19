import React from "react";
import { Box, Typography, Stack, Divider } from "@mui/material";

/**
 * Reusable PageHeader component for consistent top-level page titles.
 *
 * @param {Object} props
 * @param {string}            props.title    - Main page title
 * @param {string}            [props.subtitle] - Optional subtitle / description
 * @param {React.ReactNode}   [props.action]   - Optional action area (buttons, chips) on the right
 */
const PageHeader = ({ title, subtitle, action }) => {
    return (
        <Box sx={{ mb: 3 }}>
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                flexWrap="wrap"
                gap={2}
                sx={{ mb: subtitle ? 0.5 : 0 }}
            >
                {/* Title block */}
                <Box sx={{ flex: "1 1 auto", minWidth: 0 }}>
                    <Typography
                        variant="h5"
                        component="h1"
                        sx={{
                            fontWeight: 700,
                            color: "text.primary",
                            lineHeight: 1.25,
                            letterSpacing: "-0.2px",
                            wordBreak: "break-word",
                        }}
                    >
                        {title}
                    </Typography>

                    {subtitle && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5, lineHeight: 1.5 }}
                        >
                            {subtitle}
                        </Typography>
                    )}
                </Box>

                {/* Action slot */}
                {action && (
                    <Box sx={{ flex: "0 0 auto" }}>
                        {action}
                    </Box>
                )}
            </Stack>

            <Divider sx={{ mt: 2 }} />
        </Box>
    );
};

export default React.memo(PageHeader);
