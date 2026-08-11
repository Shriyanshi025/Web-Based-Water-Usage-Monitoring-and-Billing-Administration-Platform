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
            label: "Community Admins", 
            path: ROUTES.MAIN_ADMIN_COMMUNITY_ADMINS, 
            icon: "PeopleIcon" 
        },
        { 
            label: "Approvals", 
            path: ROUTES.MAIN_ADMIN_APPROVALS, 
            icon: "DomainVerificationIcon" 
        },
        { 
            label: "Reports & Analytics", 
            path: ROUTES.MAIN_ADMIN_REPORTS, 
            icon: "AssessmentIcon" 
        },
        { 
            label: "Notifications", 
            path: ROUTES.MAIN_ADMIN_NOTIFICATIONS, 
            icon: "MailIcon" 
        },
        { 
            label: "Support Center", 
            path: "/main-admin/support", 
            icon: "MailIcon" 
        },
        { 
            label: "My Profile", 
            path: ROUTES.MAIN_ADMIN_PROFILE, 
            icon: "PersonIcon" 
        },
    ],
    [ROLES.COMMUNITY_ADMIN]: [
        { 
            label: "Dashboard", 
            path: ROUTES.COMMUNITY_ADMIN_DASHBOARD, 
            icon: "DashboardIcon" 
        },
        {
            label: "Household Directory",
            path: "/admin/households",
            icon: "HomeIcon"
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
            label: "Bills",
            path: ROUTES.COMMUNITY_ADMIN_BILLS,
            icon: "ReceiptIcon"
        },
        {
            label: "Billing Cycle",
            path: ROUTES.COMMUNITY_ADMIN_BILLING_CYCLE,
            icon: "CalendarMonthIcon"
        },
        {
            label: "Tariff Plans",
            path: ROUTES.COMMUNITY_ADMIN_TARIFF_PLANS,
            icon: "PriceChangeIcon"
        },
        {
            label: "Bulk Purchases",
            path: ROUTES.COMMUNITY_ADMIN_BULK_PURCHASE,
            icon: "WaterDropIcon"
        },
        {
            label: "Cost Distribution",
            path: ROUTES.COMMUNITY_ADMIN_COST_DISTRIBUTION,
            icon: "TimelineIcon"
        },
        {
            label: "Alerts Management",
            path: ROUTES.COMMUNITY_ADMIN_ALERTS,
            icon: "NotificationsActiveIcon"
        },
        {
            label: "Email History",
            path: ROUTES.COMMUNITY_ADMIN_EMAIL_HISTORY,
            icon: "MarkEmailReadIcon"
        },
        {
            label: "Reports & Analytics",
            path: ROUTES.COMMUNITY_ADMIN_REPORTS,
            icon: "AssessmentIcon"
        },
        { 
            label: "Invitations", 
            path: ROUTES.COMMUNITY_ADMIN_INVITATIONS, 
            icon: "MailOutlineIcon" 
        },
        {
            label: "Complaints",
            path: ROUTES.COMMUNITY_ADMIN_COMPLAINTS,
            icon: "MailIcon"
        },
        {
            label: "Support Center",
            path: "/community-admin/support",
            icon: "MailIcon"
        },
        {
            label: "Notifications",
            path: ROUTES.COMMUNITY_ADMIN_NOTIFICATIONS,
            icon: "MailIcon"
        },
        {
            label: "My Profile",
            path: ROUTES.COMMUNITY_ADMIN_PROFILE,
            icon: "PersonIcon"
        },
    ],
    [ROLES.USER]: [
        { 
            label: "Dashboard", 
            path: ROUTES.RESIDENT_DASHBOARD, 
            icon: "DashboardIcon" 
        },
        { 
            label: "My Bills", 
            path: ROUTES.RESIDENT_BILLS, 
            icon: "ReceiptIcon" 
        },
        { 
            label: "Payment History", 
            path: ROUTES.RESIDENT_PAYMENTS, 
            icon: "ReceiptIcon" 
        },
        { 
            label: "Usage History", 
            path: ROUTES.RESIDENT_USAGE, 
            icon: "TimelineIcon" 
        },
        { 
            label: "Peer Benchmarking", 
            path: ROUTES.RESIDENT_BENCHMARKING, 
            icon: "EmojiEventsIcon" 
        },
        { 
            label: "Meter Details", 
            path: ROUTES.RESIDENT_METER, 
            icon: "WaterDropIcon" 
        },
        { 
            label: "Raise Complaint", 
            path: ROUTES.RESIDENT_COMPLAINTS + "?tab=raise", 
            icon: "MailIcon" 
        },
        { 
            label: "Complaint History", 
            path: ROUTES.RESIDENT_COMPLAINTS + "?tab=history", 
            icon: "MailIcon" 
        },
        { 
            label: "Help & Support", 
            path: "/user/support", 
            icon: "MailIcon" 
        },
        { 
            label: "Notifications", 
            path: ROUTES.RESIDENT_NOTIFICATIONS, 
            icon: "MailIcon" 
        },
        { 
            label: "My Profile", 
            path: ROUTES.RESIDENT_PROFILE, 
            icon: "PersonIcon" 
        },
    ],
};
