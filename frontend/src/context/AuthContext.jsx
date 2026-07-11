import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { storageHelper } from "../helpers/storageHelper";
import { isJwtExpired } from "../helpers/jwtHelper";
import { AuthService } from "../services/AuthService";
import { useNotification } from "./NotificationContext";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => storageHelper.getLocal(STORAGE_KEYS.AUTH_TOKEN));
    const [loading, setLoading] = useState(true);
    const { showNotification } = useNotification();

    const logout = useCallback(() => {
        storageHelper.clearAll();
        setToken(null);
        setUser(null);
    }, []);

    const refreshCurrentUser = useCallback(async () => {
        try {
            const currentUser = await AuthService.getCurrentUser();
            setUser(currentUser);
            storageHelper.setLocal(STORAGE_KEYS.USER_DETAILS, currentUser);
            return currentUser;
        } catch (error) {
            logout();
            throw error;
        }
    }, [logout]);

    const login = useCallback(async (newToken) => {
        storageHelper.setLocal(STORAGE_KEYS.AUTH_TOKEN, newToken);
        setToken(newToken);
        return refreshCurrentUser();
    }, [refreshCurrentUser]);

    // Startup Session Restoration
    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = storageHelper.getLocal(STORAGE_KEYS.AUTH_TOKEN);
            if (storedToken && !isJwtExpired(storedToken)) {
                try {
                    // Pre-emptively set token so getCurrentUser interceptor can use it
                    setToken(storedToken);
                    await refreshCurrentUser();
                } catch (error) {
                    console.error("Session restoration failed:", error);
                    logout();
                }
            } else {
                logout();
            }
            setLoading(false);
        };

        initializeAuth();
    }, [refreshCurrentUser, logout]);

    // Handle global session-expired events
    useEffect(() => {
        const handleSessionExpired = () => {
            showNotification("Your session has expired. Please log in again.", "warning");
            logout();
        };

        window.addEventListener("session-expired", handleSessionExpired);
        return () => {
            window.removeEventListener("session-expired", handleSessionExpired);
        };
    }, [logout, showNotification]);

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        refreshCurrentUser
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
