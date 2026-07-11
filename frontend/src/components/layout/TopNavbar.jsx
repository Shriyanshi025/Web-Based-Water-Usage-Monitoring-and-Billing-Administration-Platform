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
    InputBase
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SearchIcon from "@mui/icons-material/Search";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Link, useLocation } from "react-router-dom";

function TopNavbar({ onMobileNavOpen }) {
    const { user, logout } = useAuth();
    const location = useLocation();
    
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

    // Generate dynamic breadcrumbs (simple version)
    const pathnames = location.pathname.split('/').filter((x) => x);
    const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ');

    return (
        <AppBar
            position="sticky"
            sx={{
                bgcolor: "background.paper",
                color: "text.primary",
                boxShadow: "none",
                borderBottom: "1px solid",
                borderColor: "divider",
                zIndex: (theme) => theme.zIndex.drawer - 1, // Below drawer if we want drawer over navbar on mobile
            }}
        >
            <Toolbar sx={{ minHeight: 72, px: { xs: 2, sm: 3 } }}>
                {/* Mobile Menu Toggle */}
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={onMobileNavOpen}
                    sx={{ mr: 2, display: { md: 'none' } }}
                >
                    <MenuIcon />
                </IconButton>

                {/* Breadcrumbs & Page Title (Desktop) */}
                <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}>
                    <Breadcrumbs 
                        separator={<NavigateNextIcon fontSize="small" />} 
                        aria-label="breadcrumb"
                        sx={{ '& .MuiBreadcrumbs-separator': { mx: 0.5 } }}
                    >
                        <MuiLink component={Link} to="/" color="inherit" underline="hover" variant="body2">
                            Home
                        </MuiLink>
                        {pathnames.map((value, index) => {
                            const last = index === pathnames.length - 1;
                            const to = `/${pathnames.slice(0, index + 1).join('/')}`;

                            return last ? (
                                <Typography color="text.primary" key={to} variant="body2" fontWeight={600}>
                                    {capitalize(value)}
                                </Typography>
                            ) : (
                                <MuiLink component={Link} to={to} color="inherit" underline="hover" key={to} variant="body2">
                                    {capitalize(value)}
                                </MuiLink>
                            );
                        })}
                    </Breadcrumbs>
                </Box>

                <Box sx={{ flexGrow: 1, display: { xs: 'block', sm: 'none' } }} />

                {/* Right Side Actions */}
                <Box display="flex" alignItems="center" gap={1}>
                    
                    {/* Global Search Placeholder (Future Ready) */}
                    <Box sx={{ 
                        display: { xs: 'none', md: 'flex' },
                        alignItems: 'center',
                        bgcolor: 'action.hover',
                        borderRadius: 2,
                        px: 2,
                        py: 0.5,
                        mr: 2,
                        width: 250,
                        transition: 'width 0.3s',
                        '&:focus-within': { width: 300, bgcolor: 'background.default', boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)' }
                    }}>
                        <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                        <InputBase
                            placeholder="Search globally..."
                            inputProps={{ 'aria-label': 'search' }}
                            sx={{ width: '100%', fontSize: '0.875rem' }}
                        />
                    </Box>

                    {/* Notifications Placeholder */}
                    <Tooltip title="Notifications">
                        <IconButton size="large" sx={{ color: 'text.secondary' }}>
                            <Badge badgeContent={3} color="error" variant="dot">
                                <NotificationsNoneIcon />
                            </Badge>
                        </IconButton>
                    </Tooltip>

                    {/* User Profile */}
                    <Box sx={{ ml: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
                            <Typography variant="subtitle2" fontWeight={600} lineHeight={1.2}>
                                {user?.fullName || "User"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {user?.roles?.[0]?.replace('_', ' ') || "Role"}
                            </Typography>
                        </Box>
                        
                        <IconButton
                            onClick={handleMenuClick}
                            size="small"
                            sx={{ p: 0.5, border: '2px solid transparent', '&:hover': { borderColor: 'primary.main' } }}
                            aria-controls={open ? 'account-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={open ? 'true' : undefined}
                        >
                            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontWeight: 600, fontSize: '1rem' }}>
                                {user?.fullName?.charAt(0) || "U"}
                            </Avatar>
                        </IconButton>
                    </Box>

                    {/* Profile Dropdown */}
                    <Menu
                        anchorEl={anchorEl}
                        id="account-menu"
                        open={open}
                        onClose={handleMenuClose}
                        onClick={handleMenuClose}
                        PaperProps={{
                            elevation: 0,
                            sx: {
                                overflow: 'visible',
                                filter: 'drop-shadow(0px 4px 20px rgba(0,0,0,0.1))',
                                mt: 1.5,
                                borderRadius: 3,
                                minWidth: 200,
                                '& .MuiAvatar-root': {
                                    width: 32,
                                    height: 32,
                                    ml: -0.5,
                                    mr: 1,
                                },
                                '&:before': {
                                    content: '""',
                                    display: 'block',
                                    position: 'absolute',
                                    top: 0,
                                    right: 18,
                                    width: 10,
                                    height: 10,
                                    bgcolor: 'background.paper',
                                    transform: 'translateY(-50%) rotate(45deg)',
                                    zIndex: 0,
                                },
                            },
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <MenuItem onClick={handleMenuClose} component={Link} to="/profile">
                            <ListItemIcon>
                                <PersonIcon fontSize="small" />
                            </ListItemIcon>
                            My Profile
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                            <ListItemIcon>
                                <LogoutIcon fontSize="small" color="error" />
                            </ListItemIcon>
                            Logout
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default React.memo(TopNavbar);