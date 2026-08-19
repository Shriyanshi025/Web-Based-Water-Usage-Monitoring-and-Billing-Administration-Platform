import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Stack, Stepper, Step, StepLabel, Alert, Typography, Link, createTheme, ThemeProvider } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

import AuthLayout from '../../components/layout/AuthLayout';
import { registerResident, registerCommunityAdmin, validateInvitationToken } from '../../services/AuthService';
import theme from '../../styles/theme';

const authTheme = createTheme(theme, {
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
                        color: '#0369A1 !important',
                        '&:hover': {
                            color: '#075985 !important',
                            background: 'rgba(3, 105, 161, 0.04) !important',
                        },
                    },
                    '&.MuiButton-outlinedPrimary, &.MuiButton-outlined.MuiButton-colorPrimary': {
                        borderColor: '#0369A1 !important',
                        color: '#0369A1 !important',
                        '&:hover': {
                            borderColor: '#075985 !important',
                            color: '#075985 !important',
                            background: 'rgba(3, 105, 161, 0.04) !important',
                        },
                    },
                    '&.MuiButton-containedPrimary, &.MuiButton-contained.MuiButton-colorPrimary': {
                        background: '#0369A1 !important',
                        color: '#ffffff !important',
                        '&:hover': {
                            background: '#075985 !important',
                        },
                    },
                },
            },
        },
        MuiLink: {
            styleOverrides: {
                root: {
                    color: '#0369A1 !important',
                    '&:hover': {
                        color: '#075985 !important',
                    },
                },
            },
        },
        MuiStepIcon: {
            styleOverrides: {
                root: {
                    '&.Mui-active': {
                        color: '#0369A1 !important',
                    },
                    '&.Mui-completed': {
                        color: '#0369A1 !important',
                    },
                },
            },
        },
        MuiStepLabel: {
            styleOverrides: {
                label: {
                    '&.Mui-active': {
                        color: '#0369A1 !important',
                        fontWeight: 'bold',
                    },
                    '&.Mui-completed': {
                        color: '#0369A1 !important',
                    },
                },
            },
        },
    },
});
import { 
    wizardStep1BasicSchema, wizardStep3ResidentSchema, wizardStep3AdminSchema, wizardStep4CredentialsSchema 
} from '../../utils/schemas';
import { z } from 'zod';

import { 
    WizardStep1Basic, WizardStep2Role, WizardStep3Resident, 
    WizardStep3Admin, WizardStep4Credentials, WizardStep5Review 
} from './components/WizardSteps';

