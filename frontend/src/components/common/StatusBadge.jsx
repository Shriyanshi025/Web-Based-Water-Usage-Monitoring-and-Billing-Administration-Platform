import React from "react";
import { Chip } from "@mui/material";
import { STATUS_COLORS } from "../../constants/statusColors";

/**
 * HydroSync StatusBadge
 *
 * Renders a domain-specific status chip for any entity status value.
 * Colors are sourced entirely from STATUS_COLORS — no hardcoded values here.
 *
 * @param {Object} props
 * @param {string}  props.status   - Status key (e.g., "ACTIVE", "PENDING", "OVERDUE")
 * @param {string}  [props.size]   - MUI Chip size: "small" (default) | "medium"
 * @param {object}  [props.sx]     - Additional MUI sx overrides
 */
const StatusBadge = ({ status, size = "small", sx = {} }) => {
    const colorConfig =
        STATUS_COLORS[status?.toUpperCase()] || STATUS_COLORS._DEFAULT;

    return (
        <Chip
            label={status || "UNKNOWN"}
            size={size}
            sx={{
                bgcolor:      colorConfig.bg,
                color:        colorConfig.text,
                border:       `1px solid ${colorConfig.border}`,
                // Typography, radius, fontWeight, letterSpacing, textTransform
                // are all set via theme.components.MuiChip — do not duplicate here
                ...sx,
            }}
        />
    );
};

export default React.memo(StatusBadge);
