import React from "react";
import { DataGrid as MuiDataGrid } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import SkeletonTable from "./SkeletonTable";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";

/**
 * Reusable DataGrid component wrapping MUI DataGrid
 * Applies consistent styling, loading states, and error handling
 * 
 * @param {Object} props
 * @param {Array} props.rows
 * @param {Array} props.columns
 * @param {boolean} [props.loading]
 * @param {string} [props.error]
 * @param {function} [props.onRetry]
 * @param {function} [props.onRowClick]
 * @param {boolean} [props.checkboxSelection]
 * @param {number} [props.pageSize=10]
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
    ...rest
}) => {
    if (error) {
        return <ErrorState message={error} onRetry={onRetry} />;
    }

    if (loading && rows.length === 0) {
        return <SkeletonTable rows={5} />;
    }

    return (
        <Box sx={{ 
            height: '100%', 
            width: '100%',
            '& .MuiDataGrid-root': {
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                bgcolor: 'background.paper',
            },
            '& .MuiDataGrid-cell:focus': {
                outline: 'none',
            },
            '& .MuiDataGrid-columnHeaders': {
                bgcolor: 'background.default',
                borderBottom: '1px solid',
                borderColor: 'divider',
            },
            '& .MuiDataGrid-row:hover': {
                bgcolor: 'action.hover',
            }
        }}>
            <MuiDataGrid
                rows={rows}
                columns={columns}
                loading={loading}
                initialState={{
                    pagination: {
                        paginationModel: { pageSize },
                    },
                }}
                pageSizeOptions={[5, 10, 25, 50]}
                checkboxSelection={checkboxSelection}
                disableRowSelectionOnClick
                onRowClick={onRowClick}
                autoHeight
                slots={{
                    noRowsOverlay: () => <EmptyState title="No Records Found" message="Try adjusting your filters or search." />,
                }}
                {...rest}
            />
        </Box>
    );
};

export default React.memo(DataGrid);
