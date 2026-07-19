/**
 * HydroSync Status Badge Color Map
 *
 * All status values used across the platform, mapped to their
 * bg/text/border color pairs and MUI Alert severity.
 *
 * Domain statuses covered:
 *   - User approval:  APPROVED, PENDING, REJECTED
 *   - Account state:  ACTIVE, INACTIVE, SUSPENDED
 *   - Billing:        PAID, UNPAID, OVERDUE
 *   - Meter:          FAULTY, REPLACED
 *   - Invitation:     REVOKED, EXPIRED
 *   - Meter install:  NOT_INSTALLED
 *
 * Usage in StatusBadge:
 *   const colorConfig = STATUS_COLORS[status?.toUpperCase()] || STATUS_COLORS._DEFAULT;
 */
export const STATUS_COLORS = {

    // ── Approval / Registration ────────────────────────────────────────────
    APPROVED: {
        bg:       "#DCFCE7", // Green 100
        text:     "#15803D", // Green 700
        border:   "#BBF7D0", // Green 200
        severity: "success",
    },
    PENDING: {
        bg:       "#FEF9C3", // Yellow 100
        text:     "#854D0E", // Yellow 800
        border:   "#FDE68A", // Yellow 200
        severity: "warning",
    },
    REJECTED: {
        bg:       "#FFE4E6", // Red 100
        text:     "#B91C1C", // Red 700
        border:   "#FECDD3", // Red 200
        severity: "error",
    },

    // ── Account / Entity State ─────────────────────────────────────────────
    ACTIVE: {
        bg:       "#DCFCE7", // Green 100
        text:     "#15803D", // Green 700
        border:   "#BBF7D0",
        severity: "success",
    },
    INACTIVE: {
        bg:       "#F1F5F9", // Slate 100
        text:     "#475569", // Slate 600
        border:   "#E2E8F0", // Slate 200
        severity: "default",
    },
    SUSPENDED: {
        bg:       "#F1F5F9",
        text:     "#475569",
        border:   "#E2E8F0",
        severity: "default",
    },

    // ── Billing / Payment ──────────────────────────────────────────────────
    PAID: {
        bg:       "#DCFCE7",
        text:     "#15803D",
        border:   "#BBF7D0",
        severity: "success",
    },
    UNPAID: {
        bg:       "#FEF9C3",
        text:     "#854D0E",
        border:   "#FDE68A",
        severity: "warning",
    },
    OVERDUE: {
        bg:       "#FFE4E6",
        text:     "#B91C1C",
        border:   "#FECDD3",
        severity: "error",
    },
    WAIVED: {
        bg:       "#EFF6FF", // Blue 50
        text:     "#1D4ED8", // Blue 700
        border:   "#BFDBFE", // Blue 200
        severity: "info",
    },

    // ── Meter Status ───────────────────────────────────────────────────────
    FAULTY: {
        bg:       "#FFE4E6",
        text:     "#B91C1C",
        border:   "#FECDD3",
        severity: "error",
    },
    REPLACED: {
        bg:       "#EFF6FF",
        text:     "#1D4ED8",
        border:   "#BFDBFE",
        severity: "info",
    },
    NOT_INSTALLED: {
        bg:       "#F1F5F9",
        text:     "#64748B", // Slate 500
        border:   "#E2E8F0",
        severity: "default",
    },

    // ── Invitation Lifecycle ───────────────────────────────────────────────
    REVOKED: {
        bg:       "#FFE4E6",
        text:     "#B91C1C",
        border:   "#FECDD3",
        severity: "error",
    },
    EXPIRED: {
        bg:       "#F1F5F9",
        text:     "#64748B",
        border:   "#E2E8F0",
        severity: "default",
    },
    ACCEPTED: {
        bg:       "#DCFCE7",
        text:     "#15803D",
        border:   "#BBF7D0",
        severity: "success",
    },

    // ── Billing Cycle ─────────────────────────────────────────────────────
    GENERATED: {
        bg:       "#EFF6FF",
        text:     "#1D4ED8",
        border:   "#BFDBFE",
        severity: "info",
    },
    CANCELLED: {
        bg:       "#F1F5F9",
        text:     "#64748B",
        border:   "#E2E8F0",
        severity: "default",
    },

    // ── Water Usage Record Status ──────────────────────────────────────────
    RECORDED: {
        bg:       "#EFF6FF", // Blue 50
        text:     "#1D4ED8", // Blue 700
        border:   "#BFDBFE", // Blue 200
        severity: "info",
    },

    // ── Fallback ───────────────────────────────────────────────────────────
    _DEFAULT: {
        bg:       "#F1F5F9",
        text:     "#475569",
        border:   "#E2E8F0",
        severity: "default",
    },
};
