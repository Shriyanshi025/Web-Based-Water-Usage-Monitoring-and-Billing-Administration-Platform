import React from "react";
import { DataGrid as MuiDataGrid } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import SkeletonTable from "./SkeletonTable";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";

import { standardTableStyle } from "../../styles/tableStyles";

/**
 * Reusable DataGrid wrapper with consistent design, row heights, loading, error, and empty states.
 */
const DataGrid = ({
    rows = [],
    columns = [],
    loading = false,
    error = null,
    onRetry,
    onRowClick,
    checkboxSelection = false,
    pageSize = 10,
    autoHeight = true,
    emptyTitle = "No Records Found",
    emptyMessage = "Try adjusting your filters or search terms.",
    getRowClassName,
    rowHeight = 58,
    columnHeaderHeight = 48,
    sx = {},
    ...rest
}) => {
    const [paginationModel, setPaginationModel] = React.useState({
        pageSize,
        page: 0,
    });

    const containerRef = React.useRef(null);

    React.useEffect(() => {
        setPaginationModel((prev) => ({ ...prev, page: 0 }));
    }, [rows.length]);

    React.useEffect(() => {
        if (autoHeight && containerRef.current) {
            const parent = containerRef.current.parentElement;
            if (parent) {
                parent.style.height = "auto";
                parent.style.minHeight = "unset";
            }
        }
    }, [autoHeight, rows.length]);

    if (error) {
        return <ErrorState message={error} onRetry={onRetry} />;
    }

    if (loading && rows.length === 0) {
        return <SkeletonTable rows={5} />;
    }

    return (
        <Box
            ref={containerRef}
            sx={{
                height: autoHeight ? "auto" : "100%",
                width: "100%",
                ...standardTableStyle,
                // Keep the dynamic heights functional by overriding them:
                "& .MuiDataGrid-columnHeaders": {
                    ...(standardTableStyle["& .MuiDataGrid-columnHeaders"] || {}),
                    minHeight: `${columnHeaderHeight}px !important`,
                    maxHeight: `${columnHeaderHeight}px !important`,
                },
                "& .MuiDataGrid-row": {
                    ...(standardTableStyle["& .MuiDataGrid-row"] || {}),
                    minHeight: `${rowHeight}px !important`,
                    maxHeight: `${rowHeight}px !important`,
                },
                // Row cursor
                ...(onRowClick && {
                    "& .MuiDataGrid-row": { cursor: "pointer" },
                }),
                ...sx,
            }}
        >
            <MuiDataGrid
                rows={rows}
                columns={columns}
                loading={loading}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 25, 50]}
                checkboxSelection={checkboxSelection}
                disableRowSelectionOnClick
                onRowClick={onRowClick}
                autoHeight={autoHeight}
                getRowClassName={getRowClassName}
                rowHeight={rowHeight}
                columnHeaderHeight={columnHeaderHeight}
                slots={{
                    noRowsOverlay: () => (
                        <EmptyState
                            title={emptyTitle}
                            message={emptyMessage}
                            compact
                        />
                    ),
                }}
                sx={{
                    border: "none",
                    borderRadius: 0,
                    "--DataGrid-rowBorderColor": "transparent",
                    "& .MuiDataGrid-virtualScroller": {
                        backgroundColor: "transparent !important",
                    },
                    // When autoHeight is active: force the virtualScroller to size
                    // from its content (rows) instead of filling the parent flex space.
                    // MUI v9 sets height:100% on the scroller unconditionally, which
                    // prevents genuine shrink-to-content behaviour in autoHeight mode.
                    ...(autoHeight && {
                        "&.MuiDataGrid-autoHeight .MuiDataGrid-virtualScroller": {
                            height: "auto !important",
                            minHeight: "unset !important",
                        },
                        "&.MuiDataGrid-autoHeight .MuiDataGrid-main": {
                            height: "auto !important",
                        },
                    }),
                    ...sx,
                }}
                {...rest}
            />
        </Box>
    );
};

export default React.memo(DataGrid);
