import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Typography,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";

import AddIcon from "@mui/icons-material/Add";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PaidIcon from "@mui/icons-material/Paid";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import RefreshIcon from "@mui/icons-material/Refresh";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import FilterListIcon from "@mui/icons-material/FilterList";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

import DashboardLayout from "../../components/layout/DashboardLayout";
import PageSummaryHeader from "../../components/common/PageSummaryHeader";
import DataGrid from "../../components/common/DataGrid";
import TableToolbar from "../../components/common/TableToolbar";
import SearchBar from "../../components/common/SearchBar";
import StatusBadge from "../../components/common/StatusBadge";
import ActionButton from "../../components/common/ActionButton";
import ErrorState from "../../components/common/ErrorState";
import StatCard from "../../components/widgets/StatCard";
import AdminStatCard from "../../components/common/AdminStatCard";

import CommunityOpsService from "../../services/CommunityOpsService";
import { useNotification } from "../../context/NotificationContext";
import { formatCurrency } from "../../helpers/numberHelper";

import api from "../../services/api";
import BillBreakdownSection from "../../components/billing/BillBreakdownSection";

const MONTH_NAMES = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
];

function BillsPage() {
    const navigate = useNavigate();
    const theme = useTheme();

    // ── State variables ────────────────────────────────────────────────────────
    const [rows, setRows]                 = useState([]);
    const [cycles, setCycles]             = useState([]);
    const [plans, setPlans]               = useState([]);
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState(null);

    // Filter states
    const [quickChip, setQuickChip]       = useState("LATEST"); // "LATEST", "PREVIOUS", "ALL"
    const [cycleFilter, setCycleFilter]   = useState("ALL");
    const [monthFilter, setMonthFilter]   = useState("ALL");
    const [yearFilter, setYearFilter]     = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [paymentStatusFilter, setPaymentStatusFilter] = useState("ALL");
    const [searchTerm, setSearchTerm]     = useState("");

    // Dialog states
    const [dialogOpen, setDialogOpen]     = useState(false);
    const [submitting, setSubmitting]     = useState(false);
    const [form, setForm]                 = useState({ billingCycleId: "", tariffPlanId: "" });
    const { showNotification }            = useNotification();

    const [selectedBill, setSelectedBill] = useState(null);
    const [detailsOpen, setDetailsOpen]   = useState(false);
    const [downloadingId, setDownloadingId] = useState(null);

    const handleOpenDetails = (bill) => {
        setSelectedBill(bill);
        setDetailsOpen(true);
    };

    const handleCloseDetails = () => {
        setDetailsOpen(false);
        setSelectedBill(null);
    };

    // ── PDF Download Handler ──────────────────────────────────────────────────
    const handleDownloadPdf = async (billId) => {
        if (downloadingId) return;
        setDownloadingId(billId);
        try {
            const bill = rows.find(b => b.id === billId);
            const response = await api.get(`/bills/${billId}/pdf`, { responseType: 'blob' });

            if (response.data.type === 'application/json') {
                const text = await response.data.text();
                const errorObj = JSON.parse(text);
                showNotification(errorObj.message || "Unable to download bill PDF.", "error");
                return;
            }

            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;

            const disposition = response.headers['content-disposition'];
            let filename = bill?.billNumber ? `HydroSync-Bill-${bill.billNumber}.pdf` : `HydroSync-Bill-${billId}.pdf`;
            if (disposition && disposition.indexOf('attachment') !== -1) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(disposition);
                if (matches != null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, '');
                }
            }
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            showNotification(`Bill downloaded as ${filename}.`, "success");
        } catch (err) {
            console.error("PDF download failed", err);
            showNotification("Unable to download bill PDF.", "error");
        } finally {
            setDownloadingId(null);
        }
    };

    // ── Data Fetching ─────────────────────────────────────────────────────────
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
            const [allCyclesRes, activeCycleRes, planResponse] = await Promise.all([
                CommunityOpsService.getAllBillingCycles(),
                CommunityOpsService.getActiveBillingCycle().catch(() => null),
                CommunityOpsService.getAdminTariffPlans(),
            ]);

            const loadedCycles = allCyclesRes?.data || [];
            // Sort cycles latest first
            loadedCycles.sort((a, b) => {
                const startA = a.periodStart || "";
                const startB = b.periodStart || "";
                return startB.localeCompare(startA);
            });

            setCycles(loadedCycles);
            setPlans(planResponse?.data || []);
        } catch (err) {
            console.error("Failed loading metadata", err);
            setCycles([]); setPlans([]);
        }
    }, []);

    useEffect(() => {
        fetchBills();
        fetchBillingMeta();
    }, [fetchBills, fetchBillingMeta]);

    // ── Derived Metadata ──────────────────────────────────────────────────────
    const latestCycle = useMemo(() => {
        return cycles[0] || null;
    }, [cycles]);

    const activeCycle = useMemo(() => {
        return cycles.find(c => c.active) || latestCycle;
    }, [cycles, latestCycle]);

    const availableYears = useMemo(() => {
        const yearsSet = new Set();
        rows.forEach(r => {
            if (r.billingYear) yearsSet.add(String(r.billingYear));
            if (r.billDate) yearsSet.add(r.billDate.slice(0, 4));
        });
        cycles.forEach(c => {
            if (c.periodStart) yearsSet.add(c.periodStart.slice(0, 4));
        });
        return Array.from(yearsSet).sort().reverse();
    }, [rows, cycles]);

    // Set default cycle filter to latest cycle if quickChip is LATEST
    useEffect(() => {
        if (quickChip === "LATEST" && latestCycle) {
            setCycleFilter(String(latestCycle.id));
        }
    }, [quickChip, latestCycle]);

    // Quick chip action handlers
    const handleQuickChip = (mode) => {
        setQuickChip(mode);
        if (mode === "LATEST") {
            if (latestCycle) setCycleFilter(String(latestCycle.id));
        } else if (mode === "PREVIOUS" || mode === "ALL") {
            setCycleFilter("ALL");
        }
    };

    // Reset filters
    const handleResetFilters = () => {
        setQuickChip("LATEST");
        if (latestCycle) setCycleFilter(String(latestCycle.id));
        else setCycleFilter("ALL");
        setMonthFilter("ALL");
        setYearFilter("ALL");
        setStatusFilter("ALL");
        setPaymentStatusFilter("ALL");
        setSearchTerm("");
    };

    // ── Filtering and Latest-First Sorting ────────────────────────────────────
    const filteredRows = useMemo(() => {
        const term = searchTerm.toLowerCase();

        const result = rows.filter(row => {
            // Quick Chip filtering
            if (quickChip === "LATEST" && latestCycle) {
                const isLatest = String(row.billingCycleId) === String(latestCycle.id) ||
                    (row.billingCycleName && latestCycle.name && row.billingCycleName === latestCycle.name);
                if (!isLatest) return false;
            } else if (quickChip === "PREVIOUS" && latestCycle) {
                const isLatest = String(row.billingCycleId) === String(latestCycle.id) ||
                    (row.billingCycleName && latestCycle.name && row.billingCycleName === latestCycle.name);
                if (isLatest) return false;
            }

            // Dropdown cycle filter
            if (cycleFilter !== "ALL") {
                const matchesCycle = String(row.billingCycleId) === String(cycleFilter) ||
                    String(row.billingCycleName) === String(cycleFilter);
                if (!matchesCycle) return false;
            }

            // Month filter
            if (monthFilter !== "ALL") {
                let rowMonth = "";
                if (row.billingMonth != null) {
                    rowMonth = String(row.billingMonth).padStart(2, "0");
                } else if (row.billDate) {
                    rowMonth = row.billDate.slice(5, 7);
                }
                if (rowMonth !== monthFilter) return false;
            }

            // Year filter
            if (yearFilter !== "ALL") {
                let rowYear = "";
                if (row.billingYear != null) {
                    rowYear = String(row.billingYear);
                } else if (row.billDate) {
                    rowYear = row.billDate.slice(0, 4);
                }
                if (rowYear !== yearFilter) return false;
            }

            // Bill status filter
            if (statusFilter !== "ALL") {
                if ((row.status || "").toUpperCase() !== statusFilter) return false;
            }

            // Payment status filter
            if (paymentStatusFilter !== "ALL") {
                const status = (row.paymentStatus || row.status || "").toUpperCase();
                if (status !== paymentStatusFilter) return false;
            }

            // Text search filter
            if (term) {
                const matchName = (row.residentName || "").toLowerCase().includes(term);
                const matchUnit = (row.unitNumber || "").toLowerCase().includes(term);
                const matchCycle = (row.billingCycleName || "").toLowerCase().includes(term);
                const matchBillNo = (row.billNumber || "").toLowerCase().includes(term);
                if (!matchName && !matchUnit && !matchCycle && !matchBillNo) return false;
            }

            return true;
        });

        // SORTING: Latest billing cycle first, inside cycle newest generated bills first
        result.sort((a, b) => {
            const cycleIdA = Number(a.billingCycleId) || 0;
            const cycleIdB = Number(b.billingCycleId) || 0;
            if (cycleIdB !== cycleIdA) {
                return cycleIdB - cycleIdA;
            }
            // Secondary sort: newest bill ID / date DESC
            return (b.id || 0) - (a.id || 0);
        });

        return result;
    }, [rows, quickChip, latestCycle, cycleFilter, monthFilter, yearFilter, statusFilter, paymentStatusFilter, searchTerm]);

    // ── Summary Cards Calculations for current filtered view ───────────────────
    const summaryMetrics = useMemo(() => {
        const totalBills = filteredRows.length;
        const totalAmount = filteredRows.reduce((sum, r) => sum + (Number(r.amount) || Number(r.totalAmount) || 0), 0);

        const paidList = filteredRows.filter(r => r.status === "PAID");
        const paidCount = paidList.length;
        const paidAmount = paidList.reduce((sum, r) => sum + (Number(r.amount) || Number(r.totalAmount) || 0), 0);

        const unpaidList = filteredRows.filter(r => r.status === "UNPAID");
        const unpaidCount = unpaidList.length;
        const unpaidAmount = unpaidList.reduce((sum, r) => sum + (Number(r.amount) || Number(r.totalAmount) || 0), 0);

        const overdueList = filteredRows.filter(r => r.status === "OVERDUE");
        const overdueCount = overdueList.length;
        const overdueAmount = overdueList.reduce((sum, r) => sum + (Number(r.amount) || Number(r.totalAmount) || 0), 0);

        return {
            totalBills,
            totalAmount,
            paidCount,
            paidAmount,
            unpaidCount,
            unpaidAmount,
            overdueCount,
            overdueAmount,
        };
    }, [filteredRows]);

    // ── Generate Bills batch handler ──────────────────────────────────────────
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

    // ── DataGrid Columns ──────────────────────────────────────────────────────
    const columns = useMemo(() => [
        {
            field: "residentName", headerName: "Resident", flex: 1, minWidth: 200,
            renderCell: (params) => (
                <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "1px", overflow: "hidden", width: "100%" }}>
                    <Typography variant="body2" fontWeight={600} noWrap>{params.row.residentName || "—"}</Typography>
                    {params.row.unitNumber && (
                        <Typography variant="caption" color="text.secondary" noWrap>Unit {params.row.unitNumber}</Typography>
                    )}
                </Box>
            )
        },
        {
            field: "billingCycleName", headerName: "Billing Cycle", width: 170,
            renderCell: (params) => (
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body2" color="text.primary" fontWeight={500}>
                        {params.row.billingCycleName || "—"}
                    </Typography>
                    {latestCycle && (String(params.row.billingCycleId) === String(latestCycle.id) || params.row.billingCycleName === latestCycle.name) && (
                        <Chip label="Latest" size="small" color="primary" variant="outlined" sx={{ height: 18, fontSize: "0.65rem", fontWeight: 700 }} />
                    )}
                </Stack>
            )
        },
        {
            field: "tariffPlanName", headerName: "Tariff Policy", width: 160,
            renderCell: (params) => (
                <Typography variant="body2" color="text.secondary">{params.row.tariffPlanName || "—"}</Typography>
            )
        },
        {
            field: "unitsConsumed", headerName: "Units (kL)", width: 110,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={600} color="info.main">
                    {params.row.unitsConsumed != null ? params.row.unitsConsumed : "—"}
                </Typography>
            )
        },
        {
            field: "amount", headerName: "Amount", width: 140,
            renderCell: (params) => {
                const displayVal = params.row.totalAmount != null ? params.row.totalAmount : params.row.amount;
                return (
                    <Typography variant="body2" fontWeight={700} color={params.row.status === "PAID" ? "success.main" : params.row.status === "OVERDUE" ? "error.main" : "text.primary"}>
                        {displayVal != null ? formatCurrency(displayVal) : "—"}
                    </Typography>
                );
            }
        },
        {
            field: "status", headerName: "Status", width: 120,
            renderCell: (params) => <StatusBadge status={params.row.status || "UNPAID"} />
        },
        {
            field: "actions", headerName: "Actions", width: 310, sortable: false,
            renderCell: (params) => {
                const isDownloading = downloadingId === params.row.id;
                const btnStyle = {
                    width: "90px",
                    height: "32px",
                    borderRadius: "6px",
                    textTransform: "none",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    padding: "4px 8px"
                };

                return (
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Button
                            variant="outlined"
                            size="small"
                            color="info"
                            onClick={() => handleOpenDetails(params.row)}
                            sx={btnStyle}
                        >
                            Breakdown
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            color="primary"
                            onClick={() => navigate(`/invoices/bill/${params.row.id}`)}
                            sx={btnStyle}
                        >
                            Invoice
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            color="inherit"
                            onClick={() => handleDownloadPdf(params.row.id)}
                            disabled={isDownloading}
                            sx={{ ...btnStyle, color: "text.secondary" }}
                        >
                            {isDownloading ? "…" : "PDF"}
                        </Button>
                    </Stack>
                );
            }
        }
    ], [navigate, downloadingId, latestCycle]);

    // Active filters count indicator
    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (quickChip !== "LATEST") count++;
        if (cycleFilter !== "ALL" && (quickChip !== "LATEST" || (latestCycle && String(cycleFilter) !== String(latestCycle.id)))) count++;
        if (monthFilter !== "ALL") count++;
        if (yearFilter !== "ALL") count++;
        if (statusFilter !== "ALL") count++;
        if (paymentStatusFilter !== "ALL") count++;
        if (searchTerm) count++;
        return count;
    }, [quickChip, cycleFilter, latestCycle, monthFilter, yearFilter, statusFilter, paymentStatusFilter, searchTerm]);

    const headerMetadata = useMemo(() => [
        { label: "Total Bills", value: summaryMetrics.totalBills },
        { label: "Paid", value: summaryMetrics.paidCount, color: "success" },
        { label: "Pending", value: summaryMetrics.unpaidCount, color: "warning" },
        { label: "Overdue", value: summaryMetrics.overdueCount, color: "error" },
        { label: "Total Value", value: formatCurrency(summaryMetrics.totalAmount) },
    ], [summaryMetrics]);

    return (
        <DashboardLayout>
            <PageSummaryHeader
                title="Bills & Billing Policy"
                subtitle="Review resident bills sorted latest cycle first. Use historical filters to explore past billing periods."
                icon={ReceiptIcon}
                metadata={headerMetadata}
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

            {/* ── Error state display ────────────────────────────────────────── */}
            {error && !rows.length && (
                <Box sx={{ mb: 3 }}>
                    <ErrorState title="Failed to load bills" message={error} onRetry={fetchBills} />
                </Box>
            )}

            {/* ── Main Bills Data Panel ──────────────────────────────────────── */}
            <Box sx={{ bgcolor: "background.paper", borderRadius: "12px", border: "1px solid", borderColor: "divider", overflow: "hidden", boxShadow: "0 1px 4px rgba(12, 25, 41, 0.05)" }}>

                {/* ── Advanced Filter Toolbar ──────────────────────────────────── */}
                <TableToolbar
                    title="Resident Bills List"
                    action={
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexWrap: "wrap" }}>
                            <SearchBar
                                value={searchTerm}
                                onChange={setSearchTerm}
                                onClear={() => setSearchTerm("")}
                                placeholder="Search resident, unit, bill #…"
                                sx={{ width: { xs: "100%", sm: 220 } }}
                            />

                            {/* Cycle Dropdown Filter */}
                            <FormControl size="small" sx={{ minWidth: 150 }}>
                                <InputLabel id="cycle-filter-label">Cycle</InputLabel>
                                <Select
                                    labelId="cycle-filter-label"
                                    label="Cycle"
                                    value={cycleFilter}
                                    onChange={(e) => {
                                        setCycleFilter(e.target.value);
                                        if (latestCycle && e.target.value === String(latestCycle.id)) {
                                            setQuickChip("LATEST");
                                        } else if (e.target.value === "ALL") {
                                            setQuickChip("ALL");
                                        } else {
                                            setQuickChip("PREVIOUS");
                                        }
                                    }}
                                    sx={{ borderRadius: "8px", fontSize: "0.8125rem" }}
                                >
                                    <MenuItem value="ALL">All Cycles</MenuItem>
                                    {cycles.map(c => (
                                        <MenuItem key={c.id} value={String(c.id)}>
                                            {c.name} {latestCycle && c.id === latestCycle.id ? "(Latest)" : ""}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Month Filter */}
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel id="month-filter-label">Month</InputLabel>
                                <Select
                                    labelId="month-filter-label"
                                    label="Month"
                                    value={monthFilter}
                                    onChange={(e) => setMonthFilter(e.target.value)}
                                    sx={{ borderRadius: "8px", fontSize: "0.8125rem" }}
                                >
                                    <MenuItem value="ALL">All Months</MenuItem>
                                    {MONTH_NAMES.map(m => (
                                        <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Year Filter */}
                            <FormControl size="small" sx={{ minWidth: 100 }}>
                                <InputLabel id="year-filter-label">Year</InputLabel>
                                <Select
                                    labelId="year-filter-label"
                                    label="Year"
                                    value={yearFilter}
                                    onChange={(e) => setYearFilter(e.target.value)}
                                    sx={{ borderRadius: "8px", fontSize: "0.8125rem" }}
                                >
                                    <MenuItem value="ALL">All Years</MenuItem>
                                    {availableYears.map(y => (
                                        <MenuItem key={y} value={y}>{y}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Bill Status Filter */}
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel id="bill-status-label">Status</InputLabel>
                                <Select
                                    labelId="bill-status-label"
                                    label="Status"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    sx={{ borderRadius: "8px", fontSize: "0.8125rem" }}
                                >
                                    <MenuItem value="ALL">All Statuses</MenuItem>
                                    <MenuItem value="UNPAID">Unpaid</MenuItem>
                                    <MenuItem value="PAID">Paid</MenuItem>
                                    <MenuItem value="OVERDUE">Overdue</MenuItem>
                                    <MenuItem value="WAIVED">Waived</MenuItem>
                                </Select>
                            </FormControl>
                        </Stack>
                    }
                />

                {/* ── Table View ─────────────────────────────────────────────── */}
                <Box sx={{ height: 540 }}>
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

            {/* ── Generate Bills batch dialog ───────────────────────────────── */}
            <Dialog open={dialogOpen} onClose={() => !submitting && setDialogOpen(false)} maxWidth="sm" fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", borderBottom: "1px solid", borderColor: "divider", pb: 2 }}>
                    Generate Bills Batch
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 400, mt: 0.25 }}>
                        Select active billing cycle and tariff policy to generate bills for all households.
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
                                        <MenuItem disabled value=""><em>No billing cycles configured</em></MenuItem>
                                    ) : (
                                        cycles.map(cycle => (
                                            <MenuItem key={cycle.id} value={cycle.id}>
                                                {cycle.name} {cycle.active ? "(Active)" : ""}
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth size="small" required>
                                <InputLabel>Tariff Policy Plan</InputLabel>
                                <Select
                                    value={form.tariffPlanId}
                                    label="Tariff Policy Plan"
                                    onChange={(e) => setForm(p => ({ ...p, tariffPlanId: e.target.value }))}
                                >
                                    {plans.length === 0 ? (
                                        <MenuItem disabled value=""><em>No tariff plans available</em></MenuItem>
                                    ) : (
                                        plans.map(plan => (
                                            <MenuItem key={plan.id} value={plan.id} disabled={!plan.active}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: "100%" }}>
                                                    <span>{plan.name}</span>
                                                    {!plan.active && (
                                                        <Chip label="Inactive" size="small" color="default" variant="outlined" sx={{ height: 20, fontSize: "0.65rem", ml: 1 }} />
                                                    )}
                                                </Stack>
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                            </FormControl>

                            {/* ── LIVE BILLING SUMMARY ── */}
                            {form.tariffPlanId && (() => {
                                const selectedPlan = plans.find(p => String(p.id) === String(form.tariffPlanId));
                                if (!selectedPlan) return null;
                                return (
                                    <Box sx={{ border: "1px solid", borderColor: "primary.main", borderRadius: 2, p: 2, bgcolor: "background.paper" }}>
                                        <Typography variant="subtitle2" fontWeight={800} color="primary.main" sx={{ mb: 1 }}>
                                            LIVE BILLING POLICY SUMMARY: {selectedPlan.name}
                                        </Typography>
                                        {selectedPlan.description && (
                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                                                {selectedPlan.description}
                                            </Typography>
                                        )}
                                        <Stack direction="row" spacing={2} sx={{ mb: 1.5 }}>
                                            <Box sx={{ flex: 1, bgcolor: "action.hover", p: 1, borderRadius: 1 }}>
                                                <Typography variant="caption" color="text.secondary" display="block">Fixed Base Charge</Typography>
                                                <Typography variant="body2" fontWeight={700}>{formatCurrency(selectedPlan.fixedCharge)}</Typography>
                                            </Box>
                                            <Box sx={{ flex: 1, bgcolor: "action.hover", p: 1, borderRadius: 1 }}>
                                                <Typography variant="caption" color="text.secondary" display="block">GST Tax Rate</Typography>
                                                <Typography variant="body2" fontWeight={700}>{(Number(selectedPlan.taxRate || 0.05) * 100).toFixed(1)}%</Typography>
                                            </Box>
                                        </Stack>

                                        <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                                            Tiered Slabs Configured:
                                        </Typography>
                                        <Box sx={{ maxHeight: 120, overflowY: "auto", mb: 1.5 }}>
                                            {(selectedPlan.slabs || []).map((s, idx) => (
                                                <Typography key={idx} variant="caption" display="block" color="text.primary">
                                                    • {s.minUnits}–{s.maxUnits ?? "∞"} kL: <strong>₹{s.ratePerUnit} per kL</strong>
                                                </Typography>
                                            ))}
                                        </Box>

                                        <Alert severity="info" sx={{ py: 0.25, px: 1, fontSize: "0.75rem", borderRadius: 1 }}>
                                            Formula: <strong>(Tiered Consumption + Fixed Charge ₹{selectedPlan.fixedCharge} + Shared Allocation) × (1 + {(Number(selectedPlan.taxRate || 0.05) * 100).toFixed(1)}%)</strong>
                                        </Alert>
                                    </Box>
                                );
                            })()}
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

            {/* ── RICH INVOICE INSPECTION VIEW MODAL ── */}
            <Dialog
                open={detailsOpen}
                onClose={handleCloseDetails}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                {selectedBill && (
                    <>
                        <DialogTitle sx={{ p: 2.5, bgcolor: "background.paper", borderBottom: "1px solid", borderColor: "divider" }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography variant="h6" fontWeight={700}>
                                            Bill #{selectedBill.billNumber || selectedBill.id}
                                        </Typography>
                                        <Chip label="WATER BILL" size="small" color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
                                    </Stack>
                                    <Typography variant="body2" color="text.secondary">
                                        Resident: <strong>{selectedBill.residentName}</strong> · Unit {selectedBill.unitNumber || "N/A"} · Cycle: {selectedBill.billingCycleName || "Default Cycle"}
                                    </Typography>
                                </Box>
                                <StatusBadge status={selectedBill.status || "UNPAID"} />
                            </Stack>
                        </DialogTitle>

                        <DialogContent dividers sx={{ p: 3 }}>
                            <Stack spacing={3}>
                                {/* 1. Summary KPIs */}
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={3}>
                                        <Paper variant="outlined" sx={{ p: 1.5, textAlign: "center", bgcolor: "grey.50" }}>
                                            <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">TOTAL AMOUNT DUE</Typography>
                                            <Typography variant="h6" fontWeight={700} color={selectedBill.status === "PAID" ? "success.main" : "error.main"}>
                                                {formatCurrency(selectedBill.amount != null ? selectedBill.amount : selectedBill.totalAmount || 0)}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <Paper variant="outlined" sx={{ p: 1.5, textAlign: "center", bgcolor: "grey.50" }}>
                                            <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">CONSUMPTION</Typography>
                                            <Typography variant="h6" fontWeight={700} color="info.main">
                                                {selectedBill.unitsConsumed != null ? `${selectedBill.unitsConsumed} kL` : "—"}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <Paper variant="outlined" sx={{ p: 1.5, textAlign: "center", bgcolor: "grey.50" }}>
                                            <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">BILLING CYCLE</Typography>
                                            <Typography variant="body2" fontWeight={700} color="text.primary" noWrap>
                                                {selectedBill.billingCycleName || "N/A"}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <Paper variant="outlined" sx={{ p: 1.5, textAlign: "center", bgcolor: "grey.50" }}>
                                            <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">PAYMENT STATUS</Typography>
                                            <Box sx={{ mt: 0.5, display: "flex", justifyContent: "center" }}>
                                                <StatusBadge status={selectedBill.status || "UNPAID"} />
                                            </Box>
                                        </Paper>
                                    </Grid>
                                </Grid>

                                {/* 2. Comprehensive Itemized Breakdown */}
                                <BillBreakdownSection bill={selectedBill} defaultExpanded={true} />

                                {/* 3. Quick Navigation Shortcuts */}
                                <Box>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" sx={{ mb: 1, textTransform: "uppercase" }}>
                                        Quick Navigation Shortcuts
                                    </Typography>
                                    <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap" }}>
                                        {selectedBill.residentName && (
                                            <Button 
                                                variant="outlined" 
                                                size="small" 
                                                onClick={() => {
                                                    setDetailsOpen(false);
                                                    navigate("/community-admin/residents", { state: { search: selectedBill.residentName } });
                                                }}
                                            >
                                                Resident Profile
                                            </Button>
                                        )}
                                        <Button 
                                            variant="outlined" 
                                            size="small" 
                                            onClick={() => {
                                                setDetailsOpen(false);
                                                navigate("/community-admin/meters", { state: { search: selectedBill.unitNumber } });
                                            }}
                                        >
                                            Water Meter
                                        </Button>
                                        <Button 
                                            variant="outlined" 
                                            size="small" 
                                            onClick={() => {
                                                setDetailsOpen(false);
                                                navigate("/community-admin/usage");
                                            }}
                                        >
                                            Water Usage Report
                                        </Button>
                                    </Stack>
                                </Box>
                            </Stack>
                        </DialogContent>

                        <DialogActions sx={{ p: 2, borderTop: "1px solid", borderColor: "divider", gap: 1 }}>
                            <Button
                                onClick={() => handleDownloadPdf(selectedBill.id)}
                                variant="outlined"
                                color="primary"
                            >
                                Download PDF
                            </Button>
                            <Button onClick={handleCloseDetails} variant="contained" color="secondary">
                                Close
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </DashboardLayout>
    );
}

export default BillsPage;
