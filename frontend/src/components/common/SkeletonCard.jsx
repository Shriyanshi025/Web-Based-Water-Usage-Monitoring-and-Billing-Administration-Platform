import React from "react";
import { Box, Skeleton, Stack } from "@mui/material";

/**
 * Reusable SkeletonCard for loading states of widgets/cards
 */
const SkeletonCard = () => {
    return (
        <Box
            sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: "background.paper",
                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
                height: "100%",
                display: "flex",
                flexDirection: "column"
            }}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Skeleton variant="text" width="40%" height={32} />
                <Skeleton variant="circular" width={40} height={40} />
            </Stack>
            <Skeleton variant="text" width="60%" height={24} sx={{ mb: 3 }} />
            <Box sx={{ flexGrow: 1, display: "flex", alignItems: "flex-end" }}>
                <Skeleton variant="rectangular" width="100%" height={100} sx={{ borderRadius: 2 }} />
            </Box>
        </Box>
    );
};

export default React.memo(SkeletonCard);
