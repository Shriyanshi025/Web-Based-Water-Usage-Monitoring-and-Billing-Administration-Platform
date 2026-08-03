import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    IconButton,
    Tooltip,
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
    MenuItem,
    Paper,
    Grid,
    Avatar,
    Skeleton,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BlockIcon from "@mui/icons-material/Block";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PeopleIcon from "@mui/icons-material/People";
import RefreshIcon from "@mui/icons-material/Refresh";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SpeedIcon from "@mui/icons-material/Speed";
import ApartmentIcon from "@mui/icons-material/Apartment";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import SupportIcon from "@mui/icons-material/Support";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import HistoryIcon from "@mui/icons-material/History";

import DashboardLayout from "../../components/layout/DashboardLayout";
import PageSummaryHeader from "../../components/common/PageSummaryHeader";
import { useNotification } from "../../context/NotificationContext";
import DataGrid from "../../components/common/DataGrid";
import TableToolbar from "../../components/common/TableToolbar";
import SearchBar from "../../components/common/SearchBar";
import StatusBadge from "../../components/common/StatusBadge";
import ConfirmationDialog from "../../components/common/ConfirmationDialog";
import ActionButton from "../../components/common/ActionButton";
import ErrorState from "../../components/common/ErrorState";
import AdminStatCard from "../../components/common/AdminStatCard";
import { UserCell, DateCell, TextSubtextCell, formatEnum } from "../../components/common/DataGridCells";

import CommunityOpsService from "../../services/CommunityOpsService";
import { formatCurrency, formatWaterUsage } from "../../helpers/numberHelper";

// ─── Detail Field Component ──────────────────────────────────────────────────
const DetailField = ({ label, value, children, icon: Icon }) => (
    <Box>
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.25 }}>
            {Icon && <Icon sx={{ fontSize: "0.85rem", color: "text.secondary" }} />}
            <Typography
                variant="caption"
                sx={{
                    fontWeight: 600,
                    color: "text.secondary",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontSize: "0.6875rem",
                }}
            >
                {label}
            </Typography>
        </Stack>
        {children || (
            <Typography variant="body2" sx={{ fontWeight: 600, color: value ? "text.primary" : "text.disabled" }}>
                {value || "—"}
            </Typography>
        )}
    </Box>
);

