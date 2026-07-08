import { Routes, Route } from "react-router-dom";

import LandingPage from "../pages/landing/LandingPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import MainAdminDashboard from "../pages/dashboard/MainAdminDashboard";
import CommunityDashboard from "../pages/dashboard/CommunityDashboard";
import UserDashboard from "../pages/dashboard/UserDashboard";


function AppRoutes() {
    return (
        <Routes>

            <Route path="/" element={<LandingPage />} />

            <Route path="/login" element={<LoginPage />} />

            <Route path="/register" element={<RegisterPage />} />

            <Route
                path="/main-admin"
                element={<MainAdminDashboard />}
            />

            <Route
                path="/community-admin"
                element={<CommunityDashboard />}
            />

            <Route
                path="/user"
                element={<UserDashboard />}
            />

        </Routes>
    );
}

export default AppRoutes;