import { Box, Toolbar } from "@mui/material";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";

function DashboardLayout({ children }) {
    return (
        <Box sx={{ display: "flex" }}>

            <TopNavbar />

            <Sidebar />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    bgcolor: "#F4F8FC",
                    minHeight: "100vh",
                    p: 4,
                }}
            >
                <Toolbar />

                {children}

            </Box>

        </Box>
    );
}

export default DashboardLayout;