import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button } from "@mui/material";

export default function MethodologyDialog({ methodologyOpen, setMethodologyOpen }) {
  return (
    <Dialog open={methodologyOpen} onClose={() => setMethodologyOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Benchmarking & Efficiency Scoring Methodology</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" paragraph>
          <strong>1. Baseline Consumption:</strong> Household consumption is benchmarked against the weighted average of similar households in the community.
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>2. Efficiency Score (0-100):</strong> Calculated based on occupancy normalized consumption (70% weight) and payment timeliness (30% weight).
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>3. Outlier Detection:</strong> Households exceeding 2.2x the peer baseline with low occupancy are automatically flagged for suspected pipe leakage.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setMethodologyOpen(false)} variant="contained">Close</Button>
      </DialogActions>
    </Dialog>
  );
}
