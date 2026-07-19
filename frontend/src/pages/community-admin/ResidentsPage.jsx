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
    Typography,
    Stack,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Divider,
    FormControl,
    InputLabel,
    Select,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BlockIcon from "@mui/icons-material/Block";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PeopleIcon from "@mui/icons-material/People";
import RefreshIcon from "@mui/icons-material/Refresh";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import ReceiptIcon from "@mui/icons-material/Receipt";

import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import { useNotification } from "../../context/NotificationContext";
import SectionHeader from "../../components/common/SectionHeader";
import DataGrid from "../../components/common/DataGrid";
import TableToolbar from "../../components/common/TableToolbar";
import SearchBar from "../../components/common/SearchBar";
import StatusBadge from "../../components/common/StatusBadge";
import ConfirmationDialog from "../../components/common/ConfirmationDialog";
import ActionButton from "../../components/common/ActionButton";
import ErrorState from "../../components/common/ErrorState";

import CommunityOpsService from "../../services/CommunityOpsService";

// ─── Detail field — label + value pair used in dialogs ───────────────────────
const DetailField = ({ label, value, children }) => (
    <Box>
        <Typography
            variant="caption"
            sx={{ display: "block", fontWeight: 500, color: "text.secondary", mb: 0.25, textTransform: "uppercase", letterSpacing: "0.5px", fontSize: "0.6875rem" }}
        >
            {label}
        </Typography>
        {children || (
            <Typography variant="body2" sx={{ fontWeight: 500, color: value ? "text.primary" : "text.disabled" }}>
                {value || "—"}
            </Typography>
        )}
    </Box>
);

// ─── Action menu config ───────────────────────────────────────────────────────
const ACTION_CONFIG = {
    VIEW:       { label: "View Details",  icon: <VisibilityIcon fontSize="small" />,                        enabled: true },
    EDIT:       { label: "Edit Resident", icon: <EditIcon fontSize="small" />,                               enabled: true },
    GENERATE_BILL: { label: "Generate Bill", icon: <ReceiptIcon fontSize="small" color="primary" />,        enabled: true },
    ACTIVATE:   { label: "Activate",      icon: <CheckCircleIcon fontSize="small" color="success" />,        enabled: true },
    DEACTIVATE: { label: "Deactivate",    icon: <BlockIcon fontSize="small" color="warning" />,              enabled: true },
    DELETE:     { label: "Delete",        icon: <DeleteIcon fontSize="small" color="error" />,               enabled: true },
};

