export const VALIDATION_RULES = {
    PASSWORD: {
        MIN_LENGTH: 8,
        MAX_LENGTH: 20,
        MESSAGE: "Password must be between 8 and 20 characters."
    },
    PHONE: {
        REGEX: /^[0-9]{10}$/,
        MESSAGE: "Phone number must be exactly 10 digits."
    },
    EMAIL: {
        MAX_LENGTH: 100
    },
    FULL_NAME: {
        MIN_LENGTH: 3,
        MAX_LENGTH: 100,
        MESSAGE: "Full name must be at least 3 characters."
    },
    PINCODE: {
        REGEX: /^[0-9]{6}$/,
        MESSAGE: "Pincode must be exactly 6 digits."
    }
};
