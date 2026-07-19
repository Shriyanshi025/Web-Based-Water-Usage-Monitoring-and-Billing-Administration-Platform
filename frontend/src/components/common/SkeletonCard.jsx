import React from "react";
import { Box, Skeleton, Stack } from "@mui/material";

/**
 * SkeletonCard — loading placeholder for widget / chart / KPI cards.
 * Matches the card shell used by WidgetContainer.
 */
const SkeletonCard = () => {
    return (
        <Box
            sx={{
                p: "20px 24px",
                borderRadius: 2,
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "0 1px 3px rgba(12, 25, 41, 0.06), 0 1px 2px rgba(12, 25, 41, 0.04)",
                height: "100%",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* Header row */}
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2.5 }}
            >
                <Skeleton variant="text" width="40%" height={20} />
                <Skeleton
                    variant="rounded"
                    width={32}
                    height={32}
                    sx={{ borderRadius: "6px" }}
                />
            </Stack>

            {/* Sub-line (e.g. date range or subtitle) */}
            <Skeleton variant="text" width="55%" height={14} sx={{ mb: 2.5 }} />

            {/* Chart / content area */}
            <Box sx={{ flexGrow: 1, display: "flex", alignItems: "flex-end" }}>
                <Skeleton
                    variant="rounded"
                    width="100%"
                    height={110}
                    sx={{ borderRadius: 1 }}
                />
            </Box>
        </Box>
    );
};

export default React.memo(SkeletonCard);
