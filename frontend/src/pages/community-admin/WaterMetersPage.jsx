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
    Button,
    FormControl,
    InputLabel,
    Select,
    Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SpeedIcon from "@mui/icons-material/Speed";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import RefreshIcon from "@mui/icons-material/Refresh";
import LinkOffIcon from "@mui/icons-material/LinkOff";

import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import DataGrid from "../../components/common/DataGrid";
import TableToolbar from "../../components/common/TableToolbar";
import SearchBar from "../../components/common/SearchBar";
import StatusBadge from "../../components/common/StatusBadge";
import ActionButton from "../../components/common/ActionButton";
import ErrorState from "../../components/common/ErrorState";

import CommunityOpsService from "../../services/CommunityOpsService";

// ─── Detail field ─────────────────────────────────────────────────────────────
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

const ACTION_CONFIG = {
    VIEW:          { label: "View Details",   icon: <VisibilityIcon fontSize="small" />,              enabled: true },
    ASSIGN:        { label: "Assign Resident", icon: <AssignmentIndIcon fontSize="small" />,           enabled: true },
    EDIT:          { label: "Edit Settings",   icon: <EditIcon fontSize="small" />,                    enabled: true },
    TOGGLE_STATUS: { label: "Toggle Status",   icon: <PowerSettingsNewIcon fontSize="small" />,        enabled: true },
};

const STATUS_FILTER_OPTIONS = [
    { value: "ALL",      label: "All Statuses" },
    { value: "ACTIVE",   label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "FAULTY",   label: "Faulty" },
    { value: "REPLACED", label: "Replaced" },
];

