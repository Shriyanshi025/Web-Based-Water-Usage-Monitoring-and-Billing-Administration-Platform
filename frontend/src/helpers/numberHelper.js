export const formatCurrency = (amount, currency = "INR", locales = "en-IN") => {
    try {
        const value = typeof amount === "string" ? parseFloat(amount) : amount;
        if (isNaN(value)) return "₹0.00";
        return new Intl.NumberFormat(locales, {
            style: "currency",
            currency: currency
        }).format(value);
    } catch (e) {
        return `₹${amount}`;
    }
};

export const formatWaterUsage = (litres) => {
    try {
        const value = typeof litres === "string" ? parseFloat(litres) : litres;
        if (isNaN(value)) return "0 L";
        if (value >= 1000) {
            return `${(value / 1000).toFixed(2)} kL`;
        }
        return `${value.toFixed(0)} L`;
    } catch (e) {
        return `${litres} L`;
    }
};
