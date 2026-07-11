import { Box, Typography, Button, Paper, Stack } from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AuthLayout from "../../components/layout/AuthLayout";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import { motion } from 'framer-motion';

export default function PendingApproval() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate(ROUTES.LOGIN);
    };

    return (
        <AuthLayout title="Registration Complete" subtitle="Just one more step remaining.">
            <Box component={motion.div} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
                <Stack spacing={4} alignItems="center" textAlign="center">
                    <Box sx={{ 
                        width: 80, height: 80, borderRadius: '50%', bgcolor: 'success.light', 
                        color: 'success.dark', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                    }}>
                        <CheckCircleIcon sx={{ fontSize: 40 }} />
                    </Box>

                    <Box>
                        <Typography variant="h5" fontWeight="700" gutterBottom>
                            Approval Pending
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 350, mx: 'auto' }}>
                            Thank you for registering, <Typography component="span" fontWeight="600" color="text.primary">{user?.fullName || "User"}</Typography>. 
                            Your account profile is currently under review by our administrators.
                        </Typography>
                    </Box>

                    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: 'background.default', width: '100%' }}>
                        <Typography variant="subtitle2" fontWeight="600" gutterBottom align="left">What happens next?</Typography>
                        <Stack spacing={2} sx={{ mt: 2 }} align="left" textAlign="left">
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: 'primary.light', color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.75rem', fontWeight: 700 }}>1</Box>
                                <Typography variant="body2" color="text.secondary">Administrators will verify your community association.</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: 'primary.light', color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.75rem', fontWeight: 700 }}>2</Box>
                                <Typography variant="body2" color="text.secondary">You will receive an email notification once approved.</Typography>
                            </Box>
                        </Stack>
                    </Paper>

                    <Button variant="outlined" color="primary" onClick={handleLogout} sx={{ px: 4 }}>
                        Return to Login
                    </Button>
                </Stack>
            </Box>
        </AuthLayout>
    );
}
