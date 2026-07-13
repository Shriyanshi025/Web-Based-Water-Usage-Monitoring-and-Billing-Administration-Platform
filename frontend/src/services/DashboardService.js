import api from "./api";

export const getMainDashboard = () => {
    return api.get("/dashboard/main-admin");
};

export const getCommunityDashboard = (communityId) => {
    return api.get(`/dashboard/community-admin/${communityId}`);
};

export const getUserDashboard = (residentId) => {
    return api.get(`/dashboard/user/${residentId}`);
};

export const getCommunityAdminDashboard = () => {
    return api.get("/dashboard/community-admin");
};

export const getResidentDashboard = () => {
    return api.get("/dashboard/resident");
};