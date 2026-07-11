export const MOTION_PRESETS = {
    fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2, ease: "easeInOut" }
    },
    slideUp: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
    },
    slideInRight: {
        initial: { opacity: 0, x: 30 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -30 },
        transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
    },
    scale: {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
        transition: { duration: 0.2, ease: "easeOut" }
    },
    staggerContainer: {
        initial: {},
        animate: {
            transition: {
                staggerChildren: 0.05
            }
        }
    },
    staggerItem: {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.2, ease: "easeOut" }
    },
    cardHover: {
        whileHover: { y: -4, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)" },
        transition: { duration: 0.2, ease: "easeInOut" }
    },
    buttonHover: {
        whileHover: { scale: 1.02 },
        whileTap: { scale: 0.98 }
    }
};
