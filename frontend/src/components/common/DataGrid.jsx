import React from "react";
import { DataGrid as MuiDataGrid } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import SkeletonTable from "./SkeletonTable";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";

/**
 * Reusable DataGrid wrapper with consistent loading, error, and empty states.
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
    autoHeight = false,
    emptyTitle = "No Records Found",
    emptyMessage = "Try adjusting your filters or search terms.",
    getRowClassName,
    sx = {},
    ...rest
}) => {
    const [paginationModel, setPaginationModel] = React.useState({
        pageSize,
        page: 0,
    });

    React.useEffect(() => {
        setPaginationModel((prev) => ({ ...prev, page: 0 }));
    }, [rows.length]);

    if (error) {
        return <ErrorState message={error} onRetry={onRetry} />;
    }

    if (loading && rows.length === 0) {
        return <SkeletonTable rows={5} />;
    }

    return (
        <Box
            sx={{
                height: "100%",
                width: "100%",
                // Focus ring suppression
                "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
                    outline: "none",
                },
                "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within": {
                    outline: "none",
                },
                // Row cursor
                ...(onRowClick && {
                    "& .MuiDataGrid-row": { cursor: "pointer" },
                }),
                // ── Professional table styling ──────────────────────────────
                // Column headers
                "& .MuiDataGrid-columnHeaders": {
                    bgcolor: "#F0F4F8",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                },
                "& .MuiDataGrid-columnHeaderTitle": {
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    color: "text.secondary",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                },
                // Rows
                "& .MuiDataGrid-row": {
                    "&:hover": {
                        bgcolor: "action.hover",
                    },
                    "&.Mui-selected": {
                        bgcolor: "action.selected",
                        "&:hover": { bgcolor: "action.selected" },
                    },
                },
                // Cells
                "& .MuiDataGrid-cell": {
                    fontSize: "0.8125rem",
                    color: "text.primary",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    alignItems: "center",
                    py: 0,
                },
                // Row height
                "& .MuiDataGrid-row--lastVisible .MuiDataGrid-cell": {
                    borderBottom: "none",
                },
                // Pagination
                "& .MuiDataGrid-footerContainer": {
                    borderTop: "1px solid",
                    borderColor: "divider",
                    minHeight: 48,
                    bgcolor: "background.paper",
                },
                "& .MuiTablePagination-toolbar": {
                    fontSize: "0.8125rem",
                    color: "text.secondary",
                },
                "& .MuiTablePagination-displayedRows, & .MuiTablePagination-selectLabel": {
                    fontSize: "0.8125rem",
                    color: "text.secondary",
                    margin: 0,
                },
                // Sort icon
                "& .MuiDataGrid-sortIcon": {
                    fontSize: "1rem",
                    color: "text.secondary",
                },
                // Column separator
                "& .MuiDataGrid-columnSeparator": {
                    display: "none",
                },
                // No border on the grid itself
                "& .MuiDataGrid-root": {
                    border: "none",
                },
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
                rowHeight={52}
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
                        bgcolor: "background.paper",
                    },
                }}
                {...rest}
            />
        </Box>
    );
};

export default React.memo(DataGrid);
