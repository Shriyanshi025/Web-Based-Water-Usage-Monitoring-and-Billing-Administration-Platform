import React from "react";
import { Box, Skeleton, Stack, Divider } from "@mui/material";

/**
 * Reusable SkeletonTable for data grid loading states
 */
const SkeletonTable = ({ rows = 5 }) => {
    return (
        <Box sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
            {/* Header */}
            <Stack direction="row" spacing={2} sx={{ p: 2, bgcolor: 'background.default' }}>
                <Skeleton variant="text" width="20%" height={24} />
                <Skeleton variant="text" width="25%" height={24} />
                <Skeleton variant="text" width="25%" height={24} />
                <Skeleton variant="text" width="20%" height={24} />
                <Skeleton variant="text" width="10%" height={24} />
            </Stack>
            <Divider />
            {/* Rows */}
            {[...Array(rows)].map((_, i) => (
                <Box key={i}>
                    <Stack direction="row" spacing={2} sx={{ p: 2, alignItems: "center" }}>
                        <Skeleton variant="text" width="15%" height={20} />
                        <Skeleton variant="text" width="25%" height={20} />
                        <Skeleton variant="text" width="25%" height={20} />
                        <Skeleton variant="text" width="20%" height={20} />
                        <Skeleton variant="circular" width={24} height={24} sx={{ ml: "auto" }} />
                    </Stack>
                    {i < rows - 1 && <Divider />}
                </Box>
            ))}
        </Box>
    );
};

export default React.memo(SkeletonTable);
