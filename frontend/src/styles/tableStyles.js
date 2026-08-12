export const standardTableContainerStyle = {
    backgroundColor: "background.paper",
    borderRadius: "12px",
    border: "1px solid",
    borderColor: "#D9E2EA",
    boxShadow: "0 2px 8px rgba(12, 25, 41, 0.04)",
    overflow: "hidden",
    mb: 3,
};

export const standardTableStyle = {
    border: "none",
    borderRadius: 0,
    width: "100%",
    "& .MuiDataGrid-main": {
        backgroundColor: "background.paper",
    },
    "& .MuiDataGrid-columnHeaders": {
        backgroundColor: "#EAF3F8 !important",
        borderBottom: "2px solid",
        borderColor: "#D9E2EA",
    },
    "& .MuiDataGrid-columnHeadersInner": {
        backgroundColor: "#EAF3F8 !important",
    },
    "& .MuiDataGrid-topContainer": {
        backgroundColor: "#EAF3F8 !important",
    },
    "& .MuiDataGrid-columnHeaderRow": {
        backgroundColor: "#EAF3F8 !important",
    },
    "& .MuiDataGrid-columnHeader": {
        padding: "0 24px",
        backgroundColor: "#EAF3F8 !important",
    },
    "& .MuiDataGrid-filler": {
        backgroundColor: "#EAF3F8 !important",
    },
    "& .MuiDataGrid-scrollbarFiller": {
        backgroundColor: "#EAF3F8 !important",
    },
    "& .MuiDataGrid-columnHeaderTitle": {
        fontWeight: 600,
        fontSize: "0.78rem",
        color: "text.primary",
        letterSpacing: "0.04em",
    },
    "& .MuiDataGrid-virtualScroller": {
        backgroundColor: "transparent !important",
    },
    "& .MuiDataGrid-virtualScrollerContent": {
        backgroundColor: "transparent !important",
    },
    "& .MuiDataGrid-row": {
        borderBottom: "1px solid",
        borderColor: "#F1F5F9",
        transition: "background-color 0.15s ease",
        "&:hover": {
            backgroundColor: "#F1F5F9 !important",
        },
        "&.Mui-selected": {
            backgroundColor: "#F0F9FF !important",
            "&:hover": {
                backgroundColor: "#E0F2FE !important",
            },
        },
    },
    "& .MuiDataGrid-row:nth-of-type(even)": {
        backgroundColor: "#F8FAFC !important",
        "&:hover": {
            backgroundColor: "#F1F5F9 !important",
        },
    },
    "& .MuiDataGrid-cell": {
        padding: "0 24px",
        fontSize: "0.875rem",
        color: "text.primary",
        display: "flex",
        alignItems: "center",
        borderBottom: "none",
    },
    "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
        outline: "none !important",
    },
    "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within": {
        outline: "none !important",
    },
    // Column resize handle — visible only on hover so the table stays clean
    // at rest but users can still drag to resize individual columns.
    "& .MuiDataGrid-columnSeparator": {
        display: "flex",         // keep in layout so drag events fire
        opacity: 0,              // invisible at rest
        transition: "opacity 0.15s ease",
        color: "#B0C4D8",
    },
    "& .MuiDataGrid-columnHeader:hover .MuiDataGrid-columnSeparator": {
        opacity: 1,              // reveal on column-header hover
    },
    "& .MuiDataGrid-columnSeparator--resizing": {
        opacity: 1,              // keep visible while actively dragging
        color: "#4A90B8",
    },
    // Hide the empty filler cell at the end of rows. MUI renders this
    // empty cell which can default to 48px, causing artificial overflow
    // and a white vertical gap on the right.
    "& .MuiDataGrid-cellEmpty": {
        display: "none !important",
    },
    // Position the last column's separator at the right edge (right: 0) instead of
    // centered on the boundary (right: -5px). This keeps it fully interactive for resizing
    // but prevents it from overflowing the right edge and creating artificial scroll width.
    "& .MuiDataGrid-columnHeader--last .MuiDataGrid-columnSeparator": {
        display: "flex !important",
        right: "0px !important",
    },
    // Hide the transient menu icon indicator when hovering directly over the
    // resize separator to prevent the duplicate indicator flicker.
    "& .MuiDataGrid-columnHeader:has(.MuiDataGrid-columnSeparator:hover) .MuiDataGrid-menuIcon": {
        visibility: "hidden !important",
        opacity: "0 !important",
        width: "0px !important",
    },
    "& .MuiDataGrid-footerContainer": {
        borderTop: "1px solid",
        borderColor: "#D9E2EA",
        backgroundColor: "#F8FAFC",
        minHeight: "52px",
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
    "& .MuiTablePagination-actions": {
        color: "text.secondary",
    },
    "& .MuiDataGrid-sortIcon": {
        fontSize: "1rem",
        color: "text.secondary",
    },
    "& .MuiDataGrid-checkboxInput": {
        color: "grey.300",
        "&.Mui-checked": {
            color: "primary.main",
        },
    },
};
