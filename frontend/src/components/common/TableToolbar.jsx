import React from "react";
import { Toolbar, Typography, Box } from "@mui/material";

/**
 * Reusable TableToolbar component for DataGrids or tables
 * @param {Object} props
 * @param {string} props.title
 * @param {React.ReactNode} [props.action]
 */
const TableToolbar = ({ title, action }) => {
    return (
        <Toolbar
            sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
                borderBottom: '1px solid',
                borderColor: 'divider'
            }}
        >
            <Typography
                sx={{ flex: '1 1 100%', fontWeight: 600 }}
                variant="h6"
                id="tableTitle"
                component="div"
            >
                {title}
            </Typography>

            {action && (
                <Box sx={{ flexShrink: 0 }}>
                    {action}
                </Box>
            )}
        </Toolbar>
    );
};

export default React.memo(TableToolbar);
