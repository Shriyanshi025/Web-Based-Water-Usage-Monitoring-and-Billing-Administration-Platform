import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "../components/common/LoadingScreen";
import { resolveDashboardRoute } from "../helpers/roleResolver";

export default function PublicRoute({ children }) {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
        return <LoadingScreen />;
    }

    if (isAuthenticated && user?.role) {
        return <Navigate to={resolveDashboardRoute(user.role)} replace />;
    }

    return children;
}
