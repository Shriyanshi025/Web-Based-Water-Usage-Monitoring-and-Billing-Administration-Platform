import React from "react";
import { Paper, Box, Typography, Divider } from "@mui/material";
import { LAYOUT_CONSTANTS } from "./layoutConstants";

export default function SectionCard({ icon, title, description, children, headerAction, sx = {} }) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: LAYOUT_CONSTANTS.SECTION_RADIUS,
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.08)",
        bgcolor: "background.paper",
        mb: LAYOUT_CONSTANTS.SECTION_GAP,
        p: 3,
        ...sx
      }}
    >
      {/* Universal Section Header */}
      <Box
        sx={{
          pb: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "16px",
          bgcolor: "transparent"
        }}
      >
        <Box sx={{ flex: 1, minWidth: 240 }}>
          <Typography
            variant="subtitle1"
            fontWeight={700}
            color="text.primary"
            sx={{ display: "flex", alignItems: "center", gap: 1.2, letterSpacing: 0.3 }}
          >
            {icon && React.cloneElement(icon, { sx: { fontSize: 20, color: "primary.main" } })}
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

      {/* Universal Content Body */}
      <Box sx={{ pt: 1.5 }}>
        {children}
      </Box>
    </Paper>
  );
}
