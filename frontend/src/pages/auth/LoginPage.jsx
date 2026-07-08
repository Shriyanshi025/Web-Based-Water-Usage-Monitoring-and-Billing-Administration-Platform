import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    Container,
    FormControlLabel,
    Grid,
    Link,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import WaterDropIcon from "@mui/icons-material/WaterDrop";

import { login } from "../../services/AuthService";

function LoginPage() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);
        setError("");

        try {

            const response = await login(form);

            localStorage.setItem("token", response.data.token);

            localStorage.setItem("role", response.data.role);

            localStorage.setItem("userId", response.data.userId);

            localStorage.setItem("fullName", response.data.fullName);

            localStorage.setItem("email", response.data.email);

            const user = response.data;

            // Store logged-in user
            sessionStorage.setItem(
                "user",
                JSON.stringify(user)
            );

            // Role Based Navigation
            if (response.data.role === "MAIN_ADMIN") {

                navigate("/admin/dashboard");

            }
            else if (response.data.role === "COMMUNITY_ADMIN") {

                navigate("/community/dashboard");

            }
            else {

                navigate("/resident/dashboard");

            }

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Invalid Email or Password"
            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <Box
            sx={{
                minHeight: "100vh",
                background: "linear-gradient(135deg,#E3F2FD,#FFFFFF)",
                display: "flex",
                alignItems: "center",
            }}
        >

            <Container maxWidth="lg">

                <Grid container spacing={6} alignItems="center">

                    {/* Left Section */}

                    <Grid item xs={12} md={6}>

                        <WaterDropIcon
                            sx={{
                                fontSize: 80,
                                color: "#1976d2",
                                mb: 2,
                            }}
                        />

                        <Typography
                            variant="h3"
                            fontWeight="bold"
                            gutterBottom
                        >
                            Welcome Back
                        </Typography>

                        <Typography
                            color="text.secondary"
                            sx={{ mb: 4 }}
                        >
                            Login to access your Water Monitoring &
                            Billing dashboard.
                        </Typography>

                        <Typography>✔ Community Management</Typography>

                        <Typography mt={2}>
                            ✔ Smart Meter Tracking
                        </Typography>

                        <Typography mt={2}>
                            ✔ Water Usage Analytics
                        </Typography>

                        <Typography mt={2}>
                            ✔ Billing & Reports
                        </Typography>

                    </Grid>

                    {/* Right Section */}

                    <Grid item xs={12} md={6}>

                        <Card
                            elevation={8}
                            sx={{
                                borderRadius: 5,
                            }}
                        >

                            <CardContent sx={{ p: 5 }}>

                                <Typography
                                    variant="h4"
                                    fontWeight="bold"
                                    gutterBottom
                                >
                                    Login
                                </Typography>

                                <Stack
                                    component="form"
                                    spacing={3}
                                    mt={3}
                                    onSubmit={handleSubmit}
                                >

                                    {error && (
                                        <Alert severity="error">
                                            {error}
                                        </Alert>
                                    )}

                                    <TextField
                                        fullWidth
                                        required
                                        label="Email Address"
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        onChange={handleChange}
                                    />

                                    <TextField
                                        fullWidth
                                        required
                                        label="Password"
                                        name="password"
                                        type="password"
                                        value={form.password}
                                        onChange={handleChange}
                                    />

                                    <FormControlLabel
                                        control={<Checkbox />}
                                        label="Remember Me"
                                    />

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        disabled={loading}
                                    >
                                        {loading
                                            ? "Signing In..."
                                            : "Login"}
                                    </Button>

                                    <Link
                                        component={RouterLink}
                                        to="/register"
                                        underline="none"
                                    >
                                        Don't have an account? Register
                                    </Link>

                                </Stack>

                            </CardContent>

                        </Card>

                    </Grid>

                </Grid>

            </Container>

        </Box>

    );

}

export default LoginPage;