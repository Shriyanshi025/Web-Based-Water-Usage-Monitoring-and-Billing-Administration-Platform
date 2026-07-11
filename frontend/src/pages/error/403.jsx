import React from "react";
import { Container, Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../context/AuthContext";
import { resolveDashboardRoute } from "../../helpers/roleResolver";

export default function ForbiddenPage() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const handleRedirect = () => {
        if (isAuthenticated && user?.role) {
            navigate(resolveDashboardRoute(user.role));
        } else {
            navigate(ROUTES.LOGIN);
        }
    };

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
                <Typography variant="h1" color="error" sx={{ fontSize: "10rem", fontWeight: 800, lineHeight: 1 }}>
                    403
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    Access Denied
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    You do not have the required permissions to view this resource.
                </Typography>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleRedirect}
                    sx={{ px: 4, py: 1.2, mt: 2 }}
                >
                    {isAuthenticated ? "Back to Dashboard" : "Back to Login"}
                </Button>
            </Box>
        </Container>
    );
}
