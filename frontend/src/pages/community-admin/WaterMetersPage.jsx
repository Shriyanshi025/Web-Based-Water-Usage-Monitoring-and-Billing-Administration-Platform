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
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button
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
    ASSIGN: { label: "Assign Meter", icon: <AssignmentIndIcon fontSize="small" />, enabled: true, backendSupported: true },
    EDIT: { label: "Edit Settings", icon: <EditIcon fontSize="small" />, enabled: true, backendSupported: true },
    TOGGLE_STATUS: { label: "Toggle Status", icon: <PowerSettingsNewIcon fontSize="small" />, enabled: true, backendSupported: true },
};

const WaterMetersPage = () => {
    const [meters, setMeters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    
    // UI State
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState("EDIT");
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [dialogForm, setDialogForm] = useState({ residentProfileId: "", meterNumber: "", currentReading: "", meterStatus: "ACTIVE", active: true });

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
    }, []);

    const handleAction = useCallback((actionKey) => {
        if (actionKey === "TOGGLE_STATUS") {
            CommunityOpsService.updateMeter(selectedRow?.id, {
                active: !selectedRow?.active,
                meterStatus: selectedRow?.active ? "INACTIVE" : "ACTIVE"
            }).then(() => fetchMeters()).catch(err => console.error(err));
        } else if (actionKey === "VIEW") {
            setViewDialogOpen(true);
        } else if (actionKey === "ASSIGN" || actionKey === "EDIT") {
            setDialogMode(actionKey);
            setDialogForm({
                residentProfileId: selectedRow?.residentProfileId || "",
                meterNumber: selectedRow?.meterNumber || "",
                currentReading: selectedRow?.currentReading || "",
                meterStatus: selectedRow?.meterStatus || "ACTIVE",
                active: selectedRow?.active ?? true
            });
            setDialogOpen(true);
        }
        handleMenuClose();
    }, [fetchMeters, handleMenuClose, selectedRow]);

    const handleDialogSave = useCallback(async () => {
        try {
            const payload = {
                residentProfileId: dialogForm.residentProfileId ? Number(dialogForm.residentProfileId) : undefined,
                meterNumber: dialogForm.meterNumber || undefined,
                currentReading: dialogForm.currentReading ? Number(dialogForm.currentReading) : undefined,
                meterStatus: dialogForm.meterStatus || undefined,
                active: dialogForm.active
            };

            if (dialogMode === "ASSIGN") {
                await CommunityOpsService.assignMeter(selectedRow?.id, payload);
            } else {
                await CommunityOpsService.updateMeter(selectedRow?.id, payload);
            }
            await fetchMeters();
        } catch (err) {
            console.error(err);
        } finally {
            setDialogOpen(false);
        }
    }, [dialogForm, dialogMode, fetchMeters, selectedRow]);

    const filteredRows = useMemo(() => {
        return meters.filter(row => {
            return searchTerm === "" || 
                (row.meterNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (row.residentName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (row.meterStatus || "").toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [meters, searchTerm]);

    const columns = useMemo(() => [
        { 
            field: "meterNumber", 
            headerName: "Meter ID", 
            width: 200,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={600} color="primary.main">
                    {params.row.meterNumber}
                </Typography>
            )
        },
        { 
            field: "residentName", 
            headerName: "Assigned To", 
            flex: 1, 
            minWidth: 220,
            renderCell: (params) => (
                <Typography variant="body2">
                    {params.row.residentName || "Unassigned"}
                </Typography>
            )
        },
        { field: "officialUserId", headerName: "Official ID", width: 140 },
        { field: "currentReading", headerName: "Current Reading", width: 150 },
        { 
            field: "status", 
            headerName: "Status", 
            width: 150,
            renderCell: (params) => {
                const status = params.row.meterStatus || "ACTIVE";
                const isActive = status === "ACTIVE";
                return (
                    <Chip 
                        label={status} 
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

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{dialogMode === "ASSIGN" ? "Assign Meter" : "Edit Meter"}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label="Resident Profile ID"
                            value={dialogForm.residentProfileId}
                            onChange={(e) => setDialogForm(prev => ({ ...prev, residentProfileId: e.target.value }))}
                            fullWidth
                        />
                        <TextField
                            label="Meter Number"
                            value={dialogForm.meterNumber}
                            onChange={(e) => setDialogForm(prev => ({ ...prev, meterNumber: e.target.value }))}
                            fullWidth
                        />
                        <TextField
                            label="Current Reading"
                            value={dialogForm.currentReading}
                            onChange={(e) => setDialogForm(prev => ({ ...prev, currentReading: e.target.value }))}
                            fullWidth
                        />
                        <TextField
                            select
                            label="Status"
                            value={dialogForm.meterStatus}
                            onChange={(e) => setDialogForm(prev => ({ ...prev, meterStatus: e.target.value }))}
                            SelectProps={{ native: true }}
                            fullWidth
                        >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="INACTIVE">INACTIVE</option>
                            <option value="FAULTY">FAULTY</option>
                            <option value="REPLACED">REPLACED</option>
                        </TextField>
                        <TextField
                            select
                            label="Active"
                            value={dialogForm.active ? "true" : "false"}
                            onChange={(e) => setDialogForm(prev => ({ ...prev, active: e.target.value === "true" }))}
                            SelectProps={{ native: true }}
                            fullWidth
                        >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleDialogSave}>Save</Button>
                </DialogActions>
            </Dialog>

            {/* View Details Dialog */}
            <Dialog open={viewDialogOpen} onClose={() => { setViewDialogOpen(false); setSelectedRow(null); }} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 600, borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}>
                    Meter Details
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {selectedRow && (
                        <Stack spacing={3}>
                            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={3}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Meter Number</Typography>
                                    <Typography variant="body1" fontWeight={600}>{selectedRow.meterNumber}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Assigned Resident</Typography>
                                    <Typography variant="body1">{selectedRow.residentName || "Unassigned"}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Resident Profile ID</Typography>
                                    <Typography variant="body1">{selectedRow.residentProfileId || "—"}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Official User ID</Typography>
                                    <Typography variant="body1">{selectedRow.officialUserId || "—"}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Current Reading</Typography>
                                    <Typography variant="body1" fontWeight={600} color="primary.main">{selectedRow.currentReading} L</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Status</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Chip 
                                            label={selectedRow.meterStatus || "ACTIVE"} 
                                            size="small" 
                                            color={selectedRow.meterStatus === "ACTIVE" ? "success" : "default"}
                                            variant={selectedRow.meterStatus === "ACTIVE" ? "filled" : "outlined"}
                                        />
                                    </Box>
                                </Box>
                            </Box>
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2, pb: 2, px: 3 }}>
                    <Button variant="contained" onClick={() => { setViewDialogOpen(false); setSelectedRow(null); }}>Close</Button>
                </DialogActions>
            </Dialog>

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
