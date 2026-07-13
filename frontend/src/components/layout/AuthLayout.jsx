import React from 'react';
import { Box, Container, Grid, Typography, Stack, useTheme, useMediaQuery, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';

const FeatureItem = ({ icon, title, description }) => (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start', mb: 4 }}>
        <Box sx={{
            color: 'primary.main',
            bgcolor: 'rgba(255,255,255,0.9)',
            p: 1.5,
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
            display: 'flex'
        }}>
            {icon}
        </Box>
        <Box>
            <Typography variant="h6" fontWeight="700" color="white" gutterBottom sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                {title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                {description}
            </Typography>
        </Box>
    </Stack>
);

const AuthLayout = ({ children, title, subtitle, alignTop = false }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'background.default', position: 'relative', overflow: 'hidden' }}>
            
            <Box sx={{ flex: 1, display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
                {/* Left Side: Branding & Features (Hidden on mobile) */}
                {!isMobile && (
                    <Box sx={{ width: { md: '41.666%', lg: '50%' }, position: 'relative', overflow: 'hidden' }}>
                        {/* Animated Background */}
                        <Box sx={{
                            position: 'absolute', inset: 0,
                            background: 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                            zIndex: 0
                        }}>
                            {/* Abstract Blobs */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    rotate: [0, 90, 0],
                                    borderRadius: ["30% 70% 70% 30% / 30% 30% 70% 70%", "50% 50% 30% 70% / 50% 50% 70% 30%", "30% 70% 70% 30% / 30% 30% 70% 70%"]
                                }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                style={{
                                    position: 'absolute', top: '-10%', left: '-20%', width: '70%', height: '70%',
                                    background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', zIndex: 1
                                }}
                            />
                            <motion.div
                                animate={{
                                    scale: [1, 1.3, 1],
                                    rotate: [0, -90, 0],
                                    borderRadius: ["50% 50% 30% 70% / 50% 50% 70% 30%", "30% 70% 70% 30% / 30% 30% 70% 70%", "50% 50% 30% 70% / 50% 50% 70% 30%"]
                                }}
                                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                                style={{
                                    position: 'absolute', bottom: '-20%', right: '-10%', width: '80%', height: '80%',
                                    background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(10px)', zIndex: 1
                                }}
                            />
                        </Box>

                        {/* Content */}
                        <Box sx={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', p: { md: 6, lg: 8 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 8 }}>
                                <Box sx={{ p: 1.5, bgcolor: 'white', borderRadius: 3, display: 'flex', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
                                    <WaterDropIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                                </Box>
                                <Typography variant="h4" fontWeight="800" color="white" sx={{ letterSpacing: '-0.5px' }}>
                                    AquaBase
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 6 }}>
                                <Typography variant="h3" fontWeight="800" color="white" gutterBottom sx={{ lineHeight: 1.2, letterSpacing: '-1px' }}>
                                    Smart Water Management
                                </Typography>
                                <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 400, maxWidth: 480 }}>
                                    Empowering communities with real-time tracking, transparent billing, and intelligent analytics.
                                </Typography>
                            </Box>

                            <Box sx={{ mt: 'auto', pr: 4 }}>
                                <FeatureItem
                                    icon={<InsightsOutlinedIcon />}
                                    title="Real-Time Analytics"
                                    description="Monitor usage patterns instantly and receive automated alerts for anomalies."
                                />
                                <FeatureItem
                                    icon={<ShieldOutlinedIcon />}
                                    title="Enterprise Security"
                                    description="Your data is protected with industry-standard encryption and role-based access."
                                />
                                <FeatureItem
                                    icon={<SpeedOutlinedIcon />}
                                    title="Automated Billing"
                                    description="Generate fair, transparent, and accurate invoices effortlessly every month."
                                />
                            </Box>
                        </Box>
                    </Box>
                )}

                {/* Right Side: Form Area */}
                <Box sx={{ 
                    width: { xs: '100%', md: '58.333%', lg: '50%' },
                    display: 'flex', 
                    alignItems: alignTop ? 'flex-start' : 'center', 
                    justifyContent: 'center', 
                    p: { xs: 3, sm: 6, md: 8 },
                    pt: alignTop ? { xs: 4, sm: 6, md: 10 } : { xs: 3, sm: 6, md: 8 }
                }}>
                    <Box sx={{ width: '100%', maxWidth: 480 }}>
                        {isMobile && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 6, justifyContent: 'center' }}>
                                <Box sx={{ p: 1, bgcolor: 'primary.main', borderRadius: 2, display: 'flex' }}>
                                    <WaterDropIcon sx={{ fontSize: 24, color: 'white' }} />
                                </Box>
                                <Typography variant="h5" fontWeight="800" color="text.primary">
                                    AquaBase
                                </Typography>
                            </Box>
                        )}
                        
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                        >
                            <Box sx={{ mb: 4, textAlign: isMobile ? 'center' : 'left' }}>
                                <Typography variant="h4" fontWeight="800" color="text.primary" gutterBottom>
                                    {title}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    {subtitle}
                                </Typography>
                            </Box>

                            <Paper elevation={0} sx={{ 
                                p: { xs: 3, sm: 4 }, 
                                borderRadius: 4, 
                                border: '1px solid', 
                                borderColor: 'divider',
                                boxShadow: '0 12px 40px rgba(0,0,0,0.03)' 
                            }}>
                                {children}
                            </Paper>
                        </motion.div>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default AuthLayout;
