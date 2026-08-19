import api from "./api";

export const sendContactMessage = async (contactData) => {
    const response = await api.post("/contact", contactData);
    return response.data;
};

export const ContactService = {
    sendContactMessage,
};
