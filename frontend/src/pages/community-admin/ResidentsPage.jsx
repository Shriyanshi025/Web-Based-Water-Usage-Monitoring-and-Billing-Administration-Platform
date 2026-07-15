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
    Stack,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
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
    EDIT: { label: "Edit Resident", icon: <EditIcon fontSize="small" />, enabled: true, backendSupported: true },
    ACTIVATE: { label: "Activate", icon: <CheckCircleIcon fontSize="small" color="success" />, enabled: true, backendSupported: true },
    DEACTIVATE: { label: "Deactivate", icon: <BlockIcon fontSize="small" color="error" />, enabled: true, backendSupported: true },
    DELETE: { label: "Delete", icon: <DeleteIcon fontSize="small" color="error" />, enabled: true, backendSupported: true },
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
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editForm, setEditForm] = useState({ phoneNumber: "", officialUserId: "", verified: false, active: true });

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
    }, []);

    const handleAction = useCallback((actionKey) => {
        const config = ACTION_CONFIG[actionKey];
        if (!config.enabled || config.comingSoon) {
            handleMenuClose();
            return;
        }
        
        setAnchorEl(null); // Close the menu when an action is clicked

        if (actionKey === "VIEW") {
            setDrawerOpen(true);
        } else if (actionKey === "EDIT") {
            setEditForm({
                phoneNumber: selectedRow?.phoneNumber || "",
                officialUserId: selectedRow?.officialUserId || "",
                verified: selectedRow?.verified || false,
                active: selectedRow?.active ?? true
            });
            setEditDialogOpen(true);
        } else if (actionKey === "ACTIVATE") {
            CommunityOpsService.updateResidentStatus(selectedRow?.id, "ACTIVE")
                .then(() => fetchResidents())
                .catch(err => console.error(err));
        } else if (actionKey === "DEACTIVATE") {
            CommunityOpsService.updateResidentStatus(selectedRow?.id, "INACTIVE")
                .then(() => fetchResidents())
                .catch(err => console.error(err));
        } else if (actionKey === "DELETE") {
            setDialogConfig({
                open: true,
                title: "Delete Resident",
                content: `Are you sure you want to permanently delete ${selectedRow?.fullName || "this resident"}? This will completely remove their profile and all dependent records.`,
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

    const handleEditSave = useCallback(async () => {
        try {
            await CommunityOpsService.updateResident(selectedRow?.id, {
                phoneNumber: editForm.phoneNumber,
                officialUserId: editForm.officialUserId || undefined,
                verified: editForm.verified,
                active: editForm.active
            });
            await fetchResidents();
        } catch (err) {
            console.error(err);
        } finally {
            setEditDialogOpen(false);
        }
    }, [editForm, fetchResidents, selectedRow]);

    const filteredRows = useMemo(() => {
        return residents.filter(row => {
            const fullName = `${row.fullName || ""}`.toLowerCase();
            const matchesSearch = searchTerm === "" || 
                fullName.includes(searchTerm.toLowerCase()) ||
                (row.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (row.unitNumber || "").toLowerCase().includes(searchTerm.toLowerCase());
            
            const statusValue = row.active ? "ACTIVE" : "INACTIVE";
            const matchesStatus = statusFilter === "ALL" || statusValue === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
    }, [residents, searchTerm, statusFilter]);

    const columns = useMemo(() => [
        { 
            field: "fullName", 
            headerName: "Resident Name", 
            flex: 1, 
            minWidth: 220,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={500}>
                    {params.row.fullName || "Unnamed Resident"}
                </Typography>
            )
        },
        { field: "unitNumber", headerName: "Unit", width: 120 },
        { field: "email", headerName: "Email", flex: 1, minWidth: 220 },
        { field: "phoneNumber", headerName: "Contact", width: 150 },
        { 
            field: "status", 
            headerName: "Status", 
            width: 150,
            renderCell: (params) => {
                const isActive = params.row.active !== false;
                return (
                    <StatusBadge status={isActive ? "ACTIVE" : "INACTIVE"} />
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

    const statusOptions = [
        { value: "ALL", label: "All Statuses" },
        { value: "ACTIVE", label: "Active" },
        { value: "INACTIVE", label: "Inactive" }
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

            {/* View Details Dialog */}
            <Dialog 
                open={drawerOpen} 
                onClose={() => {
                    setDrawerOpen(false);
                    setSelectedRow(null);
                }}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 600, borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}>
                    Resident Details
                </DialogTitle>
                <DialogContent sx={{ mt: 2, pb: 4 }}>
                    {selectedRow && (
                        <Stack spacing={4}>
                            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={4}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Full Name</Typography>
                                    <Typography variant="body1" fontWeight={500}>{selectedRow.fullName || "Unnamed Resident"}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Community</Typography>
                                    <Typography variant="body1">{selectedRow.communityName || "—"}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Block</Typography>
                                    <Typography variant="body1">{selectedRow.blockName || "—"}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Unit</Typography>
                                    <Typography variant="body1">{selectedRow.unitNumber || "—"}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Meter Serial</Typography>
                                    <Typography variant="body1">{selectedRow.meterSerialNumber || "—"}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Email Address</Typography>
                                    <Typography variant="body1">{selectedRow.email || "—"}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Contact Number</Typography>
                                    <Typography variant="body1">{selectedRow.phoneNumber || "—"}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Official ID</Typography>
                                    <Typography variant="body1">{selectedRow.officialUserId || "—"}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Account Status</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <StatusBadge status={selectedRow.active !== false ? "ACTIVE" : "INACTIVE"} />
                                    </Box>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Approval Status</Typography>
                                    <Typography variant="body1">{selectedRow.approvalStatus || "—"}</Typography>
                                </Box>
                            </Box>
                            <Box display="flex" justifyContent="flex-end" pt={2} sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
                                <Button 
                                    variant="outlined"
                                    onClick={() => {
                                        setDrawerOpen(false);
                                        setEditDialogOpen(true);
                                        setEditForm({
                                            phoneNumber: selectedRow?.phoneNumber || "",
                                            officialUserId: selectedRow?.officialUserId || "",
                                            verified: selectedRow?.verified || false,
                                            active: selectedRow?.active ?? true
                                        });
                                    }}
                                    disabled={ACTION_CONFIG.EDIT.comingSoon}
                                    startIcon={<EditIcon />}
                                >
                                    {ACTION_CONFIG.EDIT.comingSoon ? "Edit (Coming Soon)" : "Edit Profile"}
                                </Button>
                            </Box>
                        </Stack>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={editDialogOpen} onClose={() => {
                setEditDialogOpen(false);
                setSelectedRow(null);
            }} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Resident</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label="Phone Number"
                            value={editForm.phoneNumber}
                            onChange={(e) => setEditForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                            fullWidth
                        />
                        <TextField
                            label="Official User ID"
                            value={editForm.officialUserId}
                            onChange={(e) => setEditForm(prev => ({ ...prev, officialUserId: e.target.value }))}
                            fullWidth
                        />
                        <TextField
                            select
                            label="Verification"
                            value={editForm.verified ? "true" : "false"}
                            onChange={(e) => setEditForm(prev => ({ ...prev, verified: e.target.value === "true" }))}
                            SelectProps={{ native: true }}
                            fullWidth
                        >
                            <option value="true">Verified</option>
                            <option value="false">Pending</option>
                        </TextField>
                        <TextField
                            select
                            label="Status"
                            value={editForm.active ? "active" : "inactive"}
                            onChange={(e) => setEditForm(prev => ({ ...prev, active: e.target.value === "active" }))}
                            SelectProps={{ native: true }}
                            fullWidth
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleEditSave}>Save</Button>
                </DialogActions>
            </Dialog>

            {/* Confirmation Dialog */}
            <ConfirmationDialog 
                open={dialogConfig.open}
                title={dialogConfig.title}
                content={dialogConfig.content}
                onConfirm={dialogConfig.onConfirm}
                onCancel={() => setDialogConfig(prev => ({ ...prev, open: false }))}
                confirmColor="error"
                confirmText={dialogConfig.title === "Delete Resident" ? "Delete" : "Deactivate"}
            />
        </DashboardLayout>
    );
};

export default ResidentsPage;
