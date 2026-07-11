import React from "react";
import { Box, Stack } from "@mui/material";

/**
 * Reusable FilterBar component wrapper for holding filters and search
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
const FilterBar = ({ children }) => {
    return (
        <Box sx={{ mb: 3, p: 2, bgcolor: "background.paper", borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
                {children}
            </Stack>
        </Box>
    );
};

export default React.memo(FilterBar);
