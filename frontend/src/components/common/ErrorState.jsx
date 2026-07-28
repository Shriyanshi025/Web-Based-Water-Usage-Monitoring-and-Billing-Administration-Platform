import React from "react";
import { Box, Typography, Button, Paper, useTheme } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import { safeAlpha } from "../../helpers/colorHelper";

/**
 * Reusable ErrorState component — shown when a data fetch fails.
 *
 * @param {Object}   props
 * @param {string}   [props.title="Failed to Load Data"]
 * @param {string}   [props.message="An unexpected error occurred while fetching information. Please try again."]
 * @param {function} [props.onRetry] - If provided, renders a retry button
 */
const ErrorState = ({
    title = "Failed to Load Data",
    message = "An unexpected error occurred while fetching information. Please try again.",
    onRetry,
}) => {
    const theme = useTheme();

    return (
        <Paper
            elevation={0}
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 6,
                px: 4,
                textAlign: "center",
                bgcolor: safeAlpha(theme, "error.main", 0.04),
                borderRadius: 2,
                border: "1px solid",
                borderColor: safeAlpha(theme, "error.main", 0.18),
                width: "100%",
            }}
        >
            {/* Icon */}
            <Box
                sx={{
                    mb: 2,
                    color: "error.main",
                    opacity: 0.75,
                    "& .MuiSvgIcon-root": { fontSize: "2.75rem" },
                }}
            >
                <ErrorOutlineIcon />
            </Box>

            {/* Title */}
            <Typography
                variant="h6"
                sx={{
                    fontWeight: 600,
                    color: "text.primary",
                    fontSize: "0.9375rem",
                    lineHeight: 1.4,
                    mb: 0.75,
                }}
            >
                {title}
            </Typography>

            {/* Message */}
            <Typography
                variant="body2"
                sx={{
                    color: "text.secondary",
                    maxWidth: 360,
                    lineHeight: 1.6,
                    fontSize: "0.8125rem",
                    ...(onRetry && { mb: 3 }),
                }}
            >
                {message}
            </Typography>

            {/* Retry action */}
            {onRetry && (
                <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<RefreshIcon />}
                    onClick={onRetry}
                >
                    Try again
                </Button>
            )}
        </Paper>
    );
};

export default React.memo(ErrorState);
