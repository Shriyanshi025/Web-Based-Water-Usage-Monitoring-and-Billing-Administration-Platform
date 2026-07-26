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
        <Box id="stats" sx={{ py: { xs: 14, md: 18 }, bgcolor: '#090d16', color: 'white' }}>
            <Container maxWidth="lg">
                {/* Header Container */}
                <Box textAlign="center" sx={{ maxWidth: 760, mx: 'auto', mb: { xs: 8, md: 10 } }}>
                    <Typography
                        variant="caption"
                        sx={{
                            fontWeight: 700,
                            letterSpacing: '2px',
                            color: '#38bdf8 !important',
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
                            color: '#ffffff !important'
                        }}
                    >
                        Proven Impact by the Numbers
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: '#e2e8f0 !important',
                            fontWeight: 400,
                            fontSize: { xs: '1.05rem', md: '1.2rem' },
                            lineHeight: 1.75
                        }}
                    >
                        Trust driven by measurable results in resource conservation, cost equity, and administrative automation.
                    </Typography>
                </Box>

                {/* Strict 2x2 CSS Grid with Guaranteed Equal Box Size Each (2 Columns x 2 Rows) */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                        gap: { xs: 3, md: 4 },
                        maxWidth: 980,
                        mx: 'auto'
                    }}
                >
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.94, y: 20 }}
                            whileInView={{ opacity: 1, scale: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            style={{ height: '100%', display: 'flex' }}
                        >
                            <Paper
                                elevation={0}
                                sx={{
                                    p: { xs: 3.5, md: 4.5 },
                                    borderRadius: 5,
                                    width: '100%',
                                    height: '100%',
                                    minHeight: 250,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    bgcolor: '#151d2a !important',
                                    border: '1px solid #233147',
                                    boxSizing: 'border-box',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        transform: 'translateY(-6px)',
                                        bgcolor: '#1a2436 !important',
                                        borderColor: stat.color,
                                        boxShadow: `0 20px 40px -12px ${stat.color}30`
                                    }
                                }}
                            >
                                <Box>
                                    <Stack direction="row" alignItems="center" mb={2.5}>
                                        <Box sx={{
                                            p: 1.75,
                                            borderRadius: 3.5,
                                            bgcolor: stat.bg,
                                            color: stat.color,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            {stat.icon}
                                        </Box>
                                    </Stack>

                                    <Typography
                                        variant="h3"
                                        fontWeight="900"
                                        sx={{
                                            color: `${stat.color} !important`,
                                            mb: 1.5,
                                            letterSpacing: '-1.5px',
                                            fontSize: { xs: '2.5rem', md: '3.2rem' }
                                        }}
                                    >
                                        {stat.num}
                                    </Typography>

                                    {/* Bright White Card Title */}
                                    <Typography variant="h5" fontWeight="800" sx={{ color: '#ffffff !important', mb: 1.25, letterSpacing: '-0.5px' }}>
                                        {stat.label}
                                    </Typography>

                                    {/* Crisp Light Slate Description */}
                                    <Typography variant="body1" sx={{ color: '#e2e8f0 !important', fontSize: '0.975rem', lineHeight: 1.65 }}>
                                        {stat.desc}
                                    </Typography>
                                </Box>
                            </Paper>
                        </motion.div>
                    ))}
                </Box>
            </Container>
        </Box>
    );
}