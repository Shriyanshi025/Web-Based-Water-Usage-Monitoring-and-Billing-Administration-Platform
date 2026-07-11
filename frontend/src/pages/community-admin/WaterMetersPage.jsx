import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
    Box, 
    Typography,
    Stack,
    IconButton,
    Tooltip,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Chip
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import VisibilityIcon from "@mui/icons-material/Visibility";

import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import DataGrid from "../../components/common/DataGrid";
import TableToolbar from "../../components/common/TableToolbar";
import SearchBar from "../../components/common/SearchBar";

import CommunityOpsService from "../../services/CommunityOpsService";

const ACTION_CONFIG = {
    VIEW: { label: "View Details", icon: <VisibilityIcon fontSize="small" />, enabled: true, backendSupported: true },
    ASSIGN: { label: "Assign Meter", icon: <AssignmentIndIcon fontSize="small" />, enabled: false, backendSupported: false, comingSoon: true },
    EDIT: { label: "Edit Settings", icon: <EditIcon fontSize="small" />, enabled: false, backendSupported: false, comingSoon: true },
    TOGGLE_STATUS: { label: "Toggle Status", icon: <PowerSettingsNewIcon fontSize="small" />, enabled: false, backendSupported: false, comingSoon: true },
};

const WaterMetersPage = () => {
    const [meters, setMeters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    
    // UI State
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);

    const fetchMeters = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await CommunityOpsService.getAllMeters();
            setMeters(data || []);
        } catch (err) {
            setError(err.message || "Failed to fetch water meters");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMeters();
    }, [fetchMeters]);

    const handleMenuClick = useCallback((event, row) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setSelectedRow(row);
    }, []);

    const handleMenuClose = useCallback(() => {
        setAnchorEl(null);
        setSelectedRow(null);
    }, []);

    const handleAction = useCallback((actionKey) => {
        handleMenuClose();
        // Actions are not supported yet, so nothing happens.
    }, [handleMenuClose]);

    const filteredRows = useMemo(() => {
        return meters.filter(row => {
            return searchTerm === "" || 
                row.meterId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                row.residentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                row.status?.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [meters, searchTerm]);

    const columns = useMemo(() => [
        { 
            field: "meterId", 
            headerName: "Meter ID", 
            width: 200,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={600} color="primary.main">
                    {params.row.meterId}
                </Typography>
            )
        },
        { 
            field: "residentName", 
            headerName: "Assigned To", 
            flex: 1, 
            minWidth: 200,
            renderCell: (params) => (
                <Typography variant="body2">
                    {params.row.residentName || <Typography variant="caption" color="text.secondary">Unassigned</Typography>}
                </Typography>
            )
        },
        { field: "flatNumber", headerName: "Flat", width: 120 },
        { field: "lastReading", headerName: "Last Reading (L)", width: 150 },
        { 
            field: "status", 
            headerName: "Status", 
            width: 150,
            renderCell: (params) => {
                const isActive = params.row.status === "ACTIVE";
                return (
                    <Chip 
                        label={params.row.status} 
                        size="small" 
                        color={isActive ? "success" : "default"}
                        variant={isActive ? "filled" : "outlined"}
                    />
                );
            }
        },
        { 
            field: "actions", 
            headerName: "Actions", 
            width: 100, 
            sortable: false,
            align: "center",
            renderCell: (params) => (
                <IconButton size="small" onClick={(e) => handleMenuClick(e, params.row)}>
                    <MoreVertIcon fontSize="small" />
                </IconButton>
            )
        }
    ], [handleMenuClick]);

    return (
        <DashboardLayout>
            <PageHeader 
                title="Water Meters" 
                subtitle="Manage smart water meters across the community."
            />

            <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider', mb: 3 }}>
                <TableToolbar 
                    title="Meter Registry" 
                    action={
                        <SearchBar 
                            value={searchTerm} 
                            onChange={setSearchTerm} 
                            placeholder="Search by Meter ID or Resident..." 
                        />
                    }
                />
                
                <Box sx={{ height: 500 }}>
                    <DataGrid 
                        rows={filteredRows} 
                        columns={columns} 
                        loading={loading}
                        error={error}
                        onRetry={fetchMeters}
                        disableRowSelectionOnClick
                    />
                </Box>
            </Box>

            {/* Actions Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                    elevation: 3,
                    sx: { minWidth: 200, mt: 1, borderRadius: 2 }
                }}
            >
                {Object.entries(ACTION_CONFIG).map(([key, config]) => (
                    <Tooltip key={key} title={config.comingSoon ? "Backend Support Pending" : ""} placement="left" arrow>
                        <span>
                            <MenuItem 
                                onClick={() => handleAction(key)}
                                disabled={!config.enabled || config.comingSoon}
                                sx={{ py: 1.5 }}
                            >
                                <ListItemIcon>{config.icon}</ListItemIcon>
                                <ListItemText 
                                    primary={config.label} 
                                    secondary={config.comingSoon ? "Coming Soon" : null}
                                    secondaryTypographyProps={{ variant: "caption", color: "warning.main" }}
                                />
                            </MenuItem>
                        </span>
                    </Tooltip>
                ))}
            </Menu>
        </DashboardLayout>
    );
};

export default WaterMetersPage;
