import { createTheme } from "@mui/material/styles";
import { TOKENS } from "./tokens";

const theme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#2563EB", // Slate Blue
            light: "#60A5FA",
            dark: "#1D4ED8",
            contrastText: "#FFFFFF"
        },
        secondary: {
            main: "#0D9488", // Teal
            light: "#2DD4BF",
            dark: "#0F766E",
            contrastText: "#FFFFFF"
        },
        error: {
            main: "#EF4444", // Rose/Red
            light: "#FCA5A5",
            dark: "#B91C1C"
        },
        warning: {
            main: "#F59E0B", // Amber
            light: "#FDE047",
            dark: "#B45309"
        },
        success: {
            main: "#10B981", // Emerald
            light: "#6EE7B7",
            dark: "#047857"
        },
        info: {
            main: "#3B82F6", // Blue
            light: "#93C5FD",
            dark: "#1D4ED8"
        },
        background: {
            default: "#F8FAFC", // Light Gray Canvas
            paper: "#FFFFFF"
        },
        text: {
            primary: "#0F172A", // Deep Charcoal
            secondary: "#475569", // Muted Gray
            disabled: "#94A3B8"
        },
        divider: "#E2E8F0", // Border color
        custom: {
            sidebarBg: "#0B0F19", // Deep Charcoal Black
            sidebarText: "#94A3B8",
            sidebarTextActive: "#FFFFFF",
            sidebarTextHover: "#E2E8F0",
            cardHoverShadow: TOKENS.shadow.lg
        }
    },
    typography: {
        fontFamily: "'Inter', 'Poppins', sans-serif",
        h1: {
            fontFamily: "'Outfit', 'Poppins', sans-serif",
            fontWeight: TOKENS.fontWeights.bold,
            fontSize: TOKENS.fontSizes.h1,
            lineHeight: 1.2
        },
        h2: {
            fontFamily: "'Outfit', 'Poppins', sans-serif",
            fontWeight: TOKENS.fontWeights.semiBold,
            fontSize: TOKENS.fontSizes.h2,
            lineHeight: 1.3
        },
        h3: {
            fontFamily: "'Outfit', 'Poppins', sans-serif",
            fontWeight: TOKENS.fontWeights.medium,
            fontSize: TOKENS.fontSizes.h3,
            lineHeight: 1.4
        },
        h4: {
            fontFamily: "'Outfit', 'Poppins', sans-serif",
            fontWeight: TOKENS.fontWeights.medium,
            fontSize: TOKENS.fontSizes.xl,
            lineHeight: 1.4
        },
        body1: {
            fontSize: TOKENS.fontSizes.md,
            lineHeight: 1.5
        },
        body2: {
            fontSize: TOKENS.fontSizes.sm,
            lineHeight: 1.4
        },
        caption: {
            fontSize: TOKENS.fontSizes.xs,
            lineHeight: 1.3
        },
        button: {
            textTransform: "none",
            fontWeight: TOKENS.fontWeights.semiBold,
            fontSize: TOKENS.fontSizes.sm
        }
    },
    shape: {
        borderRadius: 8
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                html: {
                    scrollBehavior: "smooth"
                },
                body: {
                    backgroundColor: "#F8FAFC",
                    color: "#0F172A",
                    minHeight: "100vh"
                },
                "::-webkit-scrollbar": {
                    width: "8px",
                    height: "8px"
                },
                "::-webkit-scrollbar-track": {
                    background: "#F1F5F9"
                },
                "::-webkit-scrollbar-thumb": {
                    background: "#CBD5E1",
                    borderRadius: "4px"
                },
                "::-webkit-scrollbar-thumb:hover": {
                    background: "#94A3B8"
                }
            }
        },
        MuiButton: {
            defaultProps: {
                disableElevation: true
            },
            styleOverrides: {
                root: {
                    borderRadius: TOKENS.radius.md,
                    padding: "8px 16px",
                    transition: TOKENS.transition.fast,
                    "&:hover": {
                        transform: "translateY(-1px)"
                    }
                }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: TOKENS.radius.lg,
                    boxShadow: TOKENS.shadow.sm,
                    border: "1px solid #E2E8F0",
                    transition: TOKENS.transition.normal,
                    "&:hover": {
                        boxShadow: TOKENS.shadow.md,
                        transform: "translateY(-2px)"
                    }
                }
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: TOKENS.radius.lg
                }
            }
        },
        MuiTextField: {
            defaultProps: {
                size: "small",
                variant: "outlined"
            }
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: TOKENS.radius.md,
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderWidth: "2px"
                    }
                }
            }
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: TOKENS.fontWeights.medium,
                    borderRadius: TOKENS.radius.sm
                }
            }
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: TOKENS.radius.lg,
                    boxShadow: TOKENS.shadow.xl
                }
            }
        },
        MuiDataGrid: {
            styleOverrides: {
                root: {
                    border: "none",
                    borderRadius: TOKENS.radius.lg,
                    overflow: "hidden",
                    backgroundColor: "#FFFFFF",
                    boxShadow: TOKENS.shadow.sm,
                    "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: "#F1F5F9",
                        borderBottom: "1px solid #E2E8F0"
                    },
                    "& .MuiDataGrid-row:hover": {
                        backgroundColor: "#F8FAFC"
                    },
                    "& .MuiDataGrid-cell": {
                        borderBottom: "1px solid #F1F5F9"
                    }
                }
            }
        }
    }
});

export default theme;