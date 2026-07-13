import React from "react";
import { Box, Typography, Stack, Avatar } from "@mui/material";
import { alpha } from "@mui/material/styles";
import WidgetContainer from "./WidgetContainer";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SpeedIcon from "@mui/icons-material/Speed";
import HistoryIcon from "@mui/icons-material/History";
import BuildIcon from "@mui/icons-material/Build";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import NotificationsIcon from "@mui/icons-material/Notifications";

const renderIcon = (iconName) => {
    switch(iconName) {
        case "WaterDropIcon": return <WaterDropIcon />;
        case "ReceiptIcon": return <ReceiptIcon />;
        case "SpeedIcon": return <SpeedIcon />;
        case "HistoryIcon": return <HistoryIcon />;
        case "BuildIcon": return <BuildIcon />;
        case "PendingActionsIcon": return <PendingActionsIcon />;
        case "AttachMoneyIcon": return <AttachMoneyIcon />;
        default: return <NotificationsIcon />;
    }
};

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
                    bgcolor: (theme) => {
                        const colorString = `${item.color || "primary"}.main`;
                        const colorPath = colorString.split('.');
                        let themeColor = theme.palette;
                        for (const key of colorPath) {
                            if (themeColor[key]) themeColor = themeColor[key];
                        }
                        return typeof themeColor === 'string' ? alpha(themeColor, 0.1) : alpha(theme.palette.primary.main, 0.1);
                    },
                    color: `${item.color || "primary"}.main`, 
                    width: 40, 
                    height: 40 
                }}>
                    {typeof item.icon === "string" ? renderIcon(item.icon) : item.icon}
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
