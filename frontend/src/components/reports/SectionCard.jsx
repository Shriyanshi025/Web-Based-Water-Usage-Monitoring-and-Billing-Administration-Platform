import React from "react";
import { Paper, Box, Typography, Divider } from "@mui/material";
import { LAYOUT_CONSTANTS } from "./layoutConstants";

export default function SectionCard({ icon, title, description, children, headerAction, sx = {} }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: LAYOUT_CONSTANTS.SECTION_RADIUS,
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        borderColor: "divider",
        bgcolor: "background.paper",
        mb: LAYOUT_CONSTANTS.SECTION_GAP,
        ...sx
      }}
    >
      {/* Universal Section Header */}
      <Box
        sx={{
          p: LAYOUT_CONSTANTS.CONTAINER_PADDING,
          pb: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "16px",
          bgcolor: "rgba(0,0,0,0.008)"
        }}
      >
        <Box sx={{ flex: 1, minWidth: 240 }}>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: 1.2, color: "text.primary" }}
          >
            {icon && React.cloneElement(icon, { sx: { fontSize: 24, color: "primary.main" } })}
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: "0.85rem" }}>
              {description}
            </Typography>
          )}
        </Box>
        {headerAction && <Box>{headerAction}</Box>}
      </Box>

      {/* Standard Divider */}
      <Divider />

      {/* Universal Content Body */}
      <Box sx={{ p: LAYOUT_CONSTANTS.CONTAINER_PADDING }}>
        {children}
      </Box>
    </Paper>
  );
}
