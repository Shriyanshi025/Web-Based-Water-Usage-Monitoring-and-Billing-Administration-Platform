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

// Main Admin Pages
const CommunitiesPage = lazy(() => import("../pages/main-admin/CommunitiesPage"));
const CommunityAdminsPage = lazy(() => import("../pages/main-admin/CommunityAdminsPage"));
const MainAdminApprovalsPage = lazy(() => import("../pages/main-admin/MainAdminApprovalsPage"));

// Community Admin Pages
const ResidentsPage = lazy(() => import("../pages/community-admin/ResidentsPage"));
const ApprovalsPage = lazy(() => import("../pages/community-admin/ApprovalsPage"));
const WaterMetersPage = lazy(() => import("../pages/community-admin/WaterMetersPage"));
const InvitationsPage = lazy(() => import("../pages/community-admin/InvitationsPage"));
const WaterUsagePage = lazy(() => import("../pages/community-admin/WaterUsagePage"));
const BillsPage = lazy(() => import("../pages/community-admin/BillsPage"));
const BillingCyclePage = lazy(() => import("../pages/community-admin/BillingCyclePage"));
const TariffPlanPage = lazy(() => import("../pages/community-admin/TariffPlanPage"));
const HouseholdDirectoryPage = lazy(() => import("../pages/community-admin/HouseholdDirectoryPage"));

// Resident Pages
const ResidentBillsPage = lazy(() => import("../pages/resident/BillsPage"));
const UsagePage = lazy(() => import("../pages/resident/UsagePage"));
const MeterDetailsPage = lazy(() => import("../pages/resident/MeterDetailsPage"));
const ProfilePage = lazy(() => import("../pages/resident/ProfilePage"));
const ResidentComplaintsPage = lazy(() => import("../pages/resident/ComplaintsPage"));
const CommunityComplaintsPage = lazy(() => import("../pages/community-admin/ComplaintsPage"));
const NotificationsPage = lazy(() => import("../pages/common/NotificationsPage"));
const PaymentHistoryPage = lazy(() => import("../pages/resident/PaymentHistoryPage"));

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

                {/* Main Admin Routes */}
                <Route path={ROUTES.MAIN_ADMIN_DASHBOARD} element={
                    <ProtectedRoute allowedRoles={[ROLES.MAIN_ADMIN]}>
                        <MainAdminDashboard />
                    </ProtectedRoute>
                } />
                <Route path={ROUTES.MAIN_ADMIN_COMMUNITIES} element={
                    <ProtectedRoute allowedRoles={[ROLES.MAIN_ADMIN]}>
                        <CommunitiesPage />
                    </ProtectedRoute>
                } />
                <Route path={ROUTES.MAIN_ADMIN_COMMUNITY_ADMINS} element={
                    <ProtectedRoute allowedRoles={[ROLES.MAIN_ADMIN]}>
                        <CommunityAdminsPage />
                    </ProtectedRoute>
                } />
                <Route path={ROUTES.MAIN_ADMIN_APPROVALS} element={
                    <ProtectedRoute allowedRoles={[ROLES.MAIN_ADMIN]}>
                        <MainAdminApprovalsPage />
                    </ProtectedRoute>
                } />
                <Route path={ROUTES.MAIN_ADMIN_PROFILE} element={
                    <ProtectedRoute allowedRoles={[ROLES.MAIN_ADMIN]}>
                        <ProfilePage />
                    </ProtectedRoute>
                } />
                
                {/* Community Admin Routes */}
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
                <Route path={ROUTES.COMMUNITY_ADMIN_USAGE} element={
                    <ProtectedRoute allowedRoles={[ROLES.COMMUNITY_ADMIN]}>
                        <WaterUsagePage />
                    </ProtectedRoute>
                } />
                <Route path={ROUTES.COMMUNITY_ADMIN_BILLS} element={
                    <ProtectedRoute allowedRoles={[ROLES.COMMUNITY_ADMIN]}>
                        <BillsPage />
                    </ProtectedRoute>
                } />
                <Route path={ROUTES.COMMUNITY_ADMIN_BILLING_CYCLE} element={
                    <ProtectedRoute allowedRoles={[ROLES.COMMUNITY_ADMIN]}>
                        <BillingCyclePage />
                    </ProtectedRoute>
                } />
                <Route path={ROUTES.COMMUNITY_ADMIN_TARIFF_PLANS} element={
                    <ProtectedRoute allowedRoles={[ROLES.COMMUNITY_ADMIN]}>
                        <TariffPlanPage />
                    </ProtectedRoute>
                } />
                <Route path="/admin/households" element={
                    <ProtectedRoute allowedRoles={[ROLES.COMMUNITY_ADMIN]}>
                        <HouseholdDirectoryPage />
                    </ProtectedRoute>
                } />
                <Route path={ROUTES.COMMUNITY_ADMIN_PROFILE} element={
                    <ProtectedRoute allowedRoles={[ROLES.COMMUNITY_ADMIN]}>
                        <ProfilePage />
                    </ProtectedRoute>
                } />
                <Route path={ROUTES.COMMUNITY_ADMIN_COMPLAINTS} element={
                    <ProtectedRoute allowedRoles={[ROLES.COMMUNITY_ADMIN]}>
                        <CommunityComplaintsPage />
                    </ProtectedRoute>
                } />

                {/* Resident Routes */}
                <Route path={ROUTES.RESIDENT_DASHBOARD} element={
                    <ProtectedRoute allowedRoles={[ROLES.USER]}>
                        <UserDashboard />
                    </ProtectedRoute>
                } />
                <Route path={ROUTES.RESIDENT_BILLS} element={
                    <ProtectedRoute allowedRoles={[ROLES.USER]}>
                        <ResidentBillsPage />
                    </ProtectedRoute>
                } />
                <Route path={ROUTES.RESIDENT_USAGE} element={
                    <ProtectedRoute allowedRoles={[ROLES.USER]}>
                        <UsagePage />
                    </ProtectedRoute>
                } />
                <Route path={ROUTES.RESIDENT_METER} element={
                    <ProtectedRoute allowedRoles={[ROLES.USER]}>
                        <MeterDetailsPage />
                    </ProtectedRoute>
                } />
                <Route path={ROUTES.RESIDENT_PROFILE} element={
                    <ProtectedRoute allowedRoles={[ROLES.USER]}>
                        <ProfilePage />
                    </ProtectedRoute>
                } />
                <Route path={ROUTES.RESIDENT_COMPLAINTS} element={
                    <ProtectedRoute allowedRoles={[ROLES.USER]}>
                        <ResidentComplaintsPage />
                    </ProtectedRoute>
                } />
                <Route path={ROUTES.RESIDENT_NOTIFICATIONS} element={
                    <ProtectedRoute allowedRoles={[ROLES.USER]}>
                        <NotificationsPage />
                    </ProtectedRoute>
                } />
                <Route path={ROUTES.RESIDENT_PAYMENTS} element={
                    <ProtectedRoute allowedRoles={[ROLES.USER]}>
                        <PaymentHistoryPage />
                    </ProtectedRoute>
                } />
                <Route path={ROUTES.COMMUNITY_ADMIN_NOTIFICATIONS} element={
                    <ProtectedRoute allowedRoles={[ROLES.COMMUNITY_ADMIN]}>
                        <NotificationsPage />
                    </ProtectedRoute>
                } />
                <Route path={ROUTES.MAIN_ADMIN_NOTIFICATIONS} element={
                    <ProtectedRoute allowedRoles={[ROLES.MAIN_ADMIN]}>
                        <NotificationsPage />
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