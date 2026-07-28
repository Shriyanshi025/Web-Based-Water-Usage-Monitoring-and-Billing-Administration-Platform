import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Divider
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import PeopleIcon from "@mui/icons-material/People";
import DomainIcon from "@mui/icons-material/Domain";
import HomeWorkIcon from "@mui/icons-material/HomeWork";

import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import DataGrid from "../../components/common/DataGrid";
import TableToolbar from "../../components/common/TableToolbar";
import StatusBadge from "../../components/common/StatusBadge";
import ConfirmationDialog from "../../components/common/ConfirmationDialog";
import MainAdminOpsService from "../../services/MainAdminOpsService";

const CommunitiesPage = () => {
    const navigate = useNavigate();
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Add/Edit Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const [formData, setFormData] = useState({
        communityName: "", communityCode: "", address: "", city: "", state: "", pincode: ""
    });

    // View Dialog state
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [viewCommunity, setViewCommunity] = useState(null);
    const [communityAdmins, setCommunityAdmins] = useState([]);
    const [loadingAdmins, setLoadingAdmins] = useState(false);
    
    // Confirm Dialog state
    const [confirmConfig, setConfirmConfig] = useState({ open: false, title: "", content: "", onConfirm: null, confirmColor: "primary", confirmText: "" });

    const fetchCommunities = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await MainAdminOpsService.getAllCommunities();
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

    const handleOpenViewDialog = async (community) => {
        setViewCommunity(community);
        setViewDialogOpen(true);
        setLoadingAdmins(true);
        try {
            const adminRes = await MainAdminOpsService.getAllCommunityAdmins();
            const admins = (adminRes.data || []).filter(a => a.communityId === community.id || a.communityName === community.communityName);
            setCommunityAdmins(admins);
        } catch (err) {
            setCommunityAdmins([]);
        } finally {
            setLoadingAdmins(false);
        }
    };

    const handleCloseViewDialog = () => {
        setViewDialogOpen(false);
        setViewCommunity(null);
        setCommunityAdmins([]);
    };

    const handleNavigateToAdmin = (admin) => {
        handleCloseViewDialog();
        navigate("/main-admin/community-admins", { 
            state: { 
                highlightId: admin.id || admin.userId,
                search: admin.officialAdminId || admin.fullName
            } 
        });
    };

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
            title: "Delete Community?",
            content: (
                <Box>
                    <Typography variant="body2" color="error.main" fontWeight={600} sx={{ mb: 1.5 }}>
                        This will permanently delete:
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ pl: 1, color: "text.secondary", lineHeight: 1.8 }}>
                        • Community ("{community.communityName}")<br />
                        • Community Admin(s)<br />
                        • Residents & Profiles<br />
                        • Bills & Invoices<br />
                        • Payments & Meter Readings<br />
                        • Water Usage History & Notifications<br />
                        • All related database records
                    </Typography>
                    <Typography variant="body2" color="error.main" fontWeight={700} sx={{ mt: 1.5 }}>
                        This action is irreversible.
                    </Typography>
                </Box>
            ),
            confirmColor: "error",
            confirmText: "Permanently Delete",
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

    // Standardized Action Order: View (👁️) → Edit (✏️) → Status Toggle (🚫/✅) → Delete (🗑️)
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
            width: 130,
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
                <Stack direction="row" spacing={0.5} justifyContent="center">
                    <Tooltip title="View Details" arrow>
                        <IconButton size="small" color="info" onClick={(e) => { e.stopPropagation(); handleOpenViewDialog(params.row); }}>
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit" arrow>
                        <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); handleOpenDialog(params.row); }}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={params.row.active ? "Deactivate" : "Activate"} arrow>
                        <IconButton size="small" color={params.row.active ? "warning" : "success"} onClick={(e) => { e.stopPropagation(); handleToggleStatus(params.row); }}>
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

            {/* View Community Dialog */}
            <Dialog open={viewDialogOpen} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
                {viewCommunity && (
                    <>
                        <DialogTitle sx={{ pb: 1 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="h6" fontWeight={700}>
                                        {viewCommunity.communityName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Community Code: <strong>{viewCommunity.communityCode}</strong>
                                    </Typography>
                                </Box>
                                <StatusBadge status={viewCommunity.active ? "ACTIVE" : "INACTIVE"} />
                            </Stack>
                        </DialogTitle>

                        <DialogContent dividers>
                            {/* Address details */}
                            <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: "grey.50" }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 0.5 }}>
                                    COMMUNITY ADDRESS
                                </Typography>
                                <Typography variant="body2">
                                    {[viewCommunity.address, viewCommunity.city, viewCommunity.state, viewCommunity.pincode].filter(Boolean).join(", ")}
                                </Typography>
                            </Paper>

                            {/* Community Statistics Cards */}
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                                Community Statistics
                            </Typography>
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={6} sm={3}>
                                    <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
                                        <SupervisorAccountIcon color="info" fontSize="small" />
                                        <Typography variant="h6" fontWeight={700} color="text.primary">
                                            {viewCommunity.totalCommunityAdmins ?? communityAdmins.length}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">Admins</Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
                                        <PeopleIcon color="success" fontSize="small" />
                                        <Typography variant="h6" fontWeight={700} color="text.primary">
                                            {viewCommunity.totalResidents ?? 0}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">Residents</Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
                                        <DomainIcon color="primary" fontSize="small" />
                                        <Typography variant="h6" fontWeight={700} color="text.primary">
                                            {viewCommunity.totalBlocks ?? 0}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">Blocks</Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
                                        <HomeWorkIcon color="secondary" fontSize="small" />
                                        <Typography variant="h6" fontWeight={700} color="text.primary">
                                            {viewCommunity.totalUnits ?? 0}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">Units/Flats</Typography>
                                    </Paper>
                                </Grid>
                            </Grid>

                            {/* Community Admins Compact Subsection */}
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                                Community Admins
                            </Typography>
                            {loadingAdmins ? (
                                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>Loading admins...</Typography>
                            ) : communityAdmins.length === 0 ? (
                                <Paper variant="outlined" sx={{ p: 2, textAlign: "center", mb: 3 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        No Community Admins currently assigned to this community.
                                    </Typography>
                                </Paper>
                            ) : (
                                <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                                    <Table size="small">
                                        <TableHead sx={{ bgcolor: "grey.100" }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 600 }}>Admin ID</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {communityAdmins.map((admin) => (
                                                <TableRow key={admin.id || admin.officialAdminId} hover>
                                                    <TableCell>
                                                        <Button
                                                            size="small"
                                                            variant="text"
                                                            onClick={() => handleNavigateToAdmin(admin)}
                                                            sx={{ 
                                                                textTransform: "none", 
                                                                fontWeight: 700, 
                                                                p: 0, 
                                                                minWidth: "auto",
                                                                color: "primary.main",
                                                                textDecoration: "underline"
                                                            }}
                                                        >
                                                            {admin.officialAdminId || `ADM-${admin.id}`}
                                                        </Button>
                                                    </TableCell>
                                                    <TableCell>{admin.fullName}</TableCell>
                                                    <TableCell>{admin.email}</TableCell>
                                                    <TableCell>
                                                        <StatusBadge status={admin.active !== false ? "ACTIVE" : "INACTIVE"} />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}

                            {/* Soft Activity Metadata Section */}
                            <Divider sx={{ my: 2 }} />
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <Typography variant="caption" color="text.secondary" display="block">Created On</Typography>
                                    <Typography variant="body2" fontWeight={500}>
                                        {viewCommunity.createdAt ? new Date(viewCommunity.createdAt).toLocaleDateString() : "N/A"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Typography variant="caption" color="text.secondary" display="block">Last Updated</Typography>
                                    <Typography variant="body2" fontWeight={500}>
                                        {viewCommunity.updatedAt ? new Date(viewCommunity.updatedAt).toLocaleDateString() : "N/A"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Typography variant="caption" color="text.secondary" display="block">Current Status</Typography>
                                    <Typography variant="body2" fontWeight={500}>
                                        {viewCommunity.active ? "Active Community" : "Inactive Community"}
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
