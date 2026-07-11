import React from "react";
import { Container, Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes";

export default function UnauthorizedPage() {
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
                    401
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    Session Expired
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Your active session has expired or you are unauthorized. Please log in again to access the application.
                </Typography>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => navigate(ROUTES.LOGIN)}
                    sx={{ px: 4, py: 1.2, mt: 2 }}
                >
                    Back to Login
                </Button>
            </Box>
        </Container>
    );
}
