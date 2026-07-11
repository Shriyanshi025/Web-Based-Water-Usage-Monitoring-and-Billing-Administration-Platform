import React from "react";
import { Box, Typography, Stack } from "@mui/material";

/**
 * Reusable SectionHeader component for sub-sections within a page or card
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {React.ReactNode} [props.action] - Optional action element
 */
const SectionHeader = ({ title, action }) => {
    return (
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>
            <Typography variant="h6" fontWeight={600} color="text.primary">
                {title}
            </Typography>
            {action && (
                <Box>
                    {action}
                </Box>
            )}
        </Stack>
    );
};

export default React.memo(SectionHeader);
