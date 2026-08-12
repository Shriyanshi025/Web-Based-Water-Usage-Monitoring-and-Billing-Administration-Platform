import React from "react";
import { Paper, Box, Typography, Divider, Skeleton } from "@mui/material";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import OpacityIcon from "@mui/icons-material/Opacity";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import PaymentsIcon from "@mui/icons-material/Payments";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import SectionCard from "./SectionCard";
import KpiGrid from "./KpiGrid";

const fmtCurrency = (val) => {
  if (val == null || isNaN(val)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(val);
};

const fmtKL = (val) => {
  if (val == null || isNaN(val)) return "0 kL";
  return `${new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(val)} kL`;
};

const fmtPct = (val) => {
  if (val == null || isNaN(val)) return "0%";
  return `${Number(val).toFixed(1)}%`;
};

const TrendBadge = ({ value, suffix = "", positiveIsGood = true }) => {
  if (value == null) return null;
  const isPositive = value > 0;
  const isNeutral = value === 0;
  const isGood = positiveIsGood ? isPositive : !isPositive;
  const color = isNeutral ? "text.secondary" : isGood ? "#2e7d32" : "#d32f2f";
  const Icon = isNeutral ? TrendingFlatIcon : isPositive ? TrendingUpIcon : TrendingDownIcon;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, mt: 0.5 }}>
      <Icon sx={{ fontSize: 15, color }} />
      <Typography variant="caption" sx={{ color, fontWeight: 600, lineHeight: 1 }}>
        {isPositive ? "+" : ""}{value?.toFixed(1)}{suffix}
      </Typography>
    </Box>
  );
};

const KpiCard = ({ title, value, subtitle, icon, iconColor, trend, trendSuffix, positiveIsGood }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      border: "1px solid rgba(0,0,0,0.08)",
      borderLeft: `4px solid ${iconColor}`,
      borderRadius: 3,
      background: `linear-gradient(135deg, ${iconColor}0D 0%, #FFFFFF 60%)`,
      height: 165,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      transition: "box-shadow 0.2s, transform 0.15s",
      "&:hover": {
        boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
        transform: "translateY(-2px)"
      }
    }}
  >
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
        {icon && (
          <Box sx={{ color: iconColor, fontSize: 20, display: "flex", alignItems: "center" }}>
            {React.cloneElement(icon, { sx: { fontSize: 20 } })}
          </Box>
        )}
        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h5" fontWeight={800} sx={{ color: iconColor, lineHeight: 1.2, my: 0.5 }}>
        {value}
      </Typography>
    </Box>

    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 0.5 }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.73rem" }}>
        {subtitle}
      </Typography>
      {trend != null && <TrendBadge value={trend} suffix={trendSuffix} positiveIsGood={positiveIsGood} />}
    </Box>
  </Paper>
);

export default function ExecutiveSummarySection({ data, loading }) {
  if (loading) {
    return (
      <SectionCard
        icon={<AnalyticsIcon />}
        title="Executive Summary"
        description="Community-wide operational KPIs, water supply balance, and revenue realization indicators."
      >
        <KpiGrid minWidth={260}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} variant="rounded" height={165} sx={{ borderRadius: 3 }} />
          ))}
        </KpiGrid>
      </SectionCard>
    );
  }

  const kpiCards = data
    ? [
        { title: "Total Water Purchased", value: fmtKL(data.totalWaterPurchased), subtitle: "Bulk source water supply", icon: <WaterDropIcon />, iconColor: "#0288d1", iconBg: "#e0f7fa" },
        { title: "Total Water Consumed", value: fmtKL(data.totalWaterConsumed), subtitle: "Aggregate metered consumption", icon: <OpacityIcon />, iconColor: "#1565c0", iconBg: "#e3f2fd" },
        {
          title: "Water Loss / NRW",
          value: fmtKL(data.totalWaterLoss),
          subtitle: "Purchased minus consumed",
          icon: <WarningAmberIcon />,
          iconColor: "#c62828",
          iconBg: "#ffebee",
          trend: data.totalWaterPurchased > 0 ? -((data.totalWaterLoss / data.totalWaterPurchased) * 100) : null,
          trendSuffix: "% of supply",
          positiveIsGood: false
        },
        { title: "Collection Efficiency", value: fmtPct(data.collectionEfficiencyPercentage), subtitle: "Revenue collected vs billed", icon: <PaymentsIcon />, iconColor: "#2e7d32", iconBg: "#e8f5e9" },
        { title: "Revenue Generated", value: fmtCurrency(data.totalRevenueGenerated), subtitle: "Total amount billed to residents", icon: <ReceiptLongIcon />, iconColor: "#e65100", iconBg: "#fff3e0" },
        { title: "Pending Revenue", value: fmtCurrency(data.totalRevenuePending), subtitle: "Uncollected outstanding amount", icon: <AccountBalanceWalletIcon />, iconColor: "#6a1b9a", iconBg: "#f3e5f5" }
      ]
    : [];

  return (
    <SectionCard
      icon={<AnalyticsIcon />}
      title="Executive Summary"
      description="Community-wide operational KPIs, water supply balance, and revenue realization indicators."
    >
      <KpiGrid minWidth={260}>
        {kpiCards.map((kpi, idx) => (
          <KpiCard key={idx} {...kpi} />
        ))}
      </KpiGrid>
    </SectionCard>
  );
}
