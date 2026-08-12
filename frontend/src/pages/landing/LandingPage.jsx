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
        <Box sx={{ position: 'relative', minHeight: '100vh', bgcolor: '#09090b', overflowX: 'hidden' }}>
            {/* 1. STATIC FIXED BACKGROUND LAYER (Fixed Canvas That Never Moves or Restarts on Scroll) */}
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 0,
                    pointerEvents: 'none',
                    overflow: 'hidden',
                    bgcolor: '#030712'
                }}
            >
                {/* Looping Liquid Water / Cinematic Atmosphere Video */}
                <Box
                    component="video"
                    autoPlay
                    loop
                    muted
                    playsInline
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: 'brightness(0.72) contrast(1.18)'
                    }}
                >
                    <source src="/liquid-water-hero.mp4" type="video/mp4" />
                    <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/liquid-metal-video_yX6NvjdW-6bLYorR3Ihmlwjivg3pjA978qrSKRU.mp4" type="video/mp4" />
                </Box>

                {/* Layered Cinematic Vignettes & Radial Dark Overlays */}
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        background: `
                            linear-gradient(180deg, rgba(9, 9, 11, 0.75) 0%, rgba(9, 9, 11, 0.3) 45%, rgba(9, 9, 11, 0.92) 100%),
                            linear-gradient(90deg, rgba(9, 9, 11, 0.55) 0%, transparent 40%, rgba(9, 9, 11, 0.55) 100%),
                            radial-gradient(ellipse 80% 60% at 50% 40%, rgba(2, 132, 199, 0.12) 0%, transparent 70%)
                        `
                    }}
                />
            </Box>

            {/* 2. TOP NAVIGATION HEADER (Fixed Navbar with Glassmorphism) */}
            <Box
                component="header"
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1100,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    bgcolor: scrolled ? 'rgba(9, 9, 11, 0.95)' : 'rgba(9, 9, 11, 0.82)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    py: 1.75,
                    px: { xs: 2.5, md: 4 },
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: scrolled ? '0 10px 30px -10px rgba(0, 0, 0, 0.7)' : 'none'
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

                    {/* Center: Nav Links */}
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
                            { id: 'stats', label: 'Why Choose Us' }
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

                    {/* Right: Action Buttons */}
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <LanguageSelector isDark={true} />
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

            {/* 3. SCROLLING FOREGROUND CONTENT LAYER (All Landing Page Sections Move Naturally Over Background) */}
            <Box sx={{ position: 'relative', zIndex: 1, overflowX: 'hidden' }}>
                {/* Hero Section */}
                <HeroSection />

                {/* Features Section */}
                <FeaturesSection />

                {/* How It Works Section */}
                <HowItWorksSection />

                {/* Statistics Section */}
                <StatsSection />

                {/* CTA Banner with Translucent Frosted Glass Styling */}
                <Box
                    sx={{
                        py: { xs: 12, md: 16 },
                        color: 'white',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <Container maxWidth="md">
                        <Box
                            sx={{
                                p: { xs: 5, sm: 7, md: 8 },
                                borderRadius: { xs: 4, sm: 5, md: 6 },
                                bgcolor: 'rgba(15, 23, 42, 0.75)',
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 50px rgba(56, 189, 248, 0.15)'
                            }}
                        >
                            <Typography
                                variant="h3"
                                fontWeight="800"
                                sx={{
                                    fontSize: { xs: '2rem', sm: '2.75rem', md: '3.25rem' },
                                    letterSpacing: '-1.2px',
                                    lineHeight: 1.25,
                                    mb: 3,
                                    color: '#ffffff',
                                    textShadow: '0 2px 15px rgba(0,0,0,0.5)'
                                }}
                            >
                                Ready to Modernize Your Community's Water Management?
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: 'rgba(224, 242, 254, 0.9)',
                                    fontWeight: 400,
                                    fontSize: { xs: '1rem', md: '1.2rem' },
                                    lineHeight: 1.6,
                                    mb: 5,
                                    maxWidth: 700,
                                    mx: 'auto'
                                }}
                            >
                                Join hundreds of communities saving thousands of liters daily with automated monitoring, leak prevention, and zero-effort billing.
                            </Typography>
                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={2.5}
                                justifyContent="center"
                                alignItems="center"
                            >
                                <Button
                                    variant="contained"
                                    size="large"
                                    endIcon={<ArrowForwardIcon />}
                                    sx={{
                                        bgcolor: '#38bdf8',
                                        color: '#0f172a',
                                        fontWeight: 700,
                                        px: 4,
                                        py: 1.8,
                                        borderRadius: '9999px',
                                        fontSize: '1.05rem',
                                        textTransform: 'none',
                                        boxShadow: '0 10px 25px -5px rgba(56, 189, 248, 0.5)',
                                        transition: 'all 0.25s ease',
                                        '&:hover': {
                                            bgcolor: '#7dd3fc',
                                            transform: 'translateY(-2px)'
                                        }
                                    }}
                                    onClick={() => navigate('/register')}
                                >
                                    Register Your Community
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    sx={{
                                        borderColor: 'rgba(255, 255, 255, 0.3)',
                                        bgcolor: 'rgba(255, 255, 255, 0.06)',
                                        color: 'white',
                                        fontWeight: 600,
                                        px: 3.5,
                                        py: 1.8,
                                        borderRadius: '9999px',
                                        fontSize: '1.05rem',
                                        textTransform: 'none',
                                        backdropFilter: 'blur(8px)',
                                        WebkitBackdropFilter: 'blur(8px)',
                                        transition: 'all 0.25s ease',
                                        '&:hover': {
                                            borderColor: 'white',
                                            bgcolor: 'rgba(255, 255, 255, 0.14)',
                                            transform: 'translateY(-2px)'
                                        }
                                    }}
                                    onClick={() => navigate('/login')}
                                >
                                    Sign In to Dashboard
                                </Button>
                            </Stack>
                        </Box>
                    </Container>
                </Box>

                {/* Footer */}
                <Footer />
            </Box>
        </Box>
    );
}