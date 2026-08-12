import React from "react";
import { Paper, Typography, Box } from "@mui/material";
import { LAYOUT_CONSTANTS } from "./layoutConstants";

export default function ChartCard({ title, subtitle, children, height = LAYOUT_CONSTANTS.CHART_CONTAINER_HEIGHT, action }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: LAYOUT_CONSTANTS.CONTAINER_PADDING,
        borderRadius: LAYOUT_CONSTANTS.CARD_RADIUS,
        border: "1px solid rgba(0,0,0,0.08)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        boxShadow: "none"
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: "1rem", lineHeight: 1.2, mb: 0.4 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.8rem", display: "block" }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && <Box sx={{ ml: 1.5 }}>{action}</Box>}
      </Box>

      <Box sx={{ flex: 1, minHeight: height, width: "100%", position: "relative" }}>
        {children}
      </Box>
    </Paper>
  );
}
