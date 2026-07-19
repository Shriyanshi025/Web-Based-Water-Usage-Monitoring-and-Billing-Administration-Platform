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
    Chip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import RefreshIcon from "@mui/icons-material/Refresh";

import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import DataGrid from "../../components/common/DataGrid";
import TableToolbar from "../../components/common/TableToolbar";
import SearchBar from "../../components/common/SearchBar";
import ConfirmationDialog from "../../components/common/ConfirmationDialog";
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

const ApprovalsPage = () => {
    const theme = useTheme();
    const [pendingResidents, setPendingResidents]   = useState([]);
    const [loading, setLoading]                     = useState(true);
    const [error, setError]                         = useState(null);
    const [searchTerm, setSearchTerm]               = useState("");

    // UI state
    const [viewOpen, setViewOpen]       = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [dialogConfig, setDialogConfig] = useState({ open: false, title: "", message: "", onConfirm: null, confirmText: "", confirmColor: "primary" });

    // ── Data fetching ─────────────────────────────────────────────────────────
    const fetchPending = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await CommunityOpsService.getPendingResidents();
            setPendingResidents(data || []);
        } catch (err) {
            if (err.response?.status === 403) {
                setError("You are not authorized to view this page.");
            } else {
                setError(err?.response?.data?.message || err.message || "Failed to load pending residents.");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPending(); }, [fetchPending]);

    // ── Actions ───────────────────────────────────────────────────────────────
    const handleAction = useCallback((actionType, row) => {
        if (actionType === "APPROVE") {
            setDialogConfig({
                open: true,
                title: "Approve Resident",
                message: `Approve ${row.firstName} ${row.lastName}? They will gain full access to community resident services.`,
                confirmText: "Approve",
                confirmColor: "success",
                onConfirm: async () => {
                    try {
                        await CommunityOpsService.approveResident(row.userId, { approvalStatus: "APPROVED", remarks: "Approved by Community Admin" });
                        setPendingResidents(prev => prev.filter(r => r.id !== row.id));
                    } catch (err) { console.error(err); }
                    finally { setDialogConfig(p => ({ ...p, open: false })); }
                }
            });
        } else if (actionType === "REJECT") {
            setDialogConfig({
                open: true,
                title: "Reject Resident",
                message: `Reject ${row.firstName} ${row.lastName}'s registration? Their application will be denied and they will not gain access.`,
                confirmText: "Reject",
                confirmColor: "error",
                onConfirm: async () => {
                    try {
                        await CommunityOpsService.approveResident(row.userId, { approvalStatus: "REJECTED", remarks: "Rejected by Community Admin" });
                        setPendingResidents(prev => prev.filter(r => r.id !== row.id));
                    } catch (err) { console.error(err); }
                    finally { setDialogConfig(p => ({ ...p, open: false })); }
                }
            });
        }
    }, []);

    // ── Filtering ─────────────────────────────────────────────────────────────
    const filteredRows = useMemo(() => {
        const term = searchTerm.toLowerCase();
        if (!term) return pendingResidents;
        return pendingResidents.filter(row =>
            (row.fullName   || "").toLowerCase().includes(term) ||
            (row.email      || "").toLowerCase().includes(term) ||
            (row.flatNumber || "").toLowerCase().includes(term)
        );
    }, [pendingResidents, searchTerm]);

    // ── Columns ───────────────────────────────────────────────────────────────
    const columns = useMemo(() => [
        {
            field: "fullName", headerName: "Applicant", flex: 1, minWidth: 200,
            renderCell: (params) => (
                <Box>
                    <Typography variant="body2" fontWeight={600}>{params.row.fullName || "Unnamed"}</Typography>
                    {params.row.email && (
                        <Typography variant="caption" color="text.secondary">{params.row.email}</Typography>
                    )}
                </Box>
            )
        },
        {
            field: "flatNumber", headerName: "Unit / Flat", width: 120,
            renderCell: (params) => (
                <Typography variant="body2" color={params.row.flatNumber ? "text.primary" : "text.disabled"}>
                    {params.row.flatNumber || "—"}
                </Typography>
            )
        },
        {
            field: "status", headerName: "Status", width: 120,
            renderCell: () => <StatusBadge status="PENDING" />
        },
        {
            field: "actions", headerName: "Actions", width: 160, sortable: false, align: "center", headerAlign: "center",
            renderCell: (params) => (
                <Stack direction="row" spacing={0.5} justifyContent="center">
                    <Tooltip title="Approve" arrow>
                        <IconButton
                            size="small"
                            color="success"
                            onClick={(e) => { e.stopPropagation(); handleAction("APPROVE", params.row); }}
                            aria-label={`Approve ${params.row.fullName}`}
                            sx={{ borderRadius: "6px", "&:hover": { bgcolor: "success.lighter" } }}
                        >
                            <CheckCircleIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Reject" arrow>
                        <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => { e.stopPropagation(); handleAction("REJECT", params.row); }}
                            aria-label={`Reject ${params.row.fullName}`}
                            sx={{ borderRadius: "6px", "&:hover": { bgcolor: "error.lighter" } }}
                        >
                            <CancelIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="View Details" arrow>
                        <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); setSelectedRow(params.row); setViewOpen(true); }}
                            aria-label={`View details for ${params.row.fullName}`}
                            sx={{ borderRadius: "6px", "&:hover": { bgcolor: "action.hover" } }}
                        >
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            )
        }
    ], [handleAction]);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <DashboardLayout>
            <PageHeader
                title="Resident Approvals"
                subtitle="Review and action pending resident registration requests."
                action={
                    <ActionButton variant="outlined" startIcon={<RefreshIcon />} onClick={fetchPending} disabled={loading} sx={{ fontSize: "0.8125rem" }}>
                        Refresh
                    </ActionButton>
                }
            />

            {/* ── Pending count banner ──────────────────────────────────────── */}
            {!loading && !error && pendingResidents.length > 0 && (
                <Box sx={{ mb: 3, px: 2, py: 1.5, bgcolor: "warning.lighter" ?? "#fffbeb", borderRadius: 2, border: "1px solid", borderColor: "warning.light", display: "flex", alignItems: "center", gap: 1.5 }}>
                    <PendingActionsIcon sx={{ fontSize: "1rem", color: "warning.main" }} />
                    <Typography variant="body2" color="warning.dark" fontWeight={600}>
                        {pendingResidents.length} resident{pendingResidents.length !== 1 ? "s" : ""} awaiting approval
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        — Review each application and approve or reject below.
                    </Typography>
                </Box>
            )}

            {/* ── Empty state ───────────────────────────────────────────────── */}
            {!loading && !error && pendingResidents.length === 0 && (
                <Box sx={{ mb: 3, px: 2, py: 1.5, bgcolor: "success.lighter" ?? "#f0fdf4", borderRadius: 2, border: "1px solid", borderColor: "success.light", display: "flex", alignItems: "center", gap: 1.5 }}>
                    <HowToRegIcon sx={{ fontSize: "1rem", color: "success.main" }} />
                    <Typography variant="body2" color="success.dark" fontWeight={600}>
                        All caught up — no pending approvals.
                    </Typography>
                </Box>
            )}

            {/* ── Full-page error ───────────────────────────────────────────── */}
            {error && !pendingResidents.length && (
                <Box sx={{ mb: 3 }}>
                    <ErrorState title="Failed to load approvals" message={error} onRetry={fetchPending} />
                </Box>
            )}

            {/* ── Main table panel ──────────────────────────────────────────── */}
            <Box sx={{ bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
                <TableToolbar
                    title="Pending Applications"
                    action={
                        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                            <SearchBar
                                value={searchTerm}
                                onChange={setSearchTerm}
                                onClear={() => setSearchTerm("")}
                                placeholder="Search by name, email, or unit…"
                                sx={{ width: { xs: "100%", sm: 260 } }}
                            />
                            {searchTerm && (
                                <Chip
                                    label={`${filteredRows.length} of ${pendingResidents.length}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: "0.75rem", height: 26 }}
                                    onDelete={() => setSearchTerm("")}
                                />
                            )}
                            {pendingResidents.length > 0 && (
                                <Chip
                                    icon={<PendingActionsIcon sx={{ fontSize: "0.875rem !important" }} />}
                                    label={`${pendingResidents.length} pending`}
                                    size="small"
                                    color="warning"
                                    variant="outlined"
                                    sx={{ fontSize: "0.75rem", height: 26 }}
                                />
                            )}
                        </Stack>
                    }
                />
                <Box sx={{ height: 500 }}>
                    <DataGrid
                        rows={filteredRows}
                        columns={columns}
                        loading={loading}
                        error={error && pendingResidents.length ? error : null}
                        onRetry={fetchPending}
                        disableRowSelectionOnClick
                        pageSize={10}
                    />
                </Box>
            </Box>

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

            {/* ── View Details dialog ───────────────────────────────────────── */}
            <Dialog
                open={viewOpen}
                onClose={() => { setViewOpen(false); setSelectedRow(null); }}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", borderBottom: "1px solid", borderColor: "divider", pb: 2 }}>
                    Applicant Details
                    {selectedRow && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 400, mt: 0.25 }}>
                            {selectedRow.email}
                        </Typography>
                    )}
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    {selectedRow && (
                        <Stack spacing={3}>
                            <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }} gap={3}>
                                <DetailField label="Full Name"    value={selectedRow.fullName} />
                                <DetailField label="Unit / Flat"  value={selectedRow.unitNumber || selectedRow.flatNumber} />
                                <DetailField label="Block"        value={selectedRow.blockName} />
                                <DetailField label="Community"    value={selectedRow.communityName} />
                                <DetailField label="Meter Serial" value={selectedRow.meterSerialNumber} />
                                <DetailField label="Contact"      value={selectedRow.phoneNumber} />
                                <DetailField label="Approval Status">
                                    <Box sx={{ mt: 0.5 }}>
                                        <StatusBadge status="PENDING" />
                                    </Box>
                                </DetailField>
                            </Box>
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions sx={{ borderTop: "1px solid", borderColor: "divider", px: 3, py: 2, gap: 1 }}>
                    <Button onClick={() => { setViewOpen(false); setSelectedRow(null); }} sx={{ textTransform: "none" }}>
                        Close
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        sx={{ textTransform: "none" }}
                        onClick={() => {
                            setViewOpen(false);
                            if (selectedRow) handleAction("APPROVE", selectedRow);
                        }}
                    >
                        Approve
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<CancelIcon />}
                        sx={{ textTransform: "none" }}
                        onClick={() => {
                            setViewOpen(false);
                            if (selectedRow) handleAction("REJECT", selectedRow);
                        }}
                    >
                        Reject
                    </Button>
                </DialogActions>
            </Dialog>
        </DashboardLayout>
    );
};

export default ApprovalsPage;
