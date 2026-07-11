import React from "react";
import { Box, Typography, Button } from "@mui/material";
import InboxIcon from "@mui/icons-material/Inbox";
import { motion } from "framer-motion";

/**
 * Reusable EmptyState component
 * @param {Object} props
 * @param {string} props.title - Main title
 * @param {string} props.message - Subtitle or message
 * @param {React.ReactNode} [props.icon] - Custom icon component
 * @param {React.ReactNode} [props.action] - Optional action element (usually a button)
 */
const EmptyState = ({ title = "No Data Found", message = "There is currently no data to display.", icon, action }) => {
    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                p: 6,
                textAlign: "center",
                color: "text.secondary",
                borderRadius: 2,
                bgcolor: "background.paper",
                border: "1px dashed",
                borderColor: "divider"
            }}
        >
            <Box sx={{ mb: 2, color: "text.disabled", "& > svg": { fontSize: 64 } }}>
                {icon || <InboxIcon />}
            </Box>
            <Typography variant="h6" color="text.primary" fontWeight={600} gutterBottom>
                {title}
            </Typography>
            <Typography variant="body2" sx={{ maxWidth: 400, mb: action ? 3 : 0 }}>
                {message}
            </Typography>
            {action && (
                <Box>
                    {action}
                </Box>
            )}
        </Box>
    );
};

export default React.memo(EmptyState);
