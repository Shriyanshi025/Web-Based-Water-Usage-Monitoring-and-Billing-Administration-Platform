import React from 'react';
import { Box, Container, Typography, Grid, Card, Stack, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import SpeedIcon from '@mui/icons-material/Speed';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SouthIcon from '@mui/icons-material/South';
import EastIcon from '@mui/icons-material/East';

const steps = [
    {
        num: '01',
        title: 'Meter Reading',
        icon: <SpeedIcon sx={{ fontSize: 30 }} />,
        color: '#0284c7',
        bg: '#e0f2fe',
        desc: 'Smart IoT meters capture precise flow rate and volume telemetry automatically across all resident units.'
    },
    {
        num: '02',
        title: 'Usage Analysis',
        icon: <AnalyticsIcon sx={{ fontSize: 30 }} />,
        color: '#8b5cf6',
        bg: '#ede9fe',
        desc: 'HydroSync engine analyzes consumption trends, checks tariff slabs, and screens for continuous flow leaks.'
    },
    {
        num: '03',
        title: 'Bill Generation',
        icon: <RequestQuoteIcon sx={{ fontSize: 30 }} />,
        color: '#10b981',
        bg: '#d1fae5',
        desc: 'Automated billing engine calculates itemized charges based on active community tariff policies.'
    },
    {
        num: '04',
        title: 'Resident Dashboard',
        icon: <DashboardIcon sx={{ fontSize: 30 }} />,
        color: '#ec4899',
        bg: '#fce7f3',
        desc: 'Residents review transparent bill breakdowns, inspect usage analytics, and settle invoices online.'
    }
];

export default function HowItWorksSection() {
    return (
        <Box id="workflow" sx={{ py: { xs: 14, md: 18 }, bgcolor: '#f8fafc' }}>
            <Container maxWidth="lg">
                {/* Header Container with Generous Spacing & Centered Alignment (Photo 3 Fix) */}
                <Box textAlign="center" sx={{ maxWidth: 760, mx: 'auto', mb: { xs: 8, md: 12 } }}>
                    <Typography
                        variant="caption"
                        sx={{
                            fontWeight: 700,
                            letterSpacing: '2px',
                            color: '#0284c7',
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
                            color: '#0f172a',
                            letterSpacing: '-1.5px',
                            lineHeight: 1.2,
                            mb: 3
                        }}
                    >
                        How HydroSync Works
                    </Typography>
                    <Typography
                        variant="h6"
                        color="text.secondary"
                        sx={{
                            fontWeight: 400,
                            fontSize: { xs: '1.05rem', md: '1.2rem' },
                            lineHeight: 1.75
                        }}
                    >
                        Automated end-to-end process from real-time meter readings to transparent resident billing.
                    </Typography>
                </Box>

                {/* 4-Column Horizontal Cards Grid with Generous Spacing (Photo 3 Fix) */}
                <Grid container spacing={4} alignItems="stretch">
                    {steps.map((step, i) => (
                        <Grid item xs={12} sm={6} md={3} key={i}>
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.12 }}
                                style={{ height: '100%' }}
                            >
                                <Card
                                    elevation={0}
                                    sx={{
                                        p: 4,
                                        borderRadius: 4.5,
                                        height: '100%',
                                        bgcolor: '#ffffff',
                                        border: '1px solid #e2e8f0',
                                        position: 'relative',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            boxShadow: '0 20px 40px -12px rgba(15, 23, 42, 0.08)',
                                            borderColor: step.color
                                        }
                                    }}
                                >
                                    <Box>
                                        {/* Avatar & Step Number */}
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                                            <Avatar
                                                sx={{
                                                    bgcolor: step.bg,
                                                    color: step.color,
                                                    width: 58,
                                                    height: 58,
                                                    borderRadius: 3.5
                                                }}
                                            >
                                                {step.icon}
                                            </Avatar>

                                            <Typography
                                                variant="h4"
                                                fontWeight="900"
                                                sx={{ color: '#cbd5e1', letterSpacing: '-1px' }}
                                            >
                                                {step.num}
                                            </Typography>
                                        </Stack>

                                        {/* Title & Description */}
                                        <Typography variant="h6" fontWeight="800" color="#0f172a" mb={1.5} sx={{ fontSize: '1.2rem' }}>
                                            {step.title}
                                        </Typography>

                                        <Typography variant="body2" color="#475569" sx={{ lineHeight: 1.7, fontSize: '0.95rem' }}>
                                            {step.desc}
                                        </Typography>
                                    </Box>

                                    {/* Step Progress Arrow */}
                                    {i < steps.length - 1 && (
                                        <Box sx={{ pt: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Box sx={{ display: { xs: 'block', md: 'none' }, color: '#cbd5e1' }}>
                                                <SouthIcon fontSize="small" />
                                            </Box>
                                            <Box sx={{ display: { xs: 'none', md: 'block' }, color: '#cbd5e1', position: 'absolute', right: -18, top: '45%', zIndex: 3 }}>
                                                <EastIcon fontSize="small" />
                                            </Box>
                                        </Box>
                                    )}
                                </Card>
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}
