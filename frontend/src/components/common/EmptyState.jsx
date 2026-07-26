import React from "react";
import { Box, Typography, Button } from "@mui/material";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";

/**
 * Reusable EmptyState component.
 */
const EmptyState = ({
    title = "No Data Found",
    message = "There is currently no data to display.",
    icon,
    action,
    compact = false,
}) => {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: compact ? 4 : 6,
                px: 3,
                textAlign: "center",
                width: "100%",
            }}
        >
            {/* Icon */}
            <Box
                sx={{
                    mb: 1.75,
                    color: "text.disabled",
                    "& .MuiSvgIcon-root": { fontSize: compact ? "2.25rem" : "2.75rem" },
                    "& > svg": { fontSize: compact ? "2.25rem" : "2.75rem" },
                    opacity: 0.6,
                }}
            >
                {icon || <InboxOutlinedIcon />}
            </Box>

            {/* Title */}
            <Typography
                sx={{
                    fontWeight: 600,
                    color: "text.secondary",
                    fontSize: compact ? "0.875rem" : "0.9375rem",
                    lineHeight: 1.4,
                    mb: 0.5,
                }}
            >
                {title}
            </Typography>

            {/* Message */}
            <Typography
                variant="body2"
                sx={{
                    color: "text.disabled",
                    maxWidth: 320,
                    lineHeight: 1.6,
                    fontSize: "0.8125rem",
                    ...(action && { mb: 2.5 }),
                }}
            >
                {message}
            </Typography>

            {/* Optional action */}
            {action && <Box>{action}</Box>}
        </Box>
    );
};

export default React.memo(EmptyState);
