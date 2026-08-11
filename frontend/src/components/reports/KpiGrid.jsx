import React from "react";
import { Box } from "@mui/material";
import { LAYOUT_CONSTANTS } from "./layoutConstants";

export default function KpiGrid({ children, minWidth = LAYOUT_CONSTANTS.KPI_MIN_WIDTH }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}px, 1fr))`,
        gap: LAYOUT_CONSTANTS.ELEMENT_GAP,
        width: "100%"
      }}
    >
      {children}
    </Box>
  );
}
