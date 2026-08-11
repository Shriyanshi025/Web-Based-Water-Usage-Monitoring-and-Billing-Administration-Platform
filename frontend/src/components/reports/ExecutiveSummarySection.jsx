import React from "react";
import { Card, CardContent, Box, Typography, Divider, Skeleton } from "@mui/material";
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

const CARD_BORDER_RADIUS = "14px";

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

const KpiCard = ({ title, value, subtitle, icon, iconColor, iconBg, trend, trendSuffix, positiveIsGood }) => (
  <Card
    variant="outlined"
    sx={{
      borderRadius: CARD_BORDER_RADIUS,
      height: 165,
      bgcolor: "background.paper",
      boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
      border: "1px solid",
      borderColor: "divider",
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
    <CardContent sx={{ p: "20px 22px 16px", "&:last-child": { pb: "16px" } }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 1.5 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "12px",
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
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600, fontSize: "0.78rem", mb: 0.4 }}>
            {title}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: "1.25rem", sm: "1.45rem" }, lineHeight: 1.15, color: "text.primary", wordBreak: "break-all" }}>
            {value}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 1.2 }} />

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 0.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.73rem" }}>
          {subtitle}
        </Typography>
        {trend != null && <TrendBadge value={trend} suffix={trendSuffix} positiveIsGood={positiveIsGood} />}
      </Box>
    </CardContent>
  </Card>
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
            <Skeleton key={i} variant="rounded" height={165} sx={{ borderRadius: CARD_BORDER_RADIUS }} />
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
