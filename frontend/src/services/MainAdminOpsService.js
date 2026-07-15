import api from "./api";

class MainAdminOpsService {
    // ================= Communities =================
    async getAllCommunities() {
        const response = await api.get("/communities");
        return response.data;
    }

    async createCommunity(data) {
        const response = await api.post("/communities", data);
        return response.data;
    }

    async updateCommunity(id, data) {
        const response = await api.put(`/communities/${id}`, data);
        return response.data;
    }

    async updateCommunityStatus(id, active) {
        const response = await api.patch(`/communities/${id}/status`, { active });
        return response.data;
    }

    async deleteCommunity(id) {
        const response = await api.delete(`/communities/${id}`);
        return response.data;
    }

    // ================= Community Admins =================
    async getAllCommunityAdmins() {
        const response = await api.get("/community-admins");
        return response.data;
    }

    async updateCommunityAdmin(id, data) {
        const response = await api.put(`/community-admins/${id}`, data);
        return response.data;
    }

    async updateCommunityAdminStatus(id, active) {
        const response = await api.patch(`/community-admins/${id}/status`, { active });
        return response.data;
    }

    // ================= Approvals =================
    async getPendingUsers() {
        const response = await api.get("/admin/pending");
        return response.data;
    }

    async approveUser(userId, data) {
        const response = await api.put(`/admin/approve/${userId}`, data);
        return response.data;
    }

    async deleteUser(userId) {
        const response = await api.delete(`/admin/${userId}`);
        return response.data;
    }
}

export default new MainAdminOpsService();
