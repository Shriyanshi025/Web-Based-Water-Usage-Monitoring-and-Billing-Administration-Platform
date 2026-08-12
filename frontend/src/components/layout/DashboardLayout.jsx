import React, { useState } from "react";
import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

/**
 * DashboardLayout - Compositional container
 */
function DashboardLayout({ children }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    const handleMobileNavToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <Box className="dashboard-layout" sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
            {/* Sidebar acts as left panel */}
            <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

            {/* Main Content Wrapper */}
            <Box
                sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 0,
                    overflow: "hidden",
                    height: "100vh",
                }}
            >
                {/* Top Navbar */}
                <TopNavbar onMobileNavOpen={handleMobileNavToggle} />

                {/* Page Content area */}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        // Consistent padding: tighter on mobile, generous on desktop
                        p: { xs: 2, sm: 2.5, md: 3 },
                        overflowY: "auto",
                        overflowX: "hidden",
                        // Subtle inner background so cards sit on a light surface
                        bgcolor: "background.default",
                    }}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.22, ease: "easeOut" }}
                            style={{ height: "100%", maxWidth: "100%" }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </Box>
            </Box>
        </Box>
    );
}

export default DashboardLayout;