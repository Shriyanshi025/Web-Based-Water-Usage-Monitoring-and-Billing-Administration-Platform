import React from "react";
import { IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";
import EmailIcon from "@mui/icons-material/Email";
import SpeedIcon from "@mui/icons-material/Speed";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import TimelineIcon from "@mui/icons-material/Timeline";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import PersonIcon from "@mui/icons-material/Person";
import DownloadIcon from "@mui/icons-material/Download";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import HomeIcon from "@mui/icons-material/Home";
import StatusBadge from "../components/common/StatusBadge";
import { ROUTES } from "./routes";

export const UI_CONFIG = {
    spacing: 3,
    elevation: 1,
    borderRadius: 2,
    transitionDuration: 0.3,
    iconSize: 24,
    chartHeight: 300,
};

export const QUICK_ACTIONS_CONFIG = {
    MAIN_ADMIN: [
        {
            id: "create-community",
            title: "Create Community",
            description: "Setup a new community profile",
            icon: <AddIcon />,
            color: "primary",
            comingSoon: false,
            path: ROUTES.MAIN_ADMIN_COMMUNITIES,
            requiredRole: "MAIN_ADMIN",
            requiredPermission: "manage_communities",
            hidden: false,
            disabled: false
        },
        {
            id: "approve-users",
            title: "Approve Registrations",
            description: "Review pending registrations",
            icon: <CheckCircleIcon />,
            color: "success",
            comingSoon: false,
            path: ROUTES.MAIN_ADMIN_APPROVALS,
            requiredRole: "MAIN_ADMIN",
            requiredPermission: "approve_users",
            hidden: false,
            disabled: false
        },
        {
            id: "invite-admin",
            title: "Manage Community Admins",
            description: "View and manage community admins",
            icon: <PeopleIcon />,
            color: "info",
            comingSoon: false,
            path: ROUTES.MAIN_ADMIN_COMMUNITY_ADMINS,
            requiredRole: "MAIN_ADMIN",
            requiredPermission: "invite_users",
            hidden: false,
            disabled: false
        },
        {
            id: "generate-bills",
            title: "Generate Bills",
            description: "Run the monthly billing cycle",
            icon: <ReceiptIcon />,
            color: "warning",
            comingSoon: true,
            path: "#",
            requiredRole: "MAIN_ADMIN",
            requiredPermission: "manage_billing",
            hidden: false,
            disabled: true
        },
        {
            id: "water-reports",
            title: "Water Usage Reports",
            description: "Analyze consumption data",
            icon: <AssessmentIcon />,
            color: "primary",
            comingSoon: true,
            path: "#",
            requiredRole: "MAIN_ADMIN",
            requiredPermission: "view_reports",
            hidden: false,
            disabled: true
        },
        {
            id: "system-settings",
            title: "System Settings",
            description: "Configure global parameters",
            icon: <SettingsIcon />,
            color: "secondary",
            comingSoon: true,
            path: "#",
            requiredRole: "MAIN_ADMIN",
            requiredPermission: "manage_settings",
            hidden: false,
            disabled: true
        }
    ],
    COMMUNITY_ADMIN: [
        {
            id: "household-directory",
            title: "Household Directory",
            description: "View residents, meters, and bills in one place",
            icon: <HomeIcon />,
            color: "secondary",
            comingSoon: false,
            path: "/admin/households",
            requiredRole: "COMMUNITY_ADMIN",
            requiredPermission: "manage_residents",
            hidden: false,
            disabled: false
        },
        {
            id: "manage-residents",
            title: "Manage Residents",
            description: "View and manage resident accounts",
            icon: <PeopleIcon />,
            color: "info",
            comingSoon: false,
            path: ROUTES.COMMUNITY_ADMIN_RESIDENTS,
            requiredRole: "COMMUNITY_ADMIN",
            requiredPermission: "manage_residents",
            hidden: false,
            disabled: false
        },
        {
            id: "review-approvals",
            title: "Review Approvals",
            description: "Approve pending residents",
            icon: <CheckCircleIcon />,
            color: "success",
            comingSoon: false,
            path: ROUTES.COMMUNITY_ADMIN_APPROVALS,
            requiredRole: "COMMUNITY_ADMIN",
            requiredPermission: "approve_residents",
            hidden: false,
            disabled: false
        },
        {
            id: "manage-meters",
            title: "Manage Meters",
            description: "Monitor community water meters",
            icon: <SpeedIcon />,
            color: "primary",
            comingSoon: false,
            path: ROUTES.COMMUNITY_ADMIN_METERS,
            requiredRole: "COMMUNITY_ADMIN",
            requiredPermission: "manage_meters",
            hidden: false,
            disabled: false
        },
        {
            id: "usage-reports",
            title: "Usage Reports",
            description: "View water consumption analytics",
            icon: <AssessmentIcon />,
            color: "secondary",
            comingSoon: false,
            path: ROUTES.COMMUNITY_ADMIN_USAGE,
            requiredRole: "COMMUNITY_ADMIN",
            requiredPermission: "view_reports",
            hidden: false,
            disabled: false
        },
        {
            id: "send-invitations",
            title: "Send Invitations",
            description: "Invite new residents",
            icon: <EmailIcon />,
            color: "warning",
            comingSoon: false,
            path: ROUTES.COMMUNITY_ADMIN_INVITATIONS,
            requiredRole: "COMMUNITY_ADMIN",
            requiredPermission: "invite_residents",
            hidden: false,
            disabled: false
        },
        {
            id: "update-profile",
            title: "Update Profile",
            description: "Manage your community settings",
            icon: <ManageAccountsIcon />,
            color: "primary",
            comingSoon: true,
            path: ROUTES.COMMUNITY_ADMIN_PROFILE,
            requiredRole: "COMMUNITY_ADMIN",
            requiredPermission: "manage_profile",
            hidden: false,
            disabled: true
        }
    ],
    USER: [
        {
            id: "view-bills",
            title: "View Bills",
            description: "Check your monthly water bills",
            icon: <ReceiptIcon />,
            color: "primary",
            comingSoon: false,
            path: ROUTES.RESIDENT_BILLS,
            requiredRole: "USER",
            requiredPermission: "view_bills",
            hidden: false,
            disabled: false
        },
        {
            id: "water-usage",
            title: "Usage History",
            description: "Track your water consumption",
            icon: <TimelineIcon />,
            color: "info",
            comingSoon: false,
            path: ROUTES.RESIDENT_USAGE,
            requiredRole: "USER",
            requiredPermission: "view_usage",
            hidden: false,
            disabled: false
        },
        {
            id: "meter-details",
            title: "Meter Details",
            description: "View meter status and info",
            icon: <WaterDropIcon />,
            color: "success",
            comingSoon: false,
            path: ROUTES.RESIDENT_METER,
            requiredRole: "USER",
            requiredPermission: "view_meter",
            hidden: false,
            disabled: false
        },
        {
            id: "user-profile",
            title: "My Profile",
            description: "Update personal information",
            icon: <PersonIcon />,
            color: "secondary",
            comingSoon: false,
            path: ROUTES.RESIDENT_PROFILE,
            requiredRole: "USER",
            requiredPermission: "manage_profile",
            hidden: false,
            disabled: false
        },
        {
            id: "download-bill",
            title: "Download Bill",
            description: "Get your latest bill PDF",
            icon: <DownloadIcon />,
            color: "warning",
            comingSoon: true,
            path: ROUTES.RESIDENT_BILLS,
            requiredRole: "USER",
            requiredPermission: "download_bill",
            hidden: false,
            disabled: true
        },
        {
            id: "raise-complaint",
            title: "Raise Complaint",
            description: "Report an issue or leak",
            icon: <ReportProblemIcon />,
            color: "error",
            comingSoon: true,
            path: "#",
            requiredRole: "USER",
            requiredPermission: "raise_complaint",
            hidden: false,
            disabled: true
        }
    ]
};

export const DATAGRID_COLUMNS = {
    MAIN_ADMIN_APPROVALS: [
        { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
        { field: 'role', headerName: 'Role', flex: 1, minWidth: 120 },
        { field: 'community', headerName: 'Community', flex: 1, minWidth: 150 },
        { field: 'date', headerName: 'Applied On', flex: 1, minWidth: 120 },
        { field: 'status', headerName: 'Status', width: 120, renderCell: (params) => <StatusBadge status={params.value} /> },
        { field: 'actions', headerName: '', width: 80, sortable: false, renderCell: () => (
            <IconButton size="small"><MoreVertIcon fontSize="small" /></IconButton>
        )}
    ],
    COMMUNITY_ADMIN_APPROVALS: [
        { field: 'name', headerName: 'Resident Name', flex: 1, minWidth: 150 },
        { field: 'unit', headerName: 'Unit/Apartment', flex: 1, minWidth: 120 },
        { field: 'email', headerName: 'Email Address', flex: 1.5, minWidth: 200 },
        { field: 'date', headerName: 'Applied On', flex: 1, minWidth: 120 },
        { field: 'status', headerName: 'Status', width: 120, renderCell: (params) => <StatusBadge status={params.value} /> },
        { field: 'actions', headerName: '', width: 80, sortable: false, renderCell: () => (
            <IconButton size="small"><MoreVertIcon fontSize="small" /></IconButton>
        )}
    ]
};

export const CHART_CONFIG = {
    WATER_CONSUMPTION: {
        type: "line",
        height: 300,
        color: "#1976d2"
    },
    METER_STATUS: {
        type: "doughnut",
        height: 300,
        colors: ["#10b981", "#ef4444", "#f59e0b"] // Active, Inactive, Maintenance
    },
    COMMUNITY_GROWTH: {
        type: "bar",
        height: 300,
        color: "#10b981"
    }
};

export const EMPTY_STATE_CONFIG = {
    TIMELINE: {
        title: "No recent activities",
        description: "Your community timeline is currently empty."
    },
    APPROVALS: {
        title: "All caught up!",
        description: "There are no pending resident approvals."
    },
    CHARTS: {
        title: "Not enough data",
        description: "Check back later when more data is collected."
    }
};
