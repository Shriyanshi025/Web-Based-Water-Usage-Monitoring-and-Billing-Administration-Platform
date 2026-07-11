import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "../pages/landing/LandingPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import PendingApproval from "../pages/auth/PendingApproval";

// Dashboard Pages (Lazy Loaded)
const MainAdminDashboard = lazy(() => import("../pages/dashboard/MainAdminDashboard"));
const CommunityDashboard = lazy(() => import("../pages/dashboard/CommunityDashboard"));
const UserDashboard = lazy(() => import("../pages/dashboard/UserDashboard"));

// Community Admin Pages
const ResidentsPage = lazy(() => import("../pages/community-admin/ResidentsPage"));
const ApprovalsPage = lazy(() => import("../pages/community-admin/ApprovalsPage"));
const WaterMetersPage = lazy(() => import("../pages/community-admin/WaterMetersPage"));
const InvitationsPage = lazy(() => import("../pages/community-admin/InvitationsPage"));

// Error Pages
import UnauthorizedPage from "../pages/error/401";
import ForbiddenPage from "../pages/error/403";
import NotFoundPage from "../pages/error/404";
import ServerErrorPage from "../pages/error/500";

// Route Guards & Constants
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import { ROLES } from "../constants/roles";
import { ROUTES } from "../constants/routes";
import LoadingScreen from "../components/common/LoadingScreen";

function AppRoutes() {
    return (
        <Suspense fallback={<LoadingScreen />}>
            <Routes>
                {/* Public Landing Page */}
            <Route path={ROUTES.LANDING} element={<LandingPage />} />

            {/* Guest Pages (Guarded against authenticated users) */}
            <Route path={ROUTES.LOGIN} element={
                <PublicRoute>
                    <LoginPage />
                </PublicRoute>
            } />
            <Route path={ROUTES.REGISTER} element={
                <PublicRoute>
                    <RegisterPage />
                </PublicRoute>
            } />

            {/* Pending Approval Screen (For authenticated users pending verification) */}
            <Route path={ROUTES.PENDING_APPROVAL} element={
                <ProtectedRoute allowedRoles={[ROLES.MAIN_ADMIN, ROLES.COMMUNITY_ADMIN, ROLES.USER]}>
                    <PendingApproval />
                </ProtectedRoute>
            } />

            <Route path={ROUTES.MAIN_ADMIN_DASHBOARD} element={
                <ProtectedRoute allowedRoles={[ROLES.MAIN_ADMIN]}>
                    <MainAdminDashboard />
                </ProtectedRoute>
            } />
            
            <Route path={ROUTES.COMMUNITY_ADMIN_DASHBOARD} element={
                <ProtectedRoute allowedRoles={[ROLES.COMMUNITY_ADMIN]}>
                    <CommunityDashboard />
                </ProtectedRoute>
            } />
            <Route path={ROUTES.COMMUNITY_ADMIN_RESIDENTS} element={
                <ProtectedRoute allowedRoles={[ROLES.COMMUNITY_ADMIN]}>
                    <ResidentsPage />
                </ProtectedRoute>
            } />
            <Route path={ROUTES.COMMUNITY_ADMIN_APPROVALS} element={
                <ProtectedRoute allowedRoles={[ROLES.COMMUNITY_ADMIN]}>
                    <ApprovalsPage />
                </ProtectedRoute>
            } />
            <Route path={ROUTES.COMMUNITY_ADMIN_METERS} element={
                <ProtectedRoute allowedRoles={[ROLES.COMMUNITY_ADMIN]}>
                    <WaterMetersPage />
                </ProtectedRoute>
            } />
            <Route path={ROUTES.COMMUNITY_ADMIN_INVITATIONS} element={
                <ProtectedRoute allowedRoles={[ROLES.COMMUNITY_ADMIN]}>
                    <InvitationsPage />
                </ProtectedRoute>
            } />

            <Route path={ROUTES.RESIDENT_DASHBOARD} element={
                <ProtectedRoute allowedRoles={[ROLES.USER]}>
                    <UserDashboard />
                </ProtectedRoute>
            } />

            {/* Error & Fallbacks */}
            <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
            <Route path={ROUTES.FORBIDDEN} element={<ForbiddenPage />} />
            <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
            <Route path={ROUTES.SERVER_ERROR} element={<ServerErrorPage />} />

            {/* Catch-all Redirect to 404 */}
            <Route path="*" element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
        </Routes>
        </Suspense>
    );
}

export default AppRoutes;