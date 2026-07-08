import {
    Drawer,
    Toolbar,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import ApartmentIcon from "@mui/icons-material/Apartment";
import PeopleIcon from "@mui/icons-material/People";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import ReceiptIcon from "@mui/icons-material/Receipt";
import LogoutIcon from "@mui/icons-material/Logout";

import { Link } from "react-router-dom";

const drawerWidth = 240;

function Sidebar() {

    return (

        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                    width: drawerWidth,
                    boxSizing: "border-box",
                },
            }}
        >

            <Toolbar />

            <List>

                <ListItemButton component={Link} to="/dashboard/main-admin">

                    <ListItemIcon>

                        <DashboardIcon />

                    </ListItemIcon>

                    <ListItemText primary="Dashboard" />

                </ListItemButton>

                <ListItemButton>

                    <ListItemIcon>

                        <ApartmentIcon />

                    </ListItemIcon>

                    <ListItemText primary="Communities" />

                </ListItemButton>

                <ListItemButton>

                    <ListItemIcon>

                        <PeopleIcon />

                    </ListItemIcon>

                    <ListItemText primary="Residents" />

                </ListItemButton>

                <ListItemButton>

                    <ListItemIcon>

                        <WaterDropIcon />

                    </ListItemIcon>

                    <ListItemText primary="Water Meters" />

                </ListItemButton>

                <ListItemButton>

                    <ListItemIcon>

                        <ReceiptIcon />

                    </ListItemIcon>

                    <ListItemText primary="Bills" />

                </ListItemButton>

                <ListItemButton>

                    <ListItemIcon>

                        <LogoutIcon />

                    </ListItemIcon>

                    <ListItemText primary="Logout" />

                </ListItemButton>

            </List>

        </Drawer>

    );

}

export default Sidebar;