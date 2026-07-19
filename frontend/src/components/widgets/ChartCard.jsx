import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Cell,
} from "recharts";
import WidgetContainer from "./WidgetContainer";
import { CHART_TYPES } from "../../constants/chartTypes";

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltipContent = ({ active, payload, label, unit }) => {
    if (!active || !payload || !payload.length) return null;
    return (
        <Box
            sx={{
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "8px",
                px: 1.5,
                py: 1,
                boxShadow: "0 4px 16px rgba(12,25,41,0.10)",
                minWidth: 120,
            }}
        >
            <Typography
                sx={{ fontSize: "0.6875rem", color: "text.disabled", mb: 0.5, fontWeight: 500 }}
            >
                {label}
            </Typography>
            {payload.map((entry, i) => (
                <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <Box
                        sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: entry.color,
                            flexShrink: 0,
                        }}
                    />
                    <Typography
                        sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "text.primary" }}
                    >
                        {typeof entry.value === "number"
                            ? entry.value.toLocaleString()
                            : entry.value}
                        {unit ? ` ${unit}` : ""}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
};

/**
 * ChartCard — integrates Recharts with WidgetContainer.
 *
 * @param {Object}   props
 * @param {string}   props.title
 * @param {Array}    props.data
 * @param {string}   [props.type]      - 'line' | 'bar' | 'pie' | 'doughnut'
 * @param {string}   [props.dataKey]
 * @param {string}   [props.xAxisKey]
 * @param {string}   [props.color]     - Main chart color (hex or CSS)
 * @param {string}   [props.unit]      - Unit label shown in tooltip (e.g. "L")
 * @param {number}   [props.height]    - Chart area height in px (default 280)
 * @param {boolean}  [props.loading]
 * @param {string}   [props.error]
 * @param {string}   [props.outerRadius]
 */
const ChartCard = ({
    title,
    data = [],
    type = CHART_TYPES.LINE,
    dataKey = "value",
    xAxisKey = "name",
    color,
    unit = "",
    height = 280,
    outerRadius = "78%",
    loading,
    error,
    ...rest
}) => {
    const theme = useTheme();
    const chartColor = color || theme.palette.primary.main;
    const empty = data.length === 0;

    // Shared axis/grid styles
    const tickStyle = { fill: theme.palette.text.secondary, fontSize: 11 };
    const gridStroke = alpha(theme.palette.divider, 0.6);

    const commonProps = {
        data,
        margin: { top: 8, right: 8, left: -16, bottom: 0 },
    };

    const tooltipProps = {
        content: <CustomTooltipContent unit={unit} />,
    };

    const renderChart = () => {
        // ── Line chart — rendered as Area for visual fill ─────────────────────
        if (type === CHART_TYPES.LINE || type === "area") {
            return (
                <AreaChart {...commonProps}>
                    <defs>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chartColor} stopOpacity={0.12} />
                            <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="4 4"
                        vertical={false}
                        stroke={gridStroke}
                    />
                    <XAxis
                        dataKey={xAxisKey}
                        axisLine={false}
                        tickLine={false}
                        tick={tickStyle}
                        dy={8}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={tickStyle}
                        tickFormatter={(v) =>
                            v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v
                        }
                        width={44}
                    />
                    <Tooltip {...tooltipProps} cursor={{ stroke: gridStroke, strokeWidth: 1, strokeDasharray: "4 4" }} />
                    <Area
                        type="monotone"
                        dataKey={dataKey}
                        stroke={chartColor}
                        strokeWidth={2.5}
                        fill="url(#areaGradient)"
                        dot={{ r: 3, fill: chartColor, strokeWidth: 0 }}
                        activeDot={{
                            r: 5,
                            fill: chartColor,
                            stroke: theme.palette.background.paper,
                            strokeWidth: 2,
                        }}
                        isAnimationActive={false}
                    />
                </AreaChart>
            );
        }

        // ── Bar chart ─────────────────────────────────────────────────────────
        if (type === CHART_TYPES.BAR) {
            return (
                <BarChart {...commonProps}>
                    <CartesianGrid
                        strokeDasharray="4 4"
                        vertical={false}
                        stroke={gridStroke}
                    />
                    <XAxis
                        dataKey={xAxisKey}
                        axisLine={false}
                        tickLine={false}
                        tick={tickStyle}
                        dy={8}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={tickStyle}
                        tickFormatter={(v) =>
                            v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v
                        }
                        width={44}
                    />
                    <Tooltip {...tooltipProps} cursor={{ fill: theme.palette.action.hover }} />
                    <Bar
                        dataKey={dataKey}
                        fill={chartColor}
                        radius={[4, 4, 0, 0]}
                        barSize={28}
                        isAnimationActive={false}
                    />
                </BarChart>
            );
        }

        // ── Pie / Doughnut chart ──────────────────────────────────────────────
        if (type === CHART_TYPES.PIE || type === CHART_TYPES.DOUGHNUT || type === "doughnut") {
            const isDoughnut = type === CHART_TYPES.DOUGHNUT || type === "doughnut";
            const PIE_COLORS = [
                theme.palette.primary.main,
                theme.palette.info.main,
                theme.palette.success.main,
                theme.palette.warning.main,
                theme.palette.error.main,
            ];
            return (
                <PieChart>
                    <Tooltip {...tooltipProps} />
                    <Legend
                        verticalAlign="bottom"
                        height={32}
                        iconType="circle"
                        iconSize={8}
                        formatter={(value) => (
                            <Typography
                                component="span"
                                sx={{ fontSize: "0.75rem", color: "text.secondary" }}
                            >
                                {value}
                            </Typography>
                        )}
                    />
                    <Pie
                        data={data}
                        dataKey={dataKey}
                        nameKey={xAxisKey}
                        cx="50%"
                        cy="50%"
                        innerRadius={isDoughnut ? "58%" : 0}
                        outerRadius={outerRadius}
                        paddingAngle={isDoughnut ? 3 : 0}
                        isAnimationActive={false}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]}
                            />
                        ))}
                    </Pie>
                </PieChart>
            );
        }

        return null;
    };

    return (
        <WidgetContainer
            title={title}
            loading={loading}
            error={error}
            empty={empty}
            {...rest}
        >
            <Box sx={{ width: "100%", height, pt: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                    {renderChart()}
                </ResponsiveContainer>
            </Box>
        </WidgetContainer>
    );
};

export default React.memo(ChartCard);
