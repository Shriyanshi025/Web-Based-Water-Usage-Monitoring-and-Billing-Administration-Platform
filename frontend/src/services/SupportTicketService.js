import api from './api';

export const SupportTicketService = {
    createTicket: async (ticketData) => {
        const response = await api.post('/support-tickets', ticketData);
        return response.data;
    },

    getMySubmittedTickets: async () => {
        const response = await api.get('/support-tickets/my-tickets');
        return response.data;
    },

    getCommunityInboxTickets: async () => {
        const response = await api.get('/support-tickets/community-inbox');
        return response.data;
    },

    getMainAdminTickets: async () => {
        const response = await api.get('/support-tickets/main-admin-inbox');
        return response.data;
    },

    getTicketDetails: async (id) => {
        const response = await api.get(`/support-tickets/${id}`);
        return response.data;
    },

    addReply: async (id, replyData) => {
        const response = await api.post(`/support-tickets/${id}/replies`, replyData);
        return response.data;
    },

    getTicketReplies: async (id) => {
        const response = await api.get(`/support-tickets/${id}/replies`);
        return response.data;
    },

    updateTicketStatus: async (id, statusData) => {
        const response = await api.put(`/support-tickets/${id}/status`, statusData);
        return response.data;
    },

    closeTicket: async (id) => {
        const response = await api.put(`/support-tickets/${id}/close`);
        return response.data;
    }
};

export default SupportTicketService;
