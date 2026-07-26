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

    async getResetStatus() {
        const response = await api.get("/water-usage/reset-status");
        return response.data;
    }

    async resetMeterReading(data) {
        const response = await api.post("/water-usage/reset-meter", data);
        return response.data;
    }

    async bulkResetMeterReadings(data) {
        const response = await api.post("/water-usage/reset-all-meters", data);
        return response.data;
    }

    async getResetLogs() {
        const response = await api.get("/water-usage/reset-logs");
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
        const response = await api.get("/billing-cycles/active");
        return response.data;
    }

    async getAllBillingCycles() {
        const response = await api.get("/billing-cycles");
        return response.data;
    }

    async createBillingCycle(data) {
        const response = await api.post("/billing-cycles", data);
        return response.data;
    }

    async openBillingCycle(id) {
        const response = await api.put(`/billing-cycles/${id}/open`);
        return response.data;
    }

    async closeBillingCycle(id) {
        const response = await api.put(`/billing-cycles/${id}/close`);
        return response.data;
    }

    async archiveBillingCycle(id) {
        const response = await api.put(`/billing-cycles/${id}/archive`);
        return response.data;
    }

    async getTariffPlans() {
        const response = await api.get("/billing/tariff-plans");
        return response.data;
    }

    async getAdminTariffPlans() {
        const response = await api.get("/tariff-plans");
        return response.data;
    }

    async getTariffPlanById(id) {
        const response = await api.get(`/tariff-plans/${id}`);
        return response.data;
    }

    async createAdminTariffPlan(data) {
        const response = await api.post("/tariff-plans", data);
        return response.data;
    }

    async updateAdminTariffPlan(id, data) {
        const response = await api.put(`/tariff-plans/${id}`, data);
        return response.data;
    }

    async deleteTariffPlan(id) {
        const response = await api.delete(`/tariff-plans/${id}`);
        return response.data;
    }

    async duplicateTariffPlan(id) {
        const response = await api.post(`/tariff-plans/${id}/duplicate`);
        return response.data;
    }

    async activateTariffPlan(id) {
        const response = await api.put(`/tariff-plans/${id}/activate`);
        return response.data;
    }

    async deactivateTariffPlan(id) {
        const response = await api.put(`/tariff-plans/${id}/deactivate`);
        return response.data;
    }

    async archiveTariffPlan(id) {
        const response = await api.put(`/tariff-plans/${id}/archive`);
        return response.data;
    }

    async previewTariffPlan(id, sampleUnits) {
        const query = sampleUnits && sampleUnits.length ? `?units=${sampleUnits.join(",")}` : "";
        const response = await api.get(`/tariff-plans/${id}/preview${query}`);
        return response.data;
    }

    async previewUnsavedTariffPlan(data, sampleUnits) {
        const query = sampleUnits && sampleUnits.length ? `?units=${sampleUnits.join(",")}` : "";
        const response = await api.post(`/tariff-plans/preview-unsaved${query}`, data);
        return response.data;
    }

    async generateBills(data) {
        const response = await api.post("/billing/generate", data);
        return response.data;
    }

    async generateBillForResident(residentId) {
        const response = await api.post(`/bills/generate/${residentId}`);
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

    // ==========================================
    // BULK WATER PURCHASES
    // ==========================================

    async getBulkPurchases() {
        const response = await api.get("/bulk-purchases");
        return response.data;
    }

    async getBulkPurchaseById(id) {
        const response = await api.get(`/bulk-purchases/${id}`);
        return response.data;
    }

    async createBulkPurchase(data) {
        const response = await api.post("/bulk-purchases", data);
        return response.data;
    }

    async updateBulkPurchase(id, data) {
        const response = await api.put(`/bulk-purchases/${id}`, data);
        return response.data;
    }

    async deleteBulkPurchase(id) {
        const response = await api.delete(`/bulk-purchases/${id}`);
        return response.data;
    }

    async getBulkPurchasesForCycle(cycleId) {
        const response = await api.get(`/bulk-purchases/cycle/${cycleId}`);
        return response.data;
    }

    async getBulkPurchaseSummaryForCycle(cycleId) {
        const response = await api.get(`/bulk-purchases/cycle/${cycleId}/summary`);
        return response.data;
    }

    async getBillingCycles() {
        const response = await api.get("/billing-cycles");
        return response.data;
    }

    async getCostDistribution(cycleId) {
        const response = await api.get(`/cost-distribution/cycle/${cycleId}`);
        return response.data;
    }

    async getCommunityAlerts(communityId) {
        const response = await api.get(`/alerts/community/${communityId}`);
        return response.data;
    }

    async getMyAlerts() {
        const response = await api.get("/alerts/my");
        return response.data;
    }

    async markAlertRead(id) {
        const response = await api.post(`/alerts/${id}/read`);
        return response.data;
    }

    async acknowledgeAlert(id) {
        const response = await api.post(`/alerts/${id}/acknowledge`);
        return response.data;
    }

    async resolveAlert(id) {
        const response = await api.post(`/alerts/${id}/resolve`);
        return response.data;
    }

    async deleteAlert(id) {
        const response = await api.delete(`/alerts/${id}`);
        return response.data;
    }

    async markAllAlertsRead() {
        const response = await api.post("/alerts/read-all");
        return response.data;
    }

    async bulkMarkAlertsRead(ids) {
        const response = await api.post("/alerts/bulk-read", ids);
        return response.data;
    }

    async bulkDeleteAlerts(ids) {
        const response = await api.post("/alerts/bulk-delete", ids);
        return response.data;
    }

    async getInvoiceByBillId(billId) {
        const response = await api.get(`/invoices/bill/${billId}`);
        return response.data;
    }

    async getInvoiceByNumber(invoiceNumber) {
        const response = await api.get(`/invoices/number/${invoiceNumber}`);
        return response.data;
    }

    async downloadInvoicePdf(invoiceId) {
        const response = await api.get(`/invoices/${invoiceId}/pdf`, { responseType: 'blob' });
        return response;
    }
}

export default new CommunityOpsService();
