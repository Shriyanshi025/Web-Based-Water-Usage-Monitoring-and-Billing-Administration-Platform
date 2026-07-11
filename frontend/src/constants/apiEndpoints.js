export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: "/auth/login",
        ME: "/auth/me",
        REGISTER_RESIDENT: "/auth/register/resident",
        REGISTER_COMMUNITY_ADMIN: "/auth/register/community-admin"
    },
    LOOKUPS: {
        COMMUNITIES: "/lookups/communities",
        BLOCKS: (communityId) => `/lookups/blocks/${communityId}`,
        UNITS: (blockId) => `/lookups/units/${blockId}`
    },
    DASHBOARD: {
        RESIDENT: "/dashboard/resident",
        COMMUNITY_ADMIN: "/dashboard/community-admin",
        MAIN_ADMIN: "/dashboard/main-admin",
        COMMUNITY_STATS: (id) => `/dashboard/community-admin/${id}`,
        USER_STATS: (id) => `/dashboard/user/${id}`
    },
    INVITATION: {
        CREATE: "/community-admins/me/invitations",
        HISTORY: "/community-admins/me/invitations",
        VALIDATE: (token) => `/invitations/${token}`
    },
    PROFILE: {
        RESIDENT: "/residents/me",
        COMMUNITY_ADMIN: "/community-admins/me"
    },
    METERS: {
        BASE: "/water-meters",
        DETAILS: (id) => `/water-meters/${id}`
    },
    USAGE: {
        BASE: "/water-usage",
        METER: (meterId) => `/water-usage/meter/${meterId}`
    },
    ADMIN: {
        PENDING_USERS: "/admin/pending",
        APPROVED_USERS: "/admin/approved",
        REJECTED_USERS: "/admin/rejected",
        PENDING_RESIDENTS: "/admin/pending-residents",
        PENDING_ADMINS: "/admin/pending-community-admins",
        APPROVE: (userId) => `/admin/approve/${userId}`
    }
};
