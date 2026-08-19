import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
    Box,
    Button,
    Menu,
    MenuItem,
    Typography,
    Divider,
    TextField,
    InputAdornment,
    ListSubheader,
    ListItemIcon,
    Tooltip,
    useTheme,
    alpha
} from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import SearchIcon from "@mui/icons-material/Search";
import CheckIcon from "@mui/icons-material/Check";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// Language Data with ISO codes and flag emojis
export const LANGUAGES = [
    // ⭐ Recommended
    { code: "en", name: "English (Recommended)", group: "RECOMMENDED", flag: "🇺🇸" },

    // 🇮🇳 Indian Languages
    { code: "hi", name: "Hindi (हिन्दी)", group: "INDIAN", flag: "🇮🇳" },
    { code: "bn", name: "Bengali (বাংলা)", group: "INDIAN", flag: "🇮🇳" },
    { code: "te", name: "Telugu (తెలుగు)", group: "INDIAN", flag: "🇮🇳" },
    { code: "mr", name: "Marathi (मराठी)", group: "INDIAN", flag: "🇮🇳" },
    { code: "ta", name: "Tamil (தமிழ்)", group: "INDIAN", flag: "🇮🇳" },
    { code: "ur", name: "Urdu (اردو)", group: "INDIAN", flag: "🇮🇳" },
    { code: "gu", name: "Gujarati (ગુજરાતી)", group: "INDIAN", flag: "🇮🇳" },
    { code: "kn", name: "Kannada (கன்னட)", group: "INDIAN", flag: "🇮🇳" },
    { code: "ml", name: "Malayalam (മലയാളം)", group: "INDIAN", flag: "🇮🇳" },
    { code: "pa", name: "Punjabi (ਪੰਜਾਬੀ)", group: "INDIAN", flag: "🇮🇳" },
    { code: "or", name: "Odia (ଓଡ଼ିଆ)", group: "INDIAN", flag: "🇮🇳" },
    { code: "as", name: "Assamese (অসমীয়া)", group: "INDIAN", flag: "🇮🇳" },

    // 🌍 Global Languages
    { code: "es", name: "Spanish (Español)", group: "GLOBAL", flag: "🇪🇸" },
    { code: "fr", name: "French (Français)", group: "GLOBAL", flag: "🇫🇷" },
    { code: "de", name: "German (Deutsch)", group: "GLOBAL", flag: "🇩🇪" },
    { code: "it", name: "Italian (Italiano)", group: "GLOBAL", flag: "🇮🇹" },
    { code: "pt", name: "Portuguese (Português)", group: "GLOBAL", flag: "🇵🇹" },
    { code: "ru", name: "Russian (Русский)", group: "GLOBAL", flag: "🇷🇺" },
    { code: "ja", name: "Japanese (日本語)", group: "GLOBAL", flag: "🇯🇵" },
    { code: "ko", name: "Korean (한국어)", group: "GLOBAL", flag: "🇰🇷" },
    { code: "zh-CN", name: "Chinese (Simplified)", group: "GLOBAL", flag: "🇨🇳" },
    { code: "ar", name: "Arabic (العربية)", group: "GLOBAL", flag: "🇸🇦" },
    { code: "tr", name: "Turkish (Türkçe)", group: "GLOBAL", flag: "🇹🇷" },
    { code: "nl", name: "Dutch (Nederlands)", group: "GLOBAL", flag: "🇳🇱" },
    { code: "pl", name: "Polish (Polski)", group: "GLOBAL", flag: "🇵🇱" },
    { code: "id", name: "Indonesian (Bahasa)", group: "GLOBAL", flag: "🇮🇩" },
    { code: "vi", name: "Vietnamese (Tiếng Việt)", group: "GLOBAL", flag: "🇻🇳" },
    { code: "th", name: "Thai (ไทย)", group: "GLOBAL", flag: "🇹🇭" },
];

const STORAGE_KEY = "hydrosync_selected_lang";

