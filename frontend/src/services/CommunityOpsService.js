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

    async getResidentById(id) {
        const response = await api.get(`/residents/${id}`);
        return response.data;
    }

    // Pending Backend Support
    async updateResident(id, data) {
        throw new Error("Backend Support Pending");
    }

    // Pending Backend Support
    async updateResidentStatus(id, status) {
        throw new Error("Backend Support Pending");
    }

    // Pending Backend Support
    async deleteResident(id) {
        throw new Error("Backend Support Pending");
    }

    // ==========================================
    // RESIDENT APPROVALS
    // ==========================================
    
    // Note: /api/admin/pending-residents exists but is restricted to MAIN_ADMIN.
    // Calling this as COMMUNITY_ADMIN will currently return 403 Forbidden.
    async getPendingResidents() {
        const response = await api.get("/admin/pending-residents");
        return response.data;
    }

    // Note: Restricted to MAIN_ADMIN
    async approveResident(id, approvalData) {
        const response = await api.put(`/admin/approve/${id}`, approvalData);
        return response.data;
    }

    // ==========================================
    // WATER METERS
    // ==========================================

    async getAllMeters() {
        const response = await api.get("/water-meters");
        return response.data;
    }

    async getMeterById(id) {
        const response = await api.get(`/water-meters/${id}`);
        return response.data;
    }

    // Existing but missing PUT
    async assignMeter(id, data) {
        throw new Error("Backend Support Pending");
    }

    // Existing but missing PUT
    async updateMeter(id, data) {
        throw new Error("Backend Support Pending");
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

    async createInvitation(data) {
        const response = await api.post("/community-admins/me/invitations", data);
        // Returns ResidentInvitationResponse directly
        return response.data;
    }

    // Pending Backend Support
    async revokeInvitation(id) {
        throw new Error("Backend Support Pending");
    }
}

export default new CommunityOpsService();
