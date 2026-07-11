import React from "react";
import { Box, Typography, LinearProgress, Stack } from "@mui/material";
import WidgetContainer from "./WidgetContainer";

/**
 * Reusable MetricCard for items requiring a progress bar or ratio
 * @param {Object} props
 * @param {string} props.title
 * @param {number} props.value
 * @param {number} props.max
 * @param {string} [props.color="primary"]
 * @param {string} [props.unit]
 */
const MetricCard = ({ title, value, max, color = "primary", unit = "", ...rest }) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100)) || 0;

    return (
        <WidgetContainer title={title} {...rest}>
            <Box sx={{ mt: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="baseline" mb={1}>
                    <Typography variant="h3" fontWeight={700}>
                        {value} <Typography component="span" variant="h6" color="text.secondary">{unit}</Typography>
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Target: {max} {unit}
                    </Typography>
                </Stack>
                <LinearProgress 
                    variant="determinate" 
                    value={percentage} 
                    color={color}
                    sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        bgcolor: `${color}.main` + "1A" // light background
                    }} 
                />
            </Box>
        </WidgetContainer>
    );
};

export default React.memo(MetricCard);
