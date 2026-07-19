import { createTheme, alpha } from "@mui/material/styles";
import {
    COLORS,
    FONT_FAMILY,
    FONT_SIZE,
    FONT_WEIGHT,
    LINE_HEIGHT,
    RADIUS,
    SHADOW,
    TRANSITION,
    TOKENS, // legacy compat for any refs outside this file
} from "./tokens";

// ─────────────────────────────────────────────────────────────────────────────
// HYDROSYNC MUI THEME
//
// Domain: Water Usage Monitoring & Billing Administration
// Visual Identity: Navy-Teal water axis · Enterprise data-centric · Clean
//
// Inspired by (layout quality only, not visual copying):
//   Microsoft Azure Portal, Google Cloud Console, Power BI, Grafana
//
// Explicitly NOT: generic SaaS, glassmorphism, neon, gaming/crypto dashboards
// ─────────────────────────────────────────────────────────────────────────────

const theme = createTheme({

    // ─── PALETTE ──────────────────────────────────────────────────────────────
    palette: {
        mode: "light",

        primary: {
            50:          COLORS.primary[50],
            100:         COLORS.primary[100],
            200:         COLORS.primary[200],
            light:       COLORS.primary[500],   // #0EA5E9
            main:        COLORS.primary[700],   // #0369A1 — Sky Blue
            dark:        COLORS.primary[800],   // #075985
            contrastText: COLORS.white,
        },

        secondary: {
            light:       COLORS.secondary[400],  // #22D3EE
            main:        COLORS.secondary[600],  // #0891B2 — Cyan
            dark:        COLORS.secondary[700],  // #0E7490
            contrastText: COLORS.white,
        },

        error: {
            50:   COLORS.error[50],
            100:  COLORS.error[100],
            main: COLORS.error[700],   // #B91C1C
            dark: COLORS.error[800],
            contrastText: COLORS.white,
        },

        warning: {
            50:   COLORS.warning[50],
            100:  COLORS.warning[100],
            main: COLORS.warning[700], // #B45309
            dark: COLORS.warning[800],
            contrastText: COLORS.white,
        },

        success: {
            50:   COLORS.success[50],
            100:  COLORS.success[100],
            main: COLORS.success[700], // #15803D
            dark: COLORS.success[800],
            contrastText: COLORS.white,
        },

        info: {
            main:  COLORS.primary[600],  // #0284C7
            dark:  COLORS.primary[700],
            light: COLORS.primary[400],
            contrastText: COLORS.white,
        },

        background: {
            default: "#F0F4F8", // Cool blue-grey canvas — not pure white, not warm grey
            paper:   COLORS.white,
        },

        text: {
            primary:   COLORS.neutral[900],  // #0C1929 — rich near-black
            secondary: COLORS.neutral[500],  // #64748B — readable muted
            disabled:  COLORS.neutral[400],  // #94A3B8
        },

        divider: COLORS.neutral[200], // #E2E8F0 — borders and separators

        // Sidebar tokens — dark panel for clear visual hierarchy
        custom: {
            sidebarBg:          "#0B1426", // Deep navy — water depth
            sidebarText:        COLORS.neutral[400],
            sidebarTextActive:  COLORS.white,
            sidebarTextHover:   COLORS.neutral[200],
            sidebarActiveBg:    alpha(COLORS.primary[500], 0.12),
            sidebarActiveBorder: COLORS.primary[500],
        },

        // Chart series colors — always use water domain axis
        chart: {
            primary:    COLORS.primary[700],
            secondary:  COLORS.secondary[600],
            areaFill:   alpha(COLORS.primary[500], 0.12),
            reference:  COLORS.neutral[400],
            success:    COLORS.success[700],
            warning:    COLORS.warning[700],
            error:      COLORS.error[700],
        },
    },

    // ─── TYPOGRAPHY ───────────────────────────────────────────────────────────
    typography: {
        fontFamily: FONT_FAMILY.sans,

        // Display — landing page hero only
        h1: {
            fontFamily:  FONT_FAMILY.sans,
            fontWeight:  FONT_WEIGHT.bold,
            fontSize:    FONT_SIZE["5xl"],   // 32px
            lineHeight:  LINE_HEIGHT.tight,
            letterSpacing: "-0.5px",
        },
        h2: {
            fontFamily:  FONT_FAMILY.sans,
            fontWeight:  FONT_WEIGHT.bold,
            fontSize:    FONT_SIZE["4xl"],   // 28px
            lineHeight:  LINE_HEIGHT.tight,
            letterSpacing: "-0.3px",
        },
        // Page title
        h3: {
            fontFamily:  FONT_FAMILY.sans,
            fontWeight:  FONT_WEIGHT.bold,
            fontSize:    FONT_SIZE["3xl"],   // 24px
            lineHeight:  LINE_HEIGHT.snug,
        },
        // Section heading / card title
        h4: {
            fontFamily:  FONT_FAMILY.sans,
            fontWeight:  FONT_WEIGHT.semiBold,
            fontSize:    FONT_SIZE["2xl"],   // 20px
            lineHeight:  LINE_HEIGHT.snug,
        },
        // PageHeader title
        h5: {
            fontFamily:  FONT_FAMILY.sans,
            fontWeight:  FONT_WEIGHT.bold,
            fontSize:    FONT_SIZE.xl,       // 18px
            lineHeight:  LINE_HEIGHT.normal,
        },
        // Sub-section heading
        h6: {
            fontFamily:  FONT_FAMILY.sans,
            fontWeight:  FONT_WEIGHT.semiBold,
            fontSize:    FONT_SIZE.lg,       // 16px
            lineHeight:  LINE_HEIGHT.normal,
        },
        // Standard body text
        body1: {
            fontFamily:  FONT_FAMILY.sans,
            fontWeight:  FONT_WEIGHT.regular,
            fontSize:    FONT_SIZE.lg,       // 16px
            lineHeight:  LINE_HEIGHT.relaxed,
        },
        // Table cells, labels, secondary body
        body2: {
            fontFamily:  FONT_FAMILY.sans,
            fontWeight:  FONT_WEIGHT.regular,
            fontSize:    FONT_SIZE.md,       // 14px
            lineHeight:  LINE_HEIGHT.normal,
        },
        // Captions, timestamps, helper text
        caption: {
            fontFamily:  FONT_FAMILY.sans,
            fontWeight:  FONT_WEIGHT.medium,
            fontSize:    FONT_SIZE.xs,       // 12px
            lineHeight:  LINE_HEIGHT.normal,
        },
        // Overline labels (e.g., "TOTAL REVENUE" above KPI value)
        overline: {
            fontFamily:   FONT_FAMILY.sans,
            fontWeight:   FONT_WEIGHT.semiBold,
            fontSize:     FONT_SIZE["2xs"],  // 11px
            lineHeight:   LINE_HEIGHT.snug,
            letterSpacing: "0.8px",
            textTransform: "uppercase",
        },
        // All buttons: no allcaps, medium weight
        button: {
            fontFamily:    FONT_FAMILY.sans,
            fontWeight:    FONT_WEIGHT.semiBold,
            fontSize:      FONT_SIZE.md,     // 14px
            textTransform: "none",
            letterSpacing: "0",
        },
    },

    // ─── SHAPE ────────────────────────────────────────────────────────────────
    shape: {
        borderRadius: 8, // MUI base unit → cards, inputs default to 8px
    },

    // ─── COMPONENT OVERRIDES ──────────────────────────────────────────────────
    components: {

        // ── CSS BASELINE ─────────────────────────────────────────────────────
        MuiCssBaseline: {
            styleOverrides: {
                "*, *::before, *::after": {
                    boxSizing: "border-box",
                },
                html: {
                    scrollBehavior: "smooth",
                    WebkitFontSmoothing: "antialiased",
                    MozOsxFontSmoothing: "grayscale",
                },
                body: {
                    backgroundColor: "#F0F4F8",
                    color:           COLORS.neutral[900],
                    minHeight:       "100vh",
                    fontFamily:      FONT_FAMILY.sans,
                },
                // Custom scrollbar — neutral, thin, non-intrusive
                "::-webkit-scrollbar": {
                    width:  "6px",
                    height: "6px",
                },
                "::-webkit-scrollbar-track": {
                    background: COLORS.neutral[100],
                },
                "::-webkit-scrollbar-thumb": {
                    background:   COLORS.neutral[300],
                    borderRadius: RADIUS.full,
                },
                "::-webkit-scrollbar-thumb:hover": {
                    background: COLORS.neutral[400],
                },
                // Monospace elements — meter numbers, bill numbers, IDs
                "code, kbd, pre, .mono": {
                    fontFamily: FONT_FAMILY.mono,
                },
            },
        },

        // ── BUTTON ───────────────────────────────────────────────────────────
        MuiButton: {
            defaultProps: {
                disableElevation: true,
            },
            styleOverrides: {
                root: {
                    borderRadius:  RADIUS.sm,     // 6px — not too round, not sharp
                    padding:       "7px 16px",
                    fontSize:      FONT_SIZE.md,  // 14px
                    fontWeight:    FONT_WEIGHT.semiBold,
                    lineHeight:    1.5,
                    transition:    TRANSITION.fast,
                    letterSpacing: "0",
                    // NO translateY — vertical movement is a consumer/gaming pattern
                    "&:hover": {
                        transform: "none",
                    },
                    "&:active": {
                        transform: "scale(0.98)",
                    },
                    "&.Mui-disabled": {
                        opacity: 0.45,
                    },
                },
                // contained variant: solid fill
                contained: {
                    "&:hover": {
                        boxShadow: SHADOW.sm,
                    },
                },
                // outlined variant: border, transparent background
                outlined: {
                    borderWidth: "1.5px",
                    "&:hover": {
                        borderWidth: "1.5px",
                    },
                },
                // small size
                sizeSmall: {
                    padding:   "5px 12px",
                    fontSize:  FONT_SIZE.xs,  // 12px
                    borderRadius: RADIUS.xs,  // 4px
                },
                // large size
                sizeLarge: {
                    padding:  "10px 24px",
                    fontSize: FONT_SIZE.lg,   // 16px
                },
            },
        },

        // ── ICON BUTTON ──────────────────────────────────────────────────────
        MuiIconButton: {
            styleOverrides: {
                root: {
                    borderRadius:  RADIUS.sm,   // 6px — square-ish, not circular
                    transition:    TRANSITION.fast,
                    "&:hover": {
                        backgroundColor: alpha(COLORS.primary[700], 0.06),
                    },
                    "&:active": {
                        backgroundColor: alpha(COLORS.primary[700], 0.10),
                        transform: "scale(0.95)",
                    },
                },
            },
        },

        // ── CARD ─────────────────────────────────────────────────────────────
        MuiCard: {
            defaultProps: {
                elevation: 0,
            },
            styleOverrides: {
                root: {
                    borderRadius:  RADIUS.md,          // 8px
                    border:        `1px solid ${COLORS.neutral[200]}`,
                    boxShadow:     SHADOW.sm,
                    backgroundColor: COLORS.white,
                    transition:    `box-shadow ${TRANSITION.fast}`,
                    // Shadow step-up on hover — NOT translateY (see design system spec)
                    "&:hover": {
                        boxShadow: SHADOW.md,
                    },
                },
            },
        },

        // ── CARD CONTENT ─────────────────────────────────────────────────────
        MuiCardContent: {
            styleOverrides: {
                root: {
                    padding: "20px 24px",
                    "&:last-child": {
                        paddingBottom: "20px",
                    },
                },
            },
        },

        // ── PAPER ────────────────────────────────────────────────────────────
        MuiPaper: {
            defaultProps: {
                elevation: 0,
            },
            styleOverrides: {
                root: {
                    borderRadius:  RADIUS.md,
                    border:        `1px solid ${COLORS.neutral[200]}`,
                    boxShadow:     SHADOW.sm,
                    backgroundImage: "none", // Prevent MUI gradient overlay
                },
                // Elevation overrides — consistent with our shadow scale
                elevation1: { boxShadow: SHADOW.sm },
                elevation2: { boxShadow: SHADOW.md },
                elevation3: { boxShadow: SHADOW.lg },
                elevation4: { boxShadow: SHADOW.xl },
            },
        },

        // ── TEXT FIELD ───────────────────────────────────────────────────────
        MuiTextField: {
            defaultProps: {
                size:    "small",
                variant: "outlined",
            },
        },

        // ── OUTLINED INPUT ───────────────────────────────────────────────────
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius:  RADIUS.sm,    // 6px
                    fontSize:      FONT_SIZE.md, // 14px
                    backgroundColor: COLORS.white,
                    transition:    `border-color ${TRANSITION.fast}, box-shadow ${TRANSITION.fast}`,
                    // Focus ring: brand primary with subtle glow
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: COLORS.primary[700],
                        borderWidth: "1.5px",
                    },
                    "&.Mui-focused": {
                        boxShadow: `0 0 0 3px ${alpha(COLORS.primary[700], 0.12)}`,
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: COLORS.neutral[400],
                    },
                },
                notchedOutline: {
                    borderColor: COLORS.neutral[300],
                },
                input: {
                    padding: "8px 12px",
                    "&::placeholder": {
                        color:   COLORS.neutral[400],
                        opacity: 1,
                    },
                },
            },
        },

        // ── INPUT LABEL ──────────────────────────────────────────────────────
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    fontSize:   FONT_SIZE.md,   // 14px
                    fontWeight: FONT_WEIGHT.medium,
                    color:      COLORS.neutral[500],
                    "&.Mui-focused": {
                        color: COLORS.primary[700],
                    },
                },
            },
        },

        // ── SELECT ───────────────────────────────────────────────────────────
        MuiSelect: {
            styleOverrides: {
                select: {
                    fontSize: FONT_SIZE.md,
                },
            },
        },

        // ── MENU / MENU ITEM ─────────────────────────────────────────────────
        MuiMenu: {
            styleOverrides: {
                paper: {
                    borderRadius:  RADIUS.md,
                    border:        `1px solid ${COLORS.neutral[200]}`,
                    boxShadow:     SHADOW.md,
                    minWidth:      "160px",
                },
            },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    fontSize:   FONT_SIZE.md,
                    fontWeight: FONT_WEIGHT.regular,
                    padding:    "8px 16px",
                    borderRadius: RADIUS.xs,
                    margin:     "0 4px",
                    "&:hover": {
                        backgroundColor: alpha(COLORS.primary[700], 0.06),
                    },
                    "&.Mui-selected": {
                        backgroundColor: alpha(COLORS.primary[700], 0.08),
                        fontWeight:      FONT_WEIGHT.medium,
                        "&:hover": {
                            backgroundColor: alpha(COLORS.primary[700], 0.12),
                        },
                    },
                },
            },
        },

        // ── CHIP / BADGE ─────────────────────────────────────────────────────
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius:  RADIUS.xs,          // 4px — not a pill, not a square
                    fontFamily:    FONT_FAMILY.sans,
                    fontWeight:    FONT_WEIGHT.semiBold,
                    fontSize:      FONT_SIZE.xs,       // 12px
                    letterSpacing: "0.3px",
                    height:        "22px",
                    textTransform: "uppercase",
                },
                label: {
                    padding: "0 8px",
                },
                sizeSmall: {
                    height:   "20px",
                    fontSize: FONT_SIZE["2xs"],       // 11px
                },
            },
        },

        // ── DIALOG ───────────────────────────────────────────────────────────
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius:  RADIUS.lg,   // 12px
                    border:        `1px solid ${COLORS.neutral[200]}`,
                    boxShadow:     SHADOW.xl,
                    backgroundImage: "none",
                },
            },
        },
        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    fontSize:    FONT_SIZE.lg,       // 16px
                    fontWeight:  FONT_WEIGHT.semiBold,
                    padding:     "20px 24px 16px",
                    borderBottom: `1px solid ${COLORS.neutral[200]}`,
                },
            },
        },
        MuiDialogContent: {
            styleOverrides: {
                root: {
                    padding: "20px 24px",
                },
            },
        },
        MuiDialogActions: {
            styleOverrides: {
                root: {
                    padding:    "16px 24px",
                    borderTop:  `1px solid ${COLORS.neutral[200]}`,
                    gap:        "8px",
                },
            },
        },

        // ── DATA GRID ────────────────────────────────────────────────────────
        MuiDataGrid: {
            defaultProps: {
                rowHeight:   52,
                columnHeaderHeight: 48,
                disableRowSelectionOnClick: true,
            },
            styleOverrides: {
                root: {
                    border:          "none",
                    borderRadius:    RADIUS.md,
                    overflow:        "hidden",
                    backgroundColor: COLORS.white,
                    boxShadow:       SHADOW.sm,
                    border:          `1px solid ${COLORS.neutral[200]}`,
                    fontFamily:      FONT_FAMILY.sans,
                    fontSize:        FONT_SIZE.md,  // 14px

                    // Column header row
                    "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: "#F0F4F8", // matches background.default
                        borderBottom:    `1px solid ${COLORS.neutral[200]}`,
                        minHeight:       "48px !important",
                        maxHeight:       "48px !important",
                    },
                    "& .MuiDataGrid-columnHeader": {
                        padding: "0 16px",
                    },
                    "& .MuiDataGrid-columnHeaderTitle": {
                        fontWeight:    FONT_WEIGHT.semiBold,
                        fontSize:      FONT_SIZE.xs,    // 12px
                        color:         COLORS.neutral[500],
                        letterSpacing: "0.5px",
                        textTransform: "uppercase",
                    },
                    // Remove default cell focus outline
                    "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
                        outline: "none",
                    },
                    "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within": {
                        outline: "none",
                    },
                    // Row styling
                    "& .MuiDataGrid-row": {
                        borderBottom: `1px solid ${COLORS.neutral[100]}`,
                        transition:   `background-color ${TRANSITION.instant}`,
                    },
                    "& .MuiDataGrid-row:hover": {
                        backgroundColor: COLORS.neutral[50],  // #F8FAFC — very subtle
                    },
                    "& .MuiDataGrid-row.Mui-selected": {
                        backgroundColor: alpha(COLORS.primary[700], 0.06),
                        "&:hover": {
                            backgroundColor: alpha(COLORS.primary[700], 0.09),
                        },
                    },
                    // Cell padding
                    "& .MuiDataGrid-cell": {
                        padding:     "0 16px",
                        borderBottom: "none",
                        color:        COLORS.neutral[900],
                        fontSize:     FONT_SIZE.md,
                    },
                    // Footer / pagination
                    "& .MuiDataGrid-footerContainer": {
                        borderTop:       `1px solid ${COLORS.neutral[200]}`,
                        backgroundColor: COLORS.white,
                        minHeight:       "48px",
                    },
                    // Checkbox column
                    "& .MuiDataGrid-checkboxInput": {
                        color: COLORS.neutral[400],
                        "&.Mui-checked": {
                            color: COLORS.primary[700],
                        },
                    },
                    // Remove border on virtual scroller
                    "& .MuiDataGrid-virtualScroller": {
                        backgroundColor: COLORS.white,
                    },
                },
            },
        },

        // ── TOOLTIP ──────────────────────────────────────────────────────────
        MuiTooltip: {
            defaultProps: {
                enterDelay:  400,
                arrow:       true,
            },
            styleOverrides: {
                tooltip: {
                    backgroundColor: COLORS.neutral[800],
                    color:           COLORS.white,
                    fontSize:        FONT_SIZE.xs,    // 12px
                    fontWeight:      FONT_WEIGHT.medium,
                    borderRadius:    RADIUS.xs,
                    padding:         "6px 10px",
                    maxWidth:        "240px",
                },
                arrow: {
                    color: COLORS.neutral[800],
                },
            },
        },

        // ── SNACKBAR / ALERT ─────────────────────────────────────────────────
        MuiSnackbar: {
            defaultProps: {
                anchorOrigin: { vertical: "bottom", horizontal: "right" },
                autoHideDuration: 4000,
            },
        },
        MuiAlert: {
            defaultProps: {
                variant: "filled",
            },
            styleOverrides: {
                root: {
                    borderRadius:  RADIUS.sm,
                    fontFamily:    FONT_FAMILY.sans,
                    fontSize:      FONT_SIZE.md,
                    fontWeight:    FONT_WEIGHT.medium,
                    alignItems:    "center",
                },
                filled: {
                    boxShadow: SHADOW.md,
                },
            },
        },

        // ── DIVIDER ──────────────────────────────────────────────────────────
        MuiDivider: {
            styleOverrides: {
                root: {
                    borderColor: COLORS.neutral[200],
                },
            },
        },

        // ── TABLE (non-DataGrid) ──────────────────────────────────────────────
        MuiTableHead: {
            styleOverrides: {
                root: {
                    backgroundColor: "#F0F4F8",
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    fontWeight:    FONT_WEIGHT.semiBold,
                    fontSize:      FONT_SIZE.xs,   // 12px
                    color:         COLORS.neutral[500],
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    borderBottom:  `1px solid ${COLORS.neutral[200]}`,
                    padding:       "12px 16px",
                },
                body: {
                    fontSize:     FONT_SIZE.md,   // 14px
                    color:        COLORS.neutral[900],
                    borderBottom: `1px solid ${COLORS.neutral[100]}`,
                    padding:      "14px 16px",
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    transition: `background-color ${TRANSITION.instant}`,
                    "&:hover": {
                        backgroundColor: COLORS.neutral[50],
                    },
                    "&.Mui-selected": {
                        backgroundColor: alpha(COLORS.primary[700], 0.06),
                    },
                    "&:last-child td": {
                        borderBottom: "none",
                    },
                },
            },
        },

        // ── AVATAR ───────────────────────────────────────────────────────────
        MuiAvatar: {
            styleOverrides: {
                root: {
                    fontFamily: FONT_FAMILY.sans,
                    fontWeight: FONT_WEIGHT.semiBold,
                    fontSize:   FONT_SIZE.md,
                },
            },
        },

        // ── LINEAR PROGRESS ──────────────────────────────────────────────────
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    borderRadius: RADIUS.full,
                    height:       "6px",
                    backgroundColor: COLORS.neutral[100],
                },
                bar: {
                    borderRadius: RADIUS.full,
                },
            },
        },

        // ── TABS ─────────────────────────────────────────────────────────────
        MuiTabs: {
            styleOverrides: {
                root: {
                    borderBottom: `1px solid ${COLORS.neutral[200]}`,
                    minHeight:    "44px",
                },
                indicator: {
                    height:          "2px",
                    borderRadius:    `${RADIUS.full} ${RADIUS.full} 0 0`,
                    backgroundColor: COLORS.primary[700],
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    fontFamily:    FONT_FAMILY.sans,
                    fontWeight:    FONT_WEIGHT.medium,
                    fontSize:      FONT_SIZE.md,
                    textTransform: "none",
                    letterSpacing: "0",
                    minHeight:     "44px",
                    padding:       "8px 16px",
                    color:         COLORS.neutral[500],
                    "&.Mui-selected": {
                        fontWeight: FONT_WEIGHT.semiBold,
                        color:      COLORS.primary[700],
                    },
                },
            },
        },

        // ── FORM CONTROL / HELPER TEXT ───────────────────────────────────────
        MuiFormHelperText: {
            styleOverrides: {
                root: {
                    fontSize:   FONT_SIZE.xs,
                    marginTop:  "4px",
                    marginLeft: "0",
                },
            },
        },

        // ── SKELETON ─────────────────────────────────────────────────────────
        MuiSkeleton: {
            defaultProps: {
                animation: "wave",
            },
            styleOverrides: {
                root: {
                    borderRadius:    RADIUS.xs,
                    backgroundColor: COLORS.neutral[100],
                    "&::after": {
                        background: `linear-gradient(90deg, transparent, ${alpha(COLORS.white, 0.5)}, transparent)`,
                    },
                },
                rounded: {
                    borderRadius: RADIUS.md,
                },
            },
        },

        // ── ACCORDION ────────────────────────────────────────────────────────
        MuiAccordion: {
            defaultProps: {
                elevation: 0,
            },
            styleOverrides: {
                root: {
                    border:        `1px solid ${COLORS.neutral[200]}`,
                    borderRadius:  `${RADIUS.md} !important`,
                    marginBottom:  "8px",
                    "&:before":    { display: "none" },
                    "&.Mui-expanded": {
                        boxShadow: SHADOW.sm,
                    },
                },
            },
        },
        MuiAccordionSummary: {
            styleOverrides: {
                root: {
                    fontWeight: FONT_WEIGHT.medium,
                    fontSize:   FONT_SIZE.md,
                    minHeight:  "48px",
                    "&.Mui-expanded": {
                        minHeight:   "48px",
                        borderBottom: `1px solid ${COLORS.neutral[200]}`,
                    },
                },
                content: {
                    margin: "12px 0",
                    "&.Mui-expanded": { margin: "12px 0" },
                },
            },
        },

        // ── BREADCRUMBS ──────────────────────────────────────────────────────
        MuiBreadcrumbs: {
            styleOverrides: {
                root: {
                    fontSize: FONT_SIZE.md,
                    color:    COLORS.neutral[500],
                },
                separator: {
                    color: COLORS.neutral[300],
                },
            },
        },
    },
});

export default theme;