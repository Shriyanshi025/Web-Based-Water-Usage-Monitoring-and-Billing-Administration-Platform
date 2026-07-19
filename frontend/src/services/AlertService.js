import api from "./api";

export const getMyAlerts = async () => {
    const res = await api.get("/alerts/my");
    return res.data.data;
};

export const markAlertAsRead = async (id) => {
    const res = await api.post(`/alerts/${id}/read`);
    return res.data.data;
};

export const resolveAlert = async (id) => {
    const res = await api.post(`/alerts/${id}/resolve`);
    return res.data.data;
};

export const getAlertStatistics = async () => {
    const res = await api.get("/alerts/statistics");
    return res.data.data;
};

export const createSystemAnnouncement = async (request) => {
    const res = await api.post("/alerts/announcement", request);
    return res.data.data;
};

export const markAllAlertsAsRead = async () => {
    const res = await api.post("/alerts/read-all");
    return res.data.data;
};

export const AlertService = {
    getMyAlerts,
    markAlertAsRead,
    markAllAlertsAsRead,
    resolveAlert,
    getAlertStatistics,
    createSystemAnnouncement
};
