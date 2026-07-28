import React from "react";
import { Box, Typography, Stack, Chip, Tooltip, Avatar } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import StatusBadge from "./StatusBadge";

/**
 * Format raw Role enums to human-friendly display titles
 */
export const formatRole = (role) => {
    if (!role) return "";
    switch (role.toUpperCase()) {
        case "COMMUNITY_ADMIN":
            return "Community Admin";
        case "MAIN_ADMIN":
            return "Main Admin";
        case "USER":
        case "RESIDENT":
            return "Resident";
        default:
            return role.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    }
};

/**
 * Format generic raw Enum strings to capitalized title format
 */
export const formatEnum = (value) => {
    if (!value) return "N/A";
    return value.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
};

/**
 * Standard User Cell (Name + Role / Email)
 */
export const UserCell = ({ name, role, email, avatar = true }) => {
    const displayName = name || email || "N/A";
    const displayRole = role ? formatRole(role) : email;

    return (
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ py: 0.5 }}>
            {avatar && (
                <Avatar 
                    sx={{ 
                        width: 30, 
                        height: 30, 
                        fontSize: "0.75rem", 
                        fontWeight: 700, 
                        bgcolor: "primary.main",
                        color: "primary.contrastText"
                    }}
                >
                    {displayName.charAt(0).toUpperCase()}
                </Avatar>
            )}
            <Box sx={{ minWidth: 0 }}>
                <Typography 
                    variant="body2" 
                    fontWeight={600} 
                    color="text.primary"
                    sx={{ 
                        lineHeight: 1.25, 
                        whiteSpace: "nowrap", 
                        overflow: "hidden", 
                        textOverflow: "ellipsis" 
                    }}
                >
                    {displayName}
                </Typography>
                {displayRole && (
                    <Typography 
                        variant="caption" 
                        color="text.secondary" 
                        sx={{ 
                            lineHeight: 1.2, 
                            display: "block", 
                            whiteSpace: "nowrap", 
                            overflow: "hidden", 
                            textOverflow: "ellipsis" 
                        }}
                    >
                        {displayRole}
                    </Typography>
                )}
            </Box>
        </Stack>
    );
};

/**
 * Standard Primary Text + Secondary Subtext Cell
 */
export const TextSubtextCell = ({ primary, secondary, primaryColor = "text.primary", primaryWeight = 600 }) => {
    return (
        <Box sx={{ py: 0.5, minWidth: 0, width: "100%" }}>
            <Typography 
                variant="body2" 
                fontWeight={primaryWeight} 
                color={primaryColor}
                sx={{ 
                    lineHeight: 1.25, 
                    whiteSpace: "nowrap", 
                    overflow: "hidden", 
                    textOverflow: "ellipsis" 
                }}
            >
                {primary || "N/A"}
            </Typography>
            {secondary && (
                <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ 
                        lineHeight: 1.2, 
                        display: "block", 
                        whiteSpace: "nowrap", 
                        overflow: "hidden", 
                        textOverflow: "ellipsis" 
                    }}
                >
                    {secondary}
                </Typography>
            )}
        </Box>
    );
};

/**
 * Standard Priority Chip Cell
 */
export const PriorityCell = ({ priority }) => {
    if (!priority) return <Typography variant="caption" color="text.secondary">N/A</Typography>;
    const val = priority.toUpperCase();
    const isUrgent = val === "URGENT" || val === "CRITICAL";
    const isHigh = val === "HIGH";

    return (
        <Chip 
            label={formatEnum(priority)} 
            size="small" 
            color={isUrgent ? "error" : isHigh ? "warning" : "default"}
            variant={isUrgent || isHigh ? "filled" : "outlined"}
            sx={{ fontWeight: 700, fontSize: "0.7rem", height: 24 }}
        />
    );
};

/**
 * Standard Formatted Date Cell
 */
export const DateCell = ({ date }) => {
    if (!date) return <Typography variant="caption" color="text.disabled">N/A</Typography>;
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return <Typography variant="caption" color="text.disabled">N/A</Typography>;
        
        const dateStr = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
        const timeStr = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

        return (
            <Tooltip title={`${dateStr} at ${timeStr}`} arrow>
                <Box sx={{ py: 0.5 }}>
                    <Typography variant="body2" sx={{ fontSize: "0.8125rem", color: "text.primary", lineHeight: 1.25 }}>
                        {dateStr}
                    </Typography>
                </Box>
            </Tooltip>
        );
    } catch {
        return <Typography variant="caption" color="text.disabled">N/A</Typography>;
    }
};

/**
 * Standard Formatted Currency Amount Cell
 */
export const AmountCell = ({ amount, currency = "₹" }) => {
    if (amount === undefined || amount === null) return <Typography variant="caption" color="text.disabled">—</Typography>;
    const num = Number(amount);
    const formatted = isNaN(num) ? amount : num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    return (
        <Typography variant="body2" fontWeight={700} color="text.primary">
            {currency}{formatted}
        </Typography>
    );
};

/**
 * Standard Water Consumption Cell
 */
export const ConsumptionCell = ({ value, unit = "L" }) => {
    if (value === undefined || value === null) return <Typography variant="caption" color="text.disabled">—</Typography>;
    const num = Number(value);
    const formatted = isNaN(num) ? value : num.toLocaleString("en-IN");

    return (
        <Typography variant="body2" fontWeight={600} color="info.main">
            {formatted} {unit}
        </Typography>
    );
};
