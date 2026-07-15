import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
    Box, 
    Typography,
    Stack,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";

import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import DataGrid from "../../components/common/DataGrid";
import TableToolbar from "../../components/common/TableToolbar";
import StatusBadge from "../../components/common/StatusBadge";
import ConfirmationDialog from "../../components/common/ConfirmationDialog";
import MainAdminOpsService from "../../services/MainAdminOpsService";

const CommunitiesPage = () => {
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const [formData, setFormData] = useState({
        communityName: "", communityCode: "", address: "", city: "", state: "", pincode: ""
    });
    
    // Confirm Dialog state
    const [confirmConfig, setConfirmConfig] = useState({ open: false, title: "", content: "", onConfirm: null, confirmColor: "primary", confirmText: "" });

    const fetchCommunities = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await MainAdminOpsService.getAllCommunities();
            // Unwrap ApiResponse
            setCommunities(response.data || []);
        } catch (err) {
            setError(err.message || "Failed to fetch communities");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCommunities();
    }, [fetchCommunities]);

    const handleSearch = useCallback((query) => {
        setSearchQuery(query);
    }, []);

    const filteredCommunities = useMemo(() => {
        if (!searchQuery) return communities;
        const q = searchQuery.toLowerCase();
        return communities.filter(c => 
            c.communityName?.toLowerCase().includes(q) || 
            c.communityCode?.toLowerCase().includes(q) ||
            c.city?.toLowerCase().includes(q)
        );
    }, [communities, searchQuery]);

    const handleOpenDialog = (community = null) => {
        if (community) {
            setEditMode(true);
            setSelectedCommunity(community);
            setFormData({
                communityName: community.communityName || "",
                communityCode: community.communityCode || "",
                address: community.address || "",
                city: community.city || "",
                state: community.state || "",
                pincode: community.pincode || ""
            });
        } else {
            setEditMode(false);
            setSelectedCommunity(null);
            setFormData({
                communityName: "", communityCode: "", address: "", city: "", state: "", pincode: ""
            });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            if (editMode && selectedCommunity) {
                await MainAdminOpsService.updateCommunity(selectedCommunity.id, formData);
            } else {
                await MainAdminOpsService.createCommunity(formData);
            }
            handleCloseDialog();
            fetchCommunities();
        } catch (err) {
            alert(err.response?.data?.message || err.message || "Failed to save community");
        }
    };

    const handleToggleStatus = (community) => {
        const newStatus = !community.active;
        setConfirmConfig({
            open: true,
            title: newStatus ? "Activate Community" : "Deactivate Community",
            content: `Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} ${community.communityName}?`,
            confirmColor: newStatus ? "success" : "error",
            confirmText: newStatus ? "Activate" : "Deactivate",
            onConfirm: async () => {
                try {
                    await MainAdminOpsService.updateCommunityStatus(community.id, newStatus);
                    fetchCommunities();
                } catch (err) {
                    alert(err.response?.data?.message || "Failed to update status");
                } finally {
                    setConfirmConfig(prev => ({ ...prev, open: false }));
                }
            }
        });
    };

    const handleDeleteCommunity = (community) => {
        setConfirmConfig({
            open: true,
            title: "Delete Community",
            content: `Are you sure you want to permanently delete community "${community.communityName}"?`,
            confirmColor: "error",
            confirmText: "Delete",
            onConfirm: async () => {
                try {
                    await MainAdminOpsService.deleteCommunity(community.id);
                    fetchCommunities();
                } catch (err) {
                    alert(err.response?.data?.message || err.message || "Failed to delete community");
                } finally {
                    setConfirmConfig(prev => ({ ...prev, open: false }));
                }
            }
        });
    };

    const columns = useMemo(() => [
        { field: "communityCode", headerName: "Code", width: 120 },
        { 
            field: "communityName", 
            headerName: "Community Name", 
            flex: 1, 
            minWidth: 200,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={500}>
                    {params.row.communityName}
                </Typography>
            )
        },
        { field: "city", headerName: "City", flex: 1 },
        { field: "state", headerName: "State", flex: 1 },
        { 
            field: "active", 
            headerName: "Status", 
            width: 150,
            renderCell: (params) => (
                <StatusBadge status={params.row.active ? "ACTIVE" : "INACTIVE"} />
            )
        },
        { 
            field: "actions", 
            headerName: "Actions", 
            width: 180, 
            sortable: false,
            align: "center",
            renderCell: (params) => (
                <Stack direction="row" spacing={1} justifyContent="center">
                    <Tooltip title="Edit" arrow>
                        <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); handleOpenDialog(params.row); }}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={params.row.active ? "Deactivate" : "Activate"} arrow>
                        <IconButton size="small" color={params.row.active ? "error" : "success"} onClick={(e) => { e.stopPropagation(); handleToggleStatus(params.row); }}>
                            {params.row.active ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete" arrow>
                        <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDeleteCommunity(params.row); }}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            )
        }
    ], []);

    return (
        <DashboardLayout>
            <PageHeader 
                title="Communities Management" 
                subtitle="View and manage all registered communities."
            />

            <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider', mb: 3 }}>
                <TableToolbar 
                    title="All Communities" 
                    onSearch={handleSearch}
                    onAdd={() => handleOpenDialog()}
                    addLabel="Add Community"
                />
                
                <Box sx={{ height: 500 }}>
                    <DataGrid 
                        rows={filteredCommunities} 
                        columns={columns} 
                        loading={loading}
                        error={error}
                        onRetry={fetchCommunities}
                        disableRowSelectionOnClick
                    />
                </Box>
            </Box>

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{editMode ? "Edit Community" : "Add Community"}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12} sm={8}>
                            <TextField fullWidth label="Community Name" name="communityName" value={formData.communityName} onChange={handleFormChange} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth label="Code" name="communityCode" value={formData.communityCode} onChange={handleFormChange} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Address" name="address" value={formData.address} onChange={handleFormChange} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth label="City" name="city" value={formData.city} onChange={handleFormChange} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth label="State" name="state" value={formData.state} onChange={handleFormChange} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth label="Pincode" name="pincode" value={formData.pincode} onChange={handleFormChange} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained" color="primary">Save</Button>
                </DialogActions>
            </Dialog>

            <ConfirmationDialog 
                open={confirmConfig.open}
                title={confirmConfig.title}
                content={confirmConfig.content}
                onConfirm={confirmConfig.onConfirm}
                onCancel={() => setConfirmConfig(prev => ({ ...prev, open: false }))}
                confirmColor={confirmConfig.confirmColor}
                confirmText={confirmConfig.confirmText}
            />
        </DashboardLayout>
    );
};

export default CommunitiesPage;
