import { Container, Grid, Paper, Typography } from "@mui/material";

const stats = [
    { value: "50+", title: "Communities" },
    { value: "500+", title: "Residents" },
    { value: "1000+", title: "Smart Meters" },
    { value: "99%", title: "Billing Accuracy" },
];

function StatsSection() {
    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Grid container spacing={3}>
                {stats.map((item) => (
                    <Grid item xs={12} sm={6} md={3} key={item.title}>
                        <Paper
                            elevation={3}
                            sx={{
                                p: 4,
                                borderRadius: 4,
                                textAlign: "center",
                                transition: "0.3s",
                                "&:hover": {
                                    transform: "translateY(-8px)",
                                },
                            }}
                        >
                            <Typography
                                variant="h3"
                                color="primary"
                                fontWeight="bold"
                            >
                                {item.value}
                            </Typography>

                            <Typography mt={1}>
                                {item.title}
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}

export default StatsSection;