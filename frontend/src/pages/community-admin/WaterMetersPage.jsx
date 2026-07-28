import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    Stack,
    IconButton,
    Tooltip,
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
    MenuItem,
    Divider,
    Paper,
    Grid,
    Avatar,
    Skeleton,
    Alert,
    FormHelperText,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import EditIcon from "@mui/icons-material/Edit";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SpeedIcon from "@mui/icons-material/Speed";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import RefreshIcon from "@mui/icons-material/Refresh";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptIcon from "@mui/icons-material/Receipt";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import HistoryIcon from "@mui/icons-material/History";
import SaveIcon from "@mui/icons-material/Save";
import SettingsIcon from "@mui/icons-material/Settings";

import DashboardLayout from "../../components/layout/DashboardLayout";
import PageSummaryHeader from "../../components/common/PageSummaryHeader";
import DataGrid from "../../components/common/DataGrid";
import TableToolbar from "../../components/common/TableToolbar";
import SearchBar from "../../components/common/SearchBar";
import StatusBadge from "../../components/common/StatusBadge";
import ActionButton from "../../components/common/ActionButton";
import ErrorState from "../../components/common/ErrorState";
import { UserCell, ConsumptionCell, TextSubtextCell } from "../../components/common/DataGridCells";

import CommunityOpsService from "../../services/CommunityOpsService";
import { useNotification } from "../../context/NotificationContext";

const STATUS_FILTER_OPTIONS = [
    { value: "ALL",      label: "All Statuses" },
    { value: "ACTIVE",   label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "FAULTY",   label: "Faulty" },
    { value: "REPLACED", label: "Replaced" },
];

const WaterMetersPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const [meters, setMeters]             = useState([]);
    const [residentsList, setResidentsList] = useState([]);
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState(null);
    const [searchTerm, setSearchTerm]     = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    // Separate Dialog States for Distinct UX
    const [selectedRow, setSelectedRow]   = useState(null);
    
    // 1. View Dialog
    const [viewOpen, setViewOpen]         = useState(false);
    const [viewLoading, setViewLoading]   = useState(false);

    // 2. Assign Dialog
    const [assignOpen, setAssignOpen]     = useState(false);
    const [assignForm, setAssignForm]     = useState({ residentProfileId: "", currentReading: "" });

    // 3. Edit Dialog
    const [editOpen, setEditOpen]         = useState(false);
    const [editForm, setEditForm]         = useState({ meterNumber: "", currentReading: "", meterStatus: "ACTIVE", active: true });

    // ── Data fetching ─────────────────────────────────────────────────────────
    const fetchMeters = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [metersData, resData] = await Promise.all([
                CommunityOpsService.getAllMeters(),
                CommunityOpsService.getAllResidents().catch(() => []),
            ]);
            setMeters(metersData || []);
            setResidentsList(resData || []);
        } catch (err) {
            setError(err?.response?.data?.message || err.message || "Failed to load water meters.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchMeters(); }, [fetchMeters]);

    // ── Dialog Opener Handlers ────────────────────────────────────────────────
    const handleOpenView = (meter) => {
        setSelectedRow(meter);
        setViewOpen(true);
        setViewLoading(true);
        setTimeout(() => setViewLoading(false), 200);
    };

    const handleOpenAssign = (meter) => {
        setSelectedRow(meter);
        setAssignForm({
            residentProfileId: meter?.residentProfileId ? String(meter.residentProfileId) : "",
            currentReading: meter?.currentReading != null ? String(meter.currentReading) : "0",
        });
        setAssignOpen(true);
    };

    const handleOpenEdit = (meter) => {
        setSelectedRow(meter);
        setEditForm({
            meterNumber: meter?.meterNumber || "",
            currentReading: meter?.currentReading != null ? String(meter.currentReading) : "0",
            meterStatus: meter?.meterStatus || "ACTIVE",
            active: meter?.active ?? true,
        });
        setEditOpen(true);
    };

    const handleToggleStatus = async (meter) => {
        try {
            const newActive = !meter?.active;
            const newStatus = newActive ? "ACTIVE" : "INACTIVE";
            await CommunityOpsService.updateMeter(meter.id, {
                active: newActive,
                meterStatus: newStatus,
            });
            showNotification(`Meter ${meter.meterNumber} status updated to ${newStatus}.`, "success");
            fetchMeters();
        } catch (err) {
            showNotification(err?.response?.data?.message || "Failed to toggle status", "error");
        }
    };

    // ── Assign Save ───────────────────────────────────────────────────────────
    const handleAssignSave = async () => {
        try {
            if (!assignForm.residentProfileId) {
                showNotification("Please select a resident to assign.", "warning");
                return;
            }
            await CommunityOpsService.assignMeter(selectedRow?.id, {
                residentProfileId: Number(assignForm.residentProfileId),
                currentReading: assignForm.currentReading ? Number(assignForm.currentReading) : undefined,
            });
            showNotification(`Meter ${selectedRow.meterNumber} assigned successfully.`, "success");
            setAssignOpen(false);
            fetchMeters();
        } catch (err) {
            showNotification(err?.response?.data?.message || "Failed to assign meter", "error");
        }
    };

    // ── Edit Save ─────────────────────────────────────────────────────────────
    const handleEditSave = async () => {
        try {
            await CommunityOpsService.updateMeter(selectedRow?.id, {
                meterNumber: editForm.meterNumber || undefined,
                currentReading: editForm.currentReading ? Number(editForm.currentReading) : undefined,
                meterStatus: editForm.meterStatus,
                active: editForm.active,
            });
            showNotification(`Meter ${editForm.meterNumber} updated successfully.`, "success");
            setEditOpen(false);
            fetchMeters();
        } catch (err) {
            showNotification(err?.response?.data?.message || "Failed to update meter", "error");
        }
    };

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

    // ── DataGrid Columns (Standard Order: View -> Assign -> Edit -> Toggle Status) ──
    const columns = useMemo(() => [
        {
            field: "meterNumber", 
            headerName: "Meter Serial #", 
            width: 180,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={700} color="primary.main" sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                    {params.row.meterNumber || "—"}
                </Typography>
            )
        },
        {
            field: "residentName", 
            headerName: "Assigned Household", 
            flex: 1.2, 
            minWidth: 200,
            renderCell: (params) => (
                <UserCell 
                    name={params.row.residentName || "Unassigned Meter"}
                    email={params.row.officialUserId ? `Official ID: ${params.row.officialUserId}` : null}
                    role="HOUSEHOLD"
                />
            )
        },
        {
            field: "currentReading", 
            headerName: "Current Reading", 
            width: 150,
            renderCell: (params) => (
                <ConsumptionCell value={params.row.currentReading} />
            )
        },
        {
            field: "meterStatus", 
            headerName: "Status", 
            width: 130,
            renderCell: (params) => <StatusBadge status={params.row.meterStatus || "ACTIVE"} />
        },
        {
            field: "actions",
            headerName: "Actions",
            width: 160,
            sortable: false,
            align: "center",
            headerAlign: "center",
            renderCell: (params) => {
                const row = params.row;
                return (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                        <Tooltip title="View Details" arrow>
                            <IconButton size="small" color="primary" onClick={() => handleOpenView(row)}>
                                <VisibilityIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Assign Meter" arrow>
                            <IconButton size="small" color="info" onClick={() => handleOpenAssign(row)}>
                                <AssignmentIndIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Edit Settings" arrow>
                            <IconButton size="small" color="primary" onClick={() => handleOpenEdit(row)}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Toggle Status" arrow>
                            <IconButton size="small" color="warning" onClick={() => handleToggleStatus(row)}>
                                <PowerSettingsNewIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                );
            }
        }
    ], []);

    const headerMetadata = useMemo(() => [
        { label: "Total Water Meters", value: meters.length },
        { label: "Active", value: meters.filter(m => m.meterStatus === "ACTIVE" || m.active !== false).length, color: "success" },
        { label: "Assigned", value: meters.filter(m => m.residentProfileId || m.residentName).length, color: "primary" },
    ], [meters]);

    return (
        <DashboardLayout>
            <PageSummaryHeader
                title="Water Meters"
                subtitle="Monitor, inspect, and manage smart water meters across the community."
                icon={SpeedIcon}
                metadata={headerMetadata}
                action={
                    <ActionButton variant="outlined" startIcon={<RefreshIcon />} onClick={fetchMeters} disabled={loading}>
                        Refresh
                    </ActionButton>
                }
            />

            {/* Error state */}
            {error && !meters.length && (
                <Box sx={{ mb: 3 }}>
                    <ErrorState title="Failed to load water meters" message={error} onRetry={fetchMeters} />
                </Box>
            )}

            {/* Main Data Panel */}
            <Box sx={{ bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
                <TableToolbar
                    title="Smart Meter Directory"
                    count={filteredRows.length}
                    action={
                        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                            <SearchBar
                                value={searchTerm}
                                onChange={setSearchTerm}
                                onClear={() => setSearchTerm("")}
                                placeholder="Search meter serial, resident..."
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
                        </Stack>
                    }
                />
                <Box sx={{ height: 560 }}>
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

            {/* ── 1. VIEW DIALOG (READ-ONLY INSPECTION MODAL) ────────────────────── */}
            <Dialog 
                open={viewOpen} 
                onClose={() => setViewOpen(false)} 
                maxWidth="md" 
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                {selectedRow && (
                    <>
                        <DialogTitle sx={{ p: 2.5, bgcolor: "background.paper", borderBottom: "1px solid", borderColor: "divider" }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Avatar sx={{ width: 52, height: 52, bgcolor: "primary.main" }}>
                                        <VisibilityIcon />
                                    </Avatar>
                                    <Box>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Typography variant="h6" fontWeight={700} sx={{ fontFamily: "monospace" }}>
                                                {selectedRow.meterNumber}
                                            </Typography>
                                            <Chip label="READ-ONLY INSPECTION" size="small" color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
                                        </Stack>
                                        <Typography variant="body2" color="text.secondary">
                                            Assigned Resident: <strong>{selectedRow.residentName || "Unassigned"}</strong>
                                        </Typography>
                                    </Box>
                                </Stack>
                                <StatusBadge status={selectedRow.meterStatus || "ACTIVE"} />
                            </Stack>
                        </DialogTitle>

                        <DialogContent dividers sx={{ p: 3 }}>
                            {viewLoading ? (
                                <Stack spacing={2}>
                                    <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
                                    <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2 }} />
                                </Stack>
                            ) : (
                                <Stack spacing={3}>
                                    {/* Summary Cards */}
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={4}>
                                            <Paper variant="outlined" sx={{ p: 1.5, textAlign: "center", bgcolor: "grey.50" }}>
                                                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">CURRENT READING</Typography>
                                                <Typography variant="h6" fontWeight={700} color="primary.main">
                                                    {selectedRow.currentReading != null ? `${selectedRow.currentReading} L` : "—"}
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <Paper variant="outlined" sx={{ p: 1.5, textAlign: "center", bgcolor: "grey.50" }}>
                                                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">METER STATUS</Typography>
                                                <Box sx={{ mt: 0.5, display: "flex", justifyContent: "center" }}>
                                                    <StatusBadge status={selectedRow.meterStatus || "ACTIVE"} />
                                                </Box>
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <Paper variant="outlined" sx={{ p: 1.5, textAlign: "center", bgcolor: "grey.50" }}>
                                                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">ASSIGNED RESIDENT</Typography>
                                                <Typography variant="body2" fontWeight={700} color="text.primary" noWrap>
                                                    {selectedRow.residentName || "Unassigned"}
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                    </Grid>

                                    {/* Specifications Grid */}
                                    <Paper variant="outlined" sx={{ p: 2 }}>
                                        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: "primary.main", display: "flex", alignItems: "center", gap: 1 }}>
                                            <SpeedIcon fontSize="small" /> Technical Specifications & Alignment
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="caption" color="text.secondary" display="block">Meter Serial Number</Typography>
                                                <Typography variant="body2" fontWeight={700} sx={{ fontFamily: "monospace" }}>{selectedRow.meterNumber}</Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="caption" color="text.secondary" display="block">Assigned Resident</Typography>
                                                <Typography variant="body2" fontWeight={600}>{selectedRow.residentName || "Unassigned"}</Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="caption" color="text.secondary" display="block">Resident Profile ID</Typography>
                                                <Typography variant="body2" fontWeight={600}>{selectedRow.residentProfileId || "—"}</Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="caption" color="text.secondary" display="block">Official User ID</Typography>
                                                <Typography variant="body2" fontWeight={600}>{selectedRow.officialUserId || "—"}</Typography>
                                            </Grid>
                                        </Grid>
                                    </Paper>

                                    {/* Quick Navigation Bar */}
                                    <Box>
                                        <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" sx={{ mb: 1, textTransform: "uppercase" }}>
                                            Quick Navigation Shortcuts
                                        </Typography>
                                        <Stack direction="row" spacing={1.5} flexWrap="wrap">
                                            {selectedRow.residentName && (
                                                <Button 
                                                    variant="outlined" 
                                                    size="small" 
                                                    startIcon={<PeopleIcon />}
                                                    endIcon={<OpenInNewIcon fontSize="small" />}
                                                    onClick={() => {
                                                        setViewOpen(false);
                                                        navigate("/community-admin/residents", { state: { search: selectedRow.residentName } });
                                                    }}
                                                >
                                                    View Resident Profile
                                                </Button>
                                            )}
                                            <Button 
                                                variant="outlined" 
                                                size="small" 
                                                startIcon={<ReceiptIcon />}
                                                endIcon={<OpenInNewIcon fontSize="small" />}
                                                onClick={() => {
                                                    setViewOpen(false);
                                                    navigate("/community-admin/bills", { state: { search: selectedRow.meterNumber } });
                                                }}
                                            >
                                                View Meter Bills
                                            </Button>
                                        </Stack>
                                    </Box>
                                </Stack>
                            )}
                        </DialogContent>

                        <DialogActions sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
                            <Button onClick={() => setViewOpen(false)}>Close</Button>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                startIcon={<EditIcon />}
                                onClick={() => {
                                    setViewOpen(false);
                                    handleOpenEdit(selectedRow);
                                }}
                            >
                                Edit Settings
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* ── 2. ASSIGN METER WORKFLOW DIALOG ───────────────────────────────── */}
            <Dialog 
                open={assignOpen} 
                onClose={() => setAssignOpen(false)} 
                maxWidth="sm" 
                fullWidth 
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                {selectedRow && (
                    <>
                        <DialogTitle sx={{ p: 2.5, bgcolor: "info.50", borderBottom: "1px solid", borderColor: "divider" }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar sx={{ width: 44, height: 44, bgcolor: "info.main" }}>
                                    <AssignmentIndIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" fontWeight={700}>
                                        Assign Water Meter
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Meter Serial: <strong style={{ fontFamily: "monospace" }}>{selectedRow.meterNumber}</strong>
                                    </Typography>
                                </Box>
                            </Stack>
                        </DialogTitle>

                        <DialogContent sx={{ pt: 3 }}>
                            <Stack spacing={2.5}>
                                <Alert severity="info" sx={{ borderRadius: 2, fontSize: "0.8125rem" }}>
                                    Assigning a smart meter pairs reading telemetry and automated billing directly to the selected resident's household account.
                                </Alert>

                                {/* Current Assignment Status Card */}
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2 }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 0.5, textTransform: "uppercase" }}>
                                        Current Meter Assignment
                                    </Typography>
                                    {selectedRow.residentName ? (
                                        <Typography variant="body2" fontWeight={700} color="primary.main">
                                            Currently Assigned to: {selectedRow.residentName} (Profile #{selectedRow.residentProfileId})
                                        </Typography>
                                    ) : (
                                        <Typography variant="body2" color="warning.dark" fontWeight={600}>
                                            Currently Unassigned — Available for resident pairing
                                        </Typography>
                                    )}
                                </Paper>

                                {/* Resident Dropdown Selection */}
                                <FormControl fullWidth size="small">
                                    <InputLabel id="assign-resident-select-label">Select Target Resident</InputLabel>
                                    <Select
                                        labelId="assign-resident-select-label"
                                        label="Select Target Resident"
                                        value={assignForm.residentProfileId}
                                        onChange={(e) => setAssignForm(p => ({ ...p, residentProfileId: e.target.value }))}
                                    >
                                        <MenuItem value="">
                                            <em>Unassign / Remove Assignment</em>
                                        </MenuItem>
                                        {residentsList.map((res) => (
                                            <MenuItem key={res.id} value={String(res.id)}>
                                                {res.fullName} — Unit {res.unitNumber || "N/A"} (ID #{res.id})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText>Select a registered community resident profile</FormHelperText>
                                </FormControl>

                                {/* Meter Reading Initial / Current Sync */}
                                <TextField
                                    label="Current Water Meter Reading (L)"
                                    type="number"
                                    value={assignForm.currentReading}
                                    onChange={(e) => setAssignForm(p => ({ ...p, currentReading: e.target.value }))}
                                    fullWidth 
                                    size="small"
                                    helperText="Baseline initial reading for consumption calculation"
                                />
                            </Stack>
                        </DialogContent>

                        <DialogActions sx={{ borderTop: "1px solid", borderColor: "divider", px: 3, py: 2, gap: 1 }}>
                            <Button onClick={() => setAssignOpen(false)}>Cancel</Button>
                            <Button 
                                variant="contained" 
                                color="info" 
                                startIcon={<AssignmentIndIcon />}
                                onClick={handleAssignSave}
                            >
                                Confirm Assignment
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* ── 3. EDIT METER CONFIGURATION DIALOG ────────────────────────────── */}
            <Dialog 
                open={editOpen} 
                onClose={() => setEditOpen(false)} 
                maxWidth="sm" 
                fullWidth 
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                {selectedRow && (
                    <>
                        <DialogTitle sx={{ p: 2.5, bgcolor: "background.paper", borderBottom: "1px solid", borderColor: "divider" }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar sx={{ width: 44, height: 44, bgcolor: "primary.main" }}>
                                    <SettingsIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" fontWeight={700}>
                                        Edit Meter Configuration
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Update operational parameters and hardware settings for <strong style={{ fontFamily: "monospace" }}>{selectedRow.meterNumber}</strong>
                                    </Typography>
                                </Box>
                            </Stack>
                        </DialogTitle>

                        <DialogContent sx={{ pt: 3 }}>
                            <Stack spacing={3}>
                                {/* Section 1: Hardware Parameters */}
                                <Box>
                                    <Typography variant="subtitle2" fontWeight={700} color="primary.main" sx={{ mb: 1.5 }}>
                                        Hardware & Reading Telemetry
                                    </Typography>
                                    <Stack spacing={2}>
                                        <TextField
                                            label="Meter Serial Number"
                                            value={editForm.meterNumber}
                                            onChange={(e) => setEditForm(p => ({ ...p, meterNumber: e.target.value }))}
                                            fullWidth 
                                            size="small"
                                        />
                                        <TextField
                                            label="Current Reading (L)"
                                            type="number"
                                            value={editForm.currentReading}
                                            onChange={(e) => setEditForm(p => ({ ...p, currentReading: e.target.value }))}
                                            fullWidth 
                                            size="small"
                                        />
                                    </Stack>
                                </Box>

                                <Divider />

                                {/* Section 2: Operational Lifecycle */}
                                <Box>
                                    <Typography variant="subtitle2" fontWeight={700} color="primary.main" sx={{ mb: 1.5 }}>
                                        Operational Status & Lifecycle
                                    </Typography>
                                    <Stack spacing={2}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Operational Status</InputLabel>
                                            <Select 
                                                label="Operational Status" 
                                                value={editForm.meterStatus}
                                                onChange={(e) => setEditForm(p => ({ ...p, meterStatus: e.target.value }))}
                                            >
                                                <MenuItem value="ACTIVE">Active (Normal Operation)</MenuItem>
                                                <MenuItem value="INACTIVE">Inactive (Suspended)</MenuItem>
                                                <MenuItem value="FAULTY">Faulty (Requires Maintenance)</MenuItem>
                                                <MenuItem value="REPLACED">Replaced / Retired</MenuItem>
                                            </Select>
                                        </FormControl>

                                        <FormControl fullWidth size="small">
                                            <InputLabel>Telemetry State</InputLabel>
                                            <Select 
                                                label="Telemetry State" 
                                                value={editForm.active ? "active" : "inactive"}
                                                onChange={(e) => setEditForm(p => ({ ...p, active: e.target.value === "active" }))}
                                            >
                                                <MenuItem value="active">Enabled & Active</MenuItem>
                                                <MenuItem value="inactive">Disabled / Off-grid</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Stack>
                                </Box>
                            </Stack>
                        </DialogContent>

                        <DialogActions sx={{ borderTop: "1px solid", borderColor: "divider", px: 3, py: 2, gap: 1 }}>
                            <Button onClick={() => setEditOpen(false)}>Cancel</Button>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                startIcon={<SaveIcon />}
                                onClick={handleEditSave}
                            >
                                Save Configuration
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </DashboardLayout>
    );
};

export default WaterMetersPage;
