import React from "react";
import { Box, Typography, Stack, Avatar, Skeleton } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { motion } from "framer-motion";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

/**
 * Reusable StatCard for top-level KPIs
 * @param {Object} props
 * @param {string} props.title
 * @param {string|number} props.value
 * @param {React.ReactNode} props.icon
 * @param {string} props.color - Theme color string (e.g. "primary.main")
 * @param {number} [props.trend] - Percentage trend (positive or negative)
 * @param {string} [props.trendLabel] - E.g., "vs last month"
 */
const AnimatedCounter = ({ value, formatValue }) => {
    const [count, setCount] = React.useState(0);
    
    React.useEffect(() => {
        if (typeof value !== 'number') {
            setCount(value);
            return;
        }
        
        let start = 0;
        const duration = 1500;
        const end = value;
        let startTime = null;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const current = Math.min(progress / duration, 1);
            // Ease out quart
            const easeOut = 1 - Math.pow(1 - current, 4);
            
            setCount(start + (end - start) * easeOut);
            
            if (current < 1) {
                requestAnimationFrame(animate);
            } else {
                setCount(end);
            }
        };
        requestAnimationFrame(animate);
    }, [value]);

    if (typeof value !== 'number') return <>{value}</>;
    return <>{formatValue ? formatValue(count) : Math.round(count).toLocaleString()}</>;
};

const StatCard = ({ title, value, icon, color = "primary.main", trend, trendLabel, formatValue, loading, error, empty }) => {
    if (loading) {
        return (
            <Box sx={{ p: 3, bgcolor: "background.paper", borderRadius: 3, boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.03)", border: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 2, height: "100%" }}>
                <Skeleton variant="circular" width={56} height={56} />
                <Box flexGrow={1}>
                    <Skeleton variant="text" width="60%" height={20} />
                    <Skeleton variant="text" width="80%" height={40} />
                </Box>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3, bgcolor: "background.paper", borderRadius: 3, boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.03)", border: "1px solid", borderColor: "error.main", display: "flex", alignItems: "center", gap: 2, height: "100%" }}>
                <Typography color="error" variant="body2">{error}</Typography>
            </Box>
        );
    }

    if (empty) {
        return (
            <Box sx={{ p: 3, bgcolor: "background.paper", borderRadius: 3, boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.03)", border: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 2, height: "100%" }}>
                <Typography color="text.secondary" variant="body2">No data</Typography>
            </Box>
        );
    }

    return (
        <Box
            component={motion.div}
            whileHover={{ y: -4 }}
            sx={{
                p: 3,
                bgcolor: "background.paper",
                borderRadius: 3,
                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.03)",
                border: "1px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                gap: 2,
                height: "100%"
            }}
        >
            <Avatar sx={{ 
                bgcolor: (theme) => {
                    const colorPath = color.split('.');
                    let themeColor = theme.palette;
                    for (const key of colorPath) {
                        if (themeColor[key]) themeColor = themeColor[key];
                    }
                    return typeof themeColor === 'string' ? alpha(themeColor, 0.15) : alpha(theme.palette.primary.main, 0.15);
                }, 
                color: color, 
                width: 56, 
                height: 56 
            }}>
                {icon}
            </Avatar>
            <Box flexGrow={1}>
                <Typography variant="body2" color="text.secondary" fontWeight={500} gutterBottom>
                    {title}
                </Typography>
                <Typography variant="h4" fontWeight={700} color="text.primary">
                    <AnimatedCounter value={value} formatValue={formatValue} />
                </Typography>
                
                {trend !== undefined && (
                    <Stack direction="row" spacing={0.5} alignItems="center" mt={0.5}>
                        {trend >= 0 ? (
                            <TrendingUpIcon sx={{ fontSize: 16, color: "success.main" }} />
                        ) : (
                            <TrendingDownIcon sx={{ fontSize: 16, color: "error.main" }} />
                        )}
                        <Typography variant="caption" fontWeight={600} color={trend >= 0 ? "success.main" : "error.main"}>
                            {Math.abs(trend)}%
                        </Typography>
                        {trendLabel && (
                            <Typography variant="caption" color="text.secondary">
                                {trendLabel}
                            </Typography>
                        )}
                    </Stack>
                )}
            </Box>
        </Box>
    );
};

export default React.memo(StatCard);
