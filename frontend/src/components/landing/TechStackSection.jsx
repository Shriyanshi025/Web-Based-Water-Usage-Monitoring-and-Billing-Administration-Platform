import React from 'react';
import { Box, Container, Typography, Grid, Paper, Stack, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import StorageIcon from '@mui/icons-material/Storage';
import CodeIcon from '@mui/icons-material/Code';
import SecurityIcon from '@mui/icons-material/Security';
import LayersIcon from '@mui/icons-material/Layers';
import TerminalIcon from '@mui/icons-material/Terminal';

const technologies = [
    {
        name: 'Spring Boot',
        category: 'Backend Architecture',
        icon: <TerminalIcon sx={{ fontSize: 30 }} />,
        color: '#16a34a',
        bg: '#dcfce7',
        desc: 'High-performance Java framework powering REST APIs, security filters, and transaction handling.'
    },
    {
        name: 'React',
        category: 'Frontend SPA',
        icon: <CodeIcon sx={{ fontSize: 30 }} />,
        color: '#0284c7',
        bg: '#e0f2fe',
        desc: 'Modern reactive frontend built with Vite for component modularity and lightning-fast state synchronization.'
    },
    {
        name: 'PostgreSQL',
        category: 'Database & Telemetry',
        icon: <StorageIcon sx={{ fontSize: 30 }} />,
        color: '#2563eb',
        bg: '#dbeafe',
        desc: 'Enterprise-grade relational storage ensuring ACID compliance for meter readings, tariffs, and invoices.'
    },
    {
        name: 'JWT',
        category: 'Security & Auth',
        icon: <SecurityIcon sx={{ fontSize: 30 }} />,
        color: '#d97706',
        bg: '#fef3c7',
        desc: 'Stateless JSON Web Tokens with fine-grained role-based access control (RBAC) across multi-tenant scopes.'
    },
    {
        name: 'Material UI',
        category: 'Design System',
        icon: <LayersIcon sx={{ fontSize: 30 }} />,
        color: '#8b5cf6',
        bg: '#ede9fe',
        desc: 'Google Material Design system providing accessible, responsive, and beautifully themed UI components.'
    }
];

export default function TechStackSection() {
    return (
        <Box id="techstack" sx={{ py: { xs: 14, md: 18 }, bgcolor: '#ffffff' }}>
            <Container maxWidth="lg">
                {/* Header Container with Generous Spacing (Photo 2 Fix) */}
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
                        Technology Stack
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
                        Powered by Enterprise Tech
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
                        Built with reliable, battle-tested modern web standards and enterprise frameworks.
                    </Typography>
                </Box>

                {/* Tech Cards Grid with Generous Internal Spacing (Photo 2 Fix) */}
                <Grid container spacing={4} justifyContent="center" alignItems="stretch">
                    {technologies.map((tech, i) => (
                        <Grid item xs={12} sm={6} md={4} key={i}>
                            <motion.div
                                initial={{ opacity: 0, y: 25 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.1 }}
                                style={{ height: '100%' }}
                            >
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 4,
                                        borderRadius: 4.5,
                                        height: '100%',
                                        bgcolor: '#f8fafc',
                                        border: '1px solid #e2e8f0',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-6px)',
                                            boxShadow: '0 20px 40px -12px rgba(15, 23, 42, 0.08)',
                                            borderColor: tech.color
                                        }
                                    }}
                                >
                                    <Box>
                                        {/* Icon & Category Chip Row */}
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                                            <Box sx={{
                                                p: 1.75,
                                                borderRadius: 3.5,
                                                bgcolor: tech.bg,
                                                color: tech.color,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                {tech.icon}
                                            </Box>

                                            <Chip
                                                label={tech.category}
                                                size="small"
                                                sx={{
                                                    bgcolor: '#ffffff',
                                                    color: '#475569',
                                                    fontWeight: 700,
                                                    fontSize: '0.75rem',
                                                    border: '1px solid #cbd5e1',
                                                    px: 1,
                                                    py: 0.5
                                                }}
                                            />
                                        </Stack>

                                        {/* Title & Description */}
                                        <Typography variant="h5" fontWeight="800" color="#0f172a" mb={1.5} sx={{ letterSpacing: '-0.5px' }}>
                                            {tech.name}
                                        </Typography>

                                        <Typography variant="body2" color="#475569" sx={{ lineHeight: 1.7, fontSize: '0.95rem' }}>
                                            {tech.desc}
                                        </Typography>
                                    </Box>
                                </Paper>
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}
