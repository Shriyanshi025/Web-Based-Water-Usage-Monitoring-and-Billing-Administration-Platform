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
        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
            {/* Sidebar acts as left panel */}
            <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

            {/* Main Content Wrapper */}
            <Box
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0, // important for overflow hidden in flex children
                    overflow: 'hidden'
                }}
            >
                {/* Top Navbar */}
                <TopNavbar onMobileNavOpen={handleMobileNavToggle} />

                {/* Page Content area with smooth transition */}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        p: { xs: 2, sm: 3, md: 4 },
                        overflowY: "auto",
                        overflowX: "hidden"
                    }}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            style={{ height: '100%' }}
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