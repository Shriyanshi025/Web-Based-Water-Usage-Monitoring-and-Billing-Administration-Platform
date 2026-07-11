import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "../components/common/LoadingScreen";
import { ROUTES } from "../constants/routes";
import { APPROVAL_STATUS } from "../constants/approvalStatus";

export default function ProtectedRoute({ allowedRoles = [], children }) {
    const { user, isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <LoadingScreen />;
    }

    if (!isAuthenticated || !user) {
        return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
    }

    // Check approval status
    if (user.approvalStatus === APPROVAL_STATUS.PENDING) {
        return <Navigate to={ROUTES.PENDING_APPROVAL} replace />;
    }

    if (user.approvalStatus === APPROVAL_STATUS.REJECTED || user.approvalStatus === APPROVAL_STATUS.SUSPENDED) {
        return <Navigate to={ROUTES.FORBIDDEN} replace />;
    }

    // Check role authorization
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return <Navigate to={ROUTES.FORBIDDEN} replace />;
    }

    return children;
}
