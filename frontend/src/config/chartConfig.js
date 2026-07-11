export const CHART_COLORS = {
    primary: "#2563EB",     // Slate Blue
    secondary: "#0D9488",   // Teal
    accent: "#6366F1",      // Indigo
    warning: "#F59E0B",     // Amber
    danger: "#EF4444",      // Rose
    success: "#10B981",     // Emerald
    info: "#3B82F6",        // Blue
    grid: "#F1F5F9",        // Very Light gray
    tooltipBg: "#FFFFFF",
    tooltipBorder: "#E2E8F0"
};

export const COMMON_CHART_PROPS = {
    responsiveContainer: {
        width: "100%",
        height: 300
    },
    grid: {
        strokeDasharray: "3 3",
        stroke: CHART_COLORS.grid,
        vertical: false
    },
    tooltip: {
        contentStyle: {
            backgroundColor: CHART_COLORS.tooltipBg,
            borderColor: CHART_COLORS.tooltipBorder,
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
            fontFamily: "Inter, sans-serif",
            fontSize: "12px"
        }
    },
    legend: {
        wrapperStyle: {
            fontFamily: "Inter, sans-serif",
            fontSize: "12px",
            paddingTop: "16px"
        },
        iconType: "circle",
        iconSize: 8
    },
    xAxis: {
        tick: { fill: "#64748B", fontSize: 11, fontFamily: "Inter, sans-serif" },
        axisLine: false,
        tickLine: false
    },
    yAxis: {
        tick: { fill: "#64748B", fontSize: 11, fontFamily: "Inter, sans-serif" },
        axisLine: false,
        tickLine: false
    }
};
