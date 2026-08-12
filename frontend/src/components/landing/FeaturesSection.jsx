import React from 'react';
import { Box, Container, Typography, Card, CardContent, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import EmailIcon from '@mui/icons-material/Email';
import InsightsIcon from '@mui/icons-material/Insights';
import ApartmentIcon from '@mui/icons-material/Apartment';

const features = [
    {
        title: 'Water Monitoring',
        icon: <WaterDropIcon sx={{ fontSize: 30 }} />,
        color: '#38bdf8',
        bg: 'rgba(56, 189, 248, 0.15)',
        desc: 'Real-time smart meter tracking with continuous flow rate telemetry, hourly consumption logs, and meter health status.'
    },
    {
        title: 'Billing Automation',
        icon: <ReceiptLongIcon sx={{ fontSize: 30 }} />,
        color: '#34d399',
        bg: 'rgba(52, 211, 153, 0.15)',
        desc: 'Automated slab tariff calculations, billing cycle generation, instant invoices, and seamless payment tracking.'
    },
    {
        title: 'Alert Engine',
        icon: <NotificationsActiveIcon sx={{ fontSize: 30 }} />,
        color: '#fbbf24',
        bg: 'rgba(251, 191, 36, 0.15)',
        desc: 'Intelligent anomaly detection algorithms that spot continuous flow, abnormal usage, and potential water leaks early.'
    },
    {
        title: 'Email Notifications',
        icon: <EmailIcon sx={{ fontSize: 30 }} />,
        color: '#a78bfa',
        bg: 'rgba(167, 139, 250, 0.15)',
        desc: 'Automated email dispatching for monthly bill statements, payment receipts, and critical leak alert notifications.'
    },
    {
        title: 'Analytics',
        icon: <InsightsIcon sx={{ fontSize: 30 }} />,
        color: '#f472b6',
        bg: 'rgba(244, 114, 182, 0.15)',
        desc: 'Comprehensive data visualizers, historical consumption charts, peak load analysis, and community usage reports.'
    },
    {
        title: 'Community Management',
        icon: <ApartmentIcon sx={{ fontSize: 30 }} />,
        color: '#818cf8',
        bg: 'rgba(129, 140, 248, 0.15)',
        desc: 'Multi-community tenant isolation, household directories, block allocation, and role-based administrative workflows.'
    }
];

export default function FeaturesSection() {
    return (
        <Box
            id="features"
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
                            letterSpacing: '1.8px',
                            color: '#38bdf8',
                            textTransform: 'uppercase',
                            mb: 2,
                            display: 'block'
                        }}
                    >
                        Core Capabilities
                    </Typography>
                    <Typography
                        variant="h2"
                        fontWeight="800"
                        sx={{
                            fontSize: { xs: '2.2rem', sm: '2.75rem', md: '3.25rem' },
                            color: '#ffffff',
                            letterSpacing: '-1.2px',
                            lineHeight: 1.2,
                            mb: 3,
                            textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                        }}
                    >
                        Everything You Need for Water Management
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 400,
                            fontSize: { xs: '1.05rem', md: '1.2rem' },
                            lineHeight: 1.7,
                            color: '#C4C0C3'
                        }}
                    >
                        Engineered for administrators and residents to bring complete transparency, automation, and conservation.
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
                    {features.map((feat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.08 }}
                            style={{ width: '100%', height: '100%' }}
                        >
                            <Card
                                elevation={0}
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    minHeight: { xs: 'auto', sm: 260 },
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
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        bgcolor: 'rgba(15, 23, 42, 0.85)',
                                        boxShadow: `0 20px 40px -10px ${feat.color}30, 0 10px 30px rgba(0,0,0,0.6)`,
                                        borderColor: feat.color
                                    }
                                }}
                            >
                                <CardContent sx={{ p: 0 }}>
                                    <Avatar
                                        sx={{
                                            bgcolor: feat.bg,
                                            color: feat.color,
                                            width: 54,
                                            height: 54,
                                            borderRadius: 3,
                                            mb: 2.5,
                                            border: `1px solid ${feat.color}35`,
                                            boxShadow: `0 8px 20px ${feat.color}20`
                                        }}
                                    >
                                        {feat.icon}
                                    </Avatar>

                                    <Typography variant="h6" fontWeight="700" gutterBottom sx={{ color: '#C4C0C3', fontSize: '1.18rem', mb: 1.25 }}>
                                        {feat.title}
                                    </Typography>

                                    <Typography variant="body2" sx={{ color: '#C4C0C3', lineHeight: 1.65, fontSize: '0.94rem' }}>
                                        {feat.desc}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </Box>
            </Container>
        </Box>
    );
}