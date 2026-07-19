/**
 * HydroSync Design Tokens
 *
 * Single source of truth for all raw design values.
 * Every value here is consumed by theme.js.
 * Do NOT hardcode any of these values in component files.
 */

// ─────────────────────────────────────────────
// COLOR PALETTE — Water Domain (navy / teal axis)
// ─────────────────────────────────────────────
export const COLORS = {
    // Brand Primary — Sky Blue (water, trust, data)
    primary: {
        50:  "#F0F9FF",
        100: "#E0F2FE",
        200: "#BAE6FD",
        300: "#7DD3FC",
        400: "#38BDF8",
        500: "#0EA5E9",
        600: "#0284C7",
        700: "#0369A1",  // primary.main
        800: "#075985",  // primary.dark
        900: "#0C4A6E",
    },

    // Brand Secondary — Cyan (water usage charts, meter data)
    secondary: {
        400: "#22D3EE",
        500: "#06B6D4",
        600: "#0891B2",  // secondary.main
        700: "#0E7490",
        800: "#155E75",
    },

    // Semantic — Success (ACTIVE, PAID, APPROVED)
    success: {
        50:  "#F0FDF4",
        100: "#DCFCE7",
        600: "#16A34A",
        700: "#15803D",  // success.main
        800: "#166534",
    },

    // Semantic — Warning (PENDING, UNPAID, EXPIRING)
    warning: {
        50:  "#FFFBEB",
        100: "#FEF9C3",
        600: "#CA8A04",
        700: "#B45309",  // warning.main
        800: "#854D0E",
    },

    // Semantic — Error (OVERDUE, REJECTED, FAULTY)
    error: {
        50:  "#FFF1F2",
        100: "#FFE4E6",
        700: "#B91C1C",  // error.main
        800: "#991B1B",
    },

    // Neutral — Blue-grey foundation
    neutral: {
        50:  "#F8FAFC",
        100: "#F1F5F9",
        200: "#E2E8F0",
        300: "#CBD5E1",
        400: "#94A3B8",
        500: "#64748B",
        600: "#475569",
        700: "#334155",
        800: "#1E293B",
        900: "#0C1929",
    },

    // Pure white for surfaces
    white: "#FFFFFF",
};

// ─────────────────────────────────────────────
// SPACING
// ─────────────────────────────────────────────
export const SPACING = {
    0:   "0px",
    1:   "4px",
    2:   "8px",
    3:   "12px",
    4:   "16px",
    5:   "20px",
    6:   "24px",
    8:   "32px",
    10:  "40px",
    12:  "48px",
    16:  "64px",
};

// ─────────────────────────────────────────────
// TYPOGRAPHY
// ─────────────────────────────────────────────
export const FONT_FAMILY = {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
};

export const FONT_SIZE = {
    "2xs": "11px",
    xs:   "12px",
    sm:   "13px",
    md:   "14px",
    lg:   "16px",
    xl:   "18px",
    "2xl": "20px",
    "3xl": "24px",
    "4xl": "28px",
    "5xl": "32px",
};

export const FONT_WEIGHT = {
    regular:  400,
    medium:   500,
    semiBold: 600,
    bold:     700,
};

export const LINE_HEIGHT = {
    tight:   1.2,
    snug:    1.3,
    normal:  1.4,
    relaxed: 1.5,
    loose:   1.6,
};

// ─────────────────────────────────────────────
// BORDER RADIUS
// ─────────────────────────────────────────────
export const RADIUS = {
    xs:   "4px",   // chips, small badges
    sm:   "6px",   // inputs, icon buttons
    md:   "8px",   // cards, panels
    lg:   "12px",  // dialogs, drawers
    xl:   "16px",  // auth card, feature cards
    full: "9999px", // avatar, pill shapes
};

// ─────────────────────────────────────────────
// SHADOWS — based on COLORS.neutral.900 (#0C1929)
// ─────────────────────────────────────────────
export const SHADOW = {
    none: "none",
    xs:   "0 1px 2px rgba(12, 25, 41, 0.05)",
    sm:   "0 1px 3px rgba(12, 25, 41, 0.06), 0 1px 2px rgba(12, 25, 41, 0.04)",
    md:   "0 4px 12px rgba(12, 25, 41, 0.08)",
    lg:   "0 8px 24px rgba(12, 25, 41, 0.10)",
    xl:   "0 16px 48px rgba(12, 25, 41, 0.12)",
};

// ─────────────────────────────────────────────
// TRANSITIONS
// ─────────────────────────────────────────────
export const TRANSITION = {
    instant: "100ms ease-out",
    fast:    "180ms cubic-bezier(0.16, 1, 0.3, 1)",
    normal:  "250ms cubic-bezier(0.16, 1, 0.3, 1)",
    slow:    "400ms cubic-bezier(0.16, 1, 0.3, 1)",
};

// ─────────────────────────────────────────────
// Z-INDEX
// ─────────────────────────────────────────────
export const Z_INDEX = {
    base:    0,
    raised:  1,
    dropdown: 1000,
    sticky:  1100,
    navbar:  1200,
    sidebar: 1300,
    overlay: 1400,
    dialog:  1500,
    toast:   1600,
};

// ─────────────────────────────────────────────
// LEGACY COMPAT — re-export in old shape
// (used by any component referencing TOKENS directly)
// ─────────────────────────────────────────────
export const TOKENS = {
    spacing:     SPACING,
    radius:      RADIUS,
    shadow:      SHADOW,
    transition:  TRANSITION,
    fontSizes:   FONT_SIZE,
    fontWeights: FONT_WEIGHT,
    zIndex:      Z_INDEX,
};
