export const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return "-";
    const cleaned = ("" + phoneNumber).replace(/\D/g, "");
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return `+91 ${match[1]}-${match[2]}-${match[3]}`;
    }
    return phoneNumber;
};

export const capitalize = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const maskEmail = (email) => {
    if (!email) return "-";
    const parts = email.split("@");
    if (parts.length !== 2) return email;
    const name = parts[0];
    const domain = parts[1];
    if (name.length <= 2) {
        return `${name[0]}*@${domain}`;
    }
    return `${name[0]}${"*".repeat(name.length - 2)}${name[name.length - 1]}@${domain}`;
};
