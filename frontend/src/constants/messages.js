export const MESSAGES = {
    AUTH: {
        LOGIN_SUCCESS: "Welcome back! Login successful.",
        LOGIN_FAILED: "Invalid email or password. Please try again.",
        LOGOUT_SUCCESS: "You have been logged out successfully.",
        SESSION_EXPIRED: "Your session has expired. Please log in again.",
        UNAUTHORIZED: "You are not authorized to view this page."
    },
    REGISTRATION: {
        SUCCESS: "Registration submitted successfully! Awaiting administrator approval.",
        FAILED: "Registration failed. Please check the details and try again.",
        EMAIL_TAKEN: "Email address is already registered."
    },
    INVITATION: {
        SENT: "Invitation generated and sent successfully.",
        COPIED: "Invitation link copied to clipboard!",
        EXPIRED: "This invitation link has expired.",
        INVALID: "Invalid invitation token."
    },
    ERRORS: {
        GENERIC: "An unexpected error occurred. Please try again later.",
        NETWORK: "Network error. Please check your internet connection.",
        FIELD_REQUIRED: "This field is required.",
        INVALID_EMAIL: "Invalid email address format."
    }
};
