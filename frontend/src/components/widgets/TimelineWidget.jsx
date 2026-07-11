import React from "react";
import { Box, Typography, Stack, Avatar } from "@mui/material";
import WidgetContainer from "./WidgetContainer";

const TimelineItem = ({ item, isLast }) => {
    return (
        <Stack direction="row" spacing={2} sx={{ position: "relative", pb: isLast ? 0 : 3 }}>
            {!isLast && (
                <Box sx={{
                    position: "absolute",
                    top: 40,
                    bottom: 0,
                    left: 19, // 20px (half of 40px avatar width) - 1px (half border)
                    width: 2,
                    bgcolor: "divider",
                    zIndex: 0
                }} />
            )}
            <Box sx={{ zIndex: 1 }}>
                <Avatar sx={{ 
                    bgcolor: `${item.color || "primary"}.main` + "1A", 
                    color: `${item.color || "primary"}.main`, 
                    width: 40, 
                    height: 40 
                }}>
                    {item.icon}
                </Avatar>
            </Box>
            <Box sx={{ pt: 1, pb: 1 }}>
                <Typography variant="body1" fontWeight={600} color="text.primary">
                    {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {item.description}
                </Typography>
                <Typography variant="caption" color="text.disabled" sx={{ display: "block", mt: 0.5 }}>
                    {item.time}
                </Typography>
            </Box>
        </Stack>
    );
};

/**
 * Reusable TimelineWidget for Recent Activities
 * @param {Object} props
 * @param {string} props.title
 * @param {Array} props.activities - Array of { id, title, description, time, icon, color }
 */
const TimelineWidget = ({ title, activities = [], loading, error, empty }) => {
    return (
        <WidgetContainer title={title} loading={loading} error={error} empty={empty || activities.length === 0}>
            <Box sx={{ mt: 1 }}>
                {activities.map((item, index) => (
                    <TimelineItem 
                        key={item.id} 
                        item={item} 
                        isLast={index === activities.length - 1} 
                    />
                ))}
            </Box>
        </WidgetContainer>
    );
};

export default React.memo(TimelineWidget);
