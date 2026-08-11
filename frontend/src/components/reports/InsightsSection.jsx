import React from "react";
import { Grid, Alert, Typography } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SectionCard from "./SectionCard";

export default function InsightsSection({ insights = [] }) {
  return (
    <SectionCard
      icon={<InfoIcon />}
      title="AI Insights & Advisory"
      description="Automated data insights, anomaly alerts, and conservation recommendations generated for your community."
    >
      <Grid container spacing={2}>
        {insights.map((item, idx) => (
          <Grid key={idx} size={{ xs: 12, md: 6 }}>
            <Alert severity={item.severity || "info"} icon={item.severity === "warning" ? <WarningAmberIcon /> : <CheckCircleIcon />} sx={{ borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={700}>{item.title}</Typography>
              <Typography variant="body2">{item.description}</Typography>
            </Alert>
          </Grid>
        ))}
      </Grid>
    </SectionCard>
  );
}
