import React from "react";
import { Box, useTheme } from "@mui/material";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from "recharts";
import WidgetContainer from "./WidgetContainer";
import { CHART_TYPES } from "../../constants/chartTypes";

/**
 * Reusable ChartCard integrating Recharts with WidgetContainer
 * @param {Object} props
 * @param {string} props.title
 * @param {Array} props.data
 * @param {string} props.type - 'line' | 'bar' | 'pie'
 * @param {string} props.dataKey - Key for Y values
 * @param {string} props.xAxisKey - Key for X values
 * @param {string} [props.color] - Main chart color
 */
const ChartCard = ({
    title,
    data = [],
    type = CHART_TYPES.LINE,
    dataKey = "value",
    xAxisKey = "name",
    color,
    outerRadius = "80%",
    loading,
    error,
    ...rest
}) => {
    const theme = useTheme();
    const chartColor = color || theme.palette.primary.main;
    const empty = data.length === 0;

    const renderChart = () => {
        const commonProps = {
            data,
            margin: { top: 10, right: 10, left: -20, bottom: 0 }
        };

        const customTooltip = {
            contentStyle: { 
                borderRadius: '8px', 
                border: 'none', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                fontWeight: 500
            }
        };

        if (type === CHART_TYPES.LINE) {
            return (
                <LineChart {...commonProps}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                    <XAxis dataKey={xAxisKey} axisLine={false} tickLine={false} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                    <Tooltip {...customTooltip} cursor={{ stroke: theme.palette.divider, strokeWidth: 1, strokeDasharray: '5 5' }} />
                    <Line type="monotone" dataKey={dataKey} stroke={chartColor} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
            );
        }

        if (type === CHART_TYPES.BAR) {
            return (
                <BarChart {...commonProps}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                    <XAxis dataKey={xAxisKey} axisLine={false} tickLine={false} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                    <Tooltip {...customTooltip} cursor={{ fill: theme.palette.action.hover }} />
                    <Bar dataKey={dataKey} fill={chartColor} radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
            );
        }

        if (type === CHART_TYPES.PIE || type === "doughnut") {
            const isDoughnut = type === "doughnut";
            const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
            return (
                <PieChart>
                    <Tooltip {...customTooltip} />
                    <Legend verticalAlign="bottom" height={36}/>
                    <Pie data={data} dataKey={dataKey} nameKey={xAxisKey} cx="50%" cy="50%" innerRadius={isDoughnut ? "60%" : 0} outerRadius={outerRadius} fill={chartColor} label>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                    </Pie>
                </PieChart>
            );
        }

        return null;
    };

    return (
        <WidgetContainer title={title} loading={loading} error={error} empty={empty} {...rest}>
            <Box sx={{ width: '100%', height: 280, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                    {renderChart()}
                </ResponsiveContainer>
            </Box>
        </WidgetContainer>
    );
};

export default React.memo(ChartCard);
