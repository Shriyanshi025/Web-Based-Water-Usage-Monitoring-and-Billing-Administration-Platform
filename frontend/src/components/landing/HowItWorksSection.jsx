import React from 'react';
import { Box, Container, Typography, Card, Stack, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import SpeedIcon from '@mui/icons-material/Speed';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import DashboardIcon from '@mui/icons-material/Dashboard';

const steps = [
    {
        num: '01',
        title: 'Meter Reading',
        icon: <SpeedIcon sx={{ fontSize: 28 }} />,
        color: '#38bdf8',
        bg: 'rgba(56, 189, 248, 0.15)',
        desc: 'Smart IoT meters capture precise flow rate and volume telemetry automatically across all resident units.'
    },
    {
        num: '02',
        title: 'Usage Analysis',
        icon: <AnalyticsIcon sx={{ fontSize: 28 }} />,
        color: '#0ea5e9',
        bg: 'rgba(14, 165, 233, 0.15)',
        desc: 'HydroSync engine analyzes consumption trends, checks tariff slabs, and screens for continuous flow leaks.'
    },
    {
        num: '03',
        title: 'Bill Generation',
        icon: <RequestQuoteIcon sx={{ fontSize: 28 }} />,
        color: '#34d399',
        bg: 'rgba(52, 211, 153, 0.15)',
        desc: 'Automated billing engine calculates itemized charges based on active community tariff policies.'
    },
    {
        num: '04',
        title: 'Resident Dashboard',
        icon: <DashboardIcon sx={{ fontSize: 28 }} />,
        color: '#f472b6',
        bg: 'rgba(244, 114, 182, 0.15)',
        desc: 'Residents review transparent bill breakdowns, inspect usage analytics, and settle invoices online.'
    }
];

export default function HowItWorksSection() {
    return (
        <Box
            id="workflow"
            sx={{
                py: { xs: 12, md: 16 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%'
            }}
        >
            <Container
                maxWidth="md"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    px: { xs: 2, sm: 3, md: 4 }
                }}
            >
                {/* Header Container Centered */}
                <Box textAlign="center" sx={{ maxWidth: 760, mx: 'auto', mb: { xs: 6, md: 8 }, width: '100%' }}>
                    <Typography
                        variant="caption"
                        sx={{
                            fontWeight: 700,
                            letterSpacing: '2px',
                            color: '#38bdf8',
                            textTransform: 'uppercase',
                            mb: 2,
                            display: 'block'
                        }}
                    >
                        4-Step Workflow
                    </Typography>
                    <Typography
                        variant="h2"
                        fontWeight="900"
                        sx={{
                            fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.25rem' },
                            color: '#ffffff',
                            letterSpacing: '-1.5px',
                            lineHeight: 1.2,
                            mb: 3,
                            textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                        }}
                    >
                        How HydroSync Works
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 400,
                            fontSize: { xs: '1.05rem', md: '1.2rem' },
                            lineHeight: 1.75,
                            color: '#C4C0C3'
                        }}
                    >
                        Automated end-to-end process from real-time meter readings to transparent resident billing.
                    </Typography>
                </Box>

                {/* Centered, Full-Width, Same-Sized Cards Grid */}
                <Box
                    sx={{
                        width: '100%',
                        maxWidth: '820px',
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                        gap: { xs: 2.5, md: 3 },
                        mx: 'auto'
                    }}
                >
                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            style={{ width: '100%', height: '100%' }}
                        >
                            <Card
                                elevation={0}
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    minHeight: { xs: 'auto', sm: 230 },
                                    p: 3.5,
                                    borderRadius: 4,
                                    border: '1px solid rgba(255, 255, 255, 0.12)',
                                    bgcolor: 'rgba(15, 23, 42, 0.65)',
                                    backdropFilter: 'blur(16px)',
                                    WebkitBackdropFilter: 'blur(16px)',
                                    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    position: 'relative',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        bgcolor: 'rgba(15, 23, 42, 0.85)',
                                        boxShadow: `0 20px 40px -10px ${step.color}30, 0 10px 30px rgba(0,0,0,0.6)`,
                                        borderColor: step.color
                                    }
                                }}
                            >
                                <Box>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
                                        <Avatar
                                            sx={{
                                                bgcolor: step.bg,
                                                color: step.color,
                                                width: 50,
                                                height: 50,
                                                borderRadius: 2.75,
                                                border: `1px solid ${step.color}35`,
                                                boxShadow: `0 8px 18px ${step.color}20`
                                            }}
                                        >
                                            {step.icon}
                                        </Avatar>
                                        <Typography
                                            variant="h5"
                                            fontWeight="900"
                                            sx={{ color: step.color, opacity: 0.85, letterSpacing: '-1px' }}
                                        >
                                            {step.num}
                                        </Typography>
                                    </Stack>

                                    <Typography variant="h6" fontWeight="700" gutterBottom sx={{ color: '#C4C0C3', fontSize: '1.18rem', mb: 1.25 }}>
                                        {step.title}
                                    </Typography>

                                    <Typography variant="body2" sx={{ color: '#C4C0C3', lineHeight: 1.65, fontSize: '0.94rem' }}>
                                        {step.desc}
                                    </Typography>
                                </Box>
                            </Card>
                        </motion.div>
                    ))}
                </Box>
            </Container>
        </Box>
    );
}
