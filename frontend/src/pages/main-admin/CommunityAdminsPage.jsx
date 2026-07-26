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
    Grid,
    MenuItem
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import DataGrid from "../../components/common/DataGrid";
import TableToolbar from "../../components/common/TableToolbar";
import StatusBadge from "../../components/common/StatusBadge";
import ConfirmationDialog from "../../components/common/ConfirmationDialog";
import MainAdminOpsService from "../../services/MainAdminOpsService";

const CommunityAdminsPage = () => {
    const [admins, setAdmins] = useState([]);
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [formData, setFormData] = useState({
        fullName: "", email: "", password: "", phoneNumber: "", communityId: "", officeAddress: ""
    });
    
    // Confirm Dialog state
    const [confirmConfig, setConfirmConfig] = useState({ open: false, title: "", content: "", onConfirm: null, confirmColor: "primary", confirmText: "" });

    const fetchAdmins = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [adminRes, commRes] = await Promise.all([
                MainAdminOpsService.getAllCommunityAdmins(),
                MainAdminOpsService.getAllCommunities()
            ]);
            setAdmins(adminRes.data || []);
            setCommunities(commRes.data || []);
        } catch (err) {
            setError(err.message || "Failed to fetch community admins");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAdmins();
    }, [fetchAdmins]);

    const handleSearch = useCallback((query) => {
        setSearchQuery(query);
    }, []);

    const filteredAdmins = useMemo(() => {
        if (!searchQuery) return admins;
        const q = searchQuery.toLowerCase();
        return admins.filter(a => 
            a.fullName?.toLowerCase().includes(q) || 
            a.email?.toLowerCase().includes(q) ||
            a.communityName?.toLowerCase().includes(q)
        );
    }, [admins, searchQuery]);

    const handleOpenCreateDialog = () => {
        setSelectedAdmin(null);
        setFormData({
            fullName: "", email: "", password: "", phoneNumber: "", communityId: "", officeAddress: ""
        });
        setDialogOpen(true);
    };

    const handleOpenEditDialog = (admin) => {
        setSelectedAdmin(admin);
        setFormData({
            fullName: admin.fullName || "",
            email: admin.email || "",
            password: "",
            phoneNumber: admin.phoneNumber || "",
            communityId: "",
            officeAddress: admin.officeAddress || ""
        });
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
            if (selectedAdmin) {
                await MainAdminOpsService.updateCommunityAdmin(selectedAdmin.id, {
                    fullName: formData.fullName,
                    phoneNumber: formData.phoneNumber,
                    officeAddress: formData.officeAddress
                });
            } else {
                await MainAdminOpsService.createCommunityAdmin({
                    fullName: formData.fullName,
                    email: formData.email,
                    password: formData.password,
                    phoneNumber: formData.phoneNumber,
                    communityId: formData.communityId,
                    officeAddress: formData.officeAddress
                });
            }
            handleCloseDialog();
            fetchAdmins();
        } catch (err) {
            alert(err.response?.data?.message || err.message || "Failed to save admin");
        }
    };

    const handleToggleStatus = (admin) => {
        const isActive = admin.active !== false;
        const newStatus = !isActive;
        
        setConfirmConfig({
            open: true,
            title: newStatus ? "Activate Admin" : "Deactivate Admin",
            content: `Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} ${admin.fullName}?`,
            confirmColor: newStatus ? "success" : "error",
            confirmText: newStatus ? "Activate" : "Deactivate",
            onConfirm: async () => {
                try {
                    await MainAdminOpsService.updateCommunityAdminStatus(admin.id, newStatus);
                    fetchAdmins();
                } catch (err) {
                    alert(err.response?.data?.message || "Failed to update status");
                } finally {
                    setConfirmConfig(prev => ({ ...prev, open: false }));
                }
            }
        });
    };

    const handleDeleteUser = (admin) => {
        setConfirmConfig({
            open: true,
            title: "Delete User",
            content: `Are you sure you want to completely delete ${admin.fullName}? This action cannot be undone.`,
            confirmColor: "error",
            confirmText: "Delete",
            onConfirm: async () => {
                try {
                    await MainAdminOpsService.deleteUser(admin.userId || admin.id);
                    fetchAdmins();
                } catch (err) {
                    alert(err.response?.data?.message || "Failed to delete user");
                } finally {
                    setConfirmConfig(prev => ({ ...prev, open: false }));
                }
            }
        });
    };

    const columns = useMemo(() => [
        { field: "officialAdminId", headerName: "Admin ID", width: 150 },
        { 
            field: "fullName", 
            headerName: "Admin Name", 
            flex: 1, 
            minWidth: 200,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={500}>
                    {params.row.fullName}
                </Typography>
            )
        },
        { field: "email", headerName: "Email", flex: 1, minWidth: 200 },
        { field: "communityName", headerName: "Community", flex: 1, minWidth: 150 },
        { 
            field: "status", 
            headerName: "Status", 
            width: 150,
            renderCell: (params) => (
                <StatusBadge status={params.row.active !== false ? "ACTIVE" : "INACTIVE"} />
            )
        },
        { 
            field: "actions", 
            headerName: "Actions", 
            width: 150, 
            sortable: false,
            align: "center",
            renderCell: (params) => (
                <Stack direction="row" spacing={1} justifyContent="center">
                    <Tooltip title="Edit" arrow>
                        <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); handleOpenEditDialog(params.row); }}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Toggle Status" arrow>
                        <IconButton size="small" color={params.row.active !== false ? "error" : "success"} onClick={(e) => { e.stopPropagation(); handleToggleStatus(params.row); }}>
                            {params.row.active !== false ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete" arrow>
                        <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDeleteUser(params.row); }}>
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
                title="Community Admins Management" 
                subtitle="View and manage community administrators."
            />

            <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider', mb: 3 }}>
                <TableToolbar 
                    title="All Community Admins" 
                    onSearch={handleSearch}
                    actions={
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={handleOpenCreateDialog}
                            sx={{ textTransform: "none", fontWeight: 600 }}
                        >
                            New Community Admin
                        </Button>
                    }
                />
                
                <Box sx={{ height: 500 }}>
                    <DataGrid 
                        rows={filteredAdmins} 
                        columns={columns} 
                        loading={loading}
                        error={error}
                        onRetry={fetchAdmins}
                        disableRowSelectionOnClick
                    />
                </Box>
            </Box>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{selectedAdmin ? "Edit Community Admin" : "Add New Community Admin"}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Full Name" name="fullName" value={formData.fullName} onChange={handleFormChange} required />
                        </Grid>
                        {!selectedAdmin && (
                            <>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleFormChange} required />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth label="Password" name="password" type="password" value={formData.password} onChange={handleFormChange} required />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField fullWidth select label="Assign Community" name="communityId" value={formData.communityId} onChange={handleFormChange} required>
                                        {communities.map((c) => (
                                            <MenuItem key={c.id} value={c.id}>
                                                {c.communityName} ({c.communityCode})
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                            </>
                        )}
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleFormChange} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Office Address" name="officeAddress" value={formData.officeAddress} onChange={handleFormChange} />
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

export default CommunityAdminsPage;
