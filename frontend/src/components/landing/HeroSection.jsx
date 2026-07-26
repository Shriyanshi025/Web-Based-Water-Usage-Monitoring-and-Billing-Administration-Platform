import React from 'react';
import { Box, Container, Typography, Button, Stack, Grid, Paper, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ApartmentIcon from '@mui/icons-material/Apartment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SpeedIcon from '@mui/icons-material/Speed';
import ShieldCheckIcon from '@mui/icons-material/Shield';

export default function HeroSection() {
    const navigate = useNavigate();

    const fadeUp = {
        hidden: { opacity: 0, y: 25 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const pillars = [
        { label: 'Smart Water Monitoring', icon: <WaterDropIcon sx={{ fontSize: 22 }} />, color: '#7dd3fc', bg: 'rgba(125, 211, 252, 0.12)' },
        { label: 'Fair Billing', icon: <ReceiptLongIcon sx={{ fontSize: 22 }} />, color: '#6ee7b7', bg: 'rgba(110, 231, 183, 0.12)' },
        { label: 'Leak Detection', icon: <WarningAmberIcon sx={{ fontSize: 22 }} />, color: '#fde047', bg: 'rgba(253, 224, 71, 0.12)' },
        { label: 'Community Management', icon: <ApartmentIcon sx={{ fontSize: 22 }} />, color: '#c4b5fd', bg: 'rgba(196, 181, 253, 0.12)' }
    ];

    const timeLabels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'];

    return (
        <Box sx={{
            position: 'relative',
            background: 'linear-gradient(180deg, #0f172a 0%, #0369a1 100%)',
            color: 'white',
            pt: { xs: 18, md: 24 },
            pb: { xs: 16, md: 22 },
            overflow: 'hidden'
        }}>
            {/* Ambient Background Glow */}
            <Box sx={{
                position: 'absolute',
                top: '-10%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 750,
                height: 750,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(56,189,248,0.18) 0%, rgba(0,0,0,0) 70%)',
                filter: 'blur(80px)',
                pointerEvents: 'none'
            }} />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
                {/* Hero Header Content */}
                <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
                    <Box textAlign="center" sx={{ maxWidth: 920, mx: 'auto', mb: 8 }}>
                        <motion.div variants={fadeUp}>
                            <Chip
                                label="🚀 HydroSync Platform v2.0 Live"
                                sx={{
                                    bgcolor: 'rgba(255, 255, 255, 0.12)',
                                    color: '#7dd3fc',
                                    fontWeight: 600,
                                    backdropFilter: 'blur(8px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    mb: 3.5,
                                    px: 1.5,
                                    py: 0.5,
                                    fontSize: '0.85rem'
                                }}
                            />
                        </motion.div>

                        <motion.div variants={fadeUp}>
                            <Typography
                                variant="h1"
                                fontWeight="900"
                                sx={{
                                    fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.2rem' },
                                    lineHeight: 1.15,
                                    letterSpacing: '-1.8px',
                                    mb: 3.5,
                                    background: 'linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}
                            >
                                Smart Water Monitoring & Fair Billing Platform.
                            </Typography>
                        </motion.div>

                        <motion.div variants={fadeUp}>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: '#e2e8f0',
                                    fontWeight: 400,
                                    lineHeight: 1.7,
                                    mb: 5,
                                    maxWidth: 780,
                                    mx: 'auto',
                                    fontSize: { xs: '1.05rem', md: '1.25rem' }
                                }}
                            >
                                Automated smart meter tracking, transparent tier billing, instant leak alerts, and comprehensive community management in one intelligent platform.
                            </Typography>
                        </motion.div>

                        {/* Centered CTA Buttons */}
                        <motion.div variants={fadeUp}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} justifyContent="center" alignItems="center" sx={{ mb: 7 }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    endIcon={<ArrowForwardIcon />}
                                    sx={{
                                        px: 4.5,
                                        py: 1.8,
                                        borderRadius: 3,
                                        fontWeight: 700,
                                        fontSize: '1.05rem',
                                        textTransform: 'none',
                                        bgcolor: '#38bdf8',
                                        color: '#0f172a',
                                        boxShadow: '0 12px 28px rgba(56, 189, 248, 0.35)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            bgcolor: '#7dd3fc',
                                            transform: 'translateY(-2px)'
                                        }
                                    }}
                                    onClick={() => navigate('/register')}
                                >
                                    Get Started Free
                                </Button>

                                <Button
                                    variant="outlined"
                                    size="large"
                                    sx={{
                                        px: 4.5,
                                        py: 1.8,
                                        borderRadius: 3,
                                        fontWeight: 600,
                                        fontSize: '1.05rem',
                                        textTransform: 'none',
                                        color: 'white',
                                        borderColor: 'rgba(255, 255, 255, 0.35)',
                                        backdropFilter: 'blur(6px)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            borderColor: 'white',
                                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                                            transform: 'translateY(-2px)'
                                        }
                                    }}
                                    onClick={() => navigate('/login')}
                                >
                                    Sign In to Portal
                                </Button>
                            </Stack>
                        </motion.div>

                        {/* 4 Pillar Badges Grid */}
                        <motion.div variants={fadeUp}>
                            <Grid container spacing={2.5} justifyContent="center">
                                {pillars.map((pillar, idx) => (
                                    <Grid item xs={12} sm={6} md={3} key={idx}>
                                        <Stack
                                            direction="row"
                                            alignItems="center"
                                            justifyContent="center"
                                            spacing={1.5}
                                            sx={{
                                                p: 1.75,
                                                borderRadius: 3,
                                                bgcolor: 'rgba(15, 23, 42, 0.75)',
                                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                                backdropFilter: 'blur(10px)',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    bgcolor: 'rgba(255, 255, 255, 0.12)',
                                                    borderColor: pillar.color,
                                                    transform: 'translateY(-2px)'
                                                }
                                            }}
                                        >
                                            <Box sx={{
                                                p: 0.85,
                                                borderRadius: 2,
                                                bgcolor: pillar.bg,
                                                color: pillar.color,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                {pillar.icon}
                                            </Box>
                                            <Typography variant="body2" fontWeight="600" color="#f8fafc" sx={{ fontSize: '0.95rem' }}>
                                                {pillar.label}
                                            </Typography>
                                        </Stack>
                                    </Grid>
                                ))}
                            </Grid>
                        </motion.div>
                    </Box>

                    {/* Proportional Telemetry Dashboard Mockup Card Grid Layout (Photo 2 Fix) */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        <Paper
                            elevation={0}
                            sx={{
                                maxWidth: 960,
                                mx: 'auto',
                                p: { xs: 3, md: 4 },
                                borderRadius: 5,
                                bgcolor: '#0f172a',
                                border: '1px solid #334155',
                                boxShadow: '0 25px 50px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(56, 189, 248, 0.12)',
                                position: 'relative'
                            }}
                        >
                            {/* Window Header */}
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3.5} pb={2} sx={{ borderBottom: '1px solid #1e293b' }}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#ef4444' }} />
                                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10b981' }} />
                                    <Typography variant="caption" color="#e2e8f0" sx={{ ml: 1.5, fontWeight: 600, fontSize: '0.85rem' }}>
                                        HydroSync Telemetry Dashboard — Community Live View
                                    </Typography>
                                </Stack>
                                <Chip
                                    icon={<CheckCircleIcon sx={{ fontSize: '14px !important', color: '#6ee7b7 !important' }} />}
                                    label="148 Smart Meters Online"
                                    size="small"
                                    sx={{ bgcolor: 'rgba(16, 185, 129, 0.12)', color: '#6ee7b7', fontWeight: 600, fontSize: '0.78rem', px: 0.75 }}
                                />
                            </Stack>

                            {/* Inside Cards Grid: Row 1 = 3 cols (equal ratio 1:1:1), Row 2 = 1 col (Photo 2 Fix) */}
                            <Grid container spacing={3}>
                                {/* ROW 1: 3 COLUMNS EQUAL RATIO */}
                                <Grid item xs={12} md={4}>
                                    <Box sx={{ p: 2.75, borderRadius: 3.5, bgcolor: '#1e293b', border: '1px solid #334155', height: '100%' }}>
                                        <Typography variant="caption" color="#e2e8f0" fontWeight="600" display="block" mb={0.75} sx={{ fontSize: '0.85rem' }}>
                                            Current Flow Rate
                                        </Typography>
                                        <Typography variant="h4" fontWeight="800" color="#7dd3fc" mb={0.75} sx={{ letterSpacing: '-0.5px' }}>
                                            42.5 L/min
                                        </Typography>
                                        <Typography variant="caption" color="#6ee7b7" fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.8rem' }}>
                                            ⚡ 100% Real-Time Sync
                                        </Typography>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <Box sx={{ p: 2.75, borderRadius: 3.5, bgcolor: '#1e293b', border: '1px solid #334155', height: '100%' }}>
                                        <Typography variant="caption" color="#e2e8f0" fontWeight="600" display="block" mb={0.75} sx={{ fontSize: '0.85rem' }}>
                                            Monthly Community Usage
                                        </Typography>
                                        <Typography variant="h4" fontWeight="800" color="#6ee7b7" mb={0.75} sx={{ letterSpacing: '-0.5px' }}>
                                            14,280 L
                                        </Typography>
                                        <Typography variant="caption" color="#e2e8f0" fontWeight="500" sx={{ fontSize: '0.8rem' }}>
                                            Slab Tier 1 (Optimal Range)
                                        </Typography>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <Box sx={{ p: 2.75, borderRadius: 3.5, bgcolor: '#1e293b', border: '1px solid #334155', height: '100%' }}>
                                        <Typography variant="caption" color="#e2e8f0" fontWeight="600" display="block" mb={0.75} sx={{ fontSize: '0.85rem' }}>
                                            Active Leak Alerts
                                        </Typography>
                                        <Typography variant="h4" fontWeight="800" color="#c4b5fd" mb={0.75} sx={{ letterSpacing: '-0.5px' }}>
                                            0 Detected
                                        </Typography>
                                        <Typography variant="caption" color="#6ee7b7" fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.8rem' }}>
                                            <ShieldCheckIcon sx={{ fontSize: 15 }} /> All Systems Normal
                                        </Typography>
                                    </Box>
                                </Grid>

                                {/* ROW 2: 1 COLUMN SPANNING ALL 3 COLUMNS */}
                                <Grid item xs={12}>
                                    <Box sx={{ p: 3, borderRadius: 3.5, bgcolor: '#1e293b', border: '1px solid #334155' }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
                                            <Typography variant="subtitle2" color="#f8fafc" fontWeight="700" sx={{ fontSize: '0.95rem' }}>
                                                24-Hour Community Water Telemetry (Liters / Hour)
                                            </Typography>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <SpeedIcon sx={{ color: '#7dd3fc', fontSize: 18 }} />
                                                <Typography variant="caption" color="#e2e8f0" fontWeight="500">Updated Just Now</Typography>
                                            </Stack>
                                        </Stack>

                                        {/* Bar Visualizer */}
                                        <Stack direction="row" spacing={1.5} alignItems="flex-end" sx={{ height: 110, pt: 1, pb: 1 }}>
                                            {[35, 45, 60, 40, 75, 95, 70, 55, 40, 65, 80, 50].map((val, idx) => (
                                                <Box
                                                    key={idx}
                                                    sx={{
                                                        flex: 1,
                                                        height: `${val}%`,
                                                        bgcolor: idx === 5 ? '#38bdf8' : idx === 4 ? '#0284c7' : 'rgba(56, 189, 248, 0.25)',
                                                        borderRadius: '6px 6px 0 0',
                                                        transition: 'all 0.3s ease',
                                                        '&:hover': { bgcolor: '#38bdf8', transform: 'scaleY(1.05)' }
                                                    }}
                                                />
                                            ))}
                                        </Stack>

                                        {/* Discrete Properly Spaced Light Time Axis Labels */}
                                        <Box sx={{ pt: 1.5, mt: 1, borderTop: '1px solid #334155' }}>
                                            <Grid container justifyContent="space-between" alignItems="center">
                                                {timeLabels.map((time, i) => (
                                                    <Grid item key={i} sx={{ textAlign: 'center' }}>
                                                        <Typography variant="caption" color="#e2e8f0" fontWeight="600" sx={{ fontSize: '0.8rem' }}>
                                                            {time}
                                                        </Typography>
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                    </motion.div>
                </motion.div>
            </Container>

            {/* Bottom Wave Divider */}
            <Box sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                lineHeight: 0,
                overflow: 'hidden'
            }}>
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ width: '100%', height: '54px', display: 'block' }}>
                    <path d="M0,0 C150,90 350,-40 500,40 C650,120 900,10 1200,40 L1200,120 L0,120 Z" fill="#ffffff"></path>
                </svg>
            </Box>
        </Box>
    );
}