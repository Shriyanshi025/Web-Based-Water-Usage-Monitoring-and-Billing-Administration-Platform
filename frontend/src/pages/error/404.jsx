import React from "react";
import { Container, Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes";

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "100vh",
                    textAlign: "center",
                    gap: 3
                }}
            >
                <Typography variant="h1" color="primary" sx={{ fontSize: "10rem", fontWeight: 800, lineHeight: 1 }}>
                    404
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    Page Not Found
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    The page you are looking for does not exist or has been moved to a new location.
                </Typography>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => navigate(ROUTES.LANDING)}
                    sx={{ px: 4, py: 1.2, mt: 2 }}
                >
                    Back to Home
                </Button>
            </Box>
        </Container>
    );
}
