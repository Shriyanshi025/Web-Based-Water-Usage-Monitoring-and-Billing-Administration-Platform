import React from 'react';
import { Box, Container, Grid, Typography, Stack, Link as MuiLink, Divider, IconButton } from '@mui/material';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailIcon from '@mui/icons-material/Email';
import CodeIcon from '@mui/icons-material/Code';

export default function Footer() {
    const scrollToSection = (id) => {
        const elem = document.getElementById(id);
        if (elem) {
            elem.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <Box sx={{ bgcolor: '#020617', color: '#94a3b8', pt: { xs: 8, md: 10 }, pb: 6, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Container maxWidth="lg">
                <Grid container spacing={5}>
                    {/* Brand & Project Info */}
                    <Grid item xs={12} md={4}>
                        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                            <WaterDropIcon sx={{ color: '#38bdf8', fontSize: 30 }} />
                            <Typography variant="h5" fontWeight="800" color="white" letterSpacing="-0.5px">
                                HydroSync
                            </Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ lineHeight: 1.7, color: '#94a3b8', mb: 3 }}>
                            Web-Based Water Usage Monitoring & Billing Administration Platform. Engineered for residential societies to track water usage, automate billing cycles, and detect leaks.
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 2 }}>
                            Infosys Virtual Internship 7.0 Project
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            <IconButton
                                component="a"
                                href="https://github.com/Shriyanshi025/Web-Based-Water-Usage-Monitoring-and-Billing-Administration-Platform"
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)', color: '#38bdf8' } }}
                            >
                                <GitHubIcon />
                            </IconButton>
                            <IconButton
                                component="a"
                                href="mailto:support@hydrosync.io"
                                sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)', color: '#38bdf8' } }}
                            >
                                <EmailIcon />
                            </IconButton>
                        </Stack>
                    </Grid>

                    {/* Quick Links */}
                    <Grid item xs={6} sm={4} md={2.5}>
                        <Typography variant="subtitle1" fontWeight="700" color="white" mb={2.5}>
                            Quick Links
                        </Typography>
                        <Stack spacing={1.5}>
                            <MuiLink underline="none" color="inherit" onClick={() => scrollToSection('features')} sx={{ cursor: 'pointer', '&:hover': { color: '#38bdf8' } }}>
                                Features
                            </MuiLink>
                            <MuiLink underline="none" color="inherit" onClick={() => scrollToSection('workflow')} sx={{ cursor: 'pointer', '&:hover': { color: '#38bdf8' } }}>
                                How It Works
                            </MuiLink>
                            <MuiLink underline="none" color="inherit" onClick={() => scrollToSection('stats')} sx={{ cursor: 'pointer', '&:hover': { color: '#38bdf8' } }}>
                                Why Choose Us
                            </MuiLink>
                            <MuiLink underline="none" color="inherit" onClick={() => scrollToSection('techstack')} sx={{ cursor: 'pointer', '&:hover': { color: '#38bdf8' } }}>
                                Tech Stack
                            </MuiLink>
                        </Stack>
                    </Grid>

                    {/* Features List */}
                    <Grid item xs={6} sm={4} md={2.5}>
                        <Typography variant="subtitle1" fontWeight="700" color="white" mb={2.5}>
                            Platform Features
                        </Typography>
                        <Stack spacing={1.5}>
                            <Typography variant="body2" sx={{ '&:hover': { color: 'white' } }}>Smart Water Monitoring</Typography>
                            <Typography variant="body2" sx={{ '&:hover': { color: 'white' } }}>Automated Billing Engine</Typography>
                            <Typography variant="body2" sx={{ '&:hover': { color: 'white' } }}>Leak & Anomaly Alerts</Typography>
                            <Typography variant="body2" sx={{ '&:hover': { color: 'white' } }}>Email Notifications</Typography>
                            <Typography variant="body2" sx={{ '&:hover': { color: 'white' } }}>Usage Analytics</Typography>
                            <Typography variant="body2" sx={{ '&:hover': { color: 'white' } }}>Community Management</Typography>
                        </Stack>
                    </Grid>

                    {/* Contact & Legal */}
                    <Grid item xs={12} sm={4} md={3}>
                        <Typography variant="subtitle1" fontWeight="700" color="white" mb={2.5}>
                            Project Info & Support
                        </Typography>
                        <Stack spacing={1.5}>
                            <Typography variant="body2">Infosys Internship Batch 7.0</Typography>
                            <Typography variant="body2">Repository: Web-Based-Water-Usage-Monitoring</Typography>
                            <Typography variant="body2">Contact: support@hydrosync.io</Typography>
                            <MuiLink
                                href="https://github.com/Shriyanshi025/Web-Based-Water-Usage-Monitoring-and-Billing-Administration-Platform"
                                target="_blank"
                                rel="noopener noreferrer"
                                underline="hover"
                                color="#38bdf8"
                                sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 1 }}
                            >
                                <CodeIcon fontSize="small" /> View Source Code
                            </MuiLink>
                        </Stack>
                    </Grid>
                </Grid>

                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', my: 4 }} />

                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
                    <Typography variant="body2" color="#64748b">
                        © {new Date().getFullYear()} HydroSync Water Administration Platform. All rights reserved.
                    </Typography>
                    <Stack direction="row" spacing={3}>
                        <Typography variant="caption" color="#64748b">Privacy Policy</Typography>
                        <Typography variant="caption" color="#64748b">Terms of Service</Typography>
                        <Typography variant="caption" color="#64748b">Security</Typography>
                    </Stack>
                </Stack>
            </Container>
        </Box>
    );
}
