import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, TextField, Typography, Alert, Stack, FormControlLabel, Checkbox, Link, InputAdornment, IconButton, Divider, createTheme, ThemeProvider } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import AuthLayout from '../../components/layout/AuthLayout';
import { login as apiLogin } from '../../services/AuthService';
import { loginSchema } from '../../utils/schemas';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const authTheme = createTheme({
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
        MuiCheckbox: {
            styleOverrides: {
                root: {
                    color: '#0369A1 !important',
                    '&.Mui-checked': {
                        color: '#0369A1 !important',
                    },
                },
            },
        },
    },
});

import { ROUTES } from '../../constants/routes';
import { STORAGE_KEYS } from '../../constants/storageKeys';
import { storageHelper } from '../../helpers/storageHelper';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login: contextLogin } = useAuth();
    
    const [globalError, setGlobalError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleGoogleCredentialResponse = async (response) => {
        setGlobalError("");
        setIsSubmitting(true);
        try {
            const res = await api.post("/auth/google", { idToken: response.credential });
            const data = res.data;
            
            if (data.message === "NEW_USER") {
                // Pre-fill sign up state and navigate to register
                navigate('/register', { 
                    state: { 
                        prefill: { 
                            email: data.email, 
                            fullName: data.fullName, 
                            googleIdToken: response.credential 
                        } 
                    } 
                });
                return;
            }

            // Set standard local storage values matching previous behavior
            storageHelper.setLocal(STORAGE_KEYS.USER_ROLE, data.role);
            storageHelper.setLocal(STORAGE_KEYS.USER_NAME, data.fullName);
            storageHelper.setLocal(STORAGE_KEYS.USER_EMAIL, data.email);
            storageHelper.setLocal(STORAGE_KEYS.USER_DETAILS, data);
            
            // Re-sync global auth context (this properly sets AUTH_TOKEN and calls refreshCurrentUser)
            await contextLogin(data.token);

            if (data.role === "MAIN_ADMIN") {
                navigate(ROUTES.MAIN_ADMIN_DASHBOARD);
            } else if (data.role === "COMMUNITY_ADMIN") {
                navigate(ROUTES.COMMUNITY_ADMIN_DASHBOARD);
            } else {
                navigate(ROUTES.RESIDENT_DASHBOARD);
            }
        } catch (err) {
            console.error("Google Login Error:", err);
            setGlobalError(err.response?.data?.message || "Google Sign-In failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        const initGoogle = () => {
            if (typeof window !== 'undefined' && window.google) {
                window.google.accounts.id.initialize({
                    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '1008719970978-hb24n2dstb40o45q4cmg24u54pcp146x.apps.googleusercontent.com',
                    callback: handleGoogleCredentialResponse,
                });
                const googleBtn = document.getElementById("googleBtn");
                if (googleBtn) {
                    window.google.accounts.id.renderButton(
                        googleBtn,
                        { theme: "outline", size: "large", width: 400, text: "continue_with" }
                    );
                }
            }
        };

        // Give a tiny timeout for client libraries to load fully if needed
        const timer = setTimeout(initGoogle, 300);
        return () => clearTimeout(timer);
    }, []);

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
        <ThemeProvider theme={authTheme}>
            <AuthLayout title="Welcome Back" subtitle="Sign in to your account to continue">
            <Stack spacing={3}>
                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <div id="googleBtn" style={{ minHeight: '40px', width: '100%', display: 'flex', justifyContent: 'center' }}></div>
                </Box>
                <Divider sx={{ my: 1, color: 'text.secondary', fontSize: '0.85rem' }}>or sign in with email</Divider>
            </Stack>

            <Stack component="form" spacing={3} onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 2 }}>
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
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }
                    }}
                />

                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <FormControlLabel 
                        control={
                            <Checkbox 
                                sx={{ 
                                    color: '#0369A1 !important', 
                                    '&.Mui-checked': { color: '#0369A1 !important' } 
                                }} 
                            />
                        } 
                        label={<Typography variant="body2">Remember Me</Typography>} 
                    />
                    <Link 
                        component={RouterLink} 
                        to="#" 
                        variant="body2" 
                        sx={{ 
                            fontWeight: 600, 
                            color: '#0369A1 !important', 
                            textDecoration: 'none',
                            '&:hover': { color: '#075985 !important', textDecoration: 'underline' } 
                        }}
                    >
                        Forgot Password?
                    </Link>
                </Stack>
 
                <Button 
                    type="submit" 
                    variant="contained" 
                    size="large" 
                    disabled={isSubmitting} 
                    sx={{ 
                        py: 1.5,
                        bgcolor: '#0369A1 !important',
                        color: '#ffffff !important',
                        '&:hover': { bgcolor: '#075985 !important' }
                    }}
                >
                    {isSubmitting ? "Signing in..." : "Sign In"}
                </Button>
 
                <Typography variant="body2" color="text.secondary" align="center">
                    Don't have an account?{' '}
                    <Link 
                        component={RouterLink} 
                        to="/register" 
                        sx={{ 
                            fontWeight: 600, 
                            color: '#0369A1 !important', 
                            textDecoration: 'none',
                            '&:hover': { color: '#075985 !important', textDecoration: 'underline' } 
                        }}
                    >
                        Create an account
                    </Link>
                </Typography>
            </Stack>
        </AuthLayout>
        </ThemeProvider>
    );
}