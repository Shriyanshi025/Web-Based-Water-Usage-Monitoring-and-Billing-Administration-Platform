import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./styles/theme";

// Providers
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./config/queryClient";
import { NotificationProvider } from "./context/NotificationContext";
import { AuthProvider } from "./context/AuthContext";
import { AlertsProvider } from "./context/AlertsContext";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

ReactDOM.createRoot(document.getElementById("root")).render(
    <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <NotificationProvider>
                    <AuthProvider>
                        <BrowserRouter>
                            <AlertsProvider>
                                <App />
                            </AlertsProvider>
                        </BrowserRouter>
                    </AuthProvider>
                </NotificationProvider>
            </LocalizationProvider>
        </ThemeProvider>
    </QueryClientProvider>
);

// Register PWA Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('HydroSync PWA Service Worker registered with scope:', registration.scope);
            })
            .catch((error) => {
                console.error('HydroSync PWA Service Worker registration failed:', error);
            });
    });
}