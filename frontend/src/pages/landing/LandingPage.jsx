import React, { useState, useEffect } from 'react';
import { Box, Container, Stack, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import HeroSection from '../../components/landing/HeroSection';
import FeaturesSection from '../../components/landing/FeaturesSection';
import HowItWorksSection from '../../components/landing/HowItWorksSection';
import StatsSection from '../../components/landing/StatsSection';
import TechStackSection from '../../components/landing/TechStackSection';
import Footer from '../../components/landing/Footer';
import LanguageSelector from '../../components/common/LanguageSelector';

export default function LandingPage() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id) => {
        const elem = document.getElementById(id);
        if (elem) {
            elem.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <Box sx={{ bgcolor: '#ffffff', minHeight: '100vh', overflowX: 'hidden' }}>
            {/* Top Navigation Header */}
            <Box
                component="header"
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1100,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    bgcolor: scrolled ? 'rgba(15, 23, 42, 0.96)' : 'rgba(15, 23, 42, 0.92)',
                    backdropFilter: 'blur(16px)',
                    py: 1.75,
                    px: { xs: 2.5, md: 4 },
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: scrolled ? '0 10px 30px -10px rgba(0, 0, 0, 0.5)' : 'none'
                }}
            >
                <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {/* Left: Brand Logo */}
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1.25}
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        sx={{
                            cursor: 'pointer',
                            py: 0.5,
                            px: 1,
                            borderRadius: 2.5,
                            transition: 'opacity 0.2s ease',
                            '&:hover': { opacity: 0.9 }
                        }}
                    >
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
                        
                        <Typography
                            variant="h6"
                            fontWeight="900"
                            sx={{
                                fontSize: '1.3rem',
                                letterSpacing: '-0.3px',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            Hydro
                            <Box component="span" sx={{ color: '#38bdf8', ml: 0.25 }}>
                                Sync
                            </Box>
                        </Typography>
                    </Stack>

                    {/* Center: Nav Links with Faded Muted Font Colors */}
                    <Stack
                        direction="row"
                        spacing={{ md: 2, lg: 3 }}
                        alignItems="center"
                        justifyContent="center"
                        sx={{ display: { xs: 'none', md: 'flex' } }}
                    >
                        {[
                            { id: 'features', label: 'Features' },
                            { id: 'workflow', label: 'How It Works' },
                            { id: 'stats', label: 'Why Choose Us' },
                            { id: 'techstack', label: 'Tech Stack' }
                        ].map((nav) => (
                            <Button
                                key={nav.id}
                                variant="text"
                                onClick={() => scrollToSection(nav.id)}
                                sx={{
                                    color: 'rgba(226, 232, 240, 0.65)',
                                    fontWeight: 500,
                                    fontSize: '0.95rem',
                                    textTransform: 'none',
                                    px: 2,
                                    py: 0.75,
                                    borderRadius: 2,
                                    transition: 'all 0.25s ease',
                                    '&:hover': {
                                        color: '#ffffff',
                                        bgcolor: 'rgba(255, 255, 255, 0.08)'
                                    }
                                }}
                            >
                                {nav.label}
                            </Button>
                        ))}
                    </Stack>

                    {/* Right: Action Buttons Pushed to Top Right Corner */}
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <LanguageSelector />
                        <Button
                            variant="text"
                            startIcon={<LockOutlinedIcon sx={{ fontSize: '18px !important' }} />}
                            sx={{
                                color: 'rgba(248, 250, 252, 0.85)',
                                fontWeight: 600,
                                px: 2.2,
                                py: 0.9,
                                borderRadius: 2.5,
                                fontSize: '0.9rem',
                                textTransform: 'none',
                                '&:hover': { color: '#ffffff', bgcolor: 'rgba(255, 255, 255, 0.12)' }
                            }}
                            onClick={() => navigate('/login')}
                        >
                            Sign In
                        </Button>
                        <Button
                            variant="contained"
                            sx={{
                                bgcolor: '#38bdf8',
                                color: '#0f172a',
                                fontWeight: 700,
                                px: 2.75,
                                py: 0.9,
                                borderRadius: 2.5,
                                fontSize: '0.9rem',
                                textTransform: 'none',
                                boxShadow: '0 4px 14px rgba(56, 189, 248, 0.35)',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    bgcolor: '#7dd3fc',
                                    transform: 'translateY(-1px)'
                                }
                            }}
                            onClick={() => navigate('/register')}
                        >
                            Get Started
                        </Button>
                    </Stack>
                </Box>
            </Box>

            {/* Hero Section */}
            <HeroSection />

            {/* Features Section */}
            <FeaturesSection />

            {/* How It Works Section */}
            <HowItWorksSection />

            {/* Statistics Section */}
            <StatsSection />

            {/* Tech Stack Section */}
            <TechStackSection />

            {/* CTA Banner */}
            <Box
                sx={{
                    py: { xs: 12, md: 16 },
                    background: 'linear-gradient(135deg, #0284c7 0%, #0f172a 100%)',
                    color: 'white',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <Container maxWidth="md">
                    <Typography
                        variant="h3"
                        fontWeight="800"
                        sx={{
                            fontSize: { xs: '2rem', sm: '2.75rem', md: '3.25rem' },
                            letterSpacing: '-1.2px',
                            lineHeight: 1.25,
                            mb: 3
                        }}
                    >
                        Ready to Modernize Your Community's Water Management?
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: 'rgba(255, 255, 255, 0.85)',
                            fontWeight: 400,
                            mb: 6,
                            maxWidth: 660,
                            mx: 'auto',
                            fontSize: { xs: '1.05rem', md: '1.2rem' },
                            lineHeight: 1.65
                        }}
                    >
                        Join HydroSync today to gain real-time water monitoring, automated billing, leak protection, and complete administrative transparency.
                    </Typography>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center" alignItems="center">
                        <Button
                            variant="contained"
                            size="large"
                            endIcon={<ArrowForwardIcon />}
                            sx={{
                                bgcolor: '#ffffff',
                                color: '#0284c7',
                                px: 4.5,
                                py: 1.8,
                                borderRadius: 3,
                                fontWeight: 700,
                                fontSize: '1.1rem',
                                textTransform: 'none',
                                boxShadow: '0 12px 28px rgba(0,0,0,0.2)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    bgcolor: '#f8fafc',
                                    transform: 'translateY(-2px)'
                                }
                            }}
                            onClick={() => navigate('/register')}
                        >
                            Get Started Now
                        </Button>

                        <Button
                            variant="outlined"
                            size="large"
                            sx={{
                                borderColor: 'rgba(255, 255, 255, 0.4)',
                                color: 'white',
                                px: 4.5,
                                py: 1.8,
                                borderRadius: 3,
                                fontWeight: 600,
                                fontSize: '1.1rem',
                                textTransform: 'none',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    borderColor: 'white',
                                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                                    transform: 'translateY(-2px)'
                                }
                            }}
                            onClick={() => navigate('/login')}
                        >
                            Sign In to Account
                        </Button>
                    </Stack>
                </Container>
            </Box>

            {/* Footer */}
            <Footer />
        </Box>
    );
}