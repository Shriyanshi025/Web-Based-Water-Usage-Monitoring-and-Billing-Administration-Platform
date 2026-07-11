import React from "react";
import { Box, Typography, Button } from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import RefreshIcon from "@mui/icons-material/Refresh";
import { motion } from "framer-motion";

/**
 * Reusable ErrorState component
 * @param {Object} props
 * @param {string} props.title - Main error title
 * @param {string} props.message - Detailed error message
 * @param {function} [props.onRetry] - Retry callback function
 */
const ErrorState = ({ title = "Something went wrong", message = "An error occurred while loading this content.", onRetry }) => {
    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                p: 5,
                textAlign: "center",
                borderRadius: 2,
                bgcolor: "error.lighter",
                border: "1px solid",
                borderColor: "error.light",
                color: "error.main"
            }}
        >
            <ErrorIcon sx={{ fontSize: 56, mb: 2, opacity: 0.8 }} />
            <Typography variant="h6" fontWeight={600} gutterBottom>
                {title}
            </Typography>
            <Typography variant="body2" sx={{ maxWidth: 400, mb: onRetry ? 3 : 0, color: "text.secondary" }}>
                {message}
            </Typography>
            {onRetry && (
                <Button 
                    variant="outlined" 
                    color="error" 
                    startIcon={<RefreshIcon />}
                    onClick={onRetry}
                    sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600 }}
                >
                    Try Again
                </Button>
            )}
        </Box>
    );
};

export default React.memo(ErrorState);
