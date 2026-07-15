import api from "./api";

/**
 * Service for Community Admin Operations
 * All methods call real backend APIs. If an endpoint is pending backend implementation,
 * it throws a clear error so the UI can gracefully show a "Coming Soon" or disable the action.
 */
class CommunityOpsService {

    // ==========================================
    // RESIDENTS MANAGEMENT
    // ==========================================
    
    async getAllResidents() {
        const response = await api.get("/residents");
        return response.data;
    }

    async getHouseholdDirectory() {
        const response = await api.get("/residents/households");
        return response.data;
    }

    async getResidentById(id) {
        const response = await api.get(`/residents/${id}`);
        return response.data;
    }

    async updateResident(id, data) {
        const response = await api.put(`/residents/${id}`, data);
        return response.data;
    }

    async updateResidentStatus(id, status) {
        const active = status === true || status === "ACTIVE" || status === "APPROVED";
        const response = await api.put(`/residents/${id}`, { active });
        return response.data;
    }

    async deleteResident(id) {
        const response = await api.delete(`/residents/${id}`);
        return response.data;
    }

    // ==========================================
    // RESIDENT APPROVALS
    // ==========================================
    
    async getPendingResidents() {
        const response = await api.get("/residents/pending");
        return response.data;
    }

    async approveResident(id, approvalData) {
        const response = await api.put(`/residents/${id}/approve`, approvalData);
        return response.data;
    }

    // ==========================================
    // WATER METERS
    // ==========================================

    async getAllMeters() {
        const response = await api.get("/water-meters");
        return response.data;
    }

    async getAllWaterUsage() {
        const response = await api.get("/water-usage");
        return response.data;
    }

    async addWaterUsage(data) {
        const response = await api.post("/water-usage", data);
        return response.data;
    }

    async uploadWaterUsageCsv(file) {
        const formData = new FormData();
        formData.append("file", file);
        const response = await api.post("/water-usage/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return response.data;
    }

    async getMeterById(id) {
        const response = await api.get(`/water-meters/${id}`);
        return response.data;
    }

    async assignMeter(id, data) {
        const response = await api.put(`/water-meters/${id}`, data);
        return response.data;
    }

    async updateMeter(id, data) {
        const response = await api.put(`/water-meters/${id}`, data);
        return response.data;
    }

    // ==========================================
    // INVITATIONS
    // ==========================================

    async getInvitations() {
        const response = await api.get("/community-admins/me/invitations");
        // API returns a direct List without ApiResponse wrapper according to controller
        // Wait, let me double check the controller.
        // Yes: return ResponseEntity.ok(invitations);
        return response.data;
    }

    async getBills() {
        const response = await api.get("/billing/bills");
        return response.data;
    }

    async getActiveBillingCycle() {
        const response = await api.get("/billing/billing-cycle/active");
        return response.data;
    }

    async getTariffPlans() {
        const response = await api.get("/billing/tariff-plans");
        return response.data;
    }

    async generateBills(data) {
        const response = await api.post("/billing/generate", data);
        return response.data;
    }

    async createInvitation(data) {
        const response = await api.post("/community-admins/me/invitations", data);
        // Returns ResidentInvitationResponse directly
        return response.data;
    }

    async revokeInvitation(id) {
        const response = await api.put(`/community-admins/me/invitations/${id}/revoke`);
        return response.data;
    }
}

export default new CommunityOpsService();