export default function RegisterPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeStep, setActiveStep] = useState(0);
    const [globalError, setGlobalError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const methods = useForm({
        mode: 'onChange',
        defaultValues: {
            fullName: '',
            email: '',
            phoneNumber: '',
            requestedRole: 'USER',
            communityId: '',
            blockId: '',
            unitId: '',
            professionalInfo: '',
            invitationToken: '',
            isInvitationLocked: false,
            password: '',
            confirmPassword: '',
            termsAccepted: false,
            googleIdToken: ''
        }
    });

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const token = queryParams.get("invite") || queryParams.get("token");
        if (token) {
            methods.setValue("invitationToken", token);
            methods.setValue("requestedRole", "USER");
            
            validateInvitationToken(token)
                .then(res => {
                    if (res && res.communityId) {
                        methods.setValue("communityId", res.communityId);
                        methods.setValue("fullName", res.residentName || "");
                        methods.setValue("isInvitationLocked", true);
                    }
                })
                .catch(err => {
                    setGlobalError(err.response?.data?.message || "Invitation is invalid or has expired.");
                });
        }
    }, [methods]);

    useEffect(() => {
        if (location.state?.prefill) {
            const prefill = location.state.prefill;
            if (prefill.email) methods.setValue("email", prefill.email);
            if (prefill.fullName) methods.setValue("fullName", prefill.fullName);
            if (prefill.googleIdToken) {
                methods.setValue("googleIdToken", prefill.googleIdToken);
                methods.setValue("termsAccepted", true);
            }
        }
    }, [location, methods]);

    const googleIdToken = methods.watch("googleIdToken");
    const isGoogleSignUp = !!googleIdToken;
    const STEPS = isGoogleSignUp 
        ? ['Basic Details', 'Role', 'Location', 'Review'] 
        : ['Basic Details', 'Role', 'Location', 'Credentials', 'Review'];

    const role = methods.watch('requestedRole');

    const getStepSchema = (step) => {
        if (isGoogleSignUp) {
            switch (step) {
                case 0: return wizardStep1BasicSchema;
                case 1: return z.object({});
                case 2: return role === 'USER' ? wizardStep3ResidentSchema : wizardStep3AdminSchema;
                default: return z.object({});
            }
        } else {
            switch (step) {
                case 0: return wizardStep1BasicSchema;
                case 1: return z.object({});
                case 2: return role === 'USER' ? wizardStep3ResidentSchema : wizardStep3AdminSchema;
                case 3: return wizardStep4CredentialsSchema;
                default: return z.object({});
            }
        }
    };

    const handleNext = async () => {
        const schema = getStepSchema(activeStep);
        const values = methods.getValues();
        const result = schema.safeParse(values);

        if (!result.success) {
            // Manually set errors to trigger UI feedback
            result.error.issues.forEach(issue => {
                methods.setError(issue.path[0], { type: 'manual', message: issue.message });
            });
            return;
        }

        methods.clearErrors();
        setActiveStep(prev => prev + 1);
    };

    const handleBack = () => setActiveStep(prev => prev - 1);

    const onSubmit = async () => {
        setGlobalError("");
        setIsSubmitting(true);
        try {
            const data = methods.getValues();
            if (data.requestedRole === 'USER') {
                await registerResident({
                    fullName: data.fullName,
                    email: data.email,
                    password: data.password,
                    phoneNumber: data.phoneNumber,
                    communityId: data.communityId || null,
                    blockId: data.blockId || null,
                    unitId: data.unitId || null,
                    inviteToken: data.invitationToken || null,
                    googleIdToken: data.googleIdToken || null
                });
            } else {
                await registerCommunityAdmin({
                    fullName: data.fullName,
                    email: data.email,
                    password: data.password,
                    phoneNumber: data.phoneNumber,
                    communityId: data.communityId || null,
                    officeAddress: data.professionalInfo || null,
                    googleIdToken: data.googleIdToken || null
                });
            }
            navigate("/pending-approval");
        } catch (err) {
            let msg = err.response?.data?.message || "Registration failed. Please try again.";
            if (msg.toLowerCase().includes("constraint") || msg.toLowerCase().includes("statement") || msg.toLowerCase().includes("sql") || msg.toLowerCase().includes("database") || msg.toLowerCase().includes("internal server error")) {
                msg = "A resident registration request is already pending approval, or the selected details are invalid.";
            }
            setGlobalError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ThemeProvider theme={authTheme}>
            <AuthLayout title="Create Account" subtitle="Join HydroSync and manage your water footprint." alignTop>
            <Box sx={{ mb: 3 }}>
                <Stepper 
                    activeStep={activeStep} 
                    alternativeLabel
                    sx={{
                        '& .MuiStepIcon-root.Mui-active': { color: '#0369A1 !important' },
                        '& .MuiStepIcon-root.Mui-completed': { color: '#0369A1 !important' },
                        '& .MuiStepLabel-label.Mui-active': { color: '#0369A1 !important', fontWeight: 'bold' },
                        '& .MuiStepLabel-label.Mui-completed': { color: '#0369A1 !important' },
                    }}
                >
                    {STEPS.map((label, index) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Box>
 
            {globalError && (
                <Alert 
                    severity="error" 
                    sx={{ 
                        mb: 3, 
                        borderRadius: 2,
                        '& .MuiAlert-message': { width: '100%' }
                    }}
                >
                    <Typography variant="subtitle2" fontWeight="bold">
                        ❌ Registration Failed
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {globalError}
                    </Typography>
                </Alert>
            )}
 
            <FormProvider {...methods}>
                <Box sx={{ minHeight: 300, position: 'relative' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeStep}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeStep === 0 && <WizardStep1Basic />}
                            {activeStep === 1 && <WizardStep2Role />}
                            {activeStep === 2 && role === 'USER' && <WizardStep3Resident />}
                            {activeStep === 2 && role === 'COMMUNITY_ADMIN' && <WizardStep3Admin />}
                            {!isGoogleSignUp && activeStep === 3 && <WizardStep4Credentials />}
                            {isGoogleSignUp && activeStep === 3 && <WizardStep5Review />}
                            {!isGoogleSignUp && activeStep === 4 && <WizardStep5Review />}
                        </motion.div>
                    </AnimatePresence>
                </Box>
 
                <Stack direction="row" spacing={2} sx={{ mt: 4, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button 
                        disabled={activeStep === 0 || isSubmitting} 
                        onClick={handleBack} 
                        variant="outlined"
                        sx={{ 
                            color: '#0369A1 !important', 
                            borderColor: '#0369A1 !important', 
                            '&:hover': { 
                                borderColor: '#075985 !important', 
                                bgcolor: 'rgba(3, 105, 161, 0.04) !important' 
                            } 
                        }}
                    >
                        Back
                    </Button>
                    <Box sx={{ flex: 1 }} />
                    {activeStep === STEPS.length - 1 ? (
                        <Button 
                            variant="contained" 
                            onClick={onSubmit} 
                            disabled={isSubmitting}
                            sx={{
                                bgcolor: '#0369A1 !important',
                                color: '#ffffff !important',
                                '&:hover': { bgcolor: '#075985 !important' }
                            }}
                        >
                            {isSubmitting ? "Submitting…" : "Complete Registration"}
                        </Button>
                    ) : (
                        <Button 
                            variant="contained" 
                            onClick={handleNext}
                            sx={{
                                bgcolor: '#0369A1 !important',
                                color: '#ffffff !important',
                                '&:hover': { bgcolor: '#075985 !important' }
                            }}
                        >
                            Continue
                        </Button>
                    )}
                </Stack>
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Already have an account?{' '}
                        <Link 
                            component={RouterLink}
                            to="/login"
                            sx={{ 
                                color: '#0369A1 !important', 
                                fontWeight: 600, 
                                textDecoration: 'none',
                                cursor: 'pointer',
                                '&:hover': { 
                                    color: '#075985 !important',
                                    textDecoration: 'underline'
                                } 
                            }}
                        >
                            Sign In
                        </Link>
                    </Typography>
                </Box>
            </FormProvider>
        </AuthLayout>
        </ThemeProvider>
    );
}