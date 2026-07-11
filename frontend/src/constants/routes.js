export const ROUTES = {
    LANDING: "/",
    LOGIN: "/login",
    REGISTER: "/register",
    PENDING_APPROVAL: "/pending-approval",
    
    // Resident Protected
    RESIDENT_DASHBOARD: "/user",
    RESIDENT_PROFILE: "/user/profile",
    
    // Community Admin Protected
    COMMUNITY_ADMIN_DASHBOARD: "/community-admin",
    COMMUNITY_ADMIN_PROFILE: "/community-admin/profile",
    COMMUNITY_ADMIN_RESIDENTS: "/community-admin/residents",
    COMMUNITY_ADMIN_APPROVALS: "/community-admin/approvals",
    COMMUNITY_ADMIN_METERS: "/community-admin/meters",
    COMMUNITY_ADMIN_USAGE: "/community-admin/usage",
    COMMUNITY_ADMIN_INVITATIONS: "/community-admin/invitations",
    
    // Main Admin Protected
    MAIN_ADMIN_DASHBOARD: "/main-admin",
    MAIN_ADMIN_COMMUNITIES: "/main-admin/communities",
    MAIN_ADMIN_APPROVALS: "/main-admin/approvals",
    
    // Error Pages
    UNAUTHORIZED: "/401",
    FORBIDDEN: "/403",
    NOT_FOUND: "/404",
    SERVER_ERROR: "/500"
};
