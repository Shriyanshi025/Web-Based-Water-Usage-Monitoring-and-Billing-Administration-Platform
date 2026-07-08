import {
    Box,
    Container,
    Typography,
    Button,
    Stack,
    Grid,
    Paper,
} from "@mui/material";

import WaterDropIcon from "@mui/icons-material/WaterDrop";
import ApartmentIcon from "@mui/icons-material/Apartment";
import SpeedIcon from "@mui/icons-material/Speed";

import { Link } from "react-router-dom";

function HeroSection() {
    return (
        <Box
            sx={{
                background:
                    "linear-gradient(135deg,#E3F2FD,#FFFFFF)",
                py: 10,
            }}
        >
            <Container maxWidth="lg">

                <Grid container spacing={6} alignItems="center">

                    <Grid size={{ xs: 12, md: 7 }}>

                        <Typography
                            variant="h2"
                            fontWeight="bold"
                        >
                            Smart Water Monitoring &
                            Billing Administration
                        </Typography>

                        <Typography
                            mt={3}
                            color="text.secondary"
                            fontSize={20}
                        >
                            Monitor water consumption,
                            manage communities,
                            automate billing,
                            and simplify administration
                            through one intelligent platform.
                        </Typography>

                        <Stack
                            direction="row"
                            spacing={2}
                            mt={5}
                        >
                            <Button
                                size="large"
                                variant="contained"
                                component={Link}
                                to="/register"
                            >
                                Get Started
                            </Button>

                            <Button
                                size="large"
                                variant="outlined"
                                component={Link}
                                to="/login"
                            >
                                Login
                            </Button>
                        </Stack>

                    </Grid>

                    <Grid size={{ xs: 12, md: 5 }}>

                        <Paper
                            elevation={5}
                            sx={{
                                p: 4,
                                borderRadius: 5,
                            }}
                        >

                            <Stack spacing={4}>

                                <Stack direction="row" spacing={2}>
                                    <ApartmentIcon color="primary" />
                                    <Typography>
                                        Community Management
                                    </Typography>
                                </Stack>

                                <Stack direction="row" spacing={2}>
                                    <WaterDropIcon color="primary" />
                                    <Typography>
                                        Smart Water Meter Tracking
                                    </Typography>
                                </Stack>

                                <Stack direction="row" spacing={2}>
                                    <SpeedIcon color="primary" />
                                    <Typography>
                                        Real-Time Usage Analytics
                                    </Typography>
                                </Stack>

                            </Stack>

                        </Paper>

                    </Grid>

                </Grid>

            </Container>
        </Box>
    );
}

export default HeroSection;