import React from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Avatar,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    Divider,
    Breadcrumbs,
    Link as MuiLink,
    Tooltip,
    Badge,
    InputBase,
    useTheme,
    Popover,
    List,
    ListItem,
    ListItemText,
    Button,
    Chip,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SearchIcon from "@mui/icons-material/Search";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";

function TopNavbar({ onMobileNavOpen }) {
    const theme = useTheme();
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // User menu state
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };
    const handleLogout = () => {
        handleMenuClose();
        logout();
    };

    // Notifications state
    const [anchorElNotifications, setAnchorElNotifications] = React.useState(null);
    const [notifications, setNotifications] = React.useState([]);
    const [unreadCount, setUnreadCount] = React.useState(0);

    const handleNotificationsClick = () => {
        let path = "/user/notifications";
        if (user?.role === "MAIN_ADMIN") {
            path = "/main-admin/notifications";
        } else if (user?.role === "COMMUNITY_ADMIN") {
            path = "/community-admin/notifications";
        }
        navigate(path);
    };

    const fetchNotifications = React.useCallback(async () => {
        if (!user) return;
        try {
            const res = await api.get("/alerts/my");
            const data = res.data.data || [];
            setNotifications(data);
            setUnreadCount(data.filter(n => n.status === "ACTIVE").length);
        } catch (e) {
            console.error("Failed to load notifications", e);
        }
    }, [user]);

    React.useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Generate dynamic breadcrumbs
    const pathnames = location.pathname.split("/").filter((x) => x);
    const capitalize = (s) =>
        s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ");

    // Resolved profile path based on role
    const profilePath =
        user?.role === "MAIN_ADMIN"
            ? "/main-admin/profile"
            : user?.role === "COMMUNITY_ADMIN"
            ? "/community-admin/profile"
            : user?.role === "USER"
            ? "/user/profile"
            : "#";

    // Avatar initials
    const initials = user?.fullName
        ? user.fullName.trim().split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
        : "U";

    return (
        <AppBar
            position="sticky"
            elevation={0}
            sx={{
                bgcolor: "background.paper",
                color: "text.primary",
                boxShadow: "none",
                borderBottom: "1px solid",
                borderColor: "divider",
                zIndex: (t) => t.zIndex.drawer - 1,
            }}
        >
            <Toolbar
                sx={{
                    minHeight: { xs: 56, sm: 64 },
                    px: { xs: 2, sm: 3 },
                    gap: 1,
                }}
            >
                {/* Mobile: hamburger */}
                <IconButton
                    color="inherit"
                    aria-label="Open navigation"
                    edge="start"
                    onClick={onMobileNavOpen}
                    sx={{
                        display: { md: "none" },
                        mr: 0.5,
                        color: "text.secondary",
                        "&:hover": { color: "text.primary" },
                    }}
                >
                    <MenuIcon sx={{ fontSize: "1.25rem" }} />
                </IconButton>

                {/* Breadcrumbs (desktop only) */}
                <Box sx={{ flexGrow: 1, display: { xs: "none", sm: "flex" }, alignItems: "center" }}>
                    <Breadcrumbs
                        separator={
                            <NavigateNextIcon
                                sx={{ fontSize: "0.875rem", color: "text.disabled" }}
                            />
                        }
                        aria-label="breadcrumb"
                        sx={{
                            "& .MuiBreadcrumbs-separator": { mx: 0.5 },
                            "& .MuiBreadcrumbs-ol": { flexWrap: "nowrap", alignItems: "center" },
                        }}
                    >
                        <MuiLink
                            component={Link}
                            to="/"
                            underline="hover"
                            sx={{
                                fontSize: "0.8125rem",
                                fontWeight: 400,
                                color: "text.secondary",
                                "&:hover": { color: "text.primary" },
                            }}
                        >
                            Home
                        </MuiLink>
                        {pathnames.map((value, index) => {
                            const last = index === pathnames.length - 1;
                            const to = `/${pathnames.slice(0, index + 1).join("/")}`;
                            return last ? (
                                <Typography
                                    key={to}
                                    sx={{
                                        fontSize: "0.8125rem",
                                        fontWeight: 600,
                                        color: "text.primary",
                                        lineHeight: 1.4,
                                    }}
                                >
                                    {capitalize(value)}
                                </Typography>
                            ) : (
                                <MuiLink
                                    component={Link}
                                    to={to}
                                    key={to}
                                    underline="hover"
                                    sx={{
                                        fontSize: "0.8125rem",
                                        fontWeight: 400,
                                        color: "text.secondary",
                                        "&:hover": { color: "text.primary" },
                                    }}
                                >
                                    {capitalize(value)}
                                </MuiLink>
                            );
                        })}
                    </Breadcrumbs>
                </Box>

                {/* Mobile spacer */}
                <Box sx={{ flexGrow: 1, display: { xs: "block", sm: "none" } }} />

                {/* ── Right Side Actions ── */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>

                    {/* Search bar (desktop) */}
                    <Box
                        sx={{
                            display: { xs: "none", md: "flex" },
                            alignItems: "center",
                            bgcolor: "action.hover",
                            border: "1px solid transparent",
                            borderRadius: "8px",
                            px: 1.5,
                            py: 0.5,
                            mr: 1,
                            width: 220,
                            transition: "width 200ms ease, border-color 180ms ease, background-color 180ms ease",
                            "&:focus-within": {
                                width: 280,
                                bgcolor: "background.paper",
                                borderColor: "divider",
                                boxShadow: `0 0 0 3px ${theme.palette.primary.main}1A`,
                            },
                        }}
                    >
                        <SearchIcon sx={{ color: "text.disabled", fontSize: "1rem", mr: 1, flexShrink: 0 }} />
                        <InputBase
                            placeholder="Search…"
                            inputProps={{ "aria-label": "Global search" }}
                            sx={{
                                width: "100%",
                                fontSize: "0.8125rem",
                                color: "text.primary",
                                "& input::placeholder": { color: "text.disabled", opacity: 1 },
                            }}
                        />
                    </Box>

                    {/* Notifications */}
                    <Tooltip title="Notifications" arrow>
                        <IconButton
                            size="medium"
                            aria-label="Notifications"
                            onClick={handleNotificationsClick}
                            sx={{
                                color: "text.secondary",
                                borderRadius: "8px",
                                "&:hover": {
                                    bgcolor: "action.hover",
                                    color: "text.primary",
                                },
                            }}
                        >
                            <Badge
                                badgeContent={unreadCount}
                                color="error"
                                max={9}
                                sx={{
                                    "& .MuiBadge-badge": {
                                        top: 2,
                                        right: 2,
                                        border: "2px solid",
                                        borderColor: "background.paper",
                                        padding: "0 4px",
                                        fontSize: "0.65rem",
                                        height: 16,
                                        minWidth: 16,
                                    },
                                }}
                            >
                                <NotificationsNoneIcon sx={{ fontSize: "1.25rem" }} />
                            </Badge>
                        </IconButton>
                    </Tooltip>

                    {/* Divider */}
                    <Divider
                        orientation="vertical"
                        flexItem
                        sx={{ mx: 0.5, my: 1.5, borderColor: "divider" }}
                    />

                    {/* User profile button */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            pl: 0.5,
                            cursor: "pointer",
                            borderRadius: "8px",
                            py: 0.5,
                            px: 1,
                            transition: "background-color 150ms ease",
                            "&:hover": { bgcolor: "action.hover" },
                        }}
                        onClick={handleMenuClick}
                        role="button"
                        aria-label="Account menu"
                        aria-controls={open ? "account-menu" : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? "true" : undefined}
                    >
                        {/* Name + role (md+) */}
                        <Box sx={{ display: { xs: "none", lg: "block" }, textAlign: "right" }}>
                            <Typography
                                sx={{
                                    fontSize: "0.8125rem",
                                    fontWeight: 600,
                                    lineHeight: 1.3,
                                    color: "text.primary",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {user?.fullName || "User"}
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: "0.6875rem",
                                    fontWeight: 400,
                                    color: "text.secondary",
                                    lineHeight: 1.3,
                                    whiteSpace: "nowrap",
                                    textTransform: "capitalize",
                                }}
                            >
                                {user?.role?.replace("_", " ").toLowerCase() || "Role"}
                            </Typography>
                        </Box>

                        {/* Avatar */}
                        <Avatar
                            sx={{
                                width: 34,
                                height: 34,
                                bgcolor: theme.palette.primary.main,
                                color: "#fff",
                                fontSize: "0.8125rem",
                                fontWeight: 700,
                                letterSpacing: "0.02em",
                                border: "2px solid",
                                borderColor: "background.paper",
                                boxShadow: "0 0 0 1px",
                                boxShadow: `0 0 0 2px ${theme.palette.divider}`,
                                flexShrink: 0,
                            }}
                        >
                            {initials}
                        </Avatar>
                    </Box>

                    {/* Profile Dropdown Menu */}
                    <Menu
                        anchorEl={anchorEl}
                        id="account-menu"
                        open={open}
                        onClose={handleMenuClose}
                        onClick={handleMenuClose}
                        PaperProps={{
                            elevation: 0,
                            sx: {
                                overflow: "visible",
                                mt: 1,
                                minWidth: 200,
                                borderRadius: "10px",
                                border: "1px solid",
                                borderColor: "divider",
                                boxShadow: "0 8px 24px rgba(12, 25, 41, 0.10)",
                                backgroundImage: "none",
                                // Caret arrow
                                "&::before": {
                                    content: '""',
                                    display: "block",
                                    position: "absolute",
                                    top: 0,
                                    right: 16,
                                    width: 10,
                                    height: 10,
                                    bgcolor: "background.paper",
                                    borderTop: "1px solid",
                                    borderLeft: "1px solid",
                                    borderColor: "divider",
                                    transform: "translateY(-50%) rotate(45deg)",
                                    zIndex: 0,
                                },
                            },
                        }}
                        transformOrigin={{ horizontal: "right", vertical: "top" }}
                        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                    >
                        {/* User info row */}
                        <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
                            <Typography
                                sx={{
                                    fontSize: "0.8125rem",
                                    fontWeight: 600,
                                    color: "text.primary",
                                    lineHeight: 1.3,
                                }}
                            >
                                {user?.fullName || "User"}
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: "0.75rem",
                                    color: "text.secondary",
                                    lineHeight: 1.4,
                                    mt: 0.25,
                                }}
                            >
                                {user?.email || ""}
                            </Typography>
                        </Box>

                        <Box sx={{ py: 0.5 }}>
                            <MenuItem
                                onClick={handleMenuClose}
                                component={Link}
                                to={profilePath}
                                sx={{
                                    fontSize: "0.8125rem",
                                    px: 2,
                                    py: 1,
                                    mx: 0.5,
                                    borderRadius: "6px",
                                    color: "text.primary",
                                    gap: 1.5,
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 0, color: "text.secondary" }}>
                                    <PersonIcon sx={{ fontSize: "1rem" }} />
                                </ListItemIcon>
                                My Profile
                            </MenuItem>

                            <Divider sx={{ my: 0.5, mx: 1 }} />

                            <MenuItem
                                onClick={handleLogout}
                                sx={{
                                    fontSize: "0.8125rem",
                                    px: 2,
                                    py: 1,
                                    mx: 0.5,
                                    borderRadius: "6px",
                                    color: "error.main",
                                    gap: 1.5,
                                    "&:hover": { bgcolor: "error.50" },
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 0, color: "error.main" }}>
                                    <LogoutIcon sx={{ fontSize: "1rem" }} />
                                </ListItemIcon>
                                Sign out
                            </MenuItem>
                        </Box>
                    </Menu>

                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default React.memo(TopNavbar);