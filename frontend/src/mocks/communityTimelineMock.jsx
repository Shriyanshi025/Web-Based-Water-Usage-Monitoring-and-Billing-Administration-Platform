import React from "react";
import PeopleIcon from "@mui/icons-material/People";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BuildIcon from "@mui/icons-material/Build";

export const mockCommunityTimeline = [
    { 
        id: 1, 
        title: 'New Resident Registered', 
        description: "Unit B-205 applied for access", 
        time: "1 hour ago", 
        icon: <PeopleIcon />, 
        color: "info" 
    },
    { 
        id: 2, 
        title: 'Resident Approved', 
        description: "Alice Smith (Unit A-102)", 
        time: "4 hours ago", 
        icon: <CheckCircleIcon />, 
        color: "success" 
    },
    { 
        id: 3, 
        title: 'High Usage Alert', 
        description: "Meter #WM-5542 reported 500L/day", 
        time: "Yesterday", 
        icon: <WaterDropIcon />, 
        color: "warning" 
    },
    { 
        id: 4, 
        title: 'Meter Maintenance', 
        description: "Meter #WM-1022 replaced", 
        time: "2 days ago", 
        icon: <BuildIcon />, 
        color: "error" 
    },
];
