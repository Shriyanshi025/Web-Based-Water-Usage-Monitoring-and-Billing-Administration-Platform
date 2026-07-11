import React from "react";
import { Chip } from "@mui/material";
import { STATUS_COLORS } from "../../constants/statusColors";

/**
 * Reusable StatusBadge component
 * @param {Object} props
 * @param {string} props.status - Status string (e.g., ACTIVE, PENDING)
 * @param {string} [props.size="small"] - Size of the badge ('small' | 'medium')
 * @param {object} [props.sx] - Additional styles
 */
const StatusBadge = ({ status, size = "small", sx = {} }) => {
    // Fallback to a default grey if status not found
    const colorConfig = STATUS_COLORS[status?.toUpperCase()] || {
        bg: "#F3F4F6",
        text: "#374151",
    };

    return (
        <Chip
            label={status || "UNKNOWN"}
            size={size}
            sx={{
                bgcolor: colorConfig.bg,
                color: colorConfig.text,
                fontWeight: 600,
                borderRadius: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                ...sx,
            }}
        />
    );
};

export default React.memo(StatusBadge);
