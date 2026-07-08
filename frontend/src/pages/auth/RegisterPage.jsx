import { useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Grid,
    Link,
    Stack,
    TextField,
    Typography,
    Alert,
} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";

import WaterDropIcon from "@mui/icons-material/WaterDrop";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { register } from "../../services/AuthService";

function RegisterPage() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        requestedRole: "USER"
    });

    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {

        setForm({

            ...form,

            [e.target.name]: e.target.value

        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        if(form.password!==form.confirmPassword){

            setError("Passwords do not match");

            return;

        }

        try{

            setLoading(true);

            await register({
                fullName: form.fullName,
                email: form.email,
                password: form.password,
                requestedRole: form.requestedRole
            });

            navigate("/login");

        }

        catch(err){

            setError(

                err.response?.data?.message ||

                "Registration Failed"

            );

        }

        finally{

            setLoading(false);

        }

    };

    return (

        <Box

            sx={{

                minHeight:"100vh",

                background:"linear-gradient(135deg,#E3F2FD,#FFFFFF)",

                display:"flex",

                alignItems:"center"

            }}

        >

            <Container maxWidth="lg">

                <Grid container spacing={6} alignItems="center">

                    <Grid item xs={12} md={6}>

                        <WaterDropIcon

                            sx={{

                                fontSize:80,

                                color:"#1976d2",

                                mb:2

                            }}

                        />

                        <Typography

                            variant="h3"

                            fontWeight="bold"

                        >

                            Join Water Monitoring

                        </Typography>

                        <Typography mt={3} color="text.secondary">

                            Register yourself to become a resident of your community.

                            After successful verification by the administrator,

                            you will be able to access your dashboard.

                        </Typography>

                    </Grid>

                    <Grid item xs={12} md={6}>

                        <Card

                            elevation={8}

                            sx={{

                                borderRadius:5

                            }}

                        >

                            <CardContent sx={{p:5}}>

                                <Typography

                                    variant="h4"

                                    fontWeight="bold"

                                >

                                    Register

                                </Typography>

                                <Stack

                                    spacing={3}

                                    component="form"

                                    mt={4}

                                    onSubmit={handleSubmit}

                                >

                                    {

                                        error &&

                                        <Alert severity="error">

                                            {error}

                                        </Alert>

                                    }

                                    <TextField

                                        label="Full Name"

                                        name="fullName"

                                        value={form.fullName}

                                        onChange={handleChange}

                                        required

                                        fullWidth

                                    />

                                    <TextField

                                        label="Email"

                                        name="email"

                                        type="email"

                                        value={form.email}

                                        onChange={handleChange}

                                        required

                                        fullWidth

                                    />

                                    <TextField
                                        select
                                        fullWidth
                                        label="Register As"
                                        name="requestedRole"
                                        value={form.requestedRole}
                                        onChange={handleChange}
                                    >
                                        <MenuItem value="USER">
                                            Resident
                                        </MenuItem>

                                        <MenuItem value="COMMUNITY_ADMIN">
                                            Community Administrator
                                        </MenuItem>
                                    </TextField>

                                    <TextField

                                        label="Password"

                                        name="password"

                                        type="password"

                                        value={form.password}

                                        onChange={handleChange}

                                        required

                                        fullWidth

                                    />

                                    <TextField

                                        label="Confirm Password"

                                        name="confirmPassword"

                                        type="password"

                                        value={form.confirmPassword}

                                        onChange={handleChange}

                                        required

                                        fullWidth

                                    />

                                    <Button

                                        type="submit"

                                        variant="contained"

                                        size="large"

                                        disabled={loading}

                                    >

                                        {

                                            loading

                                                ?

                                                "Creating Account..."

                                                :

                                                "Register"

                                        }

                                    </Button>

                                    <Link

                                        component={RouterLink}

                                        to="/login"

                                        underline="none"

                                    >

                                        Already have an account? Login

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

export default RegisterPage;