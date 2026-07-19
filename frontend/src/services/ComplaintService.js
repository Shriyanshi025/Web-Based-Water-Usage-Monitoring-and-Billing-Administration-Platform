import api from "./api";

export const raiseComplaint = async (data) => {
    const response = await api.post("/complaints", data);
    return response.data;
};

export const getMyComplaints = async () => {
    const response = await api.get("/complaints/my");
    return response.data;
};

export const getComplaintById = async (id) => {
    const response = await api.get(`/complaints/${id}`);
    return response.data;
};

export const getCommunityComplaints = async () => {
    const response = await api.get("/complaints/community");
    return response.data;
};

export const searchComplaints = async (params) => {
    const response = await api.get("/complaints/search", { params });
    return response.data;
};

export const updateComplaint = async (id, data) => {
    const response = await api.put(`/complaints/${id}`, data);
    return response.data;
};
