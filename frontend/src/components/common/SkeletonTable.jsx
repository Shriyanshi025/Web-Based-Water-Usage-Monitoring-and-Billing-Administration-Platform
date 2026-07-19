import React from "react";
import { Box, Skeleton, Stack, Divider } from "@mui/material";

/**
 * SkeletonTable — loading placeholder for data grids and tables.
 *
 * @param {Object} props
 * @param {number} [props.rows=5]    - Number of body rows to render
 * @param {number} [props.cols=5]    - Number of columns to simulate
 */
const SkeletonTable = ({ rows = 5, cols = 5 }) => {
    // Column widths cycle to simulate varied content
    const colWidths = ["18%", "26%", "22%", "20%", "14%"];

    return (
        <Box
            sx={{
                width: "100%",
                bgcolor: "background.paper",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                overflow: "hidden",
            }}
        >
            {/* Header row */}
            <Stack
                direction="row"
                spacing={2}
                sx={{
                    px: 2,
                    py: 1.5,
                    bgcolor: "background.default",
                    alignItems: "center",
                    minHeight: 48,
                }}
            >
                {Array.from({ length: cols }).map((_, i) => (
                    <Skeleton
                        key={i}
                        variant="text"
                        width={colWidths[i % colWidths.length]}
                        height={16}
                        sx={{ flexShrink: 0 }}
                    />
                ))}
            </Stack>

            <Divider />

            {/* Body rows — match theme DataGrid rowHeight: 52 */}
            {Array.from({ length: rows }).map((_, rowIdx) => (
                <Box key={rowIdx}>
                    <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                            px: 2,
                            alignItems: "center",
                            minHeight: 52,
                        }}
                    >
                        {Array.from({ length: cols }).map((_, colIdx) => {
                            // Last column: small circular action stub
                            if (colIdx === cols - 1) {
                                return (
                                    <Skeleton
                                        key={colIdx}
                                        variant="rounded"
                                        width={24}
                                        height={24}
                                        sx={{ ml: "auto", borderRadius: "6px", flexShrink: 0 }}
                                    />
                                );
                            }
                            return (
                                <Skeleton
                                    key={colIdx}
                                    variant="text"
                                    width={colWidths[colIdx % colWidths.length]}
                                    height={16}
                                    sx={{ flexShrink: 0 }}
                                />
                            );
                        })}
                    </Stack>
                    {rowIdx < rows - 1 && <Divider />}
                </Box>
            ))}
        </Box>
    );
};

export default React.memo(SkeletonTable);
