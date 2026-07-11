import { ROUTES } from "./routes";
import { ROLES } from "./roles";

// Using Material Icons mapping by string to avoid huge bundle imports in constants.
// The actual icons will be resolved in the Sidebar component.
export const NAVIGATION_CONFIG = {
    [ROLES.MAIN_ADMIN]: [
        { 
            label: "Dashboard", 
            path: ROUTES.MAIN_ADMIN_DASHBOARD, 
            icon: "DashboardIcon" 
        },
        { 
            label: "Communities", 
            path: ROUTES.MAIN_ADMIN_COMMUNITIES, 
            icon: "ApartmentIcon" 
        },
        { 
            label: "Approvals", 
            path: ROUTES.MAIN_ADMIN_APPROVALS, 
            icon: "DomainVerificationIcon" 
        },
        // Example of nested support (future ready)
        // {
        //     label: "Settings",
        //     icon: "SettingsIcon",
        //     children: [
        //         { label: "General", path: "/main-admin/settings/general" }
        //     ]
        // }
    ],
    [ROLES.COMMUNITY_ADMIN]: [
        { 
            label: "Dashboard", 
            path: ROUTES.COMMUNITY_ADMIN_DASHBOARD, 
            icon: "DashboardIcon" 
        },
        { 
            label: "Residents", 
            path: ROUTES.COMMUNITY_ADMIN_RESIDENTS, 
            icon: "PeopleIcon" 
        },
        {
            label: "Approvals",
            path: ROUTES.COMMUNITY_ADMIN_APPROVALS,
            icon: "DomainVerificationIcon"
        },
        { 
            label: "Water Meters", 
            path: ROUTES.COMMUNITY_ADMIN_METERS, 
            icon: "WaterDropIcon" 
        },
        { 
            label: "Usage", 
            path: ROUTES.COMMUNITY_ADMIN_USAGE, 
            icon: "TimelineIcon" 
        },
        { 
            label: "Invitations", 
            path: ROUTES.COMMUNITY_ADMIN_INVITATIONS, 
            icon: "MailIcon" 
        },
    ],
    [ROLES.USER]: [
        { 
            label: "Dashboard", 
            path: ROUTES.RESIDENT_DASHBOARD, 
            icon: "DashboardIcon" 
        },
        { 
            label: "My Profile", 
            path: ROUTES.RESIDENT_PROFILE, 
            icon: "PersonIcon" 
        },
    ],
};