const STATUS_FILTER_OPTIONS = [
    { value: "ALL",      label: "All Statuses" },
    { value: "ACTIVE",   label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
];

const ResidentsPage = () => {
    const theme = useTheme();
    const { showNotification } = useNotification();
    const [residents, setResidents]     = useState([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState(null);
    const [searchTerm, setSearchTerm]   = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    // UI state
    const [anchorEl, setAnchorEl]         = useState(null);
    const [selectedRow, setSelectedRow]   = useState(null);
    const [viewOpen, setViewOpen]         = useState(false);
    const [editOpen, setEditOpen]         = useState(false);
    const [editForm, setEditForm]         = useState({ phoneNumber: "", officialUserId: "", verified: false, active: true });
    const [dialogConfig, setDialogConfig] = useState({ open: false, title: "", message: "", onConfirm: null, confirmText: "", confirmColor: "primary" });

    // ── Data fetching ─────────────────────────────────────────────────────────
    const fetchResidents = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await CommunityOpsService.getAllResidents();
            setResidents(data || []);
        } catch (err) {
            setError(err?.response?.data?.message || err.message || "Failed to load residents.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchResidents(); }, [fetchResidents]);

    // ── Menu handlers ─────────────────────────────────────────────────────────
    const handleMenuOpen  = useCallback((event, row) => { event.stopPropagation(); setAnchorEl(event.currentTarget); setSelectedRow(row); }, []);
    const handleMenuClose = useCallback(() => setAnchorEl(null), []);

    const handleGenerateBill = useCallback(async (resident) => {
        try {
            await CommunityOpsService.generateBillForResident(resident.id);
            showNotification(`Bill generated successfully for ${resident.fullName}.`, "success");
        } catch (err) {
            showNotification(err?.response?.data?.message || err.message || "Failed to generate bill.", "error");
        }
    }, [showNotification]);

    const handleAction = useCallback((actionKey) => {
        handleMenuClose();
        switch (actionKey) {
            case "VIEW":
                setViewOpen(true);
                break;
            case "EDIT":
                setEditForm({ phoneNumber: selectedRow?.phoneNumber || "", officialUserId: selectedRow?.officialUserId || "", verified: selectedRow?.verified || false, active: selectedRow?.active ?? true });
                setEditOpen(true);
                break;
            case "GENERATE_BILL":
                handleGenerateBill(selectedRow);
                break;
            case "ACTIVATE":
                CommunityOpsService.updateResidentStatus(selectedRow?.id, "ACTIVE")
                    .then(fetchResidents).catch(console.error);
                break;
            case "DEACTIVATE":
                setDialogConfig({
                    open: true, title: "Deactivate Resident",
                    message: `Deactivate ${selectedRow?.fullName || "this resident"}? They will lose access to resident services.`,
                    confirmText: "Deactivate", confirmColor: "warning",
                    onConfirm: async () => {
                        try { await CommunityOpsService.updateResidentStatus(selectedRow?.id, "INACTIVE"); fetchResidents(); }
                        catch (err) { console.error(err); }
                        finally { setDialogConfig(p => ({ ...p, open: false })); }
                    }
                });
                break;
            case "DELETE":
                setDialogConfig({
                    open: true, title: "Delete Resident",
                    message: `Permanently delete ${selectedRow?.fullName || "this resident"}? This will remove their profile and all dependent records. This action cannot be undone.`,
                    confirmText: "Delete", confirmColor: "error",
                    onConfirm: async () => {
                        try { await CommunityOpsService.deleteResident(selectedRow?.id); fetchResidents(); }
                        catch (err) { console.error(err); }
                        finally { setDialogConfig(p => ({ ...p, open: false })); }
                    }
                });
                break;
            default: break;
        }
    }, [handleMenuClose, selectedRow, fetchResidents, handleGenerateBill]);

    const handleEditSave = useCallback(async () => {
        try {
            await CommunityOpsService.updateResident(selectedRow?.id, {
                phoneNumber: editForm.phoneNumber,
                officialUserId: editForm.officialUserId || undefined,
                verified: editForm.verified,
                active: editForm.active,
            });
            await fetchResidents();
        } catch (err) { console.error(err); }
        finally { setEditOpen(false); }
    }, [editForm, fetchResidents, selectedRow]);

    // ── Filtering ─────────────────────────────────────────────────────────────
    const filteredRows = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return residents.filter(row => {
            const matchesSearch = !term ||
                (row.fullName  || "").toLowerCase().includes(term) ||
                (row.email     || "").toLowerCase().includes(term) ||
                (row.unitNumber|| "").toLowerCase().includes(term) ||
                (row.phoneNumber|| "").toLowerCase().includes(term);
            const status = row.active !== false ? "ACTIVE" : "INACTIVE";
            const matchesStatus = statusFilter === "ALL" || status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [residents, searchTerm, statusFilter]);

    // ── Summary counts ────────────────────────────────────────────────────────
    const activeCount   = useMemo(() => residents.filter(r => r.active !== false).length, [residents]);
    const inactiveCount = useMemo(() => residents.filter(r => r.active === false).length, [residents]);

    // ── Columns ───────────────────────────────────────────────────────────────
    const columns = useMemo(() => [
        {
            field: "fullName", headerName: "Resident", flex: 1, minWidth: 200,
            renderCell: (params) => (
                <Box>
                    <Typography variant="body2" fontWeight={600} lineHeight={1.3}>
                        {params.row.fullName || "Unnamed Resident"}
                    </Typography>
                    {params.row.email && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                            {params.row.email}
                        </Typography>
                    )}
                </Box>
            )
        },
        { field: "unitNumber",   headerName: "Unit",    width: 100,  renderCell: (p) => <Typography variant="body2">{p.row.unitNumber || "—"}</Typography> },
        { field: "phoneNumber",  headerName: "Contact", width: 140,  renderCell: (p) => <Typography variant="body2" color={p.row.phoneNumber ? "text.primary" : "text.disabled"}>{p.row.phoneNumber || "—"}</Typography> },
        {
            field: "status", headerName: "Status", width: 120,
            renderCell: (params) => <StatusBadge status={params.row.active !== false ? "ACTIVE" : "INACTIVE"} />
        },
        {
            field: "actions", headerName: "", width: 56, sortable: false, align: "center", headerAlign: "center",
            renderCell: (params) => (
                <Tooltip title="Actions" arrow>
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, params.row)} aria-label={`Actions for ${params.row.fullName}`}
                        sx={{ borderRadius: "6px", color: "text.secondary", "&:hover": { bgcolor: "action.hover" } }}>
                        <MoreVertIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            )
        }
    ], [handleMenuOpen]);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <DashboardLayout>
            <PageHeader
                title="Residents"
                subtitle="Manage and monitor all community resident accounts."
                action={
                    <ActionButton variant="outlined" startIcon={<RefreshIcon />} onClick={fetchResidents} disabled={loading} sx={{ fontSize: "0.8125rem" }}>
                        Refresh
                    </ActionButton>
                }
            />

            {/* ── Summary strip ─────────────────────────────────────────────── */}
            {!loading && !error && (
                <Stack direction="row" spacing={2} sx={{ mb: 3 }} flexWrap="wrap">
                    <Box sx={{ px: 2, py: 1, bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 1 }}>
                        <PeopleIcon sx={{ fontSize: "1rem", color: "info.main" }} />
                        <Typography variant="body2" fontWeight={500} color="text.secondary">Total:</Typography>
                        <Typography variant="body2" fontWeight={700}>{residents.length}</Typography>
                    </Box>
                    <Box sx={{ px: 2, py: 1, bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 1 }}>
                        <CheckCircleIcon sx={{ fontSize: "1rem", color: "success.main" }} />
                        <Typography variant="body2" fontWeight={500} color="text.secondary">Active:</Typography>
                        <Typography variant="body2" fontWeight={700} color="success.main">{activeCount}</Typography>
                    </Box>
                    <Box sx={{ px: 2, py: 1, bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 1 }}>
                        <PersonOffIcon sx={{ fontSize: "1rem", color: "text.disabled" }} />
                        <Typography variant="body2" fontWeight={500} color="text.secondary">Inactive:</Typography>
                        <Typography variant="body2" fontWeight={700} color="text.secondary">{inactiveCount}</Typography>
                    </Box>
                </Stack>
            )}

            {/* ── Full-page error ───────────────────────────────────────────── */}
            {error && !residents.length && (
                <Box sx={{ mb: 3 }}>
                    <ErrorState title="Failed to load residents" message={error} onRetry={fetchResidents} />
                </Box>
            )}

            {/* ── Main table panel ──────────────────────────────────────────── */}
            <Box sx={{ bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
                <TableToolbar
                    title="Resident Directory"
                    action={
                        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                            <SearchBar
                                value={searchTerm}
                                onChange={setSearchTerm}
                                onClear={() => setSearchTerm("")}
                                placeholder="Search by name, email, or unit…"
                                sx={{ width: { xs: "100%", sm: 260 } }}
                            />
                            <FormControl size="small" sx={{ minWidth: 140 }}>
                                <InputLabel id="status-filter-label">Status</InputLabel>
                                <Select
                                    labelId="status-filter-label"
                                    label="Status"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    sx={{ borderRadius: "8px", fontSize: "0.8125rem" }}
                                >
                                    {STATUS_FILTER_OPTIONS.map(opt => (
                                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            {(searchTerm || statusFilter !== "ALL") && (
                                <Chip
                                    label={`${filteredRows.length} of ${residents.length}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: "0.75rem", height: 26 }}
                                    onDelete={() => { setSearchTerm(""); setStatusFilter("ALL"); }}
                                />
                            )}
                        </Stack>
                    }
                />
                <Box sx={{ height: 520 }}>
                    <DataGrid
                        rows={filteredRows}
                        columns={columns}
                        loading={loading}
                        error={error && residents.length ? error : null}
                        onRetry={fetchResidents}
                        disableRowSelectionOnClick
                        pageSize={10}
                    />
                </Box>
            </Box>

            {/* ── Row actions menu ──────────────────────────────────────────── */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{ elevation: 3, sx: { minWidth: 200, mt: 0.5, borderRadius: 2, border: "1px solid", borderColor: "divider" } }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
                {Object.entries(ACTION_CONFIG).map(([key, config], index, arr) => [
                    key === "DELETE" && <Divider key="divider" sx={{ my: 0.5 }} />,
                    <MenuItem
                        key={key}
                        onClick={() => handleAction(key)}
                        disabled={!config.enabled}
                        sx={{
                            py: 1, px: 1.5, fontSize: "0.8125rem",
                            color: key === "DELETE" ? "error.main" : "text.primary",
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 32 }}>{config.icon}</ListItemIcon>
                        <ListItemText primary={config.label} primaryTypographyProps={{ fontSize: "0.8125rem" }} />
                    </MenuItem>
                ])}
            </Menu>

            {/* ── View Details dialog ───────────────────────────────────────── */}
            <Dialog open={viewOpen} onClose={() => { setViewOpen(false); setSelectedRow(null); }} maxWidth="sm" fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", borderBottom: "1px solid", borderColor: "divider", pb: 2 }}>
                    Resident Profile
                    {selectedRow && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 400, mt: 0.25 }}>
                            {selectedRow.email}
                        </Typography>
                    )}
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    {selectedRow && (
                        <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }} gap={3}>
                            <DetailField label="Full Name"    value={selectedRow.fullName} />
                            <DetailField label="Unit / Flat"  value={selectedRow.unitNumber} />
                            <DetailField label="Block"        value={selectedRow.blockName} />
                            <DetailField label="Community"    value={selectedRow.communityName} />
                            <DetailField label="Contact"      value={selectedRow.phoneNumber} />
                            <DetailField label="Official ID"  value={selectedRow.officialUserId} />
                            <DetailField label="Meter Serial" value={selectedRow.meterSerialNumber} />
                            <DetailField label="Account Status">
                                <Box sx={{ mt: 0.5 }}>
                                    <StatusBadge status={selectedRow.active !== false ? "ACTIVE" : "INACTIVE"} />
                                </Box>
                            </DetailField>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ borderTop: "1px solid", borderColor: "divider", px: 3, py: 2, gap: 1 }}>
                    <Button onClick={() => { setViewOpen(false); }} sx={{ textTransform: "none" }}>Close</Button>
                    <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        sx={{ textTransform: "none" }}
                        onClick={() => {
                            setViewOpen(false);
                            setEditForm({ phoneNumber: selectedRow?.phoneNumber || "", officialUserId: selectedRow?.officialUserId || "", verified: selectedRow?.verified || false, active: selectedRow?.active ?? true });
                            setEditOpen(true);
                        }}
                    >
                        Edit Profile
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Edit Resident dialog ──────────────────────────────────────── */}
            <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", borderBottom: "1px solid", borderColor: "divider", pb: 2 }}>
                    Edit Resident
                    {selectedRow && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 400, mt: 0.25 }}>
                            {selectedRow.fullName}
                        </Typography>
                    )}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2.5} sx={{ mt: 2.5 }}>
                        <TextField
                            label="Phone Number"
                            value={editForm.phoneNumber}
                            onChange={(e) => setEditForm(p => ({ ...p, phoneNumber: e.target.value }))}
                            fullWidth size="small"
                        />
                        <TextField
                            label="Official User ID"
                            value={editForm.officialUserId}
                            onChange={(e) => setEditForm(p => ({ ...p, officialUserId: e.target.value }))}
                            fullWidth size="small"
                        />
                        <FormControl fullWidth size="small">
                            <InputLabel>Verification</InputLabel>
                            <Select label="Verification" value={editForm.verified ? "true" : "false"}
                                onChange={(e) => setEditForm(p => ({ ...p, verified: e.target.value === "true" }))}>
                                <MenuItem value="true">Verified</MenuItem>
                                <MenuItem value="false">Pending</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth size="small">
                            <InputLabel>Account Status</InputLabel>
                            <Select label="Account Status" value={editForm.active ? "active" : "inactive"}
                                onChange={(e) => setEditForm(p => ({ ...p, active: e.target.value === "active" }))}>
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="inactive">Inactive</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ borderTop: "1px solid", borderColor: "divider", px: 3, py: 2, gap: 1 }}>
                    <Button onClick={() => setEditOpen(false)} sx={{ textTransform: "none" }}>Cancel</Button>
                    <ActionButton variant="contained" onClick={handleEditSave} sx={{ textTransform: "none" }}>
                        Save Changes
                    </ActionButton>
                </DialogActions>
            </Dialog>

            {/* ── Confirmation Dialog ───────────────────────────────────────── */}
            <ConfirmationDialog
                open={dialogConfig.open}
                title={dialogConfig.title}
                message={dialogConfig.message}
                onConfirm={dialogConfig.onConfirm}
                onClose={() => setDialogConfig(p => ({ ...p, open: false }))}
                color={dialogConfig.confirmColor}
                confirmText={dialogConfig.confirmText}
            />
        </DashboardLayout>
    );
};

export default ResidentsPage;
