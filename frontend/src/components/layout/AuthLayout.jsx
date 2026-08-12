import React from 'react';
import { Box, Container, Grid, Typography, Stack, useTheme, useMediaQuery, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';

import LanguageSelector from '../common/LanguageSelector';

const FeatureItem = ({ icon, title, description }) => (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start', mb: 4 }}>
        <Box sx={{
            color: '#38bdf8',
            bgcolor: 'rgba(255, 255, 255, 0.08)',
            p: 1.5,
            borderRadius: 3,
            border: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex'
        }}>
            {icon}
        </Box>
        <Box>
            <Typography variant="h6" fontWeight="700" gutterBottom sx={{ color: '#ffffff', fontSize: '1.1rem', mb: 0.5 }}>
                {title}
            </Typography>
            <Typography variant="body2" sx={{ color: '#C4C0C3', lineHeight: 1.6 }}>
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
            
            {/* Language selector for auth pages */}
            <Box sx={{ position: 'absolute', top: 20, right: 24, zIndex: 10 }}>
                <LanguageSelector />
            </Box>

            <Box sx={{ flex: 1, display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
                {/* Left Side: Branding & Features (Hidden on mobile) */}
                {!isMobile && (
                    <Box sx={{ width: { md: '41.666%', lg: '50%' }, position: 'relative', overflow: 'hidden', bgcolor: '#030712' }}>
                        {/* Cinematic Liquid Water Video Background */}
                        <Box
                            component="video"
                            autoPlay
                            loop
                            muted
                            playsInline
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                filter: 'brightness(0.52) contrast(1.18)',
                                zIndex: 0
                            }}
                        >
                            <source src="/liquid-water-hero.mp4" type="video/mp4" />
                        </Box>

                        {/* Layered Cinematic Vignettes & Radial Dark Overlays */}
                        <Box
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                background: `
                                    linear-gradient(180deg, rgba(3, 7, 18, 0.75) 0%, rgba(3, 7, 18, 0.25) 45%, rgba(3, 7, 18, 0.9) 100%),
                                    linear-gradient(90deg, rgba(3, 7, 18, 0.5) 0%, transparent 50%),
                                    radial-gradient(ellipse 80% 60% at 50% 40%, rgba(2, 132, 199, 0.14) 0%, transparent 80%)
                                `,
                                zIndex: 1
                            }}
                        />

                        {/* Content */}
                        <Box sx={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', p: { md: 6, lg: 8 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 8 }}>
                                <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 3, display: 'flex', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
                                    <WaterDropIcon sx={{ fontSize: 32, color: '#38bdf8' }} />
                                </Box>
                                <Typography variant="h4" fontWeight="800" sx={{ color: '#ffffff', letterSpacing: '-0.5px' }}>
                                    HydroSync
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 6 }}>
                                <Typography variant="h3" fontWeight="800" gutterBottom sx={{ color: '#ffffff', lineHeight: 1.2, letterSpacing: '-1px' }}>
                                    Smart Water Management
                                </Typography>
                                <Typography variant="h6" sx={{ color: '#C4C0C3', fontWeight: 400, maxWidth: 480, fontSize: '1.05rem', lineHeight: 1.6 }}>
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
                                    HydroSync
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
