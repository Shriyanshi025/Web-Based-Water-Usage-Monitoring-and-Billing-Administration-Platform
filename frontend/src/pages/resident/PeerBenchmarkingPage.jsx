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
  Alert,
  Tooltip
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
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

// Layout & Shared Components
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import SkeletonCard from "../../components/common/SkeletonCard";
import { formatWaterUsage } from "../../helpers/numberHelper";

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

const CARD_BORDER_RADIUS = "14px";

function SummaryItem({ icon, iconBg, iconColor, label, value, secondaryText, isFirst = false }) {
  return (
    <Grid
      size={{ xs: 12, sm: 6, md: 3 }}
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

export default function PeerBenchmarkingPage() {
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
      <DashboardLayout>
        <PageHeader
          title="Peer Benchmarking & Water Analytics"
          subtitle="Compare your consumption with community neighbors and track your water efficiency score"
        />
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} md={4} key={i}>
              <SkeletonCard />
            </Grid>
          ))}
        </Grid>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <PageHeader
          title="Peer Benchmarking & Water Analytics"
          subtitle="Compare your consumption with community neighbors and track your water efficiency score"
        />
        <Alert severity="warning" sx={{ borderRadius: "10px" }}>
          {error || "Benchmarking data is currently unavailable."}
        </Alert>
      </DashboardLayout>
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
    <DashboardLayout>
      <PageHeader
        title="Peer Benchmarking & Water Analytics"
        subtitle="Compare your household water consumption with community neighbors and track your water efficiency score"
        action={
          sufficientData && badgeName ? (
            <Chip
              icon={<EmojiEventsIcon />}
              label={badgeName}
              sx={{
                fontWeight: 700,
                fontSize: "0.875rem",
                px: 1.2,
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
              variant="outlined"
              sx={{ fontWeight: 600, fontSize: "0.8125rem" }}
            />
          )
        }
      />

      {/* Insufficient Data Banner */}
      {!sufficientData && (
        <Alert
          severity="info"
          icon={<HourglassEmptyIcon fontSize="inherit" />}
          sx={{ mb: 3, borderRadius: "12px" }}
        >
          <Typography variant="subtitle2" fontWeight={700}>
            Insufficient Benchmark Data
          </Typography>
          <Typography variant="body2">
            {statusMessage || "Benchmark will be available after sufficient meter readings are recorded."}
          </Typography>
        </Alert>
      )}

      {/* ── ROW 1: Top Key Performance Metrics (Equal Height Cards) ── */}
      <Grid container spacing={3} sx={{ mb: 3, alignItems: "stretch" }}>
        {/* Card 1: Water Efficiency Score */}
        <Grid size={{ xs: 12, md: 4 }} sx={{ display: "flex" }}>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              width: "100%",
              borderRadius: CARD_BORDER_RADIUS,
              bgcolor: "background.paper",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" fontWeight={600} gutterBottom>
              Water Efficiency Score
            </Typography>

            {sufficientData && waterEfficiencyScore != null ? (
              <>
                <Box sx={{ position: "relative", display: "inline-flex", my: 1.5 }}>
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
                <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ mt: 0.5 }}>
                  {badgeDescription}
                </Typography>
              </>
            ) : (
              <Box sx={{ my: 2, py: 1 }}>
                <HourglassEmptyIcon sx={{ fontSize: 44, color: "text.disabled", mb: 1 }} />
                <Typography variant="body1" color="text.secondary" fontWeight={600}>
                  Score Awaiting Readings
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Requires recorded consumption history
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Card 2: Community Rank */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }} sx={{ display: "flex" }}>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              width: "100%",
              borderRadius: CARD_BORDER_RADIUS,
              bgcolor: "background.paper",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
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
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
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
              <Box sx={{ my: 2 }}>
                <Typography variant="h4" fontWeight={700} color="text.secondary">
                  Unranked
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Rankings will generate once regular meter readings are established across community households.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Card 3: Previous Month Comparison */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }} sx={{ display: "flex" }}>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              width: "100%",
              borderRadius: CARD_BORDER_RADIUS,
              bgcolor: "background.paper",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
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
              <Typography variant="h3" fontWeight={800} color="text.primary">
                {formatWaterUsage(currentMonthUsage)}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                <Chip
                  size="small"
                  label={`${previousMonthDiffPercentage > 0 ? "+" : ""}${previousMonthDiffPercentage}%`}
                  color={previousMonthComparisonStatus === "DECREASED" ? "success" : (previousMonthComparisonStatus === "INCREASED" ? "error" : "default")}
                  sx={{ fontWeight: 700, fontSize: "0.75rem", height: 24 }}
                />
                <Typography variant="body2" color="text.secondary">
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

      {/* ── ROW 2: Single Horizontal Benchmark Summary Information Panel ── */}
      <Paper
        variant="outlined"
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: CARD_BORDER_RADIUS,
          bgcolor: "background.paper",
          boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
        }}
      >
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

      {/* ── ROW 3: Single Unified Benchmark Analytics Panel with Vertical Divider ── */}
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          mb: 3,
          borderRadius: CARD_BORDER_RADIUS,
          bgcolor: "background.paper",
          boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
        }}
      >
        <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ mb: 3 }}>
          Benchmark Analytics
        </Typography>

        <Grid container spacing={3} alignItems="center">
          {/* Benchmark Household Comparison Chart */}
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: "flex", flexDirection: "column" }}>
            <Typography variant="subtitle1" fontWeight={700} color="text.secondary" sx={{ mb: 2 }}>
              Benchmark Comparison
            </Typography>
            <Box sx={{ width: "100%", height: 280 }}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={comparisonChartData} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <RechartsTooltip formatter={(val) => [`${val} Units`, "Water Usage"]} />
                  <Bar dataKey="usage" radius={[6, 6, 0, 0]} maxBarSize={55}>
                    {comparisonChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Grid>

          {/* 6-Month Historical Benchmark Trend Chart */}
          <Grid
            size={{ xs: 12, md: 6 }}
            sx={{
              display: "flex",
              flexDirection: "column",
              borderLeft: { xs: "none", md: "1px solid" },
              borderColor: { xs: "transparent", md: "divider" },
              pl: { xs: 0, md: 3 },
              pt: { xs: 3, md: 0 },
              borderTop: { xs: "1px solid", md: "none" },
              borderTopColor: { xs: "divider", md: "transparent" }
            }}
          >
            <Typography variant="subtitle1" fontWeight={700} color="text.secondary" sx={{ mb: 2 }}>
              6-Month Historical Trend
            </Typography>
            <Box sx={{ width: "100%", height: 280 }}>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthlyTrend} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                  <XAxis dataKey="monthName" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <RechartsTooltip formatter={(val) => [`${val} Units`]} />
                  <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="residentUsage"
                    name="Your Usage"
                    stroke={badgeColor || "#0288d1"}
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 7 }}
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
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* ── ROW 4: Personalized Water Conservation Insights ── */}
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          borderRadius: CARD_BORDER_RADIUS,
          bgcolor: "background.paper",
          boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
          <LightbulbIcon color="warning" />
          <Typography variant="h6" fontWeight={700} color="text.primary">
            Personalized Water Conservation Insights
          </Typography>
        </Stack>

        <Stack spacing={1.75}>
          {dynamicConservationTips && dynamicConservationTips.map((tip, index) => (
            <Paper
              key={index}
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: "10px",
                bgcolor: "grey.50",
                borderColor: "divider"
              }}
            >
              <Stack direction="row" spacing={1.75} alignItems="flex-start">
                <CheckCircleOutlinedIcon color="primary" fontSize="small" sx={{ mt: 0.25 }} />
                <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.6, fontWeight: 500 }}>
                  {tip}
                </Typography>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Paper>
    </DashboardLayout>
  );
}
