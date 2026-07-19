import React, { useState, useEffect } from "react";
import {
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Box,
    Collapse,
    useMediaQuery,
    useTheme,
    Tooltip,
    Typography,
    Divider
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { NAVIGATION_CONFIG } from "../../constants/navigation";
import { STORAGE_KEYS } from "../../constants/storageKeys";
import { storageHelper } from "../../helpers/storageHelper";

// Icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import ApartmentIcon from "@mui/icons-material/Apartment";
import DomainVerificationIcon from "@mui/icons-material/DomainVerification";
import PeopleIcon from "@mui/icons-material/People";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import TimelineIcon from "@mui/icons-material/Timeline";
import MailIcon from "@mui/icons-material/Mail";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import HomeIcon from "@mui/icons-material/Home";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PriceChangeIcon from "@mui/icons-material/PriceChange";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";

const iconMap = {
    DashboardIcon: <DashboardIcon fontSize="small" />,
    ApartmentIcon: <ApartmentIcon fontSize="small" />,
    DomainVerificationIcon: <DomainVerificationIcon fontSize="small" />,
    PeopleIcon: <PeopleIcon fontSize="small" />,
    WaterDropIcon: <WaterDropIcon fontSize="small" />,
    TimelineIcon: <TimelineIcon fontSize="small" />,
    MailIcon: <MailIcon fontSize="small" />,
    PersonIcon: <PersonIcon fontSize="small" />,
    SettingsIcon: <SettingsIcon fontSize="small" />,
    HomeIcon: <HomeIcon fontSize="small" />,
    ReceiptIcon: <ReceiptIcon fontSize="small" />,
    CalendarMonthIcon: <CalendarMonthIcon fontSize="small" />,
    PriceChangeIcon: <PriceChangeIcon fontSize="small" />,
};

const DRAWER_WIDTH = 264;
const COLLAPSED_WIDTH = 72;

// ─── Nav Item ──────────────────────────────────────────────────────────────────
const NavItem = ({ item, isCollapsed, isActive, level = 0 }) => {
    const theme = useTheme();
    const [open, setOpen] = useState(false);
    const hasChildren = item.children && item.children.length > 0;
    const location = useLocation();

    const handleClick = (e) => {
        if (hasChildren) {
            e.preventDefault();
            setOpen(!open);
        }
    };

    // Theme tokens for dark sidebar
    const sidebarText        = theme.palette.custom.sidebarText;
    const sidebarTextActive  = theme.palette.custom.sidebarTextActive;
    const sidebarTextHover   = theme.palette.custom.sidebarTextHover;
    const sidebarActiveBg    = theme.palette.custom.sidebarActiveBg;
    const sidebarActiveBorder = theme.palette.custom.sidebarActiveBorder;

    const buttonContent = (
        <ListItemButton
            component={hasChildren ? "div" : Link}
            to={hasChildren ? undefined : item.path}
            onClick={handleClick}
            disableRipple={false}
            sx={{
                minHeight: 40,
                justifyContent: isCollapsed ? "center" : "flex-start",
                px: isCollapsed ? 0 : 1.5,
                py: 0.875,
                mx: 1.25,
                mb: 0.5,
                borderRadius: "8px",
                position: "relative",
                overflow: "hidden",
                cursor: "pointer",
                color: isActive ? sidebarTextActive : sidebarText,
                backgroundColor: isActive ? sidebarActiveBg : "transparent",
                transition: "background-color 150ms ease, color 150ms ease",

                // Active left accent bar
                "&::before": isActive ? {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    height: "60%",
                    width: "3px",
                    borderRadius: "0 3px 3px 0",
                    backgroundColor: sidebarActiveBorder,
                } : {},

                "&:hover": {
                    backgroundColor: isActive
                        ? sidebarActiveBg
                        : "rgba(255, 255, 255, 0.06)",
                    color: isActive ? sidebarTextActive : sidebarTextHover,
                },

                "&:focus-visible": {
                    outline: `2px solid ${sidebarActiveBorder}`,
                    outlineOffset: "-2px",
                },

                ...(level > 0 && { pl: 1.5 + level * 2.5 }),
            }}
        >
            {/* Icon */}
            <ListItemIcon
                sx={{
                    minWidth: 0,
                    width: 20,
                    height: 20,
                    mr: isCollapsed ? 0 : 1.5,
                    justifyContent: "center",
                    alignItems: "center",
                    display: "flex",
                    flexShrink: 0,
                    color: "inherit",
                    "& .MuiSvgIcon-root": {
                        fontSize: "1.125rem",
                        transition: "color 150ms ease",
                    },
                }}
            >
                {iconMap[item.icon] || <DashboardIcon fontSize="small" />}
            </ListItemIcon>

            {/* Label */}
            {!isCollapsed && (
                <ListItemText
                    primary={item.label}
                    sx={{
                        m: 0,
                        "& .MuiTypography-root": {
                            fontWeight: isActive ? 600 : 400,
                            fontSize: "0.8125rem",
                            lineHeight: 1.4,
                            letterSpacing: "0.01em",
                            color: "inherit",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        },
                    }}
                />
            )}

            {/* Expand chevron */}
            {!isCollapsed && hasChildren && (
                open
                    ? <ExpandLess sx={{ fontSize: "1rem", color: sidebarText, ml: "auto", flexShrink: 0 }} />
                    : <ExpandMore sx={{ fontSize: "1rem", color: sidebarText, ml: "auto", flexShrink: 0 }} />
            )}
        </ListItemButton>
    );

    return (
        <Box>
            {isCollapsed ? (
                <Tooltip title={item.label} placement="right" arrow>
                    {buttonContent}
                </Tooltip>
            ) : (
                buttonContent
            )}

            {hasChildren && !isCollapsed && (
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        {item.children.map((child, idx) => (
                            <NavItem
                                key={idx}
                                item={child}
                                isCollapsed={isCollapsed}
                                isActive={location.pathname === child.path}
                                level={level + 1}
                            />
                        ))}
                    </List>
                </Collapse>
            )}
        </Box>
    );
};

// ─── Nav Section Label ─────────────────────────────────────────────────────────
const SectionLabel = ({ label, isCollapsed }) => {
    if (isCollapsed) {
        return (
            <Divider sx={{ mx: 1.5, my: 1, borderColor: "rgba(255,255,255,0.08)" }} />
        );
    }
    return (
        <Typography
            variant="overline"
            sx={{
                display: "block",
                px: 2.5,
                pt: 2,
                pb: 0.75,
                fontSize: "0.6875rem",
                fontWeight: 600,
                letterSpacing: "0.06em",
                color: "rgba(148, 163, 184, 0.6)",
                textTransform: "uppercase",
                userSelect: "none",
            }}
        >
            {label}
        </Typography>
    );
};

// ─── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ mobileOpen, onMobileClose }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const { user } = useAuth();
    const location = useLocation();

    const role = user?.role || "";
    const navItems = NAVIGATION_CONFIG[role] || [];

    // Persist collapse state in localStorage
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = storageHelper.getLocal(STORAGE_KEYS.SIDEBAR_COLLAPSED);
        return saved !== null ? saved : false;
    });

    useEffect(() => {
        storageHelper.setLocal(STORAGE_KEYS.SIDEBAR_COLLAPSED, isCollapsed);
    }, [isCollapsed]);

    const toggleCollapse = () => setIsCollapsed((prev) => !prev);

    const effectiveCollapsed = !isMobile && isCollapsed;
    const sidebarBg = theme.palette.custom.sidebarBg;

    // ─── Drawer Content ──────────────────────────────────────────────────────
    const drawerContent = (
        <Box
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                bgcolor: sidebarBg,
                overflow: "hidden",
            }}
        >
            {/* ── Logo / Brand Header ── */}
            <Box
                sx={{
                    height: 64,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: effectiveCollapsed ? "center" : "space-between",
                    px: effectiveCollapsed ? 1.5 : 2.5,
                    flexShrink: 0,
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
            >
                {(!effectiveCollapsed || isMobile) && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {/* Water drop mark */}
                        <Box
                            sx={{
                                width: 28,
                                height: 28,
                                borderRadius: "8px",
                                bgcolor: theme.palette.primary.main,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                            }}
                        >
                            <WaterDropIcon sx={{ fontSize: "1rem", color: "#fff" }} />
                        </Box>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 700,
                                fontSize: "0.9375rem",
                                letterSpacing: "-0.3px",
                                color: "#fff",
                                lineHeight: 1,
                            }}
                        >
                            HydroSync
                        </Typography>
                    </Box>
                )}

                {effectiveCollapsed && (
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "8px",
                            bgcolor: theme.palette.primary.main,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <WaterDropIcon sx={{ fontSize: "1.125rem", color: "#fff" }} />
                    </Box>
                )}

                {!isMobile && (
                    <Tooltip
                        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        placement="right"
                        arrow
                    >
                        <IconButton
                            onClick={toggleCollapse}
                            size="small"
                            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                            sx={{
                                color: "rgba(148, 163, 184, 0.7)",
                                borderRadius: "6px",
                                "&:hover": {
                                    bgcolor: "rgba(255,255,255,0.08)",
                                    color: "#fff",
                                },
                            }}
                        >
                            {isCollapsed ? (
                                <MenuIcon sx={{ fontSize: "1.125rem" }} />
                            ) : (
                                <MenuOpenIcon sx={{ fontSize: "1.125rem" }} />
                            )}
                        </IconButton>
                    </Tooltip>
                )}
            </Box>

            {/* ── Navigation List ── */}
            <Box
                sx={{
                    flexGrow: 1,
                    overflowY: "auto",
                    overflowX: "hidden",
                    py: 1.5,
                    // Custom scrollbar for dark sidebar
                    "&::-webkit-scrollbar": { width: "4px" },
                    "&::-webkit-scrollbar-track": { background: "transparent" },
                    "&::-webkit-scrollbar-thumb": {
                        background: "rgba(255,255,255,0.1)",
                        borderRadius: "9999px",
                    },
                    "&::-webkit-scrollbar-thumb:hover": {
                        background: "rgba(255,255,255,0.18)",
                    },
                }}
            >
                <List sx={{ pt: 0, pb: 0 }} disablePadding>
                    {navItems.map((item, index) => (
                        <NavItem
                            key={index}
                            item={item}
                            isCollapsed={effectiveCollapsed}
                            isActive={
                                location.pathname === item.path ||
                                (item.children &&
                                    item.children.some((c) => location.pathname === c.path))
                            }
                        />
                    ))}
                </List>
            </Box>

            {/* ── User Role Footer ── */}
            {!effectiveCollapsed && user && (
                <Box
                    sx={{
                        px: 2.5,
                        py: 1.5,
                        borderTop: "1px solid rgba(255,255,255,0.06)",
                        flexShrink: 0,
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{
                            display: "block",
                            fontSize: "0.6875rem",
                            fontWeight: 500,
                            color: "rgba(148, 163, 184, 0.5)",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            lineHeight: 1.2,
                        }}
                    >
                        Signed in as
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            mt: 0.25,
                            fontSize: "0.8125rem",
                            fontWeight: 500,
                            color: "rgba(226, 232, 240, 0.85)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {user.fullName || user.email || "User"}
                    </Typography>
                </Box>
            )}
        </Box>
    );

    // ─── Paper sx shared between mobile + desktop drawers ──────────────────
    const paperSx = {
        boxSizing: "border-box",
        bgcolor: sidebarBg,
        border: "none",
        backgroundImage: "none",
    };

    return (
        <Box
            component="nav"
            sx={{
                width: { md: effectiveCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH },
                flexShrink: { md: 0 },
                transition: theme.transitions.create("width", {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                }),
            }}
            aria-label="Main navigation"
        >
            {/* Mobile Temporary Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onMobileClose}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: "block", md: "none" },
                    "& .MuiDrawer-paper": {
                        ...paperSx,
                        width: DRAWER_WIDTH,
                        boxShadow: "4px 0 32px rgba(0,0,0,0.25)",
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Desktop Permanent Drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: "none", md: "block" },
                    "& .MuiDrawer-paper": {
                        ...paperSx,
                        width: effectiveCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
                        transition: theme.transitions.create("width", {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                        overflowX: "hidden",
                    },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
}

export default React.memo(Sidebar);