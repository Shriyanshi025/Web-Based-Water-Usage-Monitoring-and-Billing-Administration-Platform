import React from 'react';
import { Box, Container, Typography, Paper, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import ApartmentIcon from '@mui/icons-material/Apartment';
import GroupsIcon from '@mui/icons-material/Groups';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import WaterDropIcon from '@mui/icons-material/WaterDrop';

const stats = [
    {
        num: '150+',
        label: 'Communities Managed',
        desc: 'Active housing societies & residential complexes utilizing HydroSync.',
        icon: <ApartmentIcon sx={{ fontSize: 32 }} />,
        color: '#38bdf8',
        bg: 'rgba(56, 189, 248, 0.15)'
    },
    {
        num: '25,000+',
        label: 'Residents',
        desc: 'Active users accessing real-time billing and telemetry portals daily.',
        icon: <GroupsIcon sx={{ fontSize: 32 }} />,
        color: '#818cf8',
        bg: 'rgba(129, 140, 248, 0.15)'
    },
    {
        num: '120,000+',
        label: 'Bills Generated',
        desc: 'Accurate automated tier invoices issued with zero manual errors.',
        icon: <ReceiptLongIcon sx={{ fontSize: 32 }} />,
        color: '#34d399',
        bg: 'rgba(52, 211, 153, 0.15)'
    },
    {
        num: '4.5M+',
        label: 'Gallons Water Saved',
        desc: 'Gallons conserved via automated continuous flow leak detection.',
        icon: <WaterDropIcon sx={{ fontSize: 32 }} />,
        color: '#fbbf24',
        bg: 'rgba(251, 191, 36, 0.15)'
    }
];

export default function StatsSection() {
    return (
        <Box id="stats" sx={{ py: { xs: 14, md: 18 } }}>
            <Container maxWidth="lg">
                {/* Header Container */}
                <Box textAlign="center" sx={{ maxWidth: 760, mx: 'auto', mb: { xs: 8, md: 10 } }}>
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
                        Why Choose Us
                    </Typography>
                    <Typography
                        variant="h2"
                        fontWeight="900"
                        sx={{
                            fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.25rem' },
                            letterSpacing: '-1.5px',
                            lineHeight: 1.2,
                            mb: 3,
                            color: '#ffffff',
                            textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                        }}
                    >
                        Proven Impact by the Numbers
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: '#C4C0C3',
                            fontWeight: 400,
                            fontSize: { xs: '1.05rem', md: '1.2rem' },
                            lineHeight: 1.75
                        }}
                    >
                        Trust driven by measurable results in resource conservation, cost equity, and administrative automation.
                    </Typography>
                </Box>

                {/* 2x2 Translucent Glass Grid Centered & Full Width */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                        gap: { xs: 2.5, md: 3 },
                        maxWidth: '820px',
                        width: '100%',
                        mx: 'auto'
                    }}
                >
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                        >
                            <Paper
                                elevation={0}
                                sx={{
                                    p: { xs: 4, sm: 4.5 },
                                    borderRadius: 4,
                                    bgcolor: 'rgba(15, 23, 42, 0.65)',
                                    backdropFilter: 'blur(16px)',
                                    WebkitBackdropFilter: 'blur(16px)',
                                    border: '1px solid rgba(255, 255, 255, 0.12)',
                                    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    '&:hover': {
                                        transform: 'translateY(-6px)',
                                        bgcolor: 'rgba(15, 23, 42, 0.85)',
                                        borderColor: stat.color,
                                        boxShadow: `0 20px 40px -10px ${stat.color}30, 0 10px 30px rgba(0,0,0,0.6)`
                                    }
                                }}
                            >
                                <Stack direction="row" spacing={3} alignItems="flex-start">
                                    <Box
                                        sx={{
                                            p: 2,
                                            borderRadius: 3,
                                            bgcolor: stat.bg,
                                            color: stat.color,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: `1px solid ${stat.color}35`,
                                            boxShadow: `0 8px 20px ${stat.color}20`
                                        }}
                                    >
                                        {stat.icon}
                                    </Box>
                                    <Box>
                                        <Typography
                                            variant="h3"
                                            fontWeight="900"
                                            sx={{
                                                fontSize: { xs: '2.5rem', md: '3rem' },
                                                letterSpacing: '-1px',
                                                mb: 0.5,
                                                color: '#ffffff',
                                                textShadow: `0 2px 15px ${stat.color}40`
                                            }}
                                        >
                                            {stat.num}
                                        </Typography>
                                        <Typography variant="h6" fontWeight="700" gutterBottom sx={{ color: '#C4C0C3', fontSize: '1.15rem', mb: 1 }}>
                                            {stat.label}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#C4C0C3', lineHeight: 1.6, fontSize: '0.9rem' }}>
                                            {stat.desc}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Paper>
                        </motion.div>
                    ))}
                </Box>
            </Container>
        </Box>
    );
}