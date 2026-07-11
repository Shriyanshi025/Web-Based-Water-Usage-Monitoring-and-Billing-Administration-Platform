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
import { motion, AnimatePresence } from "framer-motion";

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
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";

const iconMap = {
    DashboardIcon: <DashboardIcon />,
    ApartmentIcon: <ApartmentIcon />,
    DomainVerificationIcon: <DomainVerificationIcon />,
    PeopleIcon: <PeopleIcon />,
    WaterDropIcon: <WaterDropIcon />,
    TimelineIcon: <TimelineIcon />,
    MailIcon: <MailIcon />,
    PersonIcon: <PersonIcon />,
    SettingsIcon: <SettingsIcon />
};

const drawerWidth = 280;
const collapsedWidth = 88;

const NavItem = ({ item, isCollapsed, isActive, level = 0 }) => {
    const theme = useTheme();
    const [open, setOpen] = useState(false);
    const hasChildren = item.children && item.children.length > 0;

    const handleClick = (e) => {
        if (hasChildren) {
            e.preventDefault();
            setOpen(!open);
        }
    };

    const buttonContent = (
        <ListItemButton
            component={hasChildren ? "div" : Link}
            to={hasChildren ? undefined : item.path}
            onClick={handleClick}
            sx={{
                minHeight: 48,
                justifyContent: isCollapsed ? "center" : "initial",
                px: 2.5,
                py: 1.5,
                mx: 2,
                mb: 1,
                borderRadius: "12px",
                position: "relative",
                transition: "all 0.2s ease",
                "&:hover": {
                    bgcolor: "action.hover",
                },
                ...(isActive && {
                    bgcolor: `${theme.palette.primary.main}15`,
                    color: "primary.main",
                    "&:hover": {
                        bgcolor: `${theme.palette.primary.main}25`,
                    }
                }),
                pl: 2.5 + level * 2
            }}
        >
            {isActive && !isCollapsed && (
                <motion.div
                    layoutId="activeIndicator"
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                        position: "absolute",
                        left: -8,
                        top: "10%",
                        height: "80%",
                        width: 4,
                        backgroundColor: theme.palette.primary.main,
                        borderRadius: 4
                    }}
                />
            )}
            
            <ListItemIcon
                sx={{
                    minWidth: 0,
                    mr: isCollapsed ? 0 : 2,
                    justifyContent: "center",
                    color: isActive ? "primary.main" : "text.secondary",
                    transition: "all 0.2s ease",
                }}
            >
                {iconMap[item.icon] || <DashboardIcon />}
            </ListItemIcon>
            
            <ListItemText
                primary={item.label}
                sx={{
                    opacity: isCollapsed ? 0 : 1,
                    display: isCollapsed ? 'none' : 'block',
                    transition: "opacity 0.2s ease",
                    '& .MuiTypography-root': {
                        fontWeight: isActive ? 600 : 500,
                        fontSize: "0.95rem"
                    }
                }}
            />
            {!isCollapsed && hasChildren && (
                open ? <ExpandLess sx={{ color: 'text.secondary' }} /> : <ExpandMore sx={{ color: 'text.secondary' }} />
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


function Sidebar({ mobileOpen, onMobileClose }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const { user } = useAuth();
    const location = useLocation();
    
    const role = user?.roles?.[0] || "";
    const navItems = NAVIGATION_CONFIG[role] || [];

    // State for desktop collapsed mode, persistance via localStorage
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = storageHelper.getLocal(STORAGE_KEYS.SIDEBAR_COLLAPSED);
        return saved !== null ? saved : false;
    });

    useEffect(() => {
        storageHelper.setLocal(STORAGE_KEYS.SIDEBAR_COLLAPSED, isCollapsed);
    }, [isCollapsed]);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ 
                height: 72, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: isCollapsed ? 'center' : 'space-between',
                px: isCollapsed ? 1 : 3,
                borderBottom: '1px solid',
                borderColor: 'divider',
                mb: 2
            }}>
                {(!isCollapsed || isMobile) && (
                    <Typography variant="h6" fontWeight={800} color="primary" sx={{ letterSpacing: '-0.5px' }}>
                        HydroSync
                    </Typography>
                )}
                {!isMobile && (
                    <IconButton onClick={toggleCollapse} size="small" sx={{ color: 'text.secondary' }} aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
                        {isCollapsed ? <MenuIcon /> : <MenuOpenIcon />}
                    </IconButton>
                )}
            </Box>

            <Box sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden' }}>
                <List sx={{ pt: 0 }}>
                    <AnimatePresence>
                        {navItems.map((item, index) => (
                            <NavItem
                                key={index}
                                item={item}
                                isCollapsed={!isMobile && isCollapsed}
                                isActive={location.pathname === item.path || (item.children && item.children.some(c => location.pathname === c.path))}
                            />
                        ))}
                    </AnimatePresence>
                </List>
            </Box>
        </Box>
    );

    return (
        <Box
            component="nav"
            sx={{ 
                width: { md: isCollapsed ? collapsedWidth : drawerWidth }, 
                flexShrink: { md: 0 },
                transition: theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                }),
            }}
        >
            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onMobileClose}
                ModalProps={{ keepMounted: true }} // Better open performance on mobile.
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { 
                        boxSizing: 'border-box', 
                        width: drawerWidth,
                        borderRight: 'none',
                        boxShadow: '4px 0 24px rgba(0,0,0,0.05)'
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Desktop Permanent Drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': { 
                        boxSizing: 'border-box', 
                        width: isCollapsed ? collapsedWidth : drawerWidth,
                        transition: theme.transitions.create('width', {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
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