const STATUS_FILTER_OPTIONS = [
    { value: "ALL",      label: "All Statuses" },
    { value: "ACTIVE",   label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
];

const ResidentsPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const [residents, setResidents]       = useState([]);
    const [bills, setBills]               = useState([]);
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState(null);
    const [searchTerm, setSearchTerm]     = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    // Dialog & Detail states
    const [selectedRow, setSelectedRow]   = useState(null);
    const [viewOpen, setViewOpen]         = useState(false);
    const [viewLoading, setViewLoading]   = useState(false);
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

    // ── Action Handlers ───────────────────────────────────────────────────────
    const handleOpenView = useCallback(async (resident) => {
        setSelectedRow(resident);
        setViewOpen(true);
        setViewLoading(true);
        try {
            const billsRes = await CommunityOpsService.getBills();
            const list = Array.isArray(billsRes) ? billsRes : (billsRes?.data || []);
            setBills(list);
        } catch {
            setBills([]);
        } finally {
            setViewLoading(false);
        }
    }, []);

    const handleOpenEdit = useCallback((resident) => {
        setSelectedRow(resident);
        setEditForm({
            phoneNumber: resident?.phoneNumber || "",
            officialUserId: resident?.officialUserId || "",
            verified: resident?.verified || false,
            active: resident?.active ?? true,
        });
        setEditOpen(true);
    }, []);

    const handleGenerateBill = useCallback(async (resident) => {
        try {
            await CommunityOpsService.generateBillForResident(resident.id);
            showNotification(`Bill generated successfully for ${resident.fullName}.`, "success");
            fetchResidents();
        } catch (err) {
            showNotification(err?.response?.data?.message || err.message || "Failed to generate bill.", "error");
        }
    }, [fetchResidents, showNotification]);

    const handleToggleStatus = useCallback((resident) => {
        const newStatus = resident.active !== false ? "INACTIVE" : "ACTIVE";
        setDialogConfig({
            open: true,
            title: `${newStatus === "ACTIVE" ? "Activate" : "Deactivate"} Resident`,
            message: `Are you sure you want to ${newStatus.toLowerCase()} ${resident.fullName}?`,
            confirmText: newStatus === "ACTIVE" ? "Activate" : "Deactivate",
            confirmColor: newStatus === "ACTIVE" ? "success" : "warning",
            onConfirm: async () => {
                try {
                    await CommunityOpsService.updateResidentStatus(resident.id, newStatus);
                    showNotification(`Resident ${resident.fullName} is now ${newStatus.toLowerCase()}.`, "success");
                    fetchResidents();
                } catch (err) {
                    showNotification(err?.response?.data?.message || "Failed to update status", "error");
                } finally {
                    setDialogConfig(p => ({ ...p, open: false }));
                }
            }
        });
    }, [fetchResidents, showNotification]);

    const handleDelete = useCallback((resident) => {
        setDialogConfig({
            open: true,
            title: "Delete Resident Account",
            message: `Permanently delete ${resident.fullName}? This will remove their profile and all dependent records. This action cannot be undone.`,
            confirmText: "Delete",
            confirmColor: "error",
            onConfirm: async () => {
                try {
                    await CommunityOpsService.deleteResident(resident.id);
                    showNotification(`Resident ${resident.fullName} has been deleted.`, "success");
                    fetchResidents();
                } catch (err) {
                    showNotification(err?.response?.data?.message || "Failed to delete resident", "error");
                } finally {
                    setDialogConfig(p => ({ ...p, open: false }));
                }
            }
        });
    }, [fetchResidents, showNotification]);

    const handleEditSave = async () => {
        try {
            await CommunityOpsService.updateResident(selectedRow?.id, {
                phoneNumber: editForm.phoneNumber,
                officialUserId: editForm.officialUserId || undefined,
                verified: editForm.verified,
                active: editForm.active,
            });
            showNotification("Resident details updated successfully.", "success");
            setEditOpen(false);
            fetchResidents();
        } catch (err) {
            showNotification(err?.response?.data?.message || "Failed to save changes", "error");
        }
    };

    // ── Filtering ─────────────────────────────────────────────────────────────
    const filteredRows = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return residents.filter(row => {
            const matchesSearch = !term ||
                (row.fullName   || "").toLowerCase().includes(term) ||
                (row.email      || "").toLowerCase().includes(term) ||
                (row.unitNumber || "").toLowerCase().includes(term) ||
                (row.phoneNumber|| "").toLowerCase().includes(term);
            const status = row.active !== false ? "ACTIVE" : "INACTIVE";
            const matchesStatus = statusFilter === "ALL" || status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [residents, searchTerm, statusFilter]);

    // Summary counts
    const activeCount   = useMemo(() => residents.filter(r => r.active !== false).length, [residents]);
    const inactiveCount = useMemo(() => residents.filter(r => r.active === false).length, [residents]);

    // Computed resident stats for View Modal
    const residentStats = useMemo(() => {
        if (!selectedRow) return { totalBills: 0, unpaidBills: 0, outstandingDue: 0, lastReading: null };
        const resBills = bills.filter(b => b.residentProfileId === selectedRow.id || b.residentName === selectedRow.fullName);
        const totalBills = resBills.length;
        const unpaidList = resBills.filter(b => b.status === "UNPAID" || b.status === "OVERDUE");
        const unpaidBills = unpaidList.length;
        const outstandingDue = unpaidList.reduce((sum, b) => sum + (Number(b.amount) || Number(b.totalAmount) || 0), 0);
        const lastReading = selectedRow.currentReading != null ? `${selectedRow.currentReading} L` : "—";
        return { totalBills, unpaidBills, outstandingDue, lastReading, resBills };
    }, [selectedRow, bills]);

    // ── DataGrid Columns (Standard Action Order: View -> Edit -> Bill -> Status -> Delete) ──
    const columns = useMemo(() => [
        {
            field: "fullName",
            headerName: "Resident",
            flex: 1.2,
            minWidth: 220,
            renderCell: (params) => (
                <UserCell 
                    name={params.row.fullName || "Unnamed Resident"}
                    email={params.row.email}
                    role="RESIDENT"
                />
            )
        },
        { 
            field: "unitNumber",   
            headerName: "Unit / Flat",    
            width: 120,  
            renderCell: (p) => (
                <TextSubtextCell 
                    primary={p.row.unitNumber ? `Unit ${p.row.unitNumber}` : "—"} 
                    secondary={p.row.blockName ? `Block: ${p.row.blockName}` : null}
                />
            )
        },
        { 
            field: "phoneNumber",  
            headerName: "Contact", 
            width: 140,  
            renderCell: (p) => (
                <Typography variant="body2" color={p.row.phoneNumber ? "text.primary" : "text.disabled"}>
                    {p.row.phoneNumber || "—"}
                </Typography>
            )
        },
        {
            field: "meterSerialNumber",
            headerName: "Meter ID",
            width: 140,
            renderCell: (p) => (
                <Typography variant="body2" fontWeight={600} color="primary.main" sx={{ fontFamily: "monospace", fontSize: "0.8125rem" }}>
                    {p.row.meterSerialNumber || p.row.meterNumber || "—"}
                </Typography>
            )
        },
        {
            field: "status", 
            headerName: "Status", 
            width: 120,
            renderCell: (params) => <StatusBadge status={params.row.active !== false ? "ACTIVE" : "INACTIVE"} />
        },
        {
            field: "actions",
            headerName: "Actions",
            width: 180,
            sortable: false,
            align: "center",
            headerAlign: "center",
            renderCell: (params) => {
                const row = params.row;
                const isActive = row.active !== false;

                return (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                        <Tooltip title="View Profile & Details" arrow>
                            <IconButton size="small" color="primary" onClick={() => handleOpenView(row)}>
                                <VisibilityIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Edit Resident" arrow>
                            <IconButton size="small" color="primary" onClick={() => handleOpenEdit(row)}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Generate Bill" arrow>
                            <IconButton size="small" color="info" onClick={() => handleGenerateBill(row)}>
                                <ReceiptIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title={isActive ? "Deactivate Account" : "Activate Account"} arrow>
                            <IconButton size="small" color={isActive ? "warning" : "success"} onClick={() => handleToggleStatus(row)}>
                                <PowerSettingsNewIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete Account" arrow>
                            <IconButton size="small" color="error" onClick={() => handleDelete(row)}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                );
            }
        }
    ], [handleOpenView, handleOpenEdit, handleGenerateBill, handleToggleStatus, handleDelete]);

    const headerMetadata = useMemo(() => [
        { label: "Total Residents", value: residents.length },
        { label: "Active", value: activeCount, color: "success" },
        { label: "Inactive", value: inactiveCount, color: "warning" },
    ], [residents.length, activeCount, inactiveCount]);

    return (
        <DashboardLayout>
            <PageSummaryHeader
                title="Residents Directory"
                subtitle="Manage, inspect, and monitor all registered community resident accounts."
                icon={PeopleIcon}
                metadata={headerMetadata}
                action={
                    <ActionButton variant="outlined" startIcon={<RefreshIcon />} onClick={fetchResidents} disabled={loading} sx={{ fontSize: "0.8125rem" }}>
                        Refresh
                    </ActionButton>
                }
            />

            {/* Error State */}
            {error && !residents.length && (
                <Box sx={{ mb: 3 }}>
                    <ErrorState title="Failed to load residents" message={error} onRetry={fetchResidents} />
                </Box>
            )}

            {/* Data Table */}
            <Box sx={{ bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
                <TableToolbar
                    title="Resident Accounts"
                    count={filteredRows.length}
                    action={
                        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ flexWrap: "wrap" }}>
                            <SearchBar
                                value={searchTerm}
                                onChange={setSearchTerm}
                                onClear={() => setSearchTerm("")}
                                placeholder="Search name, email, unit..."
                                sx={{ width: { xs: "100%", sm: 260 } }}
                            />
                            <FormControl size="small" sx={{ minWidth: 140 }}>
                                <InputLabel id="status-filter-label">Status</InputLabel>
                                <Select
                                    labelId="status-filter-label"
                                    label="Status"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    sx={{ fontSize: "0.8125rem" }}
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
                        error={error && residents.length ? error : null}
                        onRetry={fetchResidents}
                        disableRowSelectionOnClick
                        pageSize={10}
                    />
                </Box>
            </Box>

            {/* ── RICH RESIDENT PROFILE VIEW MODAL ──────────────────────────────── */}
            <Dialog 
                open={viewOpen} 
                onClose={() => setViewOpen(false)} 
                maxWidth="md" 
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                {selectedRow && (
                    <>
                        {/* Header Banner */}
                        <DialogTitle sx={{ p: 2.5, bgcolor: "background.paper", borderBottom: "1px solid", borderColor: "divider" }}>
                            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Avatar 
                                        sx={{ 
                                            width: 56, 
                                            height: 56, 
                                            bgcolor: "primary.main", 
                                            fontWeight: 700, 
                                            fontSize: "1.25rem",
                                            boxShadow: 2
                                        }}
                                    >
                                        {selectedRow.fullName ? selectedRow.fullName.charAt(0).toUpperCase() : "R"}
                                    </Avatar>
                                    <Box>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Typography variant="h6" fontWeight={700}>
                                                {selectedRow.fullName}
                                            </Typography>
                                            <Chip label="RESIDENT" size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: "0.6875rem", fontWeight: 700 }} />
                                        </Stack>
                                        <Typography variant="body2" color="text.secondary">
                                            {selectedRow.email} · Unit {selectedRow.unitNumber || "N/A"}
                                        </Typography>
                                    </Box>
                                </Stack>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <StatusBadge status={selectedRow.active !== false ? "ACTIVE" : "INACTIVE"} />
                                    {selectedRow.verified && (
                                        <Chip label="VERIFIED" color="success" size="small" sx={{ height: 22, fontSize: "0.6875rem", fontWeight: 700 }} />
                                    )}
                                </Stack>
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
                                    {/* 1. Summary Cards Row */}
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={3}>
                                            <Paper variant="outlined" sx={{ p: 1.5, textAlign: "center", bgcolor: "grey.50" }}>
                                                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">TOTAL BILLS</Typography>
                                                <Typography variant="h6" fontWeight={700} color="primary.main">{residentStats.totalBills}</Typography>
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={12} sm={3}>
                                            <Paper variant="outlined" sx={{ p: 1.5, textAlign: "center", bgcolor: "grey.50" }}>
                                                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">PENDING BILLS</Typography>
                                                <Typography variant="h6" fontWeight={700} color={residentStats.unpaidBills > 0 ? "warning.main" : "text.secondary"}>
                                                    {residentStats.unpaidBills}
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={12} sm={3}>
                                            <Paper variant="outlined" sx={{ p: 1.5, textAlign: "center", bgcolor: "grey.50" }}>
                                                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">OUTSTANDING DUE</Typography>
                                                <Typography variant="h6" fontWeight={700} color={residentStats.outstandingDue > 0 ? "error.main" : "success.main"}>
                                                    {formatCurrency(residentStats.outstandingDue)}
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={12} sm={3}>
                                            <Paper variant="outlined" sx={{ p: 1.5, textAlign: "center", bgcolor: "grey.50" }}>
                                                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">METER READING</Typography>
                                                <Typography variant="h6" fontWeight={700} color="info.main">{residentStats.lastReading}</Typography>
                                            </Paper>
                                        </Grid>
                                    </Grid>

                                    {/* 2. Structured Information Grid */}
                                    <Grid container spacing={2.5}>
                                        {/* Personal & Contact Info */}
                                        <Grid item xs={12} md={6}>
                                            <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
                                                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1, color: "primary.main" }}>
                                                    <PeopleIcon fontSize="small" /> Personal & Contact Information
                                                </Typography>
                                                <Stack spacing={1.5}>
                                                    <DetailField label="Full Name" value={selectedRow.fullName} />
                                                    <DetailField label="Email Address" value={selectedRow.email} />
                                                    <DetailField label="Phone Number" value={selectedRow.phoneNumber} />
                                                    <DetailField label="Official User ID" value={selectedRow.officialUserId} />
                                                </Stack>
                                            </Paper>
                                        </Grid>

                                        {/* Household & Meter Info */}
                                        <Grid item xs={12} md={6}>
                                            <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
                                                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1, color: "primary.main" }}>
                                                    <ApartmentIcon fontSize="small" /> Household & Infrastructure
                                                </Typography>
                                                <Stack spacing={1.5}>
                                                    <DetailField label="Community" value={selectedRow.communityName} />
                                                    <DetailField label="Block Name" value={selectedRow.blockName} />
                                                    <DetailField label="Unit / Apartment #" value={selectedRow.unitNumber} />
                                                    <DetailField label="Assigned Water Meter">
                                                        <Typography variant="body2" fontWeight={700} color="primary.main" sx={{ fontFamily: "monospace" }}>
                                                            {selectedRow.meterSerialNumber || selectedRow.meterNumber || "No Meter Assigned"}
                                                        </Typography>
                                                    </DetailField>
                                                </Stack>
                                            </Paper>
                                        </Grid>
                                    </Grid>

                                    {/* 3. Activity Timeline */}
                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                                        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                                            <HistoryIcon fontSize="small" color="action" /> Resident Activity Timeline
                                        </Typography>
                                        <Stack spacing={1}>
                                            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                                                <CheckCircleIcon color="success" sx={{ fontSize: 18 }} />
                                                <Typography variant="body2">
                                                    Account created & registered for Unit {selectedRow.unitNumber || "N/A"}
                                                </Typography>
                                            </Box>
                                            {selectedRow.verified && (
                                                <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                                                    <CheckCircleIcon color="success" sx={{ fontSize: 18 }} />
                                                    <Typography variant="body2">
                                                        Community Admin approval & identity verification completed
                                                    </Typography>
                                                </Box>
                                            )}
                                            {(selectedRow.meterSerialNumber || selectedRow.meterNumber) && (
                                                <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                                                    <SpeedIcon color="info" sx={{ fontSize: 18 }} />
                                                    <Typography variant="body2">
                                                        Smart water meter <strong>{selectedRow.meterSerialNumber || selectedRow.meterNumber}</strong> assigned
                                                    </Typography>
                                                </Box>
                                            )}
                                            {residentStats.totalBills > 0 && (
                                                <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                                                    <ReceiptIcon color="primary" sx={{ fontSize: 18 }} />
                                                    <Typography variant="body2">
                                                        {residentStats.totalBills} water consumption bill(s) generated to date
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Stack>
                                    </Paper>

                                    {/* 4. Quick Navigation Bar */}
                                    <Box>
                                        <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" sx={{ mb: 1, textTransform: "uppercase" }}>
                                            Quick Navigation Shortcuts
                                        </Typography>
                                        <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap" }}>
                                            <Button 
                                                variant="outlined" 
                                                size="small" 
                                                startIcon={<ReceiptIcon />}
                                                endIcon={<OpenInNewIcon fontSize="small" />}
                                                onClick={() => {
                                                    setViewOpen(false);
                                                    navigate("/community-admin/bills", { state: { search: selectedRow.fullName } });
                                                }}
                                            >
                                                View Resident Bills
                                            </Button>
                                            {(selectedRow.meterSerialNumber || selectedRow.meterNumber) && (
                                                <Button 
                                                    variant="outlined" 
                                                    size="small" 
                                                    startIcon={<SpeedIcon />}
                                                    endIcon={<OpenInNewIcon fontSize="small" />}
                                                    onClick={() => {
                                                        setViewOpen(false);
                                                        navigate("/community-admin/meters", { state: { search: selectedRow.meterSerialNumber || selectedRow.meterNumber } });
                                                    }}
                                                >
                                                    View Water Meter
                                                </Button>
                                            )}
                                            <Button 
                                                variant="outlined" 
                                                size="small" 
                                                startIcon={<SupportIcon />}
                                                endIcon={<OpenInNewIcon fontSize="small" />}
                                                onClick={() => {
                                                    setViewOpen(false);
                                                    navigate("/community-admin/support");
                                                }}
                                            >
                                                Support Center
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
                                Edit Profile
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Edit Resident Dialog */}
            <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", borderBottom: "1px solid", borderColor: "divider", pb: 2 }}>
                    Edit Resident Profile
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
                            <InputLabel>Verification Status</InputLabel>
                            <Select label="Verification Status" value={editForm.verified ? "true" : "false"}
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
                    <Button onClick={() => setEditOpen(false)}>Cancel</Button>
                    <ActionButton variant="contained" onClick={handleEditSave}>
                        Save Changes
                    </ActionButton>
                </DialogActions>
            </Dialog>

            {/* Confirmation Dialog */}
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