const WaterMetersPage = () => {
    const theme = useTheme();
    const [meters, setMeters]           = useState([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState(null);
    const [searchTerm, setSearchTerm]   = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    // UI state
    const [anchorEl, setAnchorEl]         = useState(null);
    const [selectedRow, setSelectedRow]   = useState(null);
    const [dialogOpen, setDialogOpen]     = useState(false);
    const [dialogMode, setDialogMode]     = useState("EDIT");
    const [viewOpen, setViewOpen]         = useState(false);
    const [dialogForm, setDialogForm]     = useState({ residentProfileId: "", meterNumber: "", currentReading: "", meterStatus: "ACTIVE", active: true });

    // ── Data fetching ─────────────────────────────────────────────────────────
    const fetchMeters = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await CommunityOpsService.getAllMeters();
            setMeters(data || []);
        } catch (err) {
            setError(err?.response?.data?.message || err.message || "Failed to load water meters.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchMeters(); }, [fetchMeters]);

    // ── Menu handlers ─────────────────────────────────────────────────────────
    const handleMenuOpen  = useCallback((event, row) => { event.stopPropagation(); setAnchorEl(event.currentTarget); setSelectedRow(row); }, []);
    const handleMenuClose = useCallback(() => setAnchorEl(null), []);

    const handleAction = useCallback((actionKey) => {
        handleMenuClose();
        if (actionKey === "TOGGLE_STATUS") {
            CommunityOpsService.updateMeter(selectedRow?.id, {
                active: !selectedRow?.active,
                meterStatus: selectedRow?.active ? "INACTIVE" : "ACTIVE",
            }).then(fetchMeters).catch(console.error);
        } else if (actionKey === "VIEW") {
            setViewOpen(true);
        } else if (actionKey === "ASSIGN" || actionKey === "EDIT") {
            setDialogMode(actionKey);
            setDialogForm({
                residentProfileId: selectedRow?.residentProfileId || "",
                meterNumber:       selectedRow?.meterNumber || "",
                currentReading:    selectedRow?.currentReading || "",
                meterStatus:       selectedRow?.meterStatus || "ACTIVE",
                active:            selectedRow?.active ?? true,
            });
            setDialogOpen(true);
        }
    }, [fetchMeters, handleMenuClose, selectedRow]);

    const handleDialogSave = useCallback(async () => {
        try {
            const payload = {
                residentProfileId: dialogForm.residentProfileId ? Number(dialogForm.residentProfileId) : undefined,
                meterNumber:       dialogForm.meterNumber || undefined,
                currentReading:    dialogForm.currentReading ? Number(dialogForm.currentReading) : undefined,
                meterStatus:       dialogForm.meterStatus || undefined,
                active:            dialogForm.active,
            };
            if (dialogMode === "ASSIGN") {
                await CommunityOpsService.assignMeter(selectedRow?.id, payload);
            } else {
                await CommunityOpsService.updateMeter(selectedRow?.id, payload);
            }
            await fetchMeters();
        } catch (err) { console.error(err); }
        finally { setDialogOpen(false); }
    }, [dialogForm, dialogMode, fetchMeters, selectedRow]);

    // ── Filtering ─────────────────────────────────────────────────────────────
    const filteredRows = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return meters.filter(row => {
            const matchesSearch = !term ||
                (row.meterNumber    || "").toLowerCase().includes(term) ||
                (row.residentName   || "").toLowerCase().includes(term) ||
                (row.officialUserId || "").toLowerCase().includes(term);
            const meterStatus = (row.meterStatus || "ACTIVE").toUpperCase();
            const matchesStatus = statusFilter === "ALL" || meterStatus === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [meters, searchTerm, statusFilter]);

    // ── Summary counts ────────────────────────────────────────────────────────
    const activeCount     = useMemo(() => meters.filter(m => m.meterStatus === "ACTIVE").length, [meters]);
    const faultyCount     = useMemo(() => meters.filter(m => m.meterStatus === "FAULTY").length, [meters]);
    const unassignedCount = useMemo(() => meters.filter(m => !m.residentProfileId && !m.residentName).length, [meters]);

    // ── Columns ───────────────────────────────────────────────────────────────
    const columns = useMemo(() => [
        {
            field: "meterNumber", headerName: "Meter ID", width: 180,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={700} color="primary.main" sx={{ fontFamily: "monospace", fontSize: "0.8125rem" }}>
                    {params.row.meterNumber || "—"}
                </Typography>
            )
        },
        {
            field: "residentName", headerName: "Assigned To", flex: 1, minWidth: 180,
            renderCell: (params) => (
                <Box>
                    <Typography variant="body2" fontWeight={500} color={params.row.residentName ? "text.primary" : "text.disabled"}>
                        {params.row.residentName || "Unassigned"}
                    </Typography>
                    {params.row.officialUserId && (
                        <Typography variant="caption" color="text.secondary">ID: {params.row.officialUserId}</Typography>
                    )}
                </Box>
            )
        },
        {
            field: "currentReading", headerName: "Reading", width: 130,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={500}>
                    {params.row.currentReading != null ? `${params.row.currentReading} L` : "—"}
                </Typography>
            )
        },
        {
            field: "meterStatus", headerName: "Status", width: 130,
            renderCell: (params) => <StatusBadge status={params.row.meterStatus || "ACTIVE"} />
        },
        {
            field: "actions", headerName: "", width: 56, sortable: false, align: "center", headerAlign: "center",
            renderCell: (params) => (
                <Tooltip title="Actions" arrow>
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, params.row)} aria-label={`Actions for meter ${params.row.meterNumber}`}
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
                title="Water Meters"
                subtitle="Monitor and manage smart water meters across the community."
                action={
                    <ActionButton variant="outlined" startIcon={<RefreshIcon />} onClick={fetchMeters} disabled={loading} sx={{ fontSize: "0.8125rem" }}>
                        Refresh
                    </ActionButton>
                }
            />

            {/* ── Summary strip ─────────────────────────────────────────────── */}
            {!loading && !error && (
                <Stack direction="row" spacing={2} sx={{ mb: 3 }} flexWrap="wrap">
                    <Box sx={{ px: 2, py: 1, bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 1 }}>
                        <SpeedIcon sx={{ fontSize: "1rem", color: "primary.main" }} />
                        <Typography variant="body2" fontWeight={500} color="text.secondary">Total:</Typography>
                        <Typography variant="body2" fontWeight={700}>{meters.length}</Typography>
                    </Box>
                    <Box sx={{ px: 2, py: 1, bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 1 }}>
                        <CheckCircleIcon sx={{ fontSize: "1rem", color: "success.main" }} />
                        <Typography variant="body2" fontWeight={500} color="text.secondary">Active:</Typography>
                        <Typography variant="body2" fontWeight={700} color="success.main">{activeCount}</Typography>
                    </Box>
                    {faultyCount > 0 && (
                        <Box sx={{ px: 2, py: 1, bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "error.light", display: "flex", alignItems: "center", gap: 1 }}>
                            <ErrorIcon sx={{ fontSize: "1rem", color: "error.main" }} />
                            <Typography variant="body2" fontWeight={500} color="text.secondary">Faulty:</Typography>
                            <Typography variant="body2" fontWeight={700} color="error.main">{faultyCount}</Typography>
                        </Box>
                    )}
                    {unassignedCount > 0 && (
                        <Box sx={{ px: 2, py: 1, bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "warning.light", display: "flex", alignItems: "center", gap: 1 }}>
                            <LinkOffIcon sx={{ fontSize: "1rem", color: "warning.main" }} />
                            <Typography variant="body2" fontWeight={500} color="text.secondary">Unassigned:</Typography>
                            <Typography variant="body2" fontWeight={700} color="warning.main">{unassignedCount}</Typography>
                        </Box>
                    )}
                </Stack>
            )}

            {/* ── Full-page error ───────────────────────────────────────────── */}
            {error && !meters.length && (
                <Box sx={{ mb: 3 }}>
                    <ErrorState title="Failed to load water meters" message={error} onRetry={fetchMeters} />
                </Box>
            )}

            {/* ── Main table panel ──────────────────────────────────────────── */}
            <Box sx={{ bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
                <TableToolbar
                    title="Meter Registry"
                    action={
                        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                            <SearchBar
                                value={searchTerm}
                                onChange={setSearchTerm}
                                onClear={() => setSearchTerm("")}
                                placeholder="Search by meter ID or resident…"
                                sx={{ width: { xs: "100%", sm: 260 } }}
                            />
                            <FormControl size="small" sx={{ minWidth: 140 }}>
                                <InputLabel id="meter-status-filter-label">Status</InputLabel>
                                <Select
                                    labelId="meter-status-filter-label"
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
                                    label={`${filteredRows.length} of ${meters.length}`}
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
                        error={error && meters.length ? error : null}
                        onRetry={fetchMeters}
                        disableRowSelectionOnClick
                        pageSize={10}
                    />
                </Box>
            </Box>

            {/* ── Actions menu ──────────────────────────────────────────────── */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{ elevation: 3, sx: { minWidth: 200, mt: 0.5, borderRadius: 2, border: "1px solid", borderColor: "divider" } }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
                {Object.entries(ACTION_CONFIG).map(([key, config]) => (
                    <MenuItem key={key} onClick={() => handleAction(key)} disabled={!config.enabled}
                        sx={{ py: 1, px: 1.5, fontSize: "0.8125rem" }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>{config.icon}</ListItemIcon>
                        <ListItemText primary={config.label} primaryTypographyProps={{ fontSize: "0.8125rem" }} />
                    </MenuItem>
                ))}
            </Menu>

            {/* ── Assign / Edit dialog ──────────────────────────────────────── */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", borderBottom: "1px solid", borderColor: "divider", pb: 2 }}>
                    {dialogMode === "ASSIGN" ? "Assign Meter to Resident" : "Edit Meter Settings"}
                    {selectedRow && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 400, mt: 0.25, fontFamily: "monospace" }}>
                            {selectedRow.meterNumber}
                        </Typography>
                    )}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2.5} sx={{ mt: 2.5 }}>
                        <TextField
                            label="Resident Profile ID"
                            value={dialogForm.residentProfileId}
                            onChange={(e) => setDialogForm(p => ({ ...p, residentProfileId: e.target.value }))}
                            fullWidth size="small"
                            helperText="Enter the resident's numeric profile ID"
                        />
                        <TextField
                            label="Meter Number"
                            value={dialogForm.meterNumber}
                            onChange={(e) => setDialogForm(p => ({ ...p, meterNumber: e.target.value }))}
                            fullWidth size="small"
                        />
                        <TextField
                            label="Current Reading (L)"
                            type="number"
                            value={dialogForm.currentReading}
                            onChange={(e) => setDialogForm(p => ({ ...p, currentReading: e.target.value }))}
                            fullWidth size="small"
                        />
                        <FormControl fullWidth size="small">
                            <InputLabel>Meter Status</InputLabel>
                            <Select label="Meter Status" value={dialogForm.meterStatus}
                                onChange={(e) => setDialogForm(p => ({ ...p, meterStatus: e.target.value }))}>
                                <MenuItem value="ACTIVE">Active</MenuItem>
                                <MenuItem value="INACTIVE">Inactive</MenuItem>
                                <MenuItem value="FAULTY">Faulty</MenuItem>
                                <MenuItem value="REPLACED">Replaced</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ borderTop: "1px solid", borderColor: "divider", px: 3, py: 2, gap: 1 }}>
                    <Button onClick={() => setDialogOpen(false)} sx={{ textTransform: "none" }}>Cancel</Button>
                    <ActionButton variant="contained" onClick={handleDialogSave} sx={{ textTransform: "none" }}>
                        {dialogMode === "ASSIGN" ? "Assign Meter" : "Save Changes"}
                    </ActionButton>
                </DialogActions>
            </Dialog>

            {/* ── View Details dialog ───────────────────────────────────────── */}
            <Dialog open={viewOpen} onClose={() => { setViewOpen(false); setSelectedRow(null); }} maxWidth="sm" fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", borderBottom: "1px solid", borderColor: "divider", pb: 2 }}>
                    Meter Details
                    {selectedRow && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 400, mt: 0.25, fontFamily: "monospace" }}>
                            {selectedRow.meterNumber}
                        </Typography>
                    )}
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    {selectedRow && (
                        <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }} gap={3}>
                            <DetailField label="Meter Number"         value={selectedRow.meterNumber} />
                            <DetailField label="Assigned Resident"    value={selectedRow.residentName || "Unassigned"} />
                            <DetailField label="Resident Profile ID"  value={selectedRow.residentProfileId} />
                            <DetailField label="Official User ID"     value={selectedRow.officialUserId} />
                            <DetailField label="Current Reading">
                                <Typography variant="body2" fontWeight={600} color="primary.main">
                                    {selectedRow.currentReading != null ? `${selectedRow.currentReading} L` : "—"}
                                </Typography>
                            </DetailField>
                            <DetailField label="Status">
                                <Box sx={{ mt: 0.5 }}>
                                    <StatusBadge status={selectedRow.meterStatus || "ACTIVE"} />
                                </Box>
                            </DetailField>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ borderTop: "1px solid", borderColor: "divider", px: 3, py: 2 }}>
                    <Button variant="outlined" onClick={() => { setViewOpen(false); setSelectedRow(null); }} sx={{ textTransform: "none" }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </DashboardLayout>
    );
};

export default WaterMetersPage;
