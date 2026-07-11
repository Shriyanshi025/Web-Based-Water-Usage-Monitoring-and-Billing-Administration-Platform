import React from "react";
import { Box, Typography, Stack } from "@mui/material";

/**
 * Reusable PageHeader component for consistent top-level page titles
 * @param {Object} props
 * @param {string} props.title - Main page title
 * @param {string} [props.subtitle] - Optional subtitle or description
 * @param {React.ReactNode} [props.action] - Optional action button(s) on the right
 */
const PageHeader = ({ title, subtitle, action }) => {
    return (
        <Box sx={{ mb: 4 }}>
            <Stack 
                direction="row" 
                justifyContent="space-between" 
                alignItems="center" 
                flexWrap="wrap" 
                gap={2}
            >
                <Box sx={{ flex: '1 1 auto', minWidth: '250px', pr: 2 }}>
                    <Typography 
                        variant="h4" 
                        fontWeight={700} 
                        color="text.primary" 
                        gutterBottom={!!subtitle}
                        sx={{ 
                            wordBreak: "break-word",
                            lineHeight: 1.2
                        }}
                    >
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography variant="body1" color="text.secondary">
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                {action && (
                    <Box sx={{ flex: '0 0 auto' }}>
                        {action}
                    </Box>
                )}
            </Stack>
        </Box>
    );
};

export default React.memo(PageHeader);
