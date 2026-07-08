import {
    Container,
    Typography,
    Grid,
    Paper,
    Stack,
} from "@mui/material";

import ApartmentIcon from "@mui/icons-material/Apartment";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import InsightsIcon from "@mui/icons-material/Insights";

const features = [
    {
        title: "Community Management",
        icon: <ApartmentIcon fontSize="large" color="primary" />,
        desc: "Manage residential communities, blocks and units efficiently.",
    },
    {
        title: "Smart Water Meter",
        icon: <WaterDropIcon fontSize="large" color="primary" />,
        desc: "Track real-time water usage with smart meter monitoring.",
    },
    {
        title: "Automated Billing",
        icon: <ReceiptLongIcon fontSize="large" color="primary" />,
        desc: "Generate transparent water bills automatically.",
    },
    {
        title: "Analytics & Reports",
        icon: <InsightsIcon fontSize="large" color="primary" />,
        desc: "Visualize consumption trends with reports and dashboards.",
    },
];

function FeaturesSection() {
    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Typography
                variant="h3"
                align="center"
                fontWeight="bold"
                gutterBottom
            >
                Platform Features
            </Typography>

            <Typography
                align="center"
                color="text.secondary"
                mb={6}
            >
                Everything you need to manage water usage in one platform.
            </Typography>

            <Grid container spacing={4}>
                {features.map((feature) => (
                    <Grid item xs={12} sm={6} md={3} key={feature.title}>
                        <Paper
                            elevation={4}
                            sx={{
                                p: 4,
                                borderRadius: 4,
                                height: "100%",
                                transition: "0.3s",
                                "&:hover": {
                                    transform: "translateY(-10px)",
                                },
                            }}
                        >
                            <Stack spacing={2}>
                                {feature.icon}

                                <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                >
                                    {feature.title}
                                </Typography>

                                <Typography
                                    color="text.secondary"
                                >
                                    {feature.desc}
                                </Typography>
                            </Stack>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}

export default FeaturesSection;