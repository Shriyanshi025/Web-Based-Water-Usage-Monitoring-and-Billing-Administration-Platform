import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
    Box, 
    Button, 
    IconButton, 
    Tooltip, 
    Menu, 
    MenuItem, 
    ListItemIcon, 
    ListItemText,
    Drawer,
    Typography,
    Divider,
    Grid,
    Stack,
    TextField,
    Chip
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BlockIcon from "@mui/icons-material/Block";
import VisibilityIcon from "@mui/icons-material/Visibility";

import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import DataGrid from "../../components/common/DataGrid";
import TableToolbar from "../../components/common/TableToolbar";
import SearchBar from "../../components/common/SearchBar";
import FilterBar from "../../components/common/FilterBar";
import StatusBadge from "../../components/common/StatusBadge";
import ConfirmationDialog from "../../components/common/ConfirmationDialog";

import CommunityOpsService from "../../services/CommunityOpsService";

const ACTION_CONFIG = {
    VIEW: { label: "View Details", icon: <VisibilityIcon fontSize="small" />, enabled: true, backendSupported: true },
    EDIT: { label: "Edit Resident", icon: <EditIcon fontSize="small" />, enabled: false, backendSupported: false, comingSoon: true },
    ACTIVATE: { label: "Activate", icon: <CheckCircleIcon fontSize="small" color="success" />, enabled: false, backendSupported: false, comingSoon: true },
    DEACTIVATE: { label: "Deactivate", icon: <BlockIcon fontSize="small" color="error" />, enabled: false, backendSupported: false, comingSoon: true },
    DELETE: { label: "Delete", icon: <DeleteIcon fontSize="small" color="error" />, enabled: false, backendSupported: false, comingSoon: true },
};

const ResidentsPage = () => {
    const [residents, setResidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    
    // UI State
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [dialogConfig, setDialogConfig] = useState({ open: false, title: "", content: "", onConfirm: null });

    const fetchResidents = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await CommunityOpsService.getAllResidents();
            setResidents(data || []);
        } catch (err) {
            setError(err.message || "Failed to fetch residents");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchResidents();
    }, [fetchResidents]);

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
        const config = ACTION_CONFIG[actionKey];
        if (!config.enabled || config.comingSoon) {
            // Future UI feedback like toast can be added here
            handleMenuClose();
            return;
        }

        if (actionKey === "VIEW") {
            setDrawerOpen(true);
        } else if (actionKey === "DELETE") {
            setDialogConfig({
                open: true,
                title: "Delete Resident",
                content: `Are you sure you want to delete ${selectedRow?.firstName}? This action cannot be undone.`,
                onConfirm: async () => {
                    try {
                        await CommunityOpsService.deleteResident(selectedRow?.id);
                        fetchResidents();
                    } catch (err) {
                        console.error(err);
                    } finally {
                        setDialogConfig(prev => ({ ...prev, open: false }));
                    }
                }
            });
        }
        handleMenuClose();
    }, [handleMenuClose, selectedRow, fetchResidents]);

    const filteredRows = useMemo(() => {
        return residents.filter(row => {
            const matchesSearch = searchTerm === "" || 
                `${row.firstName} ${row.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                row.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                row.flatNumber.toLowerCase().includes(searchTerm.toLowerCase());
            
            // Assume user object might be nested or direct status
            const status = row.user?.approvalStatus || "APPROVED";
            const matchesStatus = statusFilter === "ALL" || status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
    }, [residents, searchTerm, statusFilter]);

    const columns = useMemo(() => [
        { 
            field: "fullName", 
            headerName: "Resident Name", 
            flex: 1, 
            minWidth: 200,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={500}>
                    {`${params.row.firstName} ${params.row.lastName}`}
                </Typography>
            )
        },
        { field: "flatNumber", headerName: "Flat", width: 120 },
        { field: "email", headerName: "Email", flex: 1, minWidth: 200 },
        { field: "contactNumber", headerName: "Contact", width: 150 },
        { 
            field: "status", 
            headerName: "Status", 
            width: 150,
            renderCell: (params) => (
                <StatusBadge status={params.row.user?.approvalStatus || "APPROVED"} />
            )
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

    const statusOptions = [
        { value: "ALL", label: "All Statuses" },
        { value: "APPROVED", label: "Approved" },
        { value: "PENDING", label: "Pending" }
    ];

    return (
        <DashboardLayout>
            <PageHeader 
                title="Residents Management" 
                subtitle="Manage and monitor community residents."
            />

            <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider', mb: 3 }}>
                <TableToolbar 
                    title="Resident Directory" 
                    action={
                        <Stack direction="row" spacing={2}>
                            <SearchBar 
                                value={searchTerm} 
                                onChange={setSearchTerm} 
                                placeholder="Search residents..." 
                            />
                            <FilterBar 
                                value={statusFilter}
                                options={statusOptions}
                                onChange={setStatusFilter}
                            />
                        </Stack>
                    }
                />
                
                <Box sx={{ height: 500 }}>
                    <DataGrid 
                        rows={filteredRows} 
                        columns={columns} 
                        loading={loading}
                        error={error}
                        onRetry={fetchResidents}
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

            {/* Details Drawer */}
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                PaperProps={{ sx: { width: { xs: '100%', sm: 400 }, p: 3 } }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight={600}>Resident Details</Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                
                {selectedRow && (
                    <Stack spacing={3}>
                        <Box>
                            <Typography variant="caption" color="text.secondary">Full Name</Typography>
                            <Typography variant="body1" fontWeight={500}>{`${selectedRow.firstName} ${selectedRow.lastName}`}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary">Flat / Unit</Typography>
                            <Typography variant="body1">{selectedRow.flatNumber}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary">Email Address</Typography>
                            <Typography variant="body1">{selectedRow.email}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary">Contact Number</Typography>
                            <Typography variant="body1">{selectedRow.contactNumber}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary">Status</Typography>
                            <Box sx={{ mt: 0.5 }}>
                                <StatusBadge status={selectedRow.user?.approvalStatus || "APPROVED"} />
                            </Box>
                        </Box>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Button 
                            variant="outlined" 
                            fullWidth 
                            disabled={ACTION_CONFIG.EDIT.comingSoon}
                        >
                            {ACTION_CONFIG.EDIT.comingSoon ? "Edit (Coming Soon)" : "Edit Profile"}
                        </Button>
                    </Stack>
                )}
            </Drawer>

            {/* Confirmation Dialog */}
            <ConfirmationDialog 
                open={dialogConfig.open}
                title={dialogConfig.title}
                content={dialogConfig.content}
                onConfirm={dialogConfig.onConfirm}
                onCancel={() => setDialogConfig(prev => ({ ...prev, open: false }))}
                confirmColor="error"
                confirmText="Delete"
            />
        </DashboardLayout>
    );
};

export default ResidentsPage;
