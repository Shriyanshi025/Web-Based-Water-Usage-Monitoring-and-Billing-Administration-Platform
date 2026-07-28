import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useAuth } from "./AuthContext";
import api from "../services/api";

const AlertsContext = createContext(null);

const POLL_INTERVAL_MS = 30_000; // refresh every 30 s

export function AlertsProvider({ children }) {
    const { user } = useAuth();

    const [alerts, setAlerts]       = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading]     = useState(false);
    const [error, setError]         = useState(null);

    const intervalRef = useRef(null);

    const fetchAlerts = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);

            let data = [];

            if (user.role === "COMMUNITY_ADMIN") {
                // Community admins see community-wide alerts
                const targetCid = user.communityId || "me";
                const res = await api.get(`/alerts/community/${targetCid}`);
                const raw = res.data;
                data = Array.isArray(raw)
                    ? raw
                    : raw?.content ?? raw?.data ?? [];
            } else {
                // Residents / Main Admin see personal alerts
                const res = await api.get("/alerts/my");
                const raw = res.data;
                data = Array.isArray(raw)
                    ? raw
                    : raw?.content ?? raw?.data ?? [];
            }

            setAlerts(data);
            setUnreadCount(data.filter((a) => a.status === "ACTIVE").length);
        } catch (err) {
            setError(err?.response?.data?.message || err.message || "Failed to load alerts.");
            console.error("[AlertsContext] fetch failed:", err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Initial fetch + polling
    useEffect(() => {
        fetchAlerts();

        intervalRef.current = setInterval(fetchAlerts, POLL_INTERVAL_MS);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [fetchAlerts]);

    const value = useMemo(() => ({
        alerts,
        unreadCount,
        loading,
        error,
        refresh: fetchAlerts,
    }), [alerts, unreadCount, loading, error, fetchAlerts]);

    return (
        <AlertsContext.Provider value={value}>
            {children}
        </AlertsContext.Provider>
    );
}

export function useAlerts() {
    const ctx = useContext(AlertsContext);
    if (!ctx) throw new Error("useAlerts must be used within an AlertsProvider");
    return ctx;
}
