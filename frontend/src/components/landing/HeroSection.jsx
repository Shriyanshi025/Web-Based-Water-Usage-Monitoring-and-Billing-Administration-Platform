import React from 'react';
import { Box, Container, Typography, Button, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

function RealisticWaterDroplet() {
    return (
        <Box
            sx={{
                width: '100%',
                height: '100%',
                minHeight: { xs: 380, md: 500 },
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden', // Dedicated overflow-hidden clipping area
                p: 0 // No padding to allow full vertical containment and natural boundary clipping
            }}
        >
            {/* Very Dim Ambient Volumetric Blue Glow Behind Droplet (Slow Pulsing/Glow/Dim Animation) */}
            <Box
                component={motion.div}
                animate={{
                    opacity: [0.05, 0.15, 0.05],
                    scale: [0.96, 1.04, 0.96]
                }}
                transition={{
                    duration: 6.0,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: { xs: 240, md: 320 },
                    height: { xs: 240, md: 320 },
                    borderRadius: '50%',
                    bgcolor: 'rgba(56, 189, 248, 0.15)',
                    filter: 'blur(75px)',
                    pointerEvents: 'none'
                }}
            />

            {/* Suspended Droplet Container (Completely Static - No Y Motion) */}
            <Box
                sx={{
                    position: 'relative',
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    py: 2
                }}
            >
                {/* Large Photorealistic Standalone Water Droplet (True Transparent PNG Background - Static Position) */}
                <Box
                    component={motion.img}
                    src="/realistic-water-drop.png"
                    alt="HydroSync Water Droplet"
                    animate={{
                        filter: [
                            'drop-shadow(0 0 10px rgba(56, 189, 248, 0.1)) drop-shadow(0 15px 30px rgba(0, 0, 0, 0.75))',
                            'drop-shadow(0 0 20px rgba(56, 189, 248, 0.24)) drop-shadow(0 15px 30px rgba(0, 0, 0, 0.75))',
                            'drop-shadow(0 0 10px rgba(56, 189, 248, 0.1)) drop-shadow(0 15px 30px rgba(0, 0, 0, 0.75))'
                        ]
                    }}
                    transition={{
                        duration: 6.0,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    sx={{
                        width: 'auto',
                        height: '90%',
                        maxHeight: { xs: 360, sm: 420, md: 475 },
                        objectFit: 'contain',
                        userSelect: 'none',
                        pointerEvents: 'none'
                    }}
                />

                {/* Subtle Realistic Water Ripple Reflection Beneath Droplet */}
                <Box
                    sx={{
                        mt: -1.5,
                        width: { xs: 150, md: 190 },
                        height: 20,
                        borderRadius: '50%',
                        background: 'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.25) 0%, rgba(2, 132, 199, 0.1) 50%, transparent 80%)',
                        filter: 'blur(5px)',
                        transform: 'scaleY(0.4)',
                        pointerEvents: 'none'
                    }}
                />
            </Box>
        </Box>
    );
}

export default function HeroSection() {
    const navigate = useNavigate();

    const fadeUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
    };

    return (
        <Box
            sx={{
                minHeight: { xs: 'auto', md: '84vh' },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                pt: '106px', // 68px navbar + 38px (approx 1 cm) gap
                pb: { xs: 8, sm: 10, md: 12 },
                px: { xs: 2, sm: 3, md: 4 }
            }}
        >
            <Container
                maxWidth="lg"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    style={{ width: '100%', maxWidth: '1100px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                    {/* UNIFIED 1:2 SPLIT FROSTED GLASS HERO CARD */}
                    <Box
                        sx={{
                            width: '100%',
                            position: 'relative',
                            borderRadius: { xs: 4, sm: 5, md: 6 },
                            bgcolor: 'rgba(10, 20, 42, 0.6)',
                            backdropFilter: 'blur(24px)',
                            WebkitBackdropFilter: 'blur(24px)',
                            border: '1px solid rgba(255, 255, 255, 0.18)',
                            boxShadow: `
                                0 25px 60px -15px rgba(0, 0, 0, 0.8),
                                0 0 50px rgba(56, 189, 248, 0.12),
                                inset 0 1px 1px rgba(255, 255, 255, 0.25)
                            `,
                            overflow: 'hidden',
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' },
                            alignItems: 'stretch',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                borderColor: 'rgba(56, 189, 248, 0.35)',
                                boxShadow: `
                                    0 30px 70px -15px rgba(0, 0, 0, 0.9),
                                    0 0 60px rgba(56, 189, 248, 0.22),
                                    inset 0 1px 1px rgba(255, 255, 255, 0.35)
                                `
                            }
                        }}
                    >
                        {/* LEFT 1/3 PANEL: REALISTIC SUSPENDED WATER DROPLET WITH CLIPPED BOUNDARIES */}
                        <Box
                            sx={{
                                borderRight: { md: '1px solid rgba(255, 255, 255, 0.14)' },
                                borderBottom: { xs: '1px solid rgba(255, 255, 255, 0.14)', md: 'none' },
                                bgcolor: 'rgba(15, 23, 42, 0.35)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden' // Left panel clipping overflow
                            }}
                        >
                            <RealisticWaterDroplet />
                        </Box>

                        {/* RIGHT 2/3 PANEL: EXISTING HYDROSYNC CONTENT */}
                        <Box
                            sx={{
                                p: { xs: 4, sm: 5, md: 6, lg: 7 },
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: { xs: 'center', md: 'flex-start' },
                                textAlign: { xs: 'center', md: 'left' }
                            }}
                        >
                            {/* Prominent Visual Focal Point: HydroSync */}
                            <motion.div variants={fadeUp}>
                                <Typography
                                    variant="h1"
                                    component="h1"
                                    fontWeight="900"
                                    sx={{
                                        fontSize: { xs: '2.8rem', sm: '3.8rem', md: '4.6rem', lg: '5.2rem' },
                                        lineHeight: 1.05,
                                        letterSpacing: '-2px',
                                        mb: 2,
                                        background: 'linear-gradient(180deg, #ffffff 0%, #f0f9ff 60%, #bae6fd 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        textShadow: '0 4px 30px rgba(56, 189, 248, 0.3)',
                                        filter: 'drop-shadow(0 4px 20px rgba(0, 0, 0, 0.5))'
                                    }}
                                >
                                    HydroSync
                                </Typography>
                            </motion.div>

                            {/* Existing Hero Title / Subheading */}
                            <motion.div variants={fadeUp}>
                                <Typography
                                    variant="h2"
                                    fontWeight="700"
                                    sx={{
                                        fontSize: { xs: '1.18rem', sm: '1.45rem', md: '1.65rem', lg: '1.85rem' },
                                        lineHeight: 1.3,
                                        color: '#38bdf8',
                                        mb: 3,
                                        letterSpacing: '-0.5px',
                                        textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                                    }}
                                >
                                    Smart Water Monitoring & Fair Billing Platform
                                </Typography>
                            </motion.div>

                            {/* Existing Hero Paragraph Description */}
                            <motion.div variants={fadeUp}>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: '#C4C0C3',
                                        fontWeight: 400,
                                        lineHeight: 1.7,
                                        mb: 4.5,
                                        maxWidth: 620,
                                        fontSize: { xs: '0.98rem', sm: '1.05rem', md: '1.12rem' },
                                        textShadow: '0 2px 8px rgba(0,0,0,0.6)'
                                    }}
                                >
                                    Automated smart meter tracking, transparent tier billing, instant leak alerts, and comprehensive community management in one intelligent platform.
                                </Typography>
                            </motion.div>

                            {/* CTA Buttons */}
                            <motion.div variants={fadeUp}>
                                <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    spacing={2.5}
                                    alignItems="center"
                                >
                                    <Button
                                        variant="contained"
                                        size="large"
                                        endIcon={<ArrowForwardIcon />}
                                        onClick={() => navigate('/register')}
                                        sx={{
                                            px: 4,
                                            py: 1.6,
                                            borderRadius: '9999px',
                                            fontWeight: 700,
                                            fontSize: '1rem',
                                            textTransform: 'none',
                                            bgcolor: '#38bdf8',
                                            color: '#090d16',
                                            boxShadow: '0 0 25px rgba(56, 189, 248, 0.5), 0 4px 14px rgba(0, 0, 0, 0.4)',
                                            transition: 'all 0.25s ease',
                                            '&:hover': {
                                                bgcolor: '#7dd3fc',
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 0 35px rgba(56, 189, 248, 0.7), 0 6px 20px rgba(0, 0, 0, 0.5)'
                                            }
                                        }}
                                    >
                                        Get Started Free
                                    </Button>

                                    <Button
                                        variant="contained"
                                        size="large"
                                        startIcon={<LockOutlinedIcon sx={{ fontSize: '18px !important' }} />}
                                        onClick={() => navigate('/login')}
                                        sx={{
                                            px: 3.5,
                                            py: 1.6,
                                            borderRadius: '9999px',
                                            fontWeight: 600,
                                            fontSize: '1rem',
                                            textTransform: 'none',
                                            bgcolor: '#0369A1 !important',
                                            color: '#ffffff !important',
                                            transition: 'all 0.25s ease',
                                            boxShadow: '0 4px 14px rgba(3, 105, 161, 0.4)',
                                            '&:hover': {
                                                bgcolor: '#075985 !important',
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 6px 20px rgba(3, 105, 161, 0.6)'
                                            }
                                        }}
                                    >
                                        Sign In to Portal
                                    </Button>
                                </Stack>
                            </motion.div>
                        </Box>
                    </Box>
                </motion.div>
            </Container>
        </Box>
    );
}