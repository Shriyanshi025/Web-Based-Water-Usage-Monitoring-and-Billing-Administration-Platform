import React from "react";
import { Grid } from "@mui/material";
import { LAYOUT_CONSTANTS } from "./layoutConstants";

export default function ChartGrid({ children }) {
  const childrenArray = React.Children.toArray(children);
  return (
    <Grid container spacing={LAYOUT_CONSTANTS.ELEMENT_GAP} sx={{ alignItems: "stretch" }}>
      {childrenArray.map((child, idx) => (
        <Grid key={idx} size={{ xs: 12, md: 6 }} sx={{ display: "flex" }}>
          <div style={{ width: "100%", height: "100%" }}>{child}</div>
        </Grid>
      ))}
    </Grid>
  );
}
