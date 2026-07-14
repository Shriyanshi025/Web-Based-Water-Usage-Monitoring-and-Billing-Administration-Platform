import axios from "axios";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { storageHelper } from "../helpers/storageHelper";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
    (config) => {
        const token = storageHelper.getLocal(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
            config.headers.set('Authorization', `Bearer ${token}`);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Catch 401 Session Expiry & 500 Server Errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401) {
            // Dispatch a global session-expired event
            window.dispatchEvent(new CustomEvent("session-expired"));
        }
        return Promise.reject(error);
    }
);

export default api;