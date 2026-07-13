import api from "./api";

export const getResidentProfile = () => {
    return api.get("/residents/me");
};

export const updateResidentProfile = (data) => {
    return api.put("/residents/me", data);
};

export const getMyBills = async () => {
    const res = await api.get("/billing/me/bills");
    return res.data.data;
};

export const payBill = async (id) => {
    const res = await api.post(`/billing/me/bills/${id}/pay`);
    return res.data.data;
};

export const getMyUsageHistory = async () => {
    const res = await api.get("/water-usage/me");
    return res.data;
};

export const getMyMeterDetails = async () => {
    const res = await api.get("/water-meters/me");
    return res.data;
};
