export const formatDate = (dateString, locales = "en-IN", options = {}) => {
    if (!dateString) return "-";
    try {
        const date = new Date(dateString);
        const defaultOptions = {
            year: "numeric",
            month: "short",
            day: "numeric",
            ...options
        };
        return new Intl.DateTimeFormat(locales, defaultOptions).format(date);
    } catch (e) {
        return dateString;
    }
};

export const formatDateTime = (dateString, locales = "en-IN", options = {}) => {
    if (!dateString) return "-";
    try {
        const date = new Date(dateString);
        const defaultOptions = {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            ...options
        };
        return new Intl.DateTimeFormat(locales, defaultOptions).format(date);
    } catch (e) {
        return dateString;
    }
};

export const isExpired = (expiryString) => {
    if (!expiryString) return false;
    try {
        const expiryDate = new Date(expiryString);
        return expiryDate < new Date();
    } catch (e) {
        return false;
    }
};
