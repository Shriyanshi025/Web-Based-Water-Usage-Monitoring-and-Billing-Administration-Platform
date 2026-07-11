import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Stack, Stepper, Step, StepLabel, Alert, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

import AuthLayout from '../../components/layout/AuthLayout';
import { register as registerApi } from '../../services/AuthService';
import { 
    wizardStep1BasicSchema, wizardStep3ResidentSchema, wizardStep3AdminSchema, wizardStep4CredentialsSchema 
} from '../../utils/schemas';
import { z } from 'zod';

import { 
    WizardStep1Basic, WizardStep2Role, WizardStep3Resident, 
    WizardStep3Admin, WizardStep4Credentials, WizardStep5Review 
} from './components/WizardSteps';

const STEPS = ['Basic Details', 'Role', 'Location', 'Credentials', 'Review'];

export default function RegisterPage() {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [globalError, setGlobalError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const methods = useForm({
        mode: 'onChange',
        defaultValues: {
            fullName: '',
            email: '',
            requestedRole: 'USER',
            communityId: '',
            blockId: '',
            unitId: '',
            professionalInfo: '',
            invitationToken: '',
            password: '',
            confirmPassword: '',
            termsAccepted: false
        }
    });

    const role = methods.watch('requestedRole');

    const getStepSchema = (step) => {
        switch (step) {
            case 0: return wizardStep1BasicSchema;
            case 1: return z.object({}); // Role requires no strict zod check as it defaults and sets via UI
            case 2: return role === 'USER' ? wizardStep3ResidentSchema : wizardStep3AdminSchema;
            case 3: return wizardStep4CredentialsSchema;
            default: return z.object({});
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
            await registerApi({
                fullName: data.fullName,
                email: data.email,
                password: data.password,
                requestedRole: data.requestedRole,
                communityId: data.communityId || null,
                blockId: data.blockId || null,
                unitId: data.unitId || null,
                professionalInfo: data.professionalInfo || null
            });
            navigate("/pending-approval");
        } catch (err) {
            setGlobalError(err.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthLayout title="Create Account" subtitle="Join AquaBase and manage your water footprint." alignTop>
            <Box sx={{ mb: 3 }}>
                <Stepper activeStep={activeStep} alternativeLabel>
                    {STEPS.map((label, index) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Box>

            {globalError && <Alert severity="error" sx={{ mb: 3 }}>{globalError}</Alert>}

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
                            {activeStep === 3 && <WizardStep4Credentials />}
                            {activeStep === 4 && <WizardStep5Review />}
                        </motion.div>
                    </AnimatePresence>
                </Box>

                <Stack direction="row" spacing={2} sx={{ mt: 4, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button disabled={activeStep === 0 || isSubmitting} onClick={handleBack} variant="outlined">
                        Back
                    </Button>
                    <Box sx={{ flex: 1 }} />
                    {activeStep === STEPS.length - 1 ? (
                        <Button variant="contained" onClick={onSubmit} disabled={isSubmitting}>
                            {isSubmitting ? "Submitting..." : "Complete Registration"}
                        </Button>
                    ) : (
                        <Button variant="contained" onClick={handleNext}>
                            Continue
                        </Button>
                    )}
                </Stack>
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Already have an account? <Button variant="text" size="small" onClick={() => navigate('/login')}>Sign in</Button>
                    </Typography>
                </Box>
            </FormProvider>
        </AuthLayout>
    );
}