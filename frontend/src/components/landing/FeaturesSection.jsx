import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Avatar } from '@mui/material';
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
        icon: <WaterDropIcon sx={{ fontSize: 32 }} />,
        color: '#0284c7',
        bg: '#e0f2fe',
        desc: 'Real-time smart meter tracking with continuous flow rate telemetry, hourly consumption logs, and meter health status.'
    },
    {
        title: 'Billing Automation',
        icon: <ReceiptLongIcon sx={{ fontSize: 32 }} />,
        color: '#10b981',
        bg: '#d1fae5',
        desc: 'Automated slab tariff calculations, billing cycle generation, instant invoices, and seamless payment tracking.'
    },
    {
        title: 'Alert Engine',
        icon: <NotificationsActiveIcon sx={{ fontSize: 32 }} />,
        color: '#f59e0b',
        bg: '#fef3c7',
        desc: 'Intelligent anomaly detection algorithms that spot continuous flow, abnormal usage, and potential water leaks early.'
    },
    {
        title: 'Email Notifications',
        icon: <EmailIcon sx={{ fontSize: 32 }} />,
        color: '#8b5cf6',
        bg: '#ede9fe',
        desc: 'Automated email dispatching for monthly bill statements, payment receipts, and critical leak alert notifications.'
    },
    {
        title: 'Analytics',
        icon: <InsightsIcon sx={{ fontSize: 32 }} />,
        color: '#ec4899',
        bg: '#fce7f3',
        desc: 'Comprehensive data visualizers, historical consumption charts, peak load analysis, and community usage reports.'
    },
    {
        title: 'Community Management',
        icon: <ApartmentIcon sx={{ fontSize: 32 }} />,
        color: '#6366f1',
        bg: '#e0e7ff',
        desc: 'Multi-community tenant isolation, household directories, block allocation, and role-based administrative workflows.'
    }
];

export default function FeaturesSection() {
    return (
        <Box id="features" sx={{ py: { xs: 12, md: 16 }, bgcolor: '#ffffff' }}>
            <Container maxWidth="lg">
                {/* Header Container with Generous Spacing (Photo 4 Fix) */}
                <Box textAlign="center" sx={{ maxWidth: 760, mx: 'auto', mb: { xs: 8, md: 10 } }}>
                    <Typography
                        variant="caption"
                        sx={{
                            fontWeight: 700,
                            letterSpacing: '1.8px',
                            color: '#0284c7',
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
                            color: '#0f172a',
                            letterSpacing: '-1.2px',
                            lineHeight: 1.2,
                            mb: 3
                        }}
                    >
                        Everything You Need for Water Management
                    </Typography>
                    <Typography
                        variant="h6"
                        color="text.secondary"
                        sx={{ fontWeight: 400, fontSize: { xs: '1.05rem', md: '1.2rem' }, lineHeight: 1.7 }}
                    >
                        Engineered for administrators and residents to bring complete transparency, automation, and conservation.
                    </Typography>
                </Box>

                {/* Cards Grid with Spacing */}
                <Grid container spacing={{ xs: 4, md: 5 }} alignItems="stretch">
                    {features.map((feat, i) => (
                        <Grid item xs={12} sm={6} md={4} key={i}>
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                style={{ height: '100%' }}
                            >
                                <Card
                                    elevation={0}
                                    sx={{
                                        height: '100%',
                                        p: 4,
                                        borderRadius: 4,
                                        border: '1px solid #e2e8f0',
                                        bgcolor: '#ffffff',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.1)',
                                            borderColor: feat.color
                                        }
                                    }}
                                >
                                    <CardContent sx={{ p: 0 }}>
                                        <Avatar
                                            sx={{
                                                bgcolor: feat.bg,
                                                color: feat.color,
                                                width: 64,
                                                height: 64,
                                                borderRadius: 3.5,
                                                mb: 3.5,
                                                boxShadow: `0 8px 20px ${feat.color}20`
                                            }}
                                        >
                                            {feat.icon}
                                        </Avatar>

                                        <Typography variant="h6" fontWeight="700" color="#0f172a" gutterBottom sx={{ fontSize: '1.25rem', mb: 1.5 }}>
                                            {feat.title}
                                        </Typography>

                                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75, fontSize: '0.975rem' }}>
                                            {feat.desc}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}