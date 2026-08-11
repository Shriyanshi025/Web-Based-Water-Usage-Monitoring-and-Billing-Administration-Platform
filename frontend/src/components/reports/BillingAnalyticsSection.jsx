import React, { useState, useMemo } from "react";
import { Paper, Box, Typography, Divider, Stack, Button, Chip } from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RefreshIcon from "@mui/icons-material/Refresh";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend } from "recharts";
import SectionCard from "./SectionCard";
import ChartCard from "./ChartCard";
import ChartGrid from "./ChartGrid";
import { LAYOUT_CONSTANTS } from "./layoutConstants";

const PIE_COLORS = ["#2e7d32", "#ed6c02", "#d32f2f", "#0288d1", "#7b1fa2"];

const fmtCurrency = (val) => {
  if (val == null || isNaN(val)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(val);
};

const RevenueTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Paper variant="outlined" sx={{ p: 1.5, fontSize: 13, minWidth: 180 }}>
      <Typography variant="caption" fontWeight={700} display="block" mb={0.5}>{label}</Typography>
      {payload.map((p) => (
        <Box key={p.dataKey} sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
          <Typography variant="caption" sx={{ color: p.color }}>{p.name}</Typography>
          <Typography variant="caption" fontWeight={600}>{fmtCurrency(p.value)}</Typography>
        </Box>
      ))}
    </Paper>
  );
};

const PieTooltip = ({ active, payload, total }) => {
  if (!active || !payload?.length) return null;
  const dataItem = payload[0];
  const count = dataItem.value || 0;
  const pct = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
  return (
    <Paper variant="outlined" sx={{ p: 1.5, fontSize: 13, minWidth: 170, boxShadow: "0 4px 14px rgba(0,0,0,0.1)" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.8 }}>
        <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: dataItem.color || dataItem.fill }} />
        <Typography variant="caption" fontWeight={700} sx={{ fontSize: "0.85rem" }}>
          {dataItem.name}
        </Typography>
      </Box>
      <Divider sx={{ my: 0.5 }} />
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 0.3 }}>
        <Typography variant="caption" color="text.secondary">Count / Bills:</Typography>
        <Typography variant="caption" fontWeight={700}>{count}</Typography>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
        <Typography variant="caption" color="text.secondary">Percentage:</Typography>
        <Typography variant="caption" fontWeight={700} color="primary.main">{pct}%</Typography>
      </Box>
    </Paper>
  );
};

