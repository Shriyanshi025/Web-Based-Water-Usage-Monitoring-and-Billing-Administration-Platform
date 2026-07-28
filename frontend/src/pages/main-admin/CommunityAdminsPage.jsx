import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
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
    MenuItem,
    Paper,
    Divider
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import PeopleIcon from "@mui/icons-material/People";
import BusinessIcon from "@mui/icons-material/Business";

import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import DataGrid from "../../components/common/DataGrid";
import TableToolbar from "../../components/common/TableToolbar";
import StatusBadge from "../../components/common/StatusBadge";
import ConfirmationDialog from "../../components/common/ConfirmationDialog";
import MainAdminOpsService from "../../services/MainAdminOpsService";

const CommunityAdminsPage = () => {
    const location = useLocation();
    const [admins, setAdmins] = useState([]);
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    // View Dialog state
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [viewAdmin, setViewAdmin] = useState(null);

    // Create/Edit Dialog state
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

    // Handle incoming navigation state from Community View link
    useEffect(() => {
        if (location.state?.search) {
            setSearchQuery(location.state.search);
        }
    }, [location.state]);

    const handleSearch = useCallback((query) => {
        setSearchQuery(query);
    }, []);

    const filteredAdmins = useMemo(() => {
        if (!searchQuery) return admins;
        const q = searchQuery.toLowerCase();
        return admins.filter(a => 
            a.fullName?.toLowerCase().includes(q) || 
            a.email?.toLowerCase().includes(q) ||
            a.officialAdminId?.toLowerCase().includes(q) ||
            a.communityName?.toLowerCase().includes(q)
        );
    }, [admins, searchQuery]);

    const handleOpenViewDialog = (admin) => {
        setViewAdmin(admin);
        setViewDialogOpen(true);
    };

    const handleCloseViewDialog = () => {
        setViewDialogOpen(false);
        setViewAdmin(null);
    };

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
            title: "Delete Community Admin?",
            content: (
                <Box>
                    <Typography variant="body2" sx={{ mb: 1.5 }}>
                        This action will permanently delete <strong>only</strong> the selected Community Admin account (<strong>{admin.fullName}</strong>).
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        Residents and all community data will remain unchanged.
                    </Typography>
                    <Typography variant="body2" color="error.main" fontWeight={600}>
                        This action cannot be undone.
                    </Typography>
                </Box>
            ),
            confirmColor: "error",
            confirmText: "Delete Admin Account",
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

    // Standardized Action Order: View (👁️) → Edit (✏️) → Status Toggle (🚫/✅) → Delete (🗑️)
    const columns = useMemo(() => [
        { 
            field: "officialAdminId", 
            headerName: "Admin ID", 
            width: 160,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={600} color="primary.main">
                    {params.row.officialAdminId || `ADM-${params.row.id}`}
                </Typography>
            )
        },
        { 
            field: "fullName", 
            headerName: "Admin Name", 
            flex: 1, 
            minWidth: 180,
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
            width: 130,
            renderCell: (params) => (
                <StatusBadge status={params.row.active !== false ? "ACTIVE" : "INACTIVE"} />
            )
        },
        { 
            field: "actions", 
            headerName: "Actions", 
            width: 180, 
            sortable: false,
            align: "center",
            renderCell: (params) => (
                <Stack direction="row" spacing={0.5} justifyContent="center">
                    <Tooltip title="View Details" arrow>
                        <IconButton size="small" color="info" onClick={(e) => { e.stopPropagation(); handleOpenViewDialog(params.row); }}>
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit" arrow>
                        <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); handleOpenEditDialog(params.row); }}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={params.row.active !== false ? "Deactivate" : "Activate"} arrow>
                        <IconButton size="small" color={params.row.active !== false ? "warning" : "success"} onClick={(e) => { e.stopPropagation(); handleToggleStatus(params.row); }}>
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

            {/* Read-Only View Community Admin Dialog */}
            <Dialog open={viewDialogOpen} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
                {viewAdmin && (
                    <>
                        <DialogTitle sx={{ pb: 1 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="h6" fontWeight={700}>
                                        {viewAdmin.fullName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Admin ID: <strong>{viewAdmin.officialAdminId || `ADM-${viewAdmin.id}`}</strong>
                                    </Typography>
                                </Box>
                                <StatusBadge status={viewAdmin.active !== false ? "ACTIVE" : "INACTIVE"} />
                            </Stack>
                        </DialogTitle>

                        <DialogContent dividers>
                            {/* Personal Information */}
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: "primary.main" }}>
                                Personal Information
                            </Typography>
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={12} sm={6}>
                                    <Paper variant="outlined" sx={{ p: 1.5 }}>
                                        <Typography variant="caption" color="text.secondary" display="block">Full Name</Typography>
                                        <Typography variant="body2" fontWeight={600}>{viewAdmin.fullName || "—"}</Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Paper variant="outlined" sx={{ p: 1.5 }}>
                                        <Typography variant="caption" color="text.secondary" display="block">Email Address</Typography>
                                        <Typography variant="body2" fontWeight={600}>{viewAdmin.email || "—"}</Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Paper variant="outlined" sx={{ p: 1.5 }}>
                                        <Typography variant="caption" color="text.secondary" display="block">Mobile Number</Typography>
                                        <Typography variant="body2" fontWeight={600}>{viewAdmin.phoneNumber || "—"}</Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Paper variant="outlined" sx={{ p: 1.5 }}>
                                        <Typography variant="caption" color="text.secondary" display="block">Office Address</Typography>
                                        <Typography variant="body2" fontWeight={600}>{viewAdmin.officeAddress || "N/A"}</Typography>
                                    </Paper>
                                </Grid>
                            </Grid>

                            {/* Community Information */}
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: "primary.main" }}>
                                Community Information
                            </Typography>
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={12} sm={4}>
                                    <Paper variant="outlined" sx={{ p: 1.5 }}>
                                        <Typography variant="caption" color="text.secondary" display="block">Assigned Community</Typography>
                                        <Typography variant="body2" fontWeight={600}>{viewAdmin.communityName || "Unassigned"}</Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Paper variant="outlined" sx={{ p: 1.5 }}>
                                        <Typography variant="caption" color="text.secondary" display="block">Community ID</Typography>
                                        <Typography variant="body2" fontWeight={600}>{viewAdmin.communityId ? `COMM-${viewAdmin.communityId}` : "N/A"}</Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Paper variant="outlined" sx={{ p: 1.5 }}>
                                        <Typography variant="caption" color="text.secondary" display="block">Community Address</Typography>
                                        <Typography variant="body2" fontWeight={600}>{viewAdmin.communityAddress || "N/A"}</Typography>
                                    </Paper>
                                </Grid>
                            </Grid>

                            {/* Statistics Section */}
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: "primary.main" }}>
                                Management Statistics
                            </Typography>
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={12} sm={6}>
                                    <Paper variant="outlined" sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
                                        <PeopleIcon color="primary" sx={{ fontSize: 32 }} />
                                        <Box>
                                            <Typography variant="h6" fontWeight={700}>
                                                {viewAdmin.totalResidents ?? 0}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Total Residents Managed in Community
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Paper variant="outlined" sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
                                        <BusinessIcon color="info" sx={{ fontSize: 32 }} />
                                        <Box>
                                            <Typography variant="h6" fontWeight={700}>
                                                {viewAdmin.communityName || "N/A"}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Active Jurisdiction
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid>
                            </Grid>

                            {/* Soft Activity Metadata Section */}
                            <Divider sx={{ my: 2 }} />
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={3}>
                                    <Typography variant="caption" color="text.secondary" display="block">Created On</Typography>
                                    <Typography variant="body2" fontWeight={500}>
                                        {viewAdmin.createdAt ? new Date(viewAdmin.createdAt).toLocaleDateString() : "N/A"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <Typography variant="caption" color="text.secondary" display="block">Assigned Community</Typography>
                                    <Typography variant="body2" fontWeight={500}>
                                        {viewAdmin.communityName || "N/A"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <Typography variant="caption" color="text.secondary" display="block">Total Residents</Typography>
                                    <Typography variant="body2" fontWeight={500}>
                                        {viewAdmin.totalResidents ?? 0} Residents
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <Typography variant="caption" color="text.secondary" display="block">Account Status</Typography>
                                    <Typography variant="body2" fontWeight={500}>
                                        {viewAdmin.active !== false ? "Active Admin Account" : "Inactive Account"}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </DialogContent>

                        <DialogActions>
                            <Button onClick={handleCloseViewDialog} variant="contained" color="primary">
                                Close
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

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