export function setGoogleTranslateLanguage(langCode) {
    localStorage.setItem(STORAGE_KEY, langCode);

    // Set googtrans cookie
    const hostname = window.location.hostname;
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=${hostname}`;
    document.cookie = `googtrans=/en/${langCode}; path=/;`;

    // 1. Check if simple combo element exists
    const selectElem = document.querySelector(".goog-te-combo");
    if (selectElem) {
        selectElem.value = langCode;
        selectElem.dispatchEvent(new Event("change"));
        return;
    }

    // 2. Target Google Translate iframe popup options
    const iframe = document.querySelector("iframe.VIpgJd-ZVi9od-xl07Ob-OEVmcd") || document.querySelector("iframe.goog-te-menu-frame");
    if (iframe) {
        try {
            const doc = iframe.contentDocument || iframe.contentWindow.document;
            const targetLangObj = LANGUAGES.find(l => l.code === langCode);
            if (targetLangObj) {
                const searchName = targetLangObj.name.split(" ")[0]; // e.g. "Hindi", "Spanish"
                const spanList = Array.from(doc.querySelectorAll("span, a"));
                const match = spanList.find(s => s.innerText.trim().toLowerCase() === searchName.toLowerCase());
                if (match) {
                    match.click();
                    return;
                }
            }
        } catch (e) {}
    }

    // 3. Fallback: reload page so Google Translate reads the updated googtrans cookie
    window.location.reload();
}

function getActiveLanguageCode() {
    // Priority: 1. googtrans cookie, 2. localStorage, 3. fallback "en"
    try {
        const cookies = document.cookie.split(";");
        const googtransCookie = cookies.find(c => c.trim().startsWith("googtrans="));
        if (googtransCookie) {
            const val = googtransCookie.split("=")[1]; // e.g. /en/hi
            if (val) {
                const parts = val.split("/");
                const code = parts[parts.length - 1];
                if (code && code !== "null" && code !== "undefined") {
                    return code;
                }
            }
        }
    } catch (e) {}

    return localStorage.getItem(STORAGE_KEY) || "en";
}

export default function LanguageSelector({ variant = "navbar", isDark = false }) {
    const theme = useTheme();
    const location = useLocation();
    const isPublicPage = !(
        location.pathname.startsWith("/main-admin") ||
        location.pathname.startsWith("/community-admin") ||
        location.pathname.startsWith("/resident") ||
        location.pathname.startsWith("/chatbot")
    );
    const [anchorEl, setAnchorEl] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCode, setSelectedCode] = useState(() => getActiveLanguageCode());

    const isDarkMode = isDark || variant === "dark";

    // Keep selectedCode strictly synced with cookie / localStorage on mount & focus
    useEffect(() => {
        const syncActiveLang = () => {
            const activeCode = getActiveLanguageCode();
            setSelectedCode(activeCode);
        };

        syncActiveLang();
        window.addEventListener("focus", syncActiveLang);
        return () => window.removeEventListener("focus", syncActiveLang);
    }, []);

    const handleOpen = (e) => setAnchorEl(e.currentTarget);
    const handleClose = () => {
        setAnchorEl(null);
        setSearchQuery("");
    };

    const handleSelectLanguage = (code) => {
        setSelectedCode(code);
        setGoogleTranslateLanguage(code);
        handleClose();
    };

    const filterLangs = (langs) => {
        if (!searchQuery.trim()) return langs;
        const q = searchQuery.toLowerCase();
        return langs.filter((l) => l.name.toLowerCase().includes(q) || l.code.toLowerCase().includes(q));
    };

    const recommendedLangs = filterLangs(LANGUAGES.filter((l) => l.group === "RECOMMENDED"));
    const indianLangs = filterLangs(LANGUAGES.filter((l) => l.group === "INDIAN"));
    const globalLangs = filterLangs(LANGUAGES.filter((l) => l.group === "GLOBAL"));

    const selectedLangObj = LANGUAGES.find((l) => l.code === selectedCode) || LANGUAGES[0];

    const renderMenuItem = (lang) => {
        const isSelected = selectedCode === lang.code;
        return (
            <MenuItem
                key={lang.code}
                onClick={() => handleSelectLanguage(lang.code)}
                selected={isSelected}
                sx={{
                    borderRadius: 2,
                    py: 1,
                    px: 1.5,
                    fontSize: "0.8125rem",
                    fontWeight: isSelected ? 700 : 500,
                    bgcolor: isSelected
                        ? (isDarkMode ? "rgba(56, 189, 248, 0.2)" : alpha(isPublicPage ? "#0369A1" : theme.palette.primary.main, 0.1))
                        : "transparent",
                    color: isSelected
                        ? (isDarkMode ? "#38bdf8" : (isPublicPage ? "#0369A1" : "primary.main"))
                        : (isDarkMode ? "#f8fafc" : "text.primary"),
                    transition: "all 0.15s ease",
                    "&:hover": {
                        bgcolor: isSelected
                            ? (isDarkMode ? "rgba(56, 189, 248, 0.25)" : alpha(isPublicPage ? "#0369A1" : theme.palette.primary.main, 0.15))
                            : (isDarkMode ? "rgba(255, 255, 255, 0.08)" : alpha(isPublicPage ? "#0369A1" : theme.palette.primary.main, 0.05)),
                    },
                }}
            >
                <ListItemIcon sx={{ minWidth: 32, fontSize: "1.1rem" }}>{lang.flag}</ListItemIcon>
                <Box sx={{ flexGrow: 1 }}>{lang.name}</Box>
                {isSelected && <CheckIcon color={isDarkMode ? "info" : (isPublicPage ? undefined : "primary")} sx={{ fontSize: "1.1rem", ml: 1, color: isDarkMode ? "#38bdf8" : (isPublicPage ? "#0369A1" : undefined) }} />}
            </MenuItem>
        );
    };

    return (
        <>
            <Tooltip title="Select Language" arrow>
                <Button
                    onClick={handleOpen}
                    variant="outlined"
                    size="small"
                    startIcon={<LanguageIcon sx={{ fontSize: "1.25rem !important", color: isDarkMode ? "#38bdf8 !important" : (isPublicPage ? "#0369A1 !important" : "primary.main") }} />}
                    endIcon={<ExpandMoreIcon sx={{ fontSize: "1rem !important", color: isDarkMode ? "rgba(255, 255, 255, 0.7) !important" : "text.secondary" }} />}
                    sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "0.8125rem",
                        color: isDarkMode ? "#ffffff" : "text.primary",
                        borderColor: isDarkMode ? "rgba(255, 255, 255, 0.2)" : "divider",
                        borderRadius: isDarkMode ? "9999px" : "8px",
                        px: 1.75,
                        py: 0.6,
                        minWidth: 130,
                        bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.08)" : "background.paper",
                        backdropFilter: isDarkMode ? "blur(8px)" : undefined,
                        WebkitBackdropFilter: isDarkMode ? "blur(8px)" : undefined,
                        boxShadow: isDarkMode ? "0 2px 8px rgba(0,0,0,0.3)" : "0 1px 2px rgba(0,0,0,0.04)",
                        "&:hover": {
                            bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.16)" : alpha(isPublicPage ? "#0369A1" : theme.palette.primary.main, 0.04),
                            borderColor: isDarkMode ? "rgba(255, 255, 255, 0.4)" : (isPublicPage ? "#0369A1" : "primary.main"),
                        },
                    }}
                >
                    <Box component="span" sx={{ mr: 0.75, fontSize: "1rem" }}>
                        {selectedLangObj.flag}
                    </Box>
                    {selectedLangObj.code === "en" ? "English" : selectedLangObj.name.split(" ")[0]}
                </Button>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                slotProps={{
                    paper: {
                        sx: {
                            width: 290,
                            maxHeight: 420,
                            borderRadius: 3,
                            boxShadow: isDarkMode ? "0 20px 40px rgba(0,0,0,0.6)" : "0 10px 30px rgba(0,0,0,0.12)",
                            mt: 1,
                            p: 1,
                            bgcolor: isDarkMode ? "#0f172a" : "background.paper",
                            color: isDarkMode ? "#ffffff" : "text.primary",
                            border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.15)" : undefined,
                        },
                    },
                }}
            >
                {/* Search Header */}
                <Box sx={{ p: 1, pb: 1.5 }}>
                    <TextField
                        size="small"
                        fullWidth
                        placeholder="Search language..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ fontSize: "1.1rem", color: "text.disabled" }} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.background.default, 0.6),
                                fontSize: "0.8125rem",
                            },
                        }}
                    />
                </Box>

                <Divider sx={{ mb: 1 }} />

                {/* Recommended Section */}
                {recommendedLangs.length > 0 && (
                    <ListSubheader
                        sx={{
                            bgcolor: "transparent",
                            fontWeight: 700,
                            fontSize: "0.7rem",
                            letterSpacing: 0.8,
                            color: "text.secondary",
                            lineHeight: "28px",
                        }}
                    >
                        ⭐ RECOMMENDED
                    </ListSubheader>
                )}
                {recommendedLangs.map(renderMenuItem)}

                {/* Indian Languages Section */}
                {indianLangs.length > 0 && (
                    <>
                        <ListSubheader
                            sx={{
                                bgcolor: "transparent",
                                fontWeight: 700,
                                fontSize: "0.7rem",
                                letterSpacing: 0.8,
                                color: "text.secondary",
                                lineHeight: "28px",
                                mt: 1,
                            }}
                        >
                            🇮🇳 INDIAN LANGUAGES
                        </ListSubheader>
                        {indianLangs.map(renderMenuItem)}
                    </>
                )}

                {/* Global Languages Section */}
                {globalLangs.length > 0 && (
                    <>
                        <ListSubheader
                            sx={{
                                bgcolor: "transparent",
                                fontWeight: 700,
                                fontSize: "0.7rem",
                                letterSpacing: 0.8,
                                color: "text.secondary",
                                lineHeight: "28px",
                                mt: 1,
                            }}
                        >
                            🌍 GLOBAL LANGUAGES
                        </ListSubheader>
                        {globalLangs.map(renderMenuItem)}
                    </>
                )}
            </Menu>
        </>
    );
}
