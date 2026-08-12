import React from "react";
import { Paper, Typography, Grid, FormControl, InputLabel, Select, MenuItem, Button, Card, CardContent, Divider, Stack, CircularProgress, Box } from "@mui/material";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import SectionCard from "./SectionCard";



const fmtKL = (val) => {
  if (val == null || isNaN(val)) return "0 kL";
  return `${new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(val)} kL`;
};

export default function HouseholdComparisonSection({
  householdAId,
  setHouseholdAId,
  householdBId,
  setHouseholdBId,
  householdOptions,
  handleCompareHouseholds,
  comparing,
  comparisonData
}) {
  return (
    <SectionCard
      icon={<CompareArrowsIcon />}
      title="Household Comparison"
      description="Side-by-side performance metrics comparison between any two community households."
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          alignItems: "center",
          mb: 3,
          width: "100%"
        }}
      >
        <FormControl fullWidth size="small" sx={{ minWidth: 200, flex: 1 }}>
          <InputLabel id="household-a-label">Household A</InputLabel>
          <Select labelId="household-a-label" value={householdAId} label="Household A" onChange={(e) => setHouseholdAId(e.target.value)}>
            {householdOptions.map((opt) => (
              <MenuItem key={opt.id} value={opt.id}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small" sx={{ minWidth: 200, flex: 1 }}>
          <InputLabel id="household-b-label">Household B</InputLabel>
          <Select labelId="household-b-label" value={householdBId} label="Household B" onChange={(e) => setHouseholdBId(e.target.value)}>
            {householdOptions.map((opt) => (
              <MenuItem key={opt.id} value={opt.id}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" color="primary" onClick={handleCompareHouseholds} disabled={comparing} sx={{ minWidth: 120, height: 40, px: 3 }}>
          {comparing ? <CircularProgress size={20} /> : "Compare"}
        </Button>
      </Box>

      {comparisonData && (
        <>
          {(comparisonData.householdA?.comparisonPeriodLabel || comparisonData.householdB?.comparisonPeriodLabel) && (
            <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                Normalized Comparison Period:
              </Typography>
              <Typography variant="body2" fontWeight={700} color="primary.main">
                {comparisonData.householdA?.comparisonPeriodLabel || comparisonData.householdB?.comparisonPeriodLabel}
              </Typography>
            </Box>
          )}

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)", bgcolor: "action.hover" }}>
                <Typography variant="h6" fontWeight={700} color="primary.main">
                  {comparisonData.householdA?.flatNumber} — {comparisonData.householdA?.residentName}
                </Typography>
                <Typography variant="body2" color="text.secondary">Block: {comparisonData.householdA?.blockName}</Typography>
                <Divider sx={{ my: 1.5 }} />
                <Stack spacing={1}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}><Typography variant="body2">Period Consumption:</Typography><Typography fontWeight={700}>{fmtKL(comparisonData.householdA?.totalConsumption != null ? comparisonData.householdA.totalConsumption : comparisonData.householdA?.currentMonthUsage)}</Typography></Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}><Typography variant="body2">Efficiency Score:</Typography><Typography fontWeight={700}>{comparisonData.householdA?.efficiencyScore} / 100</Typography></Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}><Typography variant="body2">Community Rank:</Typography><Typography fontWeight={700}>#{comparisonData.householdA?.communityRank != null ? comparisonData.householdA.communityRank : comparisonData.householdA?.rank}</Typography></Box>
                </Stack>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)", bgcolor: "action.hover" }}>
                <Typography variant="h6" fontWeight={700} color="secondary.main">
                  {comparisonData.householdB?.flatNumber} — {comparisonData.householdB?.residentName}
                </Typography>
                <Typography variant="body2" color="text.secondary">Block: {comparisonData.householdB?.blockName}</Typography>
                <Divider sx={{ my: 1.5 }} />
                <Stack spacing={1}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}><Typography variant="body2">Period Consumption:</Typography><Typography fontWeight={700}>{fmtKL(comparisonData.householdB?.totalConsumption != null ? comparisonData.householdB.totalConsumption : comparisonData.householdB?.currentMonthUsage)}</Typography></Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}><Typography variant="body2">Efficiency Score:</Typography><Typography fontWeight={700}>{comparisonData.householdB?.efficiencyScore} / 100</Typography></Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}><Typography variant="body2">Community Rank:</Typography><Typography fontWeight={700}>#{comparisonData.householdB?.communityRank != null ? comparisonData.householdB.communityRank : comparisonData.householdB?.rank}</Typography></Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </SectionCard>
  );
}