const InteractivePieChart = ({ data, colors }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hiddenSlices, setHiddenSlices] = useState({});

  const totalCount = useMemo(() => {
    return (data || []).reduce((acc, curr) => acc + (curr.value || 0), 0);
  }, [data]);

  const visibleData = useMemo(() => {
    return (data || []).filter((item) => !hiddenSlices[item.name]);
  }, [data, hiddenSlices]);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.2));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.6));
  const handleReset = () => {
    setZoomLevel(1);
    setHiddenSlices({});
  };

  const toggleSlice = (name) => {
    setHiddenSlices((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const baseInnerRadius = 60 * zoomLevel;
  const baseOuterRadius = 92 * zoomLevel;

  return (
    <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1, px: 0.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          Zoom: {Math.round(zoomLevel * 100)}%
        </Typography>
        <Stack direction="row" spacing={0.5}>
          <Button size="small" variant="outlined" onClick={handleZoomIn} sx={{ minWidth: 32, p: 0.4 }} title="Zoom In">
            <ZoomInIcon fontSize="small" />
          </Button>
          <Button size="small" variant="outlined" onClick={handleZoomOut} sx={{ minWidth: 32, p: 0.4 }} title="Zoom Out">
            <ZoomOutIcon fontSize="small" />
          </Button>
          <Button size="small" variant="outlined" onClick={handleReset} sx={{ minWidth: 32, p: 0.4 }} title="Reset View">
            <RefreshIcon fontSize="small" />
          </Button>
        </Stack>
      </Box>

      <Box sx={{ flex: 1, minHeight: 250 }}>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart margin={LAYOUT_CONSTANTS.CHART_MARGINS.PIE}>
            <Pie
              data={visibleData}
              cx="50%"
              cy="50%"
              innerRadius={Math.max(20, baseInnerRadius)}
              outerRadius={Math.max(35, baseOuterRadius)}
              paddingAngle={3}
              dataKey="value"
              animationDuration={500}
            >
              {visibleData.map((entry) => {
                const colorIdx = (data || []).findIndex((d) => d.name === entry.name);
                return <Cell key={`cell-${entry.name}`} fill={colors[colorIdx % colors.length]} />;
              })}
            </Pie>
            <RechartsTooltip content={<PieTooltip total={totalCount} />} />
          </PieChart>
        </ResponsiveContainer>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 1.5, pt: 1 }}>
        {(data || []).map((entry, index) => {
          const isHidden = !!hiddenSlices[entry.name];
          const color = colors[index % colors.length];
          const count = entry.value || 0;
          const pct = totalCount > 0 ? ((count / totalCount) * 100).toFixed(0) : 0;
          return (
            <Chip
              key={entry.name}
              size="small"
              onClick={() => toggleSlice(entry.name)}
              label={`${entry.name}: ${count} (${pct}%)`}
              sx={{
                bgcolor: isHidden ? "action.disabledBackground" : `${color}18`,
                color: isHidden ? "text.disabled" : color,
                borderColor: color,
                borderWidth: isHidden ? 0 : 1,
                borderStyle: "solid",
                fontWeight: 700,
                fontSize: "0.74rem",
                cursor: "pointer"
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
};

export default function BillingAnalyticsSection({ data }) {
  const billPieData = data
    ? Object.entries(data.billPaymentStatusCounts || {}).map(([name, value]) => ({ name, value }))
    : [];

  const complaintBarData = data
    ? Object.entries(data.complaintStatusCounts || {}).map(([status, count]) => ({ status, count }))
    : [];

  return (
    <SectionCard
      icon={<ReceiptLongIcon />}
      title="Financial & Billing Analytics"
      description="Monitor revenue generation, realization rates, payment status breakdowns, and ticket resolution statistics."
    >
      <Stack spacing={LAYOUT_CONSTANTS.ELEMENT_GAP}>
        {/* Full Width Revenue Realization Trend */}
        <ChartCard
          title="Revenue Collection & Realization Trend (₹)"
          subtitle="Month-wise generated, collected, and pending outstanding revenue"
          height={340}
        >
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={data?.revenueTrend || []} margin={LAYOUT_CONSTANTS.CHART_MARGINS.LINE}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} dy={8} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} width={70} />
              <RechartsTooltip content={<RevenueTooltip />} />
              <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: 15 }} />
              <Line type="monotone" dataKey="generated" name="Billed / Generated" stroke="#ed6c02" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="collected" name="Realized / Collected" stroke="#2e7d32" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="pending" name="Outstanding Pending" stroke="#d32f2f" strokeWidth={2.5} dot={{ r: 4 }} strokeDasharray="5 3" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 2 Charts Grid */}
        <ChartGrid>
          <ChartCard
            title="Bill Payment Breakdown"
            subtitle="Proportion of Paid, Pending, and Overdue bills"
          >
            <InteractivePieChart data={billPieData} colors={PIE_COLORS} />
          </ChartCard>

          <ChartCard
            title="Complaint Ticket Status"
            subtitle="Distribution of active and resolved complaint tickets"
          >
            <ResponsiveContainer width="100%" height={LAYOUT_CONSTANTS.CHART_CONTAINER_HEIGHT - 40}>
              <BarChart data={complaintBarData} margin={LAYOUT_CONSTANTS.CHART_MARGINS.BAR}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="status" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" interval={0} dy={8} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} width={45} />
                <RechartsTooltip />
                <Bar dataKey="count" name="Complaints" radius={[5, 5, 0, 0]}>
                  {complaintBarData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </ChartGrid>
      </Stack>
    </SectionCard>
  );
}
