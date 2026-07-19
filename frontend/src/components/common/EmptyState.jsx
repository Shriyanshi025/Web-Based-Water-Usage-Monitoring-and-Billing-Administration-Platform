import React from "react";
import { Box, Typography, Button } from "@mui/material";
import InboxIcon from "@mui/icons-material/Inbox";

/**
 * Reusable EmptyState component — shown when a list or data view has no records.
 *
 * @param {Object}           props
 * @param {string}           [props.title="No Data Found"]
 * @param {string}           [props.message]
 * @param {React.ReactNode}  [props.icon]   - Custom icon; defaults to InboxIcon
 * @param {React.ReactNode}  [props.action] - Optional CTA (usually a Button)
 */
const EmptyState = ({
    title = "No Data Found",
    message = "There is currently no data to display.",
    icon,
    action,
}) => {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 7,
                px: 4,
                textAlign: "center",
                bgcolor: "background.paper",
                borderRadius: 2,
                border: "1px dashed",
                borderColor: "divider",
                width: "100%",
            }}
        >
            {/* Icon */}
            <Box
                sx={{
                    mb: 2,
                    color: "text.disabled",
                    "& .MuiSvgIcon-root": { fontSize: "3rem" },
                    "& > svg": { fontSize: "3rem" },
                }}
            >
                {icon || <InboxIcon />}
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
                    ...(action && { mb: 3 }),
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
