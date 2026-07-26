import React from "react";
import { Paper, Grid } from "@mui/material";

/**
 * AdminFilterToolbar — Standardized Filter & Search Bar for Community Admin Design System.
 * Standardizes control heights (40px), 8px border radius, and 16px padding on a responsive Grid container.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Grid item controls
 * @param {Object} [props.sx] - Additional Paper overrides
 */
const AdminFilterToolbar = ({ children, sx = {} }) => {
    return (
        <Paper
            elevation={0}
            sx={{
                p: "16px",
                mb: 3,
                borderRadius: "12px",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                ...sx,
            }}
        >
            <Grid container spacing={2} alignItems="center">
                {children}
            </Grid>
        </Paper>
    );
};

export default React.memo(AdminFilterToolbar);
