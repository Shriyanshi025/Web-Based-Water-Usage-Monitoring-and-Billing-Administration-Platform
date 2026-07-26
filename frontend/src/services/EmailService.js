import api from "./api";

export const getEmailPreferences = async () => {
    const res = await api.get("/email-preferences");
    return res.data.data;
};

export const updateEmailPreferences = async (preferences) => {
    const res = await api.put("/email-preferences", preferences);
    return res.data.data;
};

export const getEmailHistory = async () => {
    const res = await api.get("/admin/email-history");
    return res.data.data;
};

export const EmailService = {
    getEmailPreferences,
    updateEmailPreferences,
    getEmailHistory,
};
