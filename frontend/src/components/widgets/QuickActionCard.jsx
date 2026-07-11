import React from "react";
import { Box, Typography, Card, CardActionArea, CardContent, Chip } from "@mui/material";
import { motion } from "framer-motion";

/**
 * Reusable QuickActionCard for main actions
 * @param {Object} props
 * @param {string} props.title
 * @param {string} props.description
 * @param {React.ReactNode} props.icon
 * @param {string} [props.color="primary"]
 * @param {boolean} [props.comingSoon]
 * @param {function} props.onClick
 */
const QuickActionCard = ({ title, description, icon, color = "primary", comingSoon = false, disabled = false, onClick }) => {
    const isDisabled = comingSoon || disabled;
    
    return (
        <Card
            component={motion.div}
            whileHover={!isDisabled ? { y: -4 } : {}}
            elevation={0}
            sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
                height: "100%",
                opacity: isDisabled ? 0.7 : 1,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                    borderColor: !isDisabled ? `${color}.main` : "divider",
                    boxShadow: !isDisabled ? "0 12px 24px rgba(0,0,0,0.06)" : "none",
                }
            }}
        >
            <CardActionArea 
                onClick={isDisabled ? undefined : onClick} 
                disabled={isDisabled}
                sx={{ height: "100%", p: 2, display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "flex-start" }}
            >
                <CardContent sx={{ p: 0, width: "100%", textAlign: "left" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                        <Box sx={{ 
                            p: 1.5, 
                            borderRadius: 2, 
                            bgcolor: `${color}.main` + "15", // 15% opacity background
                            color: `${color}.main`,
                            display: "flex"
                        }}>
                            {icon}
                        </Box>
                        {comingSoon && (
                            <Chip label="Coming Soon" size="small" variant="outlined" color="default" sx={{ fontSize: "0.7rem", height: 20 }} />
                        )}
                    </Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom sx={{ fontSize: "1.1rem" }}>
                        {title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {description}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default React.memo(QuickActionCard);
