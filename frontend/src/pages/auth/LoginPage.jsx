import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, TextField, Typography, Alert, Stack, FormControlLabel, Checkbox, Link, InputAdornment, IconButton } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import AuthLayout from '../../components/layout/AuthLayout';
import { login as apiLogin } from '../../services/AuthService';
import { loginSchema } from '../../utils/schemas';
import { useAuth } from '../../context/AuthContext';

import { ROUTES } from '../../constants/routes';
import { STORAGE_KEYS } from '../../constants/storageKeys';
import { storageHelper } from '../../helpers/storageHelper';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login: contextLogin } = useAuth();
    
    const [globalError, setGlobalError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' }
    });

    const onSubmit = async (data) => {
        setGlobalError("");
        setIsSubmitting(true);
        try {
            const response = await apiLogin(data);
            
            // Set standard local storage values matching previous behavior
            storageHelper.setLocal(STORAGE_KEYS.USER_ROLE, response.role);
            storageHelper.setLocal(STORAGE_KEYS.USER_NAME, response.fullName);
            storageHelper.setLocal(STORAGE_KEYS.USER_EMAIL, response.email);
            storageHelper.setLocal(STORAGE_KEYS.USER_DETAILS, response);
            
            // Re-sync global auth context (this properly sets AUTH_TOKEN and calls refreshCurrentUser)
            await contextLogin(response.token);

            if (response.role === "MAIN_ADMIN") {
                navigate(ROUTES.MAIN_ADMIN_DASHBOARD);
            } else if (response.role === "COMMUNITY_ADMIN") {
                navigate(ROUTES.COMMUNITY_ADMIN_DASHBOARD);
            } else {
                navigate(ROUTES.RESIDENT_DASHBOARD);
            }
        } catch (err) {
            console.error("Login Error:", err);
            if (err.response) {
                setGlobalError(err.response?.data?.message || "Invalid Email or Password");
            } else {
                setGlobalError("An unexpected error occurred during login. Please try again later.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthLayout title="Welcome Back" subtitle="Sign in to your account to continue">
            <Stack component="form" spacing={3} onSubmit={handleSubmit(onSubmit)} noValidate>
                {globalError && <Alert severity="error" sx={{ borderRadius: 2 }}>{globalError}</Alert>}

                <TextField
                    label="Email Address"
                    {...register("email")}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    fullWidth
                    autoComplete="email"
                />

                <TextField
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    fullWidth
                    autoComplete="current-password"
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" aria-label="Toggle password visibility">
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                />

                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <FormControlLabel control={<Checkbox color="primary" />} label={<Typography variant="body2">Remember Me</Typography>} />
                    <Link component={RouterLink} to="#" variant="body2" sx={{ fontWeight: 600 }}>Forgot Password?</Link>
                </Stack>

                <Button type="submit" variant="contained" size="large" disabled={isSubmitting} sx={{ py: 1.5 }}>
                    {isSubmitting ? "Signing in..." : "Sign In"}
                </Button>

                <Typography variant="body2" color="text.secondary" align="center">
                    Don't have an account? <Link component={RouterLink} to="/register" sx={{ fontWeight: 600 }}>Create an account</Link>
                </Typography>
            </Stack>
        </AuthLayout>
    );
}