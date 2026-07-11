import { VALIDATION_RULES } from "../constants/validationRules";

export const isValidEmail = (email) => {
    if (!email) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase()) && email.length <= VALIDATION_RULES.EMAIL.MAX_LENGTH;
};

export const isValidPhone = (phone) => {
    if (!phone) return false;
    return VALIDATION_RULES.PHONE.REGEX.test(phone);
};

export const isValidPincode = (pincode) => {
    if (!pincode) return false;
    return VALIDATION_RULES.PINCODE.REGEX.test(pincode);
};

export const isStrongPassword = (password) => {
    if (!password) return false;
    return (
        password.length >= VALIDATION_RULES.PASSWORD.MIN_LENGTH &&
        password.length <= VALIDATION_RULES.PASSWORD.MAX_LENGTH
    );
};
