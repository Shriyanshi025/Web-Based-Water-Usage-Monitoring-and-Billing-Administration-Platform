import React, { useEffect, useState } from "react";
import {
  Paper,
  Box,
  Typography,
  Chip,
  Button,
  Stack,
  CircularProgress,
  Grid
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import PeerBenchmarkingService from "../../services/PeerBenchmarkingService";
import { ROUTES } from "../../constants/routes";
import { formatWaterUsage } from "../../helpers/numberHelper";

export default function BenchmarkSummaryWidget() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    PeerBenchmarkingService.getMyBenchmark()
      .then((res) => setData(res))
      .catch((err) => console.error("Widget fetch benchmark error", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: "14px", mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary">Loading Peer Benchmarking Summary...</Typography>
      </Paper>
    );
  }

  if (!data) return null;

  const {
    sufficientData,
    waterEfficiencyScore,
    badgeName,
    badgeColor,
    communityRank,
    totalHouseholdsInCommunity,
    currentMonthUsage
  } = data;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        mb: 3,
        borderRadius: "14px",
        bgcolor: "background.paper",
        borderColor: "divider",
        boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={2.5} alignItems="center">
          {sufficientData && waterEfficiencyScore != null ? (
            <Box sx={{ position: "relative", display: "inline-flex", flexShrink: 0 }}>
              <CircularProgress
                variant="determinate"
                value={100}
                size={54}
                thickness={5}
                sx={{ color: "grey.200" }}
              />
              <CircularProgress
                variant="determinate"
                value={waterEfficiencyScore}
                size={54}
                thickness={5}
                sx={{
                  color: badgeColor || "#0288d1",
                  position: "absolute",
                  left: 0
                }}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: "absolute",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Typography variant="caption" fontWeight={800} color={badgeColor}>
                  {waterEfficiencyScore}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box
              sx={{
                width: 54,
                height: 54,
                borderRadius: "50%",
                bgcolor: "action.hover",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <HourglassEmptyIcon color="action" fontSize="small" />
            </Box>
          )}

          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                Peer Benchmarking & Efficiency Status
              </Typography>
              {sufficientData && badgeName ? (
                <Chip
                  size="small"
                  icon={<EmojiEventsIcon sx={{ fontSize: "0.85rem !important" }} />}
                  label={badgeName}
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    bgcolor: `${badgeColor}15`,
                    color: badgeColor,
                    border: `1px solid ${badgeColor}`
                  }}
                />
              ) : (
                <Chip
                  size="small"
                  label="Pending Benchmark"
                  variant="outlined"
                  sx={{ fontSize: "0.72rem", fontWeight: 600 }}
                />
              )}
            </Stack>

            <Typography variant="body2" color="text.secondary">
              {sufficientData && communityRank != null
                ? `Ranked #${communityRank} out of ${totalHouseholdsInCommunity} households in your community. Current Month: ${formatWaterUsage(currentMonthUsage)}.`
                : "Record regular water meter readings to unlock community ranking and efficiency score."}
            </Typography>
          </Box>
        </Stack>

        <Button
          variant="contained"
          color="primary"
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate("/user/peer-benchmarking")}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: "8px",
            px: 2.5,
            whiteSpace: "nowrap"
          }}
        >
          View Full Benchmarking
        </Button>
      </Stack>
    </Paper>
  );
}
