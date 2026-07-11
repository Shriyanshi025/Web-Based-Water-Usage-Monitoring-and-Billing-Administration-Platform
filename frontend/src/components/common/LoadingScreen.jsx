import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function LoadingScreen() {
    return (
        <Box
            sx={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "background.default",
                zIndex: (theme) => theme.zIndex.drawer + 9999,
                gap: 2
            }}
        >
            <CircularProgress size={48} thickness={4} color="primary" />
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, letterSpacing: "0.5px" }}>
                Loading details...
            </Typography>
        </Box>
    );
}
