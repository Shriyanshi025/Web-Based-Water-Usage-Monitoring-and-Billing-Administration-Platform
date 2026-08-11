import React from "react";
import { Paper, Typography, Box } from "@mui/material";
import { LAYOUT_CONSTANTS } from "./layoutConstants";

export default function ChartCard({ title, subtitle, children, height = LAYOUT_CONSTANTS.CHART_CONTAINER_HEIGHT, action }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: LAYOUT_CONSTANTS.CONTAINER_PADDING,
        borderRadius: LAYOUT_CONSTANTS.CARD_RADIUS,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
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
