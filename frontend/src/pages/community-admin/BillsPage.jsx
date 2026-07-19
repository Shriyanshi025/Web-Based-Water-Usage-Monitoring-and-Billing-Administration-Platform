import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import AddIcon from "@mui/icons-material/Add";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PaidIcon from "@mui/icons-material/Paid";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import RefreshIcon from "@mui/icons-material/Refresh";

import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import DataGrid from "../../components/common/DataGrid";
import TableToolbar from "../../components/common/TableToolbar";
import SearchBar from "../../components/common/SearchBar";
import StatusBadge from "../../components/common/StatusBadge";
import ActionButton from "../../components/common/ActionButton";
import ErrorState from "../../components/common/ErrorState";

import CommunityOpsService from "../../services/CommunityOpsService";
import { useNotification } from "../../context/NotificationContext";
import { formatCurrency } from "../../helpers/numberHelper";

function BillsPage() {
    const theme = useTheme();
    const [rows, setRows]               = useState([]);
    const [cycles, setCycles]           = useState([]);
    const [plans, setPlans]             = useState([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState(null);
    const [searchTerm, setSearchTerm]   = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [dialogOpen, setDialogOpen]   = useState(false);
    const [submitting, setSubmitting]   = useState(false);
    const [form, setForm]               = useState({ billingCycleId: "", tariffPlanId: "" });
    const { showNotification } = useNotification();

    // ── Data fetching ─────────────────────────────────────────────────────────
    const fetchBills = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await CommunityOpsService.getBills();
            setRows((response?.data || []).map(item => ({ ...item, id: item.id })));
        } catch (err) {
            setError(err?.response?.data?.message || err.message || "Unable to load bills.");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchBillingMeta = useCallback(async () => {
        try {
            const [cycleResponse, planResponse] = await Promise.all([
                CommunityOpsService.getActiveBillingCycle(),
                CommunityOpsService.getTariffPlans(),
            ]);
            setCycles(cycleResponse?.data ? [cycleResponse.data] : []);
            setPlans(planResponse?.data || []);
        } catch {
            setCycles([]); setPlans([]);
        }
    }, []);

    useEffect(() => { fetchBills(); fetchBillingMeta(); }, [fetchBills, fetchBillingMeta]);

    // ── Summary stats ─────────────────────────────────────────────────────────
    const paidCount   = useMemo(() => rows.filter(r => r.status === "PAID").length, [rows]);
    const unpaidCount = useMemo(() => rows.filter(r => r.status === "UNPAID").length, [rows]);
    const overdueCount = useMemo(() => rows.filter(r => r.status === "OVERDUE").length, [rows]);
    const totalRevenue = useMemo(() => rows.filter(r => r.status === "PAID").reduce((sum, r) => sum + (Number(r.amount) || 0), 0), [rows]);

    // ── Filtering ─────────────────────────────────────────────────────────────
    const filteredRows = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return rows.filter(row => {
            const matchesSearch = !term ||
                (row.residentName      || "").toLowerCase().includes(term) ||
                (row.unitNumber        || "").toLowerCase().includes(term) ||
                (row.billingCycleName  || "").toLowerCase().includes(term);
            const matchesStatus = statusFilter === "ALL" || (row.status || "").toUpperCase() === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [rows, searchTerm, statusFilter]);

    // ── Generate bills ────────────────────────────────────────────────────────
    const handleGenerate = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        try {
            await CommunityOpsService.generateBills({
                billingCycleId: Number(form.billingCycleId),
                tariffPlanId:   Number(form.tariffPlanId),
            });
            showNotification("Bills generated successfully.", "success");
            setDialogOpen(false);
            setForm({ billingCycleId: "", tariffPlanId: "" });
            await fetchBills();
        } catch (err) {
            showNotification(err?.response?.data?.message || err.message || "Unable to generate bills.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    // ── Columns ───────────────────────────────────────────────────────────────
    const columns = useMemo(() => [
        {
            field: "residentName", headerName: "Resident", flex: 1, minWidth: 180,
            renderCell: (params) => (
                <Box>
                    <Typography variant="body2" fontWeight={600}>{params.row.residentName || "—"}</Typography>
                    {params.row.unitNumber && (
                        <Typography variant="caption" color="text.secondary">Unit {params.row.unitNumber}</Typography>
                    )}
                </Box>
            )
        },
        {
            field: "billingCycleName", headerName: "Billing Cycle", width: 180,
            renderCell: (params) => (
                <Typography variant="body2" color="text.secondary">{params.row.billingCycleName || "—"}</Typography>
            )
        },
        {
            field: "tariffPlanName", headerName: "Tariff Plan", width: 160,
            renderCell: (params) => (
                <Typography variant="body2" color="text.secondary">{params.row.tariffPlanName || "—"}</Typography>
            )
        },
        {
            field: "unitsConsumed", headerName: "Units", width: 90,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={500} color="info.main">
                    {params.row.unitsConsumed != null ? params.row.unitsConsumed : "—"}
                </Typography>
            )
        },
        {
            field: "amount", headerName: "Amount", width: 130,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={700} color={params.row.status === "PAID" ? "success.main" : params.row.status === "OVERDUE" ? "error.main" : "text.primary"}>
                    {params.row.amount != null ? formatCurrency(params.row.amount) : "—"}
                </Typography>
            )
        },
        {
            field: "status", headerName: "Status", width: 120,
            renderCell: (params) => <StatusBadge status={params.row.status || "UNPAID"} />
        },
    ], []);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <DashboardLayout>
            <PageHeader
                title="Billing"
                subtitle="Review resident bills, inspect the active cycle, and generate billing batches."
                action={
                    <Stack direction="row" spacing={1.5}>
                        <ActionButton variant="outlined" startIcon={<RefreshIcon />} onClick={fetchBills} disabled={loading} sx={{ fontSize: "0.8125rem" }}>
                            Refresh
                        </ActionButton>
                        <ActionButton variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)} sx={{ fontSize: "0.8125rem" }}>
                            Generate Bills
                        </ActionButton>
                    </Stack>
                }
            />

            {/* ── Active cycle callout ──────────────────────────────────────── */}
            {cycles[0] && (
                <Box sx={{ mb: 3, px: 2, py: 1.5, bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 1.5 }}>
                    <HourglassEmptyIcon sx={{ fontSize: "1rem", color: "info.main" }} />
                    <Typography variant="body2" color="text.secondary">Active billing cycle:</Typography>
                    <Typography variant="body2" fontWeight={700}>{cycles[0].name}</Typography>
                </Box>
            )}

            {/* ── Summary strip ─────────────────────────────────────────────── */}
            {!loading && !error && (
                <Stack direction="row" spacing={2} sx={{ mb: 3 }} flexWrap="wrap">
                    <Box sx={{ px: 2, py: 1, bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 1 }}>
                        <ReceiptIcon sx={{ fontSize: "1rem", color: "text.secondary" }} />
                        <Typography variant="body2" fontWeight={500} color="text.secondary">Total:</Typography>
                        <Typography variant="body2" fontWeight={700}>{rows.length}</Typography>
                    </Box>
                    <Box sx={{ px: 2, py: 1, bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 1 }}>
                        <PaidIcon sx={{ fontSize: "1rem", color: "success.main" }} />
                        <Typography variant="body2" fontWeight={500} color="text.secondary">Paid:</Typography>
                        <Typography variant="body2" fontWeight={700} color="success.main">{paidCount}</Typography>
                    </Box>
                    {unpaidCount > 0 && (
                        <Box sx={{ px: 2, py: 1, bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "warning.light", display: "flex", alignItems: "center", gap: 1 }}>
                            <HourglassEmptyIcon sx={{ fontSize: "1rem", color: "warning.main" }} />
                            <Typography variant="body2" fontWeight={500} color="text.secondary">Unpaid:</Typography>
                            <Typography variant="body2" fontWeight={700} color="warning.main">{unpaidCount}</Typography>
                        </Box>
                    )}
                    {overdueCount > 0 && (
                        <Box sx={{ px: 2, py: 1, bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "error.light", display: "flex", alignItems: "center", gap: 1 }}>
                            <WarningAmberIcon sx={{ fontSize: "1rem", color: "error.main" }} />
                            <Typography variant="body2" fontWeight={500} color="text.secondary">Overdue:</Typography>
                            <Typography variant="body2" fontWeight={700} color="error.main">{overdueCount}</Typography>
                        </Box>
                    )}
                    {paidCount > 0 && (
                        <Box sx={{ px: 2, py: 1, bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "success.light", display: "flex", alignItems: "center", gap: 1 }}>
                            <PaidIcon sx={{ fontSize: "1rem", color: "success.main" }} />
                            <Typography variant="body2" fontWeight={500} color="text.secondary">Revenue:</Typography>
                            <Typography variant="body2" fontWeight={700} color="success.main">{formatCurrency(totalRevenue)}</Typography>
                        </Box>
                    )}
                </Stack>
            )}

            {/* ── Full-page error ───────────────────────────────────────────── */}
            {error && !rows.length && (
                <Box sx={{ mb: 3 }}>
                    <ErrorState title="Failed to load bills" message={error} onRetry={fetchBills} />
                </Box>
            )}

            {/* ── Main table panel ──────────────────────────────────────────── */}
            <Box sx={{ bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
                <TableToolbar
                    title="Bills"
                    action={
                        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                            <SearchBar
                                value={searchTerm}
                                onChange={setSearchTerm}
                                onClear={() => setSearchTerm("")}
                                placeholder="Search by resident, unit, or cycle…"
                                sx={{ width: { xs: "100%", sm: 260 } }}
                            />
                            <FormControl size="small" sx={{ minWidth: 140 }}>
                                <InputLabel id="bill-status-filter-label">Status</InputLabel>
                                <Select
                                    labelId="bill-status-filter-label"
                                    label="Status"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    sx={{ borderRadius: "8px", fontSize: "0.8125rem" }}
                                >
                                    {["ALL", "PAID", "UNPAID", "OVERDUE", "WAIVED"].map(s => (
                                        <MenuItem key={s} value={s}>{s === "ALL" ? "All Statuses" : s.charAt(0) + s.slice(1).toLowerCase()}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            {(searchTerm || statusFilter !== "ALL") && (
                                <Chip
                                    label={`${filteredRows.length} of ${rows.length}`}
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
                        error={error && rows.length ? error : null}
                        onRetry={fetchBills}
                        pageSize={10}
                    />
                </Box>
            </Box>

            {/* ── Generate Bills dialog ─────────────────────────────────────── */}
            <Dialog open={dialogOpen} onClose={() => !submitting && setDialogOpen(false)} maxWidth="sm" fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", borderBottom: "1px solid", borderColor: "divider", pb: 2 }}>
                    Generate Bills
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 400, mt: 0.25 }}>
                        Select billing cycle and tariff plan to generate bills for all active residents.
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Box component="form" id="generate-bills-form" onSubmit={handleGenerate}>
                        <Stack spacing={2.5} sx={{ mt: 2.5 }}>
                            <FormControl fullWidth size="small" required>
                                <InputLabel>Billing Cycle</InputLabel>
                                <Select
                                    value={form.billingCycleId}
                                    label="Billing Cycle"
                                    onChange={(e) => setForm(p => ({ ...p, billingCycleId: e.target.value }))}
                                >
                                    {cycles.length === 0 ? (
                                        <MenuItem disabled value=""><em>No active cycle configured</em></MenuItem>
                                    ) : (
                                        cycles.map(cycle => (
                                            <MenuItem key={cycle.id} value={cycle.id}>{cycle.name}</MenuItem>
                                        ))
                                    )}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth size="small" required>
                                <InputLabel>Tariff Plan</InputLabel>
                                <Select
                                    value={form.tariffPlanId}
                                    label="Tariff Plan"
                                    onChange={(e) => setForm(p => ({ ...p, tariffPlanId: e.target.value }))}
                                >
                                    {plans.length === 0 ? (
                                        <MenuItem disabled value=""><em>No tariff plans available</em></MenuItem>
                                    ) : (
                                        plans.map(plan => (
                                            <MenuItem key={plan.id} value={plan.id}>{plan.name}</MenuItem>
                                        ))
                                    )}
                                </Select>
                            </FormControl>
                        </Stack>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ borderTop: "1px solid", borderColor: "divider", px: 3, py: 2, gap: 1 }}>
                    <Button onClick={() => setDialogOpen(false)} disabled={submitting} sx={{ textTransform: "none" }}>
                        Cancel
                    </Button>
                    <ActionButton
                        type="submit"
                        form="generate-bills-form"
                        variant="contained"
                        disabled={submitting || !form.billingCycleId || !form.tariffPlanId}
                        sx={{ textTransform: "none" }}
                    >
                        {submitting ? "Generating…" : "Generate Bills"}
                    </ActionButton>
                </DialogActions>
            </Dialog>
        </DashboardLayout>
    );
}

export default BillsPage;
