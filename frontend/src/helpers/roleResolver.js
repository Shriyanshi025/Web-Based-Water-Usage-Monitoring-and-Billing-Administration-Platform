import { ROLES } from "../constants/roles";
import { ROUTES } from "../constants/routes";

export const resolveDashboardRoute = (role) => {
    switch (role) {
        case ROLES.MAIN_ADMIN:
            return ROUTES.MAIN_ADMIN_DASHBOARD;
        case ROLES.COMMUNITY_ADMIN:
            return ROUTES.COMMUNITY_ADMIN_DASHBOARD;
        case ROLES.USER:
            return ROUTES.RESIDENT_DASHBOARD;
        default:
            return ROUTES.LOGIN;
    }
};

export const getRoleDisplayName = (role) => {
    switch (role) {
        case ROLES.MAIN_ADMIN:
            return "Main Administrator";
        case ROLES.COMMUNITY_ADMIN:
            return "Community Administrator";
        case ROLES.USER:
            return "Resident";
        default:
            return "Guest";
    }
};

export const hasAccess = (currentRole, requiredRoles = []) => {
    if (!currentRole) return false;
    if (requiredRoles.length === 0) return true;
    return requiredRoles.includes(currentRole);
};
