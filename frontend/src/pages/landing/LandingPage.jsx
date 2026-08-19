import React, { useState, useEffect } from 'react';
import { Box, Container, Stack, Typography, Button, TextField, Alert, createTheme, ThemeProvider } from '@mui/material';
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
import { ContactService } from '../../services/ContactService';
import theme from '../../styles/theme';

const landingTheme = createTheme(theme, {
    palette: {
        primary: {
            main: '#0369A1',
            light: '#38bdf8',
            dark: '#075985',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#0284c7',
            light: '#38bdf8',
            dark: '#075985',
            contrastText: '#ffffff',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    '&.MuiButton-textPrimary, &.MuiButton-text.MuiButton-colorPrimary': {
                        color: 'rgba(226, 232, 240, 0.65) !important',
                        '&:hover': {
                            color: '#38bdf8 !important',
                            background: 'rgba(255, 255, 255, 0.08) !important',
                        },
                        '&:focus': {
                            color: '#38bdf8 !important',
                        }
                    },
                    '&.MuiButton-outlinedPrimary, &.MuiButton-outlined.MuiButton-colorPrimary': {
                        borderColor: 'rgba(255, 255, 255, 0.3) !important',
                        color: '#ffffff !important',
                        background: 'rgba(255, 255, 255, 0.06) !important',
                        '&:hover': {
                            borderColor: 'rgba(255, 255, 255, 0.6) !important',
                            bgcolor: 'rgba(255, 255, 255, 0.14) !important',
                        },
                    },
                    '&.MuiButton-containedPrimary, &.MuiButton-contained.MuiButton-colorPrimary': {
                        background: '#38bdf8 !important',
                        color: '#090d16 !important',
                        '&:hover': {
                            background: '#7dd3fc !important',
                        },
                    },
                },
            },
        },
    },
});

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

    // Contact Form State
    const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [contactErrors, setContactErrors] = useState({});
    const [contactSubmitting, setContactSubmitting] = useState(false);
    const [contactStatus, setContactStatus] = useState({ type: '', message: '' });

    const handleContactChange = (e) => {
        const { name, value } = e.target;
        setContactForm(prev => ({ ...prev, [name]: value }));
        if (contactErrors[name]) {
            setContactErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateContactForm = () => {
        const errors = {};
        if (!contactForm.name.trim()) errors.name = 'Name is required';
        if (!contactForm.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(contactForm.email)) {
            errors.email = 'Please enter a valid email address';
        }
        if (!contactForm.subject.trim()) errors.subject = 'Subject is required';
        if (!contactForm.message.trim()) errors.message = 'Message is required';
        return errors;
    };

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        const errors = validateContactForm();
        if (Object.keys(errors).length > 0) {
            setContactErrors(errors);
            return;
        }

        setContactSubmitting(true);
        setContactStatus({ type: '', message: '' });

        try {
            await ContactService.sendContactMessage(contactForm);
            setContactStatus({
                type: 'success',
                message: 'Your message has been sent successfully! We will get back to you shortly.'
            });
            setContactForm({ name: '', email: '', subject: '', message: '' });
        } catch (err) {
            console.error(err);
            setContactStatus({
                type: 'error',
                message: err.response?.data?.message || 'Failed to send your message. Please try again later.'
            });
        } finally {
            setContactSubmitting(false);
        }
    };

    return (
        <ThemeProvider theme={landingTheme}>
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
                                    color: 'rgba(226, 232, 240, 0.65) !important',
                                    fontWeight: 500,
                                    fontSize: '0.95rem',
                                    textTransform: 'none',
                                    px: 2,
                                    py: 0.75,
                                    borderRadius: 2,
                                    transition: 'all 0.25s ease',
                                    '&:hover': {
                                        color: '#38bdf8 !important',
                                        bgcolor: 'rgba(255, 255, 255, 0.08)'
                                    },
                                    '&:focus': {
                                        color: '#38bdf8 !important'
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
                                color: 'rgba(248, 250, 252, 0.85) !important',
                                fontWeight: 600,
                                px: 2.2,
                                py: 0.9,
                                borderRadius: 2.5,
                                fontSize: '0.9rem',
                                textTransform: 'none',
                                '&:hover': { color: '#38bdf8 !important', bgcolor: 'rgba(255, 255, 255, 0.12)' },
                                '&:focus': { color: '#38bdf8 !important' }
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
                                        borderColor: '#0369A1 !important',
                                        color: '#0369A1 !important',
                                        bgcolor: 'transparent !important',
                                        fontWeight: 600,
                                        px: 3.5,
                                        py: 1.8,
                                        borderRadius: '9999px',
                                        fontSize: '1.05rem',
                                        textTransform: 'none',
                                        transition: 'all 0.25s ease',
                                        '&:hover': {
                                            borderColor: '#075985 !important',
                                            color: '#075985 !important',
                                            bgcolor: 'rgba(3, 105, 161, 0.08) !important',
                                            transform: 'translateY(-2px)'
                                        },
                                        '&:focus': {
                                            borderColor: '#0369A1 !important',
                                            color: '#0369A1 !important',
                                            bgcolor: 'transparent !important'
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

                {/* Contact Us Section */}
                <ThemeProvider theme={theme}>
                <Box
                    id="contact"
                    sx={{
                        py: { xs: 10, md: 14 },
                        color: 'white',
                        position: 'relative',
                        zIndex: 1,
                        bgcolor: 'rgba(3, 7, 18, 0.4)',
                        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                >
                    <Container maxWidth="md">
                        <Box sx={{ textAlign: 'center', mb: 6 }}>
                            <Typography
                                variant="h3"
                                fontWeight="800"
                                sx={{
                                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                                    letterSpacing: '-1.2px',
                                    mb: 2,
                                    color: '#ffffff'
                                }}
                            >
                                Contact Our Support Team
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{ color: '#94a3b8', maxWidth: 600, mx: 'auto', fontSize: '1.1rem' }}
                            >
                                Have any questions about HydroSync? Send us a message and our technical support team will get back to you shortly.
                            </Typography>
                        </Box>

                        <Box
                            component="form"
                            onSubmit={handleContactSubmit}
                            noValidate
                            sx={{
                                p: { xs: 4, sm: 6 },
                                borderRadius: 5,
                                bgcolor: 'rgba(15, 23, 42, 0.75)',
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                            }}
                        >
                            {contactStatus.message && (
                                <Alert
                                    severity={contactStatus.type}
                                    sx={{
                                        mb: 4,
                                        borderRadius: 2.5,
                                        bgcolor: contactStatus.type === 'success' ? 'rgba(22, 163, 74, 0.15)' : 'rgba(220, 38, 38, 0.15)',
                                        color: contactStatus.type === 'success' ? '#4ade80' : '#f87171',
                                        border: `1px solid ${contactStatus.type === 'success' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)'}`
                                    }}
                                >
                                    {contactStatus.message}
                                </Alert>
                            )}

                            <Stack spacing={3.5}>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3.5}>
                                    <TextField
                                        label="Name"
                                        name="name"
                                        value={contactForm.name}
                                        onChange={handleContactChange}
                                        error={!!contactErrors.name}
                                        helperText={contactErrors.name}
                                        fullWidth
                                        variant="outlined"
                                        sx={{
                                            '& .MuiOutlinedInput-input': {
                                                color: '#0C1929 !important',
                                            },
                                            '& .MuiOutlinedInput-input::placeholder': {
                                                color: '#64748b !important',
                                                opacity: 0.85
                                            },
                                            '& .MuiInputLabel-root': {
                                                color: '#475569 !important',
                                            },
                                            '& .MuiInputLabel-root.MuiInputLabel-shrink': {
                                                color: '#94a3b8 !important',
                                            },
                                            '& .MuiInputLabel-root.Mui-focused': {
                                                color: '#38bdf8 !important',
                                            },
                                            '& .MuiInputLabel-root.Mui-error': {
                                                color: '#ef4444 !important',
                                            },
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                                '&:hover fieldset': { borderColor: '#38bdf8' },
                                                '&.Mui-focused fieldset': { borderColor: '#38bdf8' }
                                            }
                                        }}
                                    />
                                    <TextField
                                        label="Email Address"
                                        name="email"
                                        type="email"
                                        value={contactForm.email}
                                        onChange={handleContactChange}
                                        error={!!contactErrors.email}
                                        helperText={contactErrors.email}
                                        fullWidth
                                        variant="outlined"
                                        sx={{
                                            '& .MuiOutlinedInput-input': {
                                                color: '#0C1929 !important',
                                            },
                                            '& .MuiOutlinedInput-input::placeholder': {
                                                color: '#64748b !important',
                                                opacity: 0.85
                                            },
                                            '& .MuiInputLabel-root': {
                                                color: '#475569 !important',
                                            },
                                            '& .MuiInputLabel-root.MuiInputLabel-shrink': {
                                                color: '#94a3b8 !important',
                                            },
                                            '& .MuiInputLabel-root.Mui-focused': {
                                                color: '#38bdf8 !important',
                                            },
                                            '& .MuiInputLabel-root.Mui-error': {
                                                color: '#ef4444 !important',
                                            },
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                                '&:hover fieldset': { borderColor: '#38bdf8' },
                                                '&.Mui-focused fieldset': { borderColor: '#38bdf8' }
                                            }
                                        }}
                                    />
                                </Stack>
                                <TextField
                                    label="Subject"
                                    name="subject"
                                    value={contactForm.subject}
                                    onChange={handleContactChange}
                                    error={!!contactErrors.subject}
                                    helperText={contactErrors.subject}
                                    fullWidth
                                    variant="outlined"
                                    sx={{
                                        '& .MuiOutlinedInput-input': {
                                            color: '#0C1929 !important',
                                        },
                                        '& .MuiOutlinedInput-input::placeholder': {
                                            color: '#64748b !important',
                                            opacity: 0.85
                                        },
                                        '& .MuiInputLabel-root': {
                                            color: '#475569 !important',
                                        },
                                        '& .MuiInputLabel-root.MuiInputLabel-shrink': {
                                            color: '#94a3b8 !important',
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: '#38bdf8 !important',
                                        },
                                        '& .MuiInputLabel-root.Mui-error': {
                                            color: '#ef4444 !important',
                                        },
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                            '&:hover fieldset': { borderColor: '#38bdf8' },
                                            '&.Mui-focused fieldset': { borderColor: '#38bdf8' }
                                        }
                                    }}
                                />
                                <TextField
                                    label="Message"
                                    name="message"
                                    value={contactForm.message}
                                    onChange={handleContactChange}
                                    error={!!contactErrors.message}
                                    helperText={contactErrors.message}
                                    fullWidth
                                    multiline
                                    rows={5}
                                    variant="outlined"
                                    sx={{
                                        '& .MuiOutlinedInput-input': {
                                            color: '#0C1929 !important',
                                        },
                                        '& .MuiOutlinedInput-input::placeholder': {
                                            color: '#64748b !important',
                                            opacity: 0.85
                                        },
                                        '& .MuiInputLabel-root': {
                                            color: '#475569 !important',
                                        },
                                        '& .MuiInputLabel-root.MuiInputLabel-shrink': {
                                            color: '#94a3b8 !important',
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: '#38bdf8 !important',
                                        },
                                        '& .MuiInputLabel-root.Mui-error': {
                                            color: '#ef4444 !important',
                                        },
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                            '&:hover fieldset': { borderColor: '#38bdf8' },
                                            '&.Mui-focused fieldset': { borderColor: '#38bdf8' }
                                        }
                                    }}
                                />

                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={contactSubmitting}
                                        sx={{
                                            bgcolor: '#38bdf8',
                                            color: '#0f172a',
                                            fontWeight: 700,
                                            px: 5,
                                            py: 1.6,
                                            borderRadius: 3,
                                            textTransform: 'none',
                                            boxShadow: '0 4px 14px rgba(56, 189, 248, 0.35)',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                bgcolor: '#7dd3fc',
                                                transform: 'translateY(-1px)'
                                            },
                                            '&:disabled': {
                                                bgcolor: 'rgba(56, 189, 248, 0.3)',
                                                color: 'rgba(15, 23, 42, 0.5)'
                                            }
                                        }}
                                    >
                                        {contactSubmitting ? 'Sending...' : 'Send Message'}
                                    </Button>
                                </Box>
                            </Stack>
                        </Box>
                    </Container>
                </Box>
                </ThemeProvider>

                {/* Footer */}
                <Footer />
            </Box>
        </Box>
        </ThemeProvider>
    );
}