import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  LinearProgress,
  CircularProgress,
  Stack,
  Alert
} from "@mui/material";

// Icons
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import GroupsIcon from "@mui/icons-material/Groups";
import HomeIcon from "@mui/icons-material/Home";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";

// Recharts
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  LineChart,
  Line,
  Cell
} from "recharts";

// Service
import PeerBenchmarkingService from "../../services/PeerBenchmarkingService";
import SkeletonCard from "../common/SkeletonCard";
import { formatWaterUsage } from "../../helpers/numberHelper";

function SummaryItem({ icon, iconBg, iconColor, label, value, secondaryText, isFirst = false }) {
  return (
    <Grid
      item
      xs={12}
      sm={6}
      md={3}
      sx={{
        display: "flex",
        alignItems: "stretch",
        borderLeft: { xs: "none", md: isFirst ? "none" : "1px solid" },
        borderColor: { xs: "transparent", md: "divider" },
        px: { xs: 1.5, md: 2.5 },
        py: { xs: 1.5, md: 0 },
        borderTop: { xs: isFirst ? "none" : "1px solid", sm: "none" },
        borderTopColor: { xs: "divider", sm: "transparent" }
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, width: "100%" }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            bgcolor: iconBg,
            color: iconColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}
        >
          {React.cloneElement(icon, { sx: { fontSize: 22 } })}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1, pt: 0.25 }}>
          <Typography variant="caption" color="text.secondary" display="block" fontWeight={600} sx={{ lineHeight: 1.2 }}>
            {label}
          </Typography>
          <Box sx={{ mt: 0.5, lineHeight: 1.2 }}>
            {typeof value === "string" || typeof value === "number" ? (
              <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ lineHeight: 1.2 }}>
                {value}
              </Typography>
            ) : (
              value
            )}
          </Box>
          {secondaryText && (
            <Box sx={{ mt: 0.5 }}>
              {typeof secondaryText === "string" ? (
                <Typography variant="caption" color="text.secondary" display="block" fontWeight={500} sx={{ fontSize: "0.75rem", lineHeight: 1.2 }}>
                  {secondaryText}
                </Typography>
              ) : (
                secondaryText
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Grid>
  );
}

export default function PeerBenchmarkingSection({ residentProfileId, compact = false }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBenchmarkData();
  }, []);

  const fetchBenchmarkData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await PeerBenchmarkingService.getMyBenchmark();
      setData(res);
    } catch (err) {
      console.error("Failed to load peer benchmarking data", err);
      setError(err?.response?.data?.message || "Failed to load peer benchmarking data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Paper variant="outlined" sx={{ p: 3, borderRadius: "14px", mb: 3 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Peer Benchmarking & Community Comparison
        </Typography>
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={6}>
            <SkeletonCard />
          </Grid>
          <Grid item xs={12} md={6}>
            <SkeletonCard />
          </Grid>
        </Grid>
      </Paper>
    );
  }

  if (error || !data) {
    return (
      <Paper variant="outlined" sx={{ p: 3, borderRadius: "14px", mb: 3 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Peer Benchmarking & Community Comparison
        </Typography>
        <Alert severity="warning">
          {error || "Benchmarking data is currently unavailable."}
        </Alert>
      </Paper>
    );
  }

  const {
    sufficientData,
    statusMessage,
    currentMonthUsage,
    communityAverageUsage,
    similarHouseholdAverageUsage,
    similarHouseholdBasis,
    communityDiffPercentage,
    communityComparisonStatus,
    previousMonthUsage,
    previousMonthDiffPercentage,
    previousMonthComparisonStatus,
    communityRank,
    totalHouseholdsInCommunity,
    waterEfficiencyScore,
    badgeName,
    badgeColor,
    badgeDescription,
    monthlyTrend,
    dynamicConservationTips
  } = data;

  // Comparison Bar Chart data
  const comparisonChartData = [
    {
      name: "Your Household",
      usage: currentMonthUsage,
      fill: badgeColor || "#0288d1"
    },
    {
      name: "Similar Households",
      usage: similarHouseholdAverageUsage,
      fill: "#7b1fa2"
    },
    {
      name: "Community Average",
      usage: communityAverageUsage,
      fill: "#0284c7"
    }
  ];

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        mb: 3,
        borderRadius: "14px",
        bgcolor: "background.paper",
        borderColor: "divider",
        boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
      }}
    >
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{
          mb: 3,
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" }
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700} color="text.primary">
            Peer Benchmarking & Water Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Compare your consumption with community neighbors and track your water efficiency score
          </Typography>
        </Box>
        
        {sufficientData && badgeName ? (
          <Chip
            icon={<EmojiEventsIcon />}
            label={badgeName}
            sx={{
              fontWeight: 700,
              fontSize: "0.85rem",
              px: 1,
              py: 0.5,
              bgcolor: `${badgeColor}15`,
              color: badgeColor,
              border: `1.5px solid ${badgeColor}`
            }}
          />
        ) : (
          <Chip
            icon={<HourglassEmptyIcon />}
            label="Pending Benchmarking"
            color="default"
            variant="outlined"
            sx={{ fontWeight: 600, fontSize: "0.8rem" }}
          />
        )}
      </Stack>

      {/* Insufficient Data Neutral State Banner */}
      {!sufficientData && (
        <Alert
          severity="info"
          icon={<HourglassEmptyIcon fontSize="inherit" />}
          sx={{ mb: 3, borderRadius: "10px" }}
        >
          <Typography variant="subtitle2" fontWeight={700}>
            Insufficient Benchmark Data
          </Typography>
          <Typography variant="body2">
            {statusMessage || "Benchmark will be available after sufficient meter readings are recorded."}
          </Typography>
        </Alert>
      )}

      {/* Top 3 Cards Grid */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Efficiency Score Gauge Card */}
        <Grid item xs={12} md={4}>
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              height: "100%",
              borderRadius: "12px",
              bgcolor: "grey.50",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center"
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" fontWeight={600} gutterBottom>
              Water Efficiency Score
            </Typography>
            
            {sufficientData && waterEfficiencyScore != null ? (
              <>
                <Box sx={{ position: "relative", display: "inline-flex", my: 2 }}>
                  <CircularProgress
                    variant="determinate"
                    value={100}
                    size={110}
                    thickness={6}
                    sx={{ color: "grey.200" }}
                  />
                  <CircularProgress
                    variant="determinate"
                    value={waterEfficiencyScore}
                    size={110}
                    thickness={6}
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
                      justifyContent: "center",
                      flexDirection: "column"
                    }}
                  >
                    <Typography variant="h4" component="div" fontWeight={800} color={badgeColor}>
                      {waterEfficiencyScore}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      / 100
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ mt: 1 }}>
                  {badgeDescription}
                </Typography>
              </>
            ) : (
              <Box sx={{ my: 3, py: 1 }}>
                <HourglassEmptyIcon sx={{ fontSize: 44, color: "text.disabled", mb: 1 }} />
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  Score Awaiting Readings
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Requires recorded consumption
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Community Rank Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              height: "100%",
              borderRadius: "12px",
              bgcolor: "grey.50",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                Community Conservation Rank
              </Typography>
              <EmojiEventsIcon sx={{ color: sufficientData ? "#f57c00" : "action.disabled" }} />
            </Stack>

            {sufficientData && communityRank != null ? (
              <>
                <Box sx={{ my: 1.5 }}>
                  <Stack direction="row" alignItems="baseline" spacing={1}>
                    <Typography variant="h3" fontWeight={800} color="primary.main">
                      #{communityRank}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" fontWeight={600}>
                      out of {totalHouseholdsInCommunity} households
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                    Ranked by overall water conservation & efficiency performance.
                  </Typography>
                </Box>

                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Efficiency Standing
                    </Typography>
                    <Typography variant="caption" color="primary.main" fontWeight={700}>
                      Top {Math.max(1, Math.round((communityRank / Math.max(1, totalHouseholdsInCommunity)) * 100))}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, Math.max(5, (1 - (communityRank - 1) / Math.max(1, totalHouseholdsInCommunity)) * 100))}
                    sx={{ height: 8, borderRadius: 4, bgcolor: "grey.200" }}
                  />
                </Box>
              </>
            ) : (
              <Box sx={{ my: 2.5 }}>
                <Typography variant="h5" fontWeight={700} color="text.secondary">
                  Unranked
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Rankings generated once meter usage data is established across community households.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Previous Month Comparison Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              height: "100%",
              borderRadius: "12px",
              bgcolor: "grey.50",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                Previous Month Comparison
              </Typography>
              {previousMonthComparisonStatus === "DECREASED" ? (
                <TrendingDownIcon color="success" />
              ) : previousMonthComparisonStatus === "INCREASED" ? (
                <TrendingUpIcon color="error" />
              ) : (
                <TrendingFlatIcon color="action" />
              )}
            </Stack>

            <Box sx={{ my: 1.5 }}>
              <Typography variant="h4" fontWeight={800} color="text.primary">
                {formatWaterUsage(currentMonthUsage)}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                <Chip
                  size="small"
                  label={`${previousMonthDiffPercentage > 0 ? "+" : ""}${previousMonthDiffPercentage}%`}
                  color={previousMonthComparisonStatus === "DECREASED" ? "success" : (previousMonthComparisonStatus === "INCREASED" ? "error" : "default")}
                  sx={{ fontWeight: 700, fontSize: "0.75rem", height: 22 }}
                />
                <Typography variant="caption" color="text.secondary">
                  vs {formatWaterUsage(previousMonthUsage)} last month
                </Typography>
              </Stack>
            </Box>

            <Typography variant="caption" color="text.secondary">
              {previousMonthComparisonStatus === "DECREASED"
                ? "🎉 Great work! You consumed less water compared to last month."
                : previousMonthComparisonStatus === "INCREASED"
                ? "⚠️ Consumption increased. Keep an eye on daily activities."
                : "Consistent usage maintained compared to last month."}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Unified Horizontal Benchmark Summary Information Panel */}
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: "12px", mb: 3 }}>
        <Grid container spacing={0} alignItems="stretch">
          {/* Section 1: Current Usage */}
          <SummaryItem
            isFirst={true}
            icon={<WaterDropIcon />}
            iconBg="info.50"
            iconColor="info.main"
            label="Current Usage"
            value={formatWaterUsage(currentMonthUsage)}
          />

          {/* Section 2: Community Average */}
          <SummaryItem
            icon={<GroupsIcon />}
            iconBg="primary.50"
            iconColor="primary.main"
            label="Community Average"
            value={formatWaterUsage(communityAverageUsage)}
            secondaryText={
              <Typography
                variant="caption"
                color={communityComparisonStatus === "BELOW_AVERAGE" ? "success.main" : "error.main"}
                fontWeight={700}
                sx={{ display: "block", mt: 0.25 }}
              >
                {communityDiffPercentage > 0 ? `+${communityDiffPercentage}%` : `${communityDiffPercentage}%`} vs avg
              </Typography>
            }
          />

          {/* Section 3: Similar Household */}
          <SummaryItem
            icon={<HomeIcon />}
            iconBg="#f3e5f5"
            iconColor="#7b1fa2"
            label="Similar Household"
            value={formatWaterUsage(similarHouseholdAverageUsage)}
            secondaryText={`Based on ${similarHouseholdBasis}`}
          />

          {/* Section 4: Conservation Badge */}
          <SummaryItem
            icon={<EmojiEventsIcon />}
            iconBg="#fff8e1"
            iconColor="#f57c00"
            label="Conservation Badge"
            value={
              sufficientData && badgeName ? (
                <Chip
                  size="small"
                  label={badgeName}
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    bgcolor: `${badgeColor}15`,
                    color: badgeColor,
                    border: `1px solid ${badgeColor}`,
                    maxWidth: "100%",
                    height: "auto",
                    py: 0.5,
                    "& .MuiChip-label": {
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                      lineHeight: 1.2,
                      px: 1
                    }
                  }}
                />
              ) : (
                <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                  Pending Readings
                </Typography>
              )
            }
          />
        </Grid>
      </Paper>

      {/* Unified Benchmark Analytics Panel */}
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: "12px", mb: 3 }}>
        <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ mb: 2.5 }}>
          Benchmark Analytics
        </Typography>

        <Grid container spacing={2.5} alignItems="center">
          {/* Comparison Bar Chart */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight={700} color="text.secondary" sx={{ mb: 1.5 }}>
              Benchmark Comparison
            </Typography>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={comparisonChartData} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} />
                <YAxis tick={{ fontSize: 12 }} />
                <RechartsTooltip formatter={(val) => [`${val} Units`, "Water Usage"]} />
                <Bar dataKey="usage" radius={[6, 6, 0, 0]}>
                  {comparisonChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Grid>

          {/* 6-Month Trend Line Chart */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              borderLeft: { xs: "none", md: "1px solid" },
              borderColor: { xs: "transparent", md: "divider" },
              pl: { xs: 0, md: 2.5 },
              pt: { xs: 2.5, md: 0 },
              borderTop: { xs: "1px solid", md: "none" },
              borderTopColor: { xs: "divider", md: "transparent" }
            }}
          >
            <Typography variant="subtitle1" fontWeight={700} color="text.secondary" sx={{ mb: 1.5 }}>
              6-Month Historical Trend
            </Typography>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyTrend} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="monthName" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <RechartsTooltip formatter={(val) => [`${val} Units`]} />
                <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: 10 }} />
                <Line
                  type="monotone"
                  dataKey="residentUsage"
                  name="Your Usage"
                  stroke={badgeColor || "#0288d1"}
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="communityAverage"
                  name="Community Avg"
                  stroke="#9e9e9e"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
              </LineChart>
            </ResponsiveContainer>
          </Grid>
        </Grid>
      </Paper>

      {/* Dynamic Conservation Tips Section */}
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: "12px", bgcolor: "grey.50" }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <LightbulbIcon color="warning" />
          <Typography variant="subtitle1" fontWeight={700} color="text.primary">
            Personalized Water Conservation Insights
          </Typography>
        </Stack>

        <Stack spacing={1.5}>
          {dynamicConservationTips && dynamicConservationTips.map((tip, index) => (
            <Paper
              key={index}
              variant="outlined"
              sx={{
                p: 1.75,
                borderRadius: "8px",
                bgcolor: "background.paper",
                borderColor: "divider"
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <CheckCircleOutlinedIcon color="primary" fontSize="small" sx={{ mt: 0.2 }} />
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                  {tip}
                </Typography>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Paper>
    </Paper>
  );
}
