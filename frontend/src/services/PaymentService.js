import api from "./api";

export const getRazorpayKey = async () => {
    const response = await api.get("/payments/key");
    return response.data;
};

export const createPaymentOrder = async (billId) => {
    const response = await api.post("/payments/order", { billId });
    return response.data;
};

export const verifyPaymentSignature = async (data) => {
    const response = await api.post("/payments/verify", data);
    return response.data;
};

export const getMyPayments = async () => {
    const response = await api.get("/payments/my");
    return response.data;
};
