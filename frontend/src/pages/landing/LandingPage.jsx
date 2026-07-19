import React from 'react';
import { Box, Button, Container, Grid, Stack, Typography, Card, CardContent, Accordion, AccordionSummary, AccordionDetails, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BarChartIcon from '@mui/icons-material/BarChart';
import SecurityIcon from '@mui/icons-material/Security';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import GroupsIcon from '@mui/icons-material/Groups';
import OpacityIcon from '@mui/icons-material/Opacity';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const Section = ({ children, bg = 'background.default', pt = 12, pb = 12 }) => (
    <Box sx={{ bgcolor: bg, pt, pb, overflow: 'hidden' }}>
        <Container maxWidth="lg">{children}</Container>
    </Box>
);

export default function LandingPage() {
    const navigate = useNavigate();

    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
    };

    return (
        <Box>
            {/* Header / Nav */}
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, p: 3 }}>
                <Container maxWidth="lg">
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <WaterDropIcon sx={{ color: 'primary.main', fontSize: 32 }} />
                            <Typography variant="h6" fontWeight="800" color="text.primary">HydroSync</Typography>
                        </Stack>
                        <Stack direction="row" spacing={2}>
                            <Button variant="text" onClick={() => navigate('/login')}>Sign In</Button>
                            <Button variant="contained" onClick={() => navigate('/register')}>Get Started</Button>
                        </Stack>
                    </Stack>
                </Container>
            </Box>

            {/* Hero Section */}
            <Section pt={20} pb={15} bg="#f8fafc">
                <Grid container spacing={6} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
                            <motion.div variants={fadeUp}>
                                <Typography variant="h2" fontWeight="800" sx={{ lineHeight: 1.1, mb: 3, letterSpacing: '-1px', color: 'text.primary' }}>
                                    Smart Water Management for Modern Communities.
                                </Typography>
                            </motion.div>
                            <motion.div variants={fadeUp}>
                                <Typography variant="h6" color="text.secondary" sx={{ mb: 4, fontWeight: 400, maxWidth: '90%' }}>
                                    Gain complete visibility into your water consumption. Automated billing, real-time analytics, and transparent tracking for residents and administrators alike.
                                </Typography>
                            </motion.div>
                            <motion.div variants={fadeUp}>
                                <Stack direction="row" spacing={2}>
                                    <Button variant="contained" size="large" sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }} onClick={() => navigate('/register')}>
                                        Start Free Trial
                                    </Button>
                                    <Button variant="outlined" size="large" sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }} onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
                                        Learn More
                                    </Button>
                                </Stack>
                            </motion.div>
                        </motion.div>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
                            {/* Dashboard Mockup */}
                            <Box sx={{ 
                                position: 'relative', 
                                p: 1, 
                                borderRadius: 4, 
                                bgcolor: 'white', 
                                boxShadow: '0 24px 80px rgba(0,0,0,0.1)',
                                border: '1px solid',
                                borderColor: 'divider'
                            }}>
                                <Box sx={{ bgcolor: '#f1f5f9', borderRadius: 3, height: 400, display: 'flex', flexDirection: 'column' }}>
                                    {/* Mock Header */}
                                    <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ef4444' }} />
                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#10b981' }} />
                                    </Box>
                                    {/* Mock Content */}
                                    <Box sx={{ p: 3, flex: 1, display: 'flex', gap: 2 }}>
                                        <Box sx={{ width: 60, height: '100%', bgcolor: 'white', borderRadius: 2 }} />
                                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            <Stack direction="row" spacing={2}>
                                                <Box sx={{ flex: 1, height: 80, bgcolor: 'white', borderRadius: 2 }} />
                                                <Box sx={{ flex: 1, height: 80, bgcolor: 'white', borderRadius: 2 }} />
                                                <Box sx={{ flex: 1, height: 80, bgcolor: 'white', borderRadius: 2 }} />
                                            </Stack>
                                            <Box sx={{ flex: 1, bgcolor: 'white', borderRadius: 2 }} />
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </motion.div>
                    </Grid>
                </Grid>
            </Section>

            {/* Statistics */}
            <Section pt={6} pb={6}>
                <Grid container spacing={4} justifyContent="center">
                    {[
                        { num: '50M+', label: 'Gallons Tracked' },
                        { num: '1,200+', label: 'Communities' },
                        { num: '99.9%', label: 'Uptime' },
                        { num: '$2M+', label: 'Savings Generated' }
                    ].map((stat, i) => (
                        <Grid item xs={6} md={3} key={i}>
                            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                                <Box textAlign="center">
                                    <Typography variant="h3" fontWeight="800" color="primary.main">{stat.num}</Typography>
                                    <Typography variant="body1" color="text.secondary" fontWeight="600">{stat.label}</Typography>
                                </Box>
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>
            </Section>

            {/* Features */}
            <Box id="features" />
            <Section bg="#f8fafc">
                <Box textAlign="center" mb={8}>
                    <Typography variant="h3" fontWeight="800" gutterBottom>Everything you need.</Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                        Powerful tools designed for transparency, efficiency, and scale.
                    </Typography>
                </Box>
                <Grid container spacing={4}>
                    {[
                        { icon: <OpacityIcon fontSize="large" />, title: 'Smart Meter Tracking', desc: 'Connect directly to smart meters for automated, real-time data ingestion.' },
                        { icon: <BarChartIcon fontSize="large" />, title: 'Advanced Analytics', desc: 'Visualize consumption trends and predict future usage with AI-driven insights.' },
                        { icon: <ReceiptLongIcon fontSize="large" />, title: 'Automated Billing', desc: 'Generate precise, prorated bills automatically at the end of each billing cycle.' },
                        { icon: <GroupsIcon fontSize="large" />, title: 'Resident Portal', desc: 'Give residents a dedicated dashboard to view their usage and pay bills.' },
                        { icon: <SecurityIcon fontSize="large" />, title: 'Role-Based Access', desc: 'Secure access controls for Main Admins, Community Admins, and Residents.' },
                        { icon: <CheckCircleIcon fontSize="large" />, title: 'Leak Detection', desc: 'Receive instant alerts for unusual usage patterns that indicate potential leaks.' }
                    ].map((feat, i) => (
                        <Grid item xs={12} md={4} key={i}>
                            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { delay: i * 0.1 } } }}>
                                <Card elevation={0} sx={{ height: '100%', p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 4, transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(0,0,0,0.08)' } }}>
                                    <CardContent>
                                        <Box sx={{ color: 'primary.main', mb: 2 }}>{feat.icon}</Box>
                                        <Typography variant="h6" fontWeight="700" gutterBottom>{feat.title}</Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{feat.desc}</Typography>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>
            </Section>

            {/* Workflow & Comparison */}
            <Section>
                <Grid container spacing={8} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                            <Typography variant="h3" fontWeight="800" gutterBottom>Built for everyone.</Typography>
                            <Typography variant="h6" color="text.secondary" mb={4}>One platform, tailored experiences.</Typography>
                            
                            <Stack spacing={4}>
                                <Box>
                                    <Typography variant="h6" fontWeight="700" color="primary.main" gutterBottom>For Residents</Typography>
                                    <Typography variant="body1" color="text.secondary">Monitor personal daily usage, track billing history, set usage goals, and receive leak alerts directly to your inbox.</Typography>
                                </Box>
                                <Divider />
                                <Box>
                                    <Typography variant="h6" fontWeight="700" color="secondary.main" gutterBottom>For Community Admins</Typography>
                                    <Typography variant="body1" color="text.secondary">Manage entire blocks and units, aggregate community-wide data, configure tariffs, and resolve resident disputes efficiently.</Typography>
                                </Box>
                            </Stack>
                        </motion.div>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                            <Box sx={{ p: 4, bgcolor: '#f8fafc', borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                                <Stack spacing={3}>
                                    {['Meter registers usage', 'Data synced to HydroSync cloud', 'Algorithms analyze patterns', 'Dashboard updates in real-time', 'Invoices generated automatically'].map((step, i) => (
                                        <Stack direction="row" alignItems="center" spacing={2} key={i}>
                                            <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                {i + 1}
                                            </Box>
                                            <Typography variant="body1" fontWeight="600">{step}</Typography>
                                        </Stack>
                                    ))}
                                </Stack>
                            </Box>
                        </motion.div>
                    </Grid>
                </Grid>
            </Section>

            {/* Testimonials Placeholder */}
            <Section bg="#0f172a">
                <Box textAlign="center" mb={6}>
                    <Typography variant="h3" fontWeight="800" color="white" gutterBottom>Trusted by thousands.</Typography>
                </Box>
                <Grid container spacing={4}>
                    {[1, 2, 3].map((_, i) => (
                        <Grid item xs={12} md={4} key={i}>
                            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.2 }}>
                                <Card sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: 'white', borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <CardContent sx={{ p: 4 }}>
                                        <Typography sx={{ fontStyle: 'italic', mb: 3, opacity: 0.8 }}>
                                            "Since implementing HydroSync, our community's water waste has dropped by 30%, and billing disputes are completely gone."
                                        </Typography>
                                        <Stack direction="row" alignItems="center" spacing={2}>
                                            <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)' }} />
                                            <Box>
                                                <Typography fontWeight="700">Sarah Jenkins</Typography>
                                                <Typography variant="body2" sx={{ opacity: 0.6 }}>Community Admin, Oakridge</Typography>
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>
            </Section>

            {/* FAQ */}
            <Section>
                <Box textAlign="center" mb={6}>
                    <Typography variant="h3" fontWeight="800" gutterBottom>Frequently Asked Questions</Typography>
                </Box>
                <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                    {[
                        { q: 'How is the data collected?', a: 'HydroSync integrates with standard IoT water meters to securely transmit data to our cloud infrastructure.' },
                        { q: 'Can residents pay bills through the platform?', a: 'Yes, residents can view and securely pay their monthly invoices directly from their dashboard.' },
                        { q: 'What happens if a leak is detected?', a: 'The system instantly triggers an alert (email/SMS) to both the resident and the community admin.' }
                    ].map((faq, i) => (
                        <Accordion key={i} elevation={0} sx={{ mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: '8px !important', '&:before': { display: 'none' } }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography fontWeight="600">{faq.q}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography color="text.secondary">{faq.a}</Typography>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>
            </Section>

            {/* CTA */}
            <Section bg="primary.main">
                <Box textAlign="center">
                    <Typography variant="h3" fontWeight="800" color="white" gutterBottom>Ready to modernize your water management?</Typography>
                    <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', mb: 4 }}>Join HydroSync today and take control of your community's resources.</Typography>
                    <Button variant="contained" size="large" sx={{ bgcolor: 'white', color: 'primary.main', px: 6, py: 2, fontSize: '1.2rem', '&:hover': { bgcolor: '#f8fafc' } }} onClick={() => navigate('/register')}>
                        Get Started Now
                    </Button>
                </Box>
            </Section>

            {/* Footer */}
            <Box sx={{ bgcolor: '#020617', color: 'rgba(255,255,255,0.6)', py: 6 }}>
                <Container maxWidth="lg">
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={4}>
                            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                                <WaterDropIcon sx={{ color: 'primary.main' }} />
                                <Typography variant="h6" fontWeight="800" color="white">HydroSync</Typography>
                            </Stack>
                            <Typography variant="body2">Smart Water Management & Billing Platform.</Typography>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <Grid container spacing={4}>
                                <Grid item xs={6} md={4}>
                                    <Typography color="white" fontWeight="600" mb={2}>Product</Typography>
                                    <Stack spacing={1}>
                                        <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>Features</Typography>
                                        <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>Pricing</Typography>
                                        <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>Security</Typography>
                                    </Stack>
                                </Grid>
                                <Grid item xs={6} md={4}>
                                    <Typography color="white" fontWeight="600" mb={2}>Company</Typography>
                                    <Stack spacing={1}>
                                        <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>About Us</Typography>
                                        <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>Careers</Typography>
                                        <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>Contact</Typography>
                                    </Stack>
                                </Grid>
                                <Grid item xs={6} md={4}>
                                    <Typography color="white" fontWeight="600" mb={2}>Legal</Typography>
                                    <Stack spacing={1}>
                                        <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>Privacy Policy</Typography>
                                        <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>Terms of Service</Typography>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 4 }} />
                    <Typography variant="body2" align="center">© {new Date().getFullYear()} HydroSync Inc. All rights reserved.</Typography>
                </Container>
            </Box>
        </Box>
    );
}