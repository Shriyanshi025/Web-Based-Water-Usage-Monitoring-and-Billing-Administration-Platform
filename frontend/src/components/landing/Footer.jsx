import React, { useState } from 'react';
import { Box, Container, Grid, Typography, Stack, Link as MuiLink, Divider, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import EmailIcon from '@mui/icons-material/Email';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import CloseIcon from '@mui/icons-material/Close';

export default function Footer() {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', body: '' });

    const scrollToSection = (id) => {
        const elem = document.getElementById(id);
        if (elem) {
            elem.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleOpenModal = (title, type) => {
        let body = '';
        if (type === 'privacy') {
            body = `This Privacy Policy describes how HydroSync collects, uses, and discloses your personal information when you use our Water Usage Monitoring and Billing Platform. We collect account data (name, email, phone number) and consumption telemetry. We do not sell or share your data with unauthorized third parties. All data is stored securely and processed in compliance with standard security protocols.`;
        } else {
            body = `By accessing or using the HydroSync Platform, you agree to be bound by these Terms of Service. HydroSync provides smart water monitoring, billing automation, and alert tools for residential societies. Users must provide accurate profile details and comply with community rules. We reserve the right to suspend accounts violating terms or attempting unauthorized access.`;
        }
        setModalContent({ title, body });
        setModalOpen(true);
    };

    const gmailComposeUrl = "https://mail.google.com/mail/?view=cm&fs=1&to=support@hydrosync.io";

    return (
        <Box 
            sx={{ 
                bgcolor: '#09090b', 
                color: '#94a3b8', 
                pt: { xs: 10, sm: 12, md: 14 }, 
                pb: { xs: 6, md: 8 }, 
                borderTop: '1px solid rgba(255, 255, 255, 0.08)', 
                position: 'relative', 
                zIndex: 1 
            }}
        >
            <Container maxWidth="lg" sx={{ px: { xs: 3, sm: 4, md: 6 } }}>
                <Grid container spacing={{ xs: 5, sm: 6, md: 8 }} sx={{ justifyContent: 'space-between' }}>
                    {/* Brand Section */}
                    <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
                        <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    p: 0.75,
                                    borderRadius: 2,
                                    bgcolor: 'rgba(56, 189, 248, 0.15)',
                                    color: '#38bdf8'
                                }}
                            >
                                <WaterDropIcon sx={{ fontSize: 26 }} />
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>
                                HydroSync
                            </Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ lineHeight: 1.8, color: '#94a3b8', mb: 3.5 }}>
                            Web-Based Water Usage Monitoring & Billing Administration Platform. Engineered for residential societies to track water usage, automate billing cycles, and detect leaks.
                        </Typography>
                        <Stack direction="row" spacing={1.5}>
                            <IconButton
                                component="a"
                                href={gmailComposeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Send email via Gmail"
                                sx={{ 
                                    color: '#94a3b8', 
                                    bgcolor: 'rgba(255,255,255,0.03)', 
                                    border: '1px solid rgba(255,255,255,0.06)', 
                                    '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' } 
                                }}
                            >
                                <EmailIcon />
                            </IconButton>
                            <IconButton
                                component="a"
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="GitHub Repository"
                                sx={{ 
                                    color: '#94a3b8', 
                                    bgcolor: 'rgba(255,255,255,0.03)', 
                                    border: '1px solid rgba(255,255,255,0.06)', 
                                    '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' } 
                                }}
                            >
                                <GitHubIcon />
                            </IconButton>
                            <IconButton
                                component="a"
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="LinkedIn"
                                sx={{ 
                                    color: '#94a3b8', 
                                    bgcolor: 'rgba(255,255,255,0.03)', 
                                    border: '1px solid rgba(255,255,255,0.06)', 
                                    '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' } 
                                }}
                            >
                                <LinkedInIcon />
                            </IconButton>
                        </Stack>
                    </Grid>
 
                    {/* Quick Links */}
                    <Grid size={{ xs: 6, sm: 6, md: 2.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'white', mb: 3 }}>
                            Quick Links
                        </Typography>
                        <Stack spacing={2}>
                            <MuiLink underline="none" color="inherit" onClick={() => scrollToSection('features')} sx={{ cursor: 'pointer', transition: 'color 0.2s', '&:hover': { color: '#38bdf8' } }}>
                                Features
                            </MuiLink>
                            <MuiLink underline="none" color="inherit" onClick={() => scrollToSection('workflow')} sx={{ cursor: 'pointer', transition: 'color 0.2s', '&:hover': { color: '#38bdf8' } }}>
                                How It Works
                            </MuiLink>
                            <MuiLink underline="none" color="inherit" onClick={() => scrollToSection('stats')} sx={{ cursor: 'pointer', transition: 'color 0.2s', '&:hover': { color: '#38bdf8' } }}>
                                Why Choose Us
                            </MuiLink>
                            <MuiLink underline="none" color="inherit" onClick={() => scrollToSection('contact')} sx={{ cursor: 'pointer', transition: 'color 0.2s', '&:hover': { color: '#38bdf8' } }}>
                                Contact Us
                            </MuiLink>
                        </Stack>
                    </Grid>
 
                    {/* Platform Features */}
                    <Grid size={{ xs: 6, sm: 6, md: 2.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'white', mb: 3 }}>
                            Platform Features
                        </Typography>
                        <Stack spacing={2}>
                            <Typography variant="body2" sx={{ transition: 'color 0.2s', '&:hover': { color: 'white' } }}>Smart Water Monitoring</Typography>
                            <Typography variant="body2" sx={{ transition: 'color 0.2s', '&:hover': { color: 'white' } }}>Automated Billing Engine</Typography>
                            <Typography variant="body2" sx={{ transition: 'color 0.2s', '&:hover': { color: 'white' } }}>Leak & Anomaly Alerts</Typography>
                            <Typography variant="body2" sx={{ transition: 'color 0.2s', '&:hover': { color: 'white' } }}>Email Notifications</Typography>
                            <Typography variant="body2" sx={{ transition: 'color 0.2s', '&:hover': { color: 'white' } }}>Usage Analytics</Typography>
                        </Stack>
                    </Grid>
 
                    {/* Support & Help */}
                    <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'white', mb: 3 }}>
                            Support & Help
                        </Typography>
                        <Stack spacing={2}>
                            <Typography variant="body2">24/7 Technical Support</Typography>
                            <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                                Email:{' '}
                                <MuiLink
                                    href={gmailComposeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    color="inherit"
                                    underline="hover"
                                    sx={{ '&:hover': { color: '#38bdf8' } }}
                                >
                                    support@hydrosync.io
                                </MuiLink>
                            </Typography>
                            <MuiLink
                                onClick={() => scrollToSection('contact')}
                                underline="hover"
                                color="#38bdf8"
                                sx={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 0.75, mt: 1 }}
                            >
                                <EmailIcon fontSize="small" /> Contact Support Team
                            </MuiLink>
                        </Stack>
                    </Grid>
                </Grid>
 
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', mt: 8, mb: 4 }} />
 
                <Stack 
                    direction={{ xs: 'column', sm: 'row' }} 
                    spacing={2.5}
                    sx={{ justifyContent: 'space-between', alignItems: 'center' }}
                >
                    <Typography variant="body2" sx={{ color: '#64748b', textAlign: { xs: 'center', sm: 'left' } }}>
                        © 2026 HydroSync. All rights reserved.
                    </Typography>
                    <Stack direction="row" spacing={4.5}>
                        <MuiLink onClick={() => handleOpenModal('Privacy Policy', 'privacy')} sx={{ cursor: 'pointer', fontSize: '0.8125rem', color: '#64748b', textDecoration: 'none', '&:hover': { color: '#38bdf8' } }}>Privacy Policy</MuiLink>
                        <MuiLink onClick={() => handleOpenModal('Terms of Service', 'terms')} sx={{ cursor: 'pointer', fontSize: '0.8125rem', color: '#64748b', textDecoration: 'none', '&:hover': { color: '#38bdf8' } }}>Terms of Service</MuiLink>
                    </Stack>
                </Stack>
            </Container>

            {/* Privacy Policy & Terms Modals */}
            <Dialog
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                PaperProps={{
                    sx: {
                        bgcolor: '#0f172a',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 3,
                        p: 1
                    }
                }}
            >
                <DialogTitle sx={{ m: 0, p: 2, fontWeight: 'bold', fontSize: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {modalContent.title}
                    <IconButton onClick={() => setModalOpen(false)} sx={{ color: '#94a3b8', '&:hover': { color: 'white' } }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                    <Typography gutterBottom sx={{ color: '#cbd5e1', lineHeight: 1.6 }}>
                        {modalContent.body}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setModalOpen(false)} variant="contained" sx={{ bgcolor: '#38bdf8', color: '#0f172a', '&:hover': { bgcolor: '#7dd3fc' } }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
