import React from "react";
import { Paper, Box, Typography } from "@mui/material";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend } from "recharts";
import SectionCard from "./SectionCard";
import ChartCard from "./ChartCard";
import ChartGrid from "./ChartGrid";
import { LAYOUT_CONSTANTS } from "./layoutConstants";

const WaterTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Paper variant="outlined" sx={{ p: 1.5, fontSize: 13, minWidth: 160 }}>
      <Typography variant="caption" fontWeight={700} display="block" mb={0.5}>{label}</Typography>
      {payload.map((p) => (
        <Box key={p.dataKey} sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
          <Typography variant="caption" sx={{ color: p.color }}>{p.name}</Typography>
          <Typography variant="caption" fontWeight={600}>
            {typeof p.value === "number" ? `${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 }).format(p.value)} kL` : p.value}
          </Typography>
        </Box>
      ))}
    </Paper>
  );
};

export default function WaterReportsSection({ data }) {
  return (
    <SectionCard
      icon={<WaterDropIcon />}
      title="Community Operations & Water Reports"
      description="Track water bulk supply against resident consumption trends and identify non-revenue water (NRW) loss."
    >
      <ChartGrid>
        <ChartCard
          title="Monthly Water Purchase vs Consumption"
          subtitle="Actual database aggregate — kL per month"
        >
          <ResponsiveContainer width="100%" height={LAYOUT_CONSTANTS.CHART_CONTAINER_HEIGHT}>
            <LineChart data={data?.waterBalanceTrend || []} margin={LAYOUT_CONSTANTS.CHART_MARGINS.LINE}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} dy={8} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v} kL`} width={65} />
              <RechartsTooltip content={<WaterTooltip />} />
              <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: 15 }} />
              <Line type="monotone" dataKey="purchased" name="Purchased (kL)" stroke="#0288d1" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="consumed" name="Consumed (kL)" stroke="#2e7d32" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Water Loss Analysis (NRW)"
          subtitle="Purchased − Consumed = Unaccounted Water Loss per month"
        >
          <ResponsiveContainer width="100%" height={LAYOUT_CONSTANTS.CHART_CONTAINER_HEIGHT}>
            <BarChart data={data?.waterBalanceTrend || []} margin={LAYOUT_CONSTANTS.CHART_MARGINS.BAR}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} dy={8} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v} kL`} width={65} />
              <RechartsTooltip content={<WaterTooltip />} />
              <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: 15 }} />
              <Bar dataKey="purchased" name="Purchased" fill="#0288d1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="consumed" name="Consumed" fill="#2e7d32" radius={[4, 4, 0, 0]} />
              <Bar dataKey="loss" name="Water Loss" fill="#d32f2f" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartGrid>
    </SectionCard>
  );
}
