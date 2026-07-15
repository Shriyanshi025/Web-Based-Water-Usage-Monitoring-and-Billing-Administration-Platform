import api from "./api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

export const login = (credentials) => {
    return api.post(API_ENDPOINTS.AUTH.LOGIN, credentials).then((res) => res.data);
};

export const registerResident = (data) => {
    return api.post(API_ENDPOINTS.AUTH.REGISTER_RESIDENT, data).then((res) => res.data);
};

export const registerCommunityAdmin = (data) => {
    return api.post(API_ENDPOINTS.AUTH.REGISTER_COMMUNITY_ADMIN, data).then((res) => res.data);
};

export const getCurrentUser = () => {
    return api.get(API_ENDPOINTS.AUTH.ME).then((res) => res.data);
};

// Aliased fallback for existing template compatibility
export const register = registerResident;

export const validateInvitationToken = (token) => {
    return api.get(`/invitations/${token}`).then((res) => res.data);
};

export const AuthService = {
    login,
    registerResident,
    registerCommunityAdmin,
    getCurrentUser,
    register,
    validateInvitationToken
};