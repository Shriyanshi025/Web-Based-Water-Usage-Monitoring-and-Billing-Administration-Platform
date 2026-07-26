import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
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
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    Tooltip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";

import UploadFileIcon from "@mui/icons-material/UploadFile";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SpeedIcon from "@mui/icons-material/Speed";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import StarIcon from "@mui/icons-material/Star";
import ViewListIcon from "@mui/icons-material/ViewList";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import PersonIcon from "@mui/icons-material/Person";
import HistoryIcon from "@mui/icons-material/History";
import LockIcon from "@mui/icons-material/Lock";

import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
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

const initialManualEntry = {
    waterMeterId: "",
    currentReading: "",
    readingDate: new Date().toISOString().slice(0, 10),
};

function WaterUsagePage() {
    const theme = useTheme();

    // ── State variables ────────────────────────────────────────────────────────
    const [rows, setRows]                         = useState([]);
    const [meters, setMeters]                     = useState([]);
    const [cycles, setCycles]                     = useState([]);
    const [loading, setLoading]                   = useState(true);
    const [error, setError]                       = useState(null);

    // Software Reset state
    const [resetAllowed, setResetAllowed]         = useState(true);
    const [resetLogs, setResetLogs]               = useState([]);
    const [resetLogsOpen, setResetLogsOpen]       = useState(false);
    const [individualResetModal, setIndividualResetModal] = useState({ open: false, residentProfileId: null, residentName: '', meterNumber: '', currentReading: 0, reason: '' });
    const [bulkResetModal, setBulkResetModal]     = useState({ open: false, reason: '' });

    // View & Filters
    const [viewMode, setViewMode]                 = useState("GROUPED"); // "GROUPED" or "TABLE"
    const [searchTerm, setSearchTerm]             = useState("");
    const [residentFilter, setResidentFilter]     = useState("ALL");
    const [meterFilter, setMeterFilter]           = useState("ALL");
    const [statusFilter, setStatusFilter]         = useState("ALL");
    const [cycleFilter, setCycleFilter]           = useState("ALL");
    const [startDate, setStartDate]               = useState("");
    const [endDate, setEndDate]                   = useState("");

    // Dialog states
    const [manualDialogOpen, setManualDialogOpen] = useState(false);
    const [csvDialogOpen, setCsvDialogOpen]       = useState(false);
    const [manualForm, setManualForm]             = useState(initialManualEntry);
    const [csvFile, setCsvFile]                   = useState(null);
    const [submitting, setSubmitting]             = useState(false);

    const { showNotification }                    = useNotification();

    // ── Data fetching ─────────────────────────────────────────────────────────
    const fetchUsage = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await CommunityOpsService.getAllWaterUsage();
            setRows((data || []).map(item => ({ ...item, id: item.id })));
        } catch (err) {
            setError(err?.response?.data?.message || err.message || "Unable to load water usage records.");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchMetadata = useCallback(async () => {
        try {
            const [metersData, cyclesRes, resetStatusRes] = await Promise.all([
                CommunityOpsService.getAllMeters(),
                CommunityOpsService.getAllBillingCycles().catch(() => ({ data: [] })),
                CommunityOpsService.getResetStatus().catch(() => ({ resetAllowed: true }))
            ]);
            setMeters(metersData || []);
            setCycles(cyclesRes?.data || []);
            setResetAllowed(resetStatusRes?.resetAllowed ?? true);
        } catch {
            setMeters([]); setCycles([]); setResetAllowed(true);
        }
    }, []);

    useEffect(() => {
        fetchUsage();
        fetchMetadata();
    }, [fetchUsage, fetchMetadata]);

    // ── Sorting & Latest Record ───────────────────────────────────────────────
    const sortedRows = useMemo(() => {
        const copy = [...rows];
        copy.sort((a, b) => {
            const dateA = a.readingDate || "";
            const dateB = b.readingDate || "";
            if (dateB !== dateA) {
                return dateB.localeCompare(dateA); // Reading Date DESC
            }
            return (b.id || 0) - (a.id || 0); // Ties by ID DESC
        });
        return copy;
    }, [rows]);

    const latestReadingRecord = useMemo(() => {
        return sortedRows[0] || null;
    }, [sortedRows]);

    // Unique resident list for dropdown
    const residentOptions = useMemo(() => {
        const resSet = new Map();
        sortedRows.forEach(r => {
            if (r.officialUserId || r.residentName) {
                const label = r.residentName ? `${r.residentName} (${r.officialUserId || "N/A"})` : r.officialUserId;
                resSet.set(r.officialUserId || r.residentName, label);
            }
        });
        return Array.from(resSet.entries()).map(([key, label]) => ({ key, label }));
    }, [sortedRows]);

    // ── Filtering Logic ───────────────────────────────────────────────────────
    const filteredRows = useMemo(() => {
        const term = searchTerm.toLowerCase();

        return sortedRows.filter(row => {
            // Resident filter
            if (residentFilter !== "ALL") {
                const matchRes = row.officialUserId === residentFilter || row.residentName === residentFilter;
                if (!matchRes) return false;
            }

            // Meter filter
            if (meterFilter !== "ALL") {
                if (String(row.meterNumber) !== String(meterFilter) && String(row.waterMeterId) !== String(meterFilter)) {
                    return false;
                }
            }

            // Status filter
            if (statusFilter !== "ALL") {
                const status = (row.status || "RECORDED").toUpperCase();
                if (status !== statusFilter) return false;
            }

            // Billing Cycle filter
            if (cycleFilter !== "ALL") {
                const selectedCycle = cycles.find(c => String(c.id) === String(cycleFilter));
                if (selectedCycle && selectedCycle.periodStart && selectedCycle.periodEnd) {
                    const rDate = row.readingDate || "";
                    if (rDate < selectedCycle.periodStart || rDate > selectedCycle.periodEnd) {
                        return false;
                    }
                }
            }

            // Date Range filters
            if (startDate && row.readingDate && row.readingDate < startDate) return false;
            if (endDate && row.readingDate && row.readingDate > endDate) return false;

            // Search Term filter
            if (term) {
                const matchMeter = (row.meterNumber || "").toLowerCase().includes(term);
                const matchUser = (row.officialUserId || "").toLowerCase().includes(term);
                const matchName = (row.residentName || "").toLowerCase().includes(term);
                const matchDate = (row.readingDate || "").toLowerCase().includes(term);
                if (!matchMeter && !matchUser && !matchName && !matchDate) return false;
            }

            return true;
        });
    }, [sortedRows, residentFilter, meterFilter, statusFilter, cycleFilter, startDate, endDate, searchTerm, cycles]);

    // ── Summary stats ─────────────────────────────────────────────────────────
    const totalUnits = useMemo(() => filteredRows.reduce((sum, r) => sum + (Number(r.unitsConsumed) || 0), 0), [filteredRows]);
    const uniqueMetersCount = useMemo(() => new Set(filteredRows.map(r => r.meterNumber).filter(Boolean)).size, [filteredRows]);

    // Reset filters handler
    const handleResetFilters = () => {
        setSearchTerm("");
        setResidentFilter("ALL");
        setMeterFilter("ALL");
        setStatusFilter("ALL");
        setCycleFilter("ALL");
        setStartDate("");
        setEndDate("");
    };

    // Active filters count
    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (searchTerm) count++;
        if (residentFilter !== "ALL") count++;
        if (meterFilter !== "ALL") count++;
        if (statusFilter !== "ALL") count++;
        if (cycleFilter !== "ALL") count++;
        if (startDate) count++;
        if (endDate) count++;
        return count;
    }, [searchTerm, residentFilter, meterFilter, statusFilter, cycleFilter, startDate, endDate]);

    // ── Grouped View Data Structure (Month → Resident → Readings) ───────────────
    const groupedByMonthAndResident = useMemo(() => {
        const groupsMap = new Map();

        filteredRows.forEach(row => {
            const dateStr = row.readingDate || "Unknown Date";
            let monthKey = "Unknown Month";
            if (dateStr.length >= 7) {
                const [yyyy, mm] = dateStr.split("-");
                const dateObj = new Date(Number(yyyy), Number(mm) - 1, 1);
                monthKey = dateObj.toLocaleDateString("default", { month: "long", year: "numeric" });
            }

            if (!groupsMap.has(monthKey)) {
                groupsMap.set(monthKey, {
                    monthKey,
                    totalUnits: 0,
                    residentMap: new Map()
                });
            }

            const monthGroup = groupsMap.get(monthKey);
            const units = Number(row.unitsConsumed) || 0;
            monthGroup.totalUnits += units;

            const resKey = row.residentName || row.officialUserId || "General Meter";
            if (!monthGroup.residentMap.has(resKey)) {
                monthGroup.residentMap.set(resKey, {
                    residentName: resKey,
                    unitNumber: row.unitNumber || "N/A",
                    officialUserId: row.officialUserId || "—",
                    residentProfileId: row.residentProfileId || null,
                    readings: []
                });
            }

            monthGroup.residentMap.get(resKey).readings.push(row);
        });

        return Array.from(groupsMap.values()).map(mGroup => ({
            monthKey: mGroup.monthKey,
            totalUnits: mGroup.totalUnits,
            residents: Array.from(mGroup.residentMap.values())
        }));
    }, [filteredRows]);

    // ── Software Baseline Reset Handlers ─────────────────────────────────────
    const handleIndividualResetSubmit = async () => {
        setSubmitting(true);
        try {
            await CommunityOpsService.resetMeterReading({
                residentProfileId: individualResetModal.residentProfileId,
                reason: individualResetModal.reason || "Individual Software Baseline Reset"
            });
            showNotification(`Baseline reset to 0.0 for ${individualResetModal.residentName}. Historical data preserved.`, "success");
            setIndividualResetModal({ open: false, residentProfileId: null, residentName: '', meterNumber: '', currentReading: 0, reason: '' });
            await fetchUsage();
            await fetchMetadata();
        } catch (err) {
            showNotification(err?.response?.data?.message || err.message || "Failed to reset reading baseline.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleBulkResetSubmit = async () => {
        setSubmitting(true);
        try {
            const results = await CommunityOpsService.bulkResetMeterReadings({
                reason: bulkResetModal.reason || "End-of-cycle bulk software baseline reset"
            });
            showNotification(`Bulk baseline reset completed for ${results.length} active meters. All history preserved.`, "success");
            setBulkResetModal({ open: false, reason: '' });
            await fetchUsage();
            await fetchMetadata();
        } catch (err) {
            showNotification(err?.response?.data?.message || err.message || "Bulk reset failed.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const fetchResetLogs = async () => {
        try {
            const logs = await CommunityOpsService.getResetLogs();
            setResetLogs(logs || []);
            setResetLogsOpen(true);
        } catch (err) {
            showNotification("Unable to load reset audit logs.", "error");
        }
    };

    // ── Manual submit ─────────────────────────────────────────────────────────
    const handleManualSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                waterMeterId:   Number(manualForm.waterMeterId),
                currentReading: Number(manualForm.currentReading),
                readingDate:    manualForm.readingDate,
            };
            if (!payload.waterMeterId || isNaN(payload.currentReading) || !payload.readingDate) {
                throw new Error("Please complete all fields before submitting.");
            }
            await CommunityOpsService.addWaterUsage(payload);
            showNotification("Water usage reading added successfully.", "success");
            setManualForm(initialManualEntry);
            setManualDialogOpen(false);
            await fetchUsage();
        } catch (err) {
            showNotification(err?.response?.data?.message || err.message || "Failed to add reading.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    // ── CSV submit ────────────────────────────────────────────────────────────
    const handleCsvSubmit = async (event) => {
        event.preventDefault();
        if (!csvFile) { showNotification("Select a CSV file to upload.", "error"); return; }
        setSubmitting(true);
        try {
            const result = await CommunityOpsService.uploadWaterUsageCsv(csvFile);
            showNotification(`Uploaded ${result.length} reading${result.length === 1 ? "" : "s"}.`, "success");
            setCsvFile(null);
            setCsvDialogOpen(false);
            await fetchUsage();
        } catch (err) {
            showNotification(err?.response?.data?.message || err.message || "CSV upload failed.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    // ── DataGrid Columns ──────────────────────────────────────────────────────
    const columns = useMemo(() => [
        {
            field: "meterNumber", headerName: "Meter Number", flex: 1, minWidth: 150,
            renderCell: (params) => {
                const isLatest = latestReadingRecord && params.row.id === latestReadingRecord.id;
                return (
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="body2" fontWeight={700} color="primary.main" sx={{ fontFamily: "monospace", fontSize: "0.8125rem" }}>
                            {params.row.meterNumber || "—"}
                        </Typography>
                        {isLatest && (
                            <Chip icon={<StarIcon sx={{ fontSize: "0.75rem !important" }} />} label="Latest" size="small" color="primary" sx={{ height: 18, fontSize: "0.65rem", fontWeight: 700 }} />
                        )}
                    </Stack>
                );
            }
        },
        {
            field: "officialUserId", headerName: "Resident", flex: 1, minWidth: 160,
            renderCell: (params) => (
                <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "1px", overflow: "hidden", width: "100%" }}>
                    <Typography variant="body2" fontWeight={600} color="text.primary" noWrap>
                        {params.row.residentName || params.row.officialUserId || "—"}
                    </Typography>
                    {params.row.officialUserId && params.row.residentName && (
                        <Typography variant="caption" color="text.secondary" noWrap>ID: {params.row.officialUserId}</Typography>
                    )}
                </Box>
            )
        },
        {
            field: "readingDate", headerName: "Reading Date", width: 140,
            renderCell: (params) => (
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    {params.row.readingDate || "—"}
                </Typography>
            )
        },
        {
            field: "previousReading", headerName: "Prev. Reading (L)", width: 140,
            renderCell: (params) => (
                <Typography variant="body2" color="text.secondary">
                    {params.row.previousReading != null ? params.row.previousReading.toLocaleString() : "—"}
                </Typography>
            )
        },
        {
            field: "currentReading", headerName: "Current Reading (L)", width: 150,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={700} color="text.primary">
                    {params.row.currentReading != null ? params.row.currentReading.toLocaleString() : "—"}
                </Typography>
            )
        },
        {
            field: "unitsConsumed", headerName: "Units (kL)", width: 110,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={700} color="info.main">
                    {params.row.unitsConsumed != null ? params.row.unitsConsumed : "—"}
                </Typography>
            )
        },
        {
            field: "status", headerName: "Status", width: 120,
            renderCell: (params) => <StatusBadge status={params.row.status || "RECORDED"} />
        },
        {
            field: "actions", headerName: "Baseline Reset", width: 140, sortable: false,
            renderCell: (params) => {
                const targetResId = params.row.residentProfileId || meters.find(m => m.meterNumber === params.row.meterNumber)?.residentProfileId;
                return (
                    <Tooltip title={!resetAllowed ? "Reset locked: Active cycle bills not fully generated" : "Reset software baseline to 0.0 for next cycle"}>
                        <span>
                            <Button
                                size="small"
                                variant="outlined"
                                color="warning"
                                disabled={!resetAllowed || !targetResId}
                                startIcon={<RestartAltIcon sx={{ fontSize: "0.85rem !important" }} />}
                                onClick={() => setIndividualResetModal({
                                    open: true,
                                    residentProfileId: targetResId,
                                    residentName: params.row.residentName || params.row.officialUserId || "Resident",
                                    meterNumber: params.row.meterNumber,
                                    currentReading: params.row.currentReading || 0,
                                    reason: ""
                                })}
                                sx={{ textTransform: "none", fontSize: "0.7rem", py: 0.2, px: 1, borderRadius: "6px" }}
                            >
                                Reset 0.0
                            </Button>
                        </span>
                    </Tooltip>
                );
            }
        }
    ], [latestReadingRecord, meters, resetAllowed]);

    return (
        <DashboardLayout>
            <PageHeader
                title="Water Meter Usage"
                subtitle="Track meter readings sorted latest date first. Software reading reset allowed after bill generation."
                action={
                    <Stack direction="row" spacing={1.5}>
                        <ActionButton variant="outlined" startIcon={<HistoryIcon />} onClick={fetchResetLogs} sx={{ fontSize: "0.8125rem" }}>
                            Reset History Audit
                        </ActionButton>
                        <ActionButton variant="outlined" startIcon={<RefreshIcon />} onClick={fetchUsage} disabled={loading} sx={{ fontSize: "0.8125rem" }}>
                            Refresh
                        </ActionButton>
                    </Stack>
                }
            />

            {/* ── Summary KPI Cards Row ──────────────────────────────────────── */}
            {!loading && !error && (
                <Grid container spacing={2.5} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={4}>
                        <AdminStatCard
                            title="Usage Records Found"
                            value={filteredRows.length}
                            icon={<CalendarMonthIcon />}
                            color="info"
                            subtitle={`Filtered from ${rows.length} total records`}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <AdminStatCard
                            title="Active Water Meters"
                            value={uniqueMetersCount}
                            icon={<SpeedIcon />}
                            color="primary"
                            subtitle="Distinct monitored meters"
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <AdminStatCard
                            title="Total Consumption (kL)"
                            value={totalUnits.toLocaleString()}
                            icon={<WaterDropIcon />}
                            color="info"
                            subtitle="Cumulative units consumed"
                        />
                    </Grid>
                </Grid>
            )}

            {/* ── Error state display ────────────────────────────────────────── */}
            {error && !rows.length && (
                <Box sx={{ mb: 3 }}>
                    <ErrorState title="Failed to load usage records" message={error} onRetry={fetchUsage} />
                </Box>
            )}

            {/* ── Main Panel ───────────────────────────────────────────────── */}
            <Box sx={{ bgcolor: "background.paper", borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                {/* ── Toolbar Header & View Mode Switcher ─────────────────────── */}
                <TableToolbar
                    title="Meter Readings Management"
                    action={
                        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                            <ToggleButtonGroup
                                size="small"
                                value={viewMode}
                                exclusive
                                onChange={(e, newMode) => newMode && setViewMode(newMode)}
                                sx={{ bgcolor: "background.paper" }}
                            >
                                <ToggleButton value="GROUPED" sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.75rem" }}>
                                    <AccountTreeIcon sx={{ fontSize: "1rem", mr: 0.5 }} /> Grouped (Month → Resident)
                                </ToggleButton>
                                <ToggleButton value="TABLE" sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.75rem" }}>
                                    <ViewListIcon sx={{ fontSize: "1rem", mr: 0.5 }} /> Flat Table
                                </ToggleButton>
                            </ToggleButtonGroup>

                            {/* Software Baseline Bulk Reset Button */}
                            <Tooltip title={!resetAllowed ? "Bulk Reset Locked: Previous billing cycle bills are not fully generated." : "Software Reading Reset: Baseline all active meters to 0.0 for next cycle (Preserves all history)"}>
                                <span>
                                    <Button
                                        variant="outlined"
                                        color="warning"
                                        size="small"
                                        disabled={!resetAllowed}
                                        startIcon={!resetAllowed ? <LockIcon /> : <RestartAltIcon />}
                                        onClick={() => setBulkResetModal({ open: true, reason: '' })}
                                        sx={{ textTransform: "none", borderRadius: "8px", fontWeight: 700, fontSize: "0.8125rem" }}
                                    >
                                        Reset All Readings (0.0)
                                    </Button>
                                </span>
                            </Tooltip>

                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<UploadFileIcon />}
                                onClick={() => setCsvDialogOpen(true)}
                                sx={{ textTransform: "none", borderRadius: "8px", fontWeight: 600, fontSize: "0.8125rem" }}
                            >
                                Upload CSV
                            </Button>
                            <ActionButton
                                variant="contained"
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={() => setManualDialogOpen(true)}
                                sx={{ fontSize: "0.8125rem" }}
                            >
                                Manual Reading
                            </ActionButton>
                        </Stack>
                    }
                />

                {/* ── Filters Bar ────────────────────────────────────────────── */}
                <Box sx={{ p: 2.5, bgcolor: alpha(theme.palette.background.default, 0.4), borderBottom: "1px solid", borderColor: "divider" }}>
                    <Grid container spacing={2} alignItems="center">
                        {/* Row 1: Search, Resident, Meter */}
                        <Grid item xs={12} md={4}>
                            <SearchBar
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by meter #, resident, or date..."
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Resident</InputLabel>
                                <Select
                                    value={residentFilter}
                                    label="Resident"
                                    onChange={(e) => setResidentFilter(e.target.value)}
                                    sx={{ borderRadius: "8px", fontSize: "0.8125rem", bgcolor: "background.paper" }}
                                >
                                    <MenuItem value="ALL">All Residents</MenuItem>
                                    {residentOptions.map(opt => (
                                        <MenuItem key={opt.key} value={opt.key}>{opt.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Meter</InputLabel>
                                <Select
                                    value={meterFilter}
                                    label="Meter"
                                    onChange={(e) => setMeterFilter(e.target.value)}
                                    sx={{ borderRadius: "8px", fontSize: "0.8125rem", bgcolor: "background.paper" }}
                                >
                                    <MenuItem value="ALL">All Meters</MenuItem>
                                    {meters.map(m => (
                                        <MenuItem key={m.id} value={m.meterNumber || String(m.id)}>
                                            {m.meterNumber} ({m.residentName || "Unassigned"})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Row 2: Billing Cycle, From Date, To Date */}
                        <Grid item xs={12} sm={4} md={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Billing Cycle</InputLabel>
                                <Select
                                    value={cycleFilter}
                                    label="Billing Cycle"
                                    onChange={(e) => setCycleFilter(e.target.value)}
                                    sx={{ borderRadius: "8px", fontSize: "0.8125rem", bgcolor: "background.paper" }}
                                >
                                    <MenuItem value="ALL">All Cycles</MenuItem>
                                    {cycles.map(c => (
                                        <MenuItem key={c.id} value={String(c.id)}>{c.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={4} md={4}>
                            <TextField
                                label="From Date"
                                type="date"
                                size="small"
                                fullWidth
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                slotProps={{ inputLabel: { shrink: true } }}
                                sx={{ bgcolor: "background.paper", minWidth: 140, borderRadius: "8px" }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4} md={4}>
                            <TextField
                                label="To Date"
                                type="date"
                                size="small"
                                fullWidth
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                slotProps={{ inputLabel: { shrink: true } }}
                                sx={{ bgcolor: "background.paper", minWidth: 140, borderRadius: "8px" }}
                            />
                        </Grid>
                    </Grid>

                    {activeFiltersCount > 0 && (
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.5 }}>
                            <Chip
                                label={`Filtered ${filteredRows.length} of ${rows.length} readings`}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ height: 24, fontSize: "0.75rem" }}
                            />
                            <Button
                                size="small"
                                startIcon={<RestartAltIcon />}
                                onClick={handleResetFilters}
                                sx={{ textTransform: "none", fontSize: "0.75rem" }}
                            >
                                Clear All Filters ({activeFiltersCount})
                            </Button>
                        </Stack>
                    )}
                </Box>

                {/* ── VIEW MODE 1: Grouped View (Month → Residents) ─────────────── */}
                {viewMode === "GROUPED" ? (
                    <Box sx={{ p: 3, minHeight: 400, bgcolor: alpha(theme.palette.background.default, 0.2) }}>
                        {groupedByMonthAndResident.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 6 }}>
                                No water usage records match the selected filters.
                            </Typography>
                        ) : (
                            <Stack spacing={2.5}>
                                {groupedByMonthAndResident.map((monthGroup, idx) => (
                                    <Accordion
                                        key={monthGroup.monthKey}
                                        defaultExpanded={idx === 0}
                                        sx={{
                                            borderRadius: "12px !important",
                                            border: "1px solid",
                                            borderColor: idx === 0 ? "primary.light" : "divider",
                                            overflow: "hidden",
                                            boxShadow: idx === 0 ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                                            "&:before": { display: "none" }
                                        }}
                                    >
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            sx={{
                                                bgcolor: idx === 0 ? alpha(theme.palette.primary.main, 0.06) : "background.paper",
                                                px: 2.5,
                                                py: 1
                                            }}
                                        >
                                            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2} sx={{ width: "100%", pr: 2 }}>
                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                    <CalendarMonthIcon color={idx === 0 ? "primary" : "action"} />
                                                    <Typography variant="subtitle1" fontWeight={700}>
                                                        {monthGroup.monthKey}
                                                    </Typography>
                                                    {idx === 0 && (
                                                        <Chip label="Latest Month" size="small" color="primary" sx={{ height: 20, fontSize: "0.6875rem", fontWeight: 700 }} />
                                                    )}
                                                </Stack>
                                                <Stack direction="row" spacing={2.5} alignItems="center">
                                                    <Typography variant="body2" color="text.secondary">
                                                        Residents: <strong>{monthGroup.residents.length}</strong>
                                                    </Typography>
                                                    <Chip
                                                        label={`Total Usage: ${monthGroup.totalUnits.toLocaleString()} kL`}
                                                        color="info"
                                                        size="small"
                                                        sx={{ fontWeight: 700 }}
                                                    />
                                                </Stack>
                                            </Stack>
                                        </AccordionSummary>

                                        <AccordionDetails sx={{ p: 2.5, bgcolor: "background.paper" }}>
                                            <Grid container spacing={2}>
                                                {monthGroup.residents.map(res => {
                                                    const latestResReading = res.readings[0];
                                                    const targetResId = res.residentProfileId || (latestResReading ? (latestResReading.residentProfileId || meters.find(m => m.meterNumber === latestResReading.meterNumber)?.residentProfileId) : null);
                                                    return (
                                                        <Grid item xs={12} md={6} key={res.residentName}>
                                                            <Paper
                                                                variant="outlined"
                                                                sx={{
                                                                    p: 2,
                                                                    borderRadius: 2,
                                                                    borderColor: "divider",
                                                                    bgcolor: alpha(theme.palette.background.default, 0.3)
                                                                }}
                                                            >
                                                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                                        <PersonIcon color="primary" sx={{ fontSize: "1.1rem" }} />
                                                                        <Typography variant="subtitle2" fontWeight={700}>
                                                                            {res.residentName}
                                                                        </Typography>
                                                                        {res.unitNumber && res.unitNumber !== "N/A" && (
                                                                            <Chip label={`Unit ${res.unitNumber}`} size="small" variant="outlined" sx={{ height: 18, fontSize: "0.65rem" }} />
                                                                        )}
                                                                    </Stack>

                                                                    {/* Individual Software Baseline Reset Button */}
                                                                    <Tooltip title={!resetAllowed ? "Reset locked: Active cycle bills not fully generated" : "Reset reading baseline to 0.0 for next reading cycle"}>
                                                                        <span>
                                                                            <Button
                                                                                size="small"
                                                                                variant="outlined"
                                                                                color="warning"
                                                                                disabled={!resetAllowed || !targetResId}
                                                                                startIcon={<RestartAltIcon sx={{ fontSize: "0.85rem !important" }} />}
                                                                                onClick={() => setIndividualResetModal({
                                                                                    open: true,
                                                                                    residentProfileId: targetResId,
                                                                                    residentName: res.residentName,
                                                                                    meterNumber: latestResReading?.meterNumber || "N/A",
                                                                                    currentReading: latestResReading?.currentReading || 0,
                                                                                    reason: ""
                                                                                })}
                                                                                sx={{ textTransform: "none", fontSize: "0.7rem", py: 0.2, px: 1, borderRadius: "6px" }}
                                                                            >
                                                                                Reset 0.0
                                                                            </Button>
                                                                        </span>
                                                                    </Tooltip>
                                                                </Stack>

                                                                {/* Readings List for this Resident */}
                                                                <Stack spacing={1}>
                                                                    {res.readings.map(reading => {
                                                                        const isLatest = latestReadingRecord && reading.id === latestReadingRecord.id;
                                                                        return (
                                                                            <Box
                                                                                key={reading.id}
                                                                                sx={{
                                                                                    p: 1.5,
                                                                                    borderRadius: 1.5,
                                                                                    bgcolor: isLatest ? alpha(theme.palette.primary.main, 0.08) : "background.paper",
                                                                                    border: "1px solid",
                                                                                    borderColor: isLatest ? "primary.main" : "divider",
                                                                                    display: "flex",
                                                                                    justifyContent: "space-between",
                                                                                    alignItems: "center"
                                                                                }}
                                                                            >
                                                                                <Box>
                                                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                                                        <Typography variant="caption" fontWeight={700} sx={{ fontFamily: "monospace", color: "primary.main" }}>
                                                                                            {reading.meterNumber}
                                                                                        </Typography>
                                                                                        {isLatest && (
                                                                                            <Chip label="Latest Reading" size="small" color="primary" sx={{ height: 16, fontSize: "0.6rem" }} />
                                                                                        )}
                                                                                    </Stack>
                                                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                                                        Date: {reading.readingDate} | Reading: {reading.currentReading?.toLocaleString()} L
                                                                                    </Typography>
                                                                                </Box>

                                                                                <Typography variant="subtitle2" fontWeight={800} color="info.main">
                                                                                    {reading.unitsConsumed} kL
                                                                                </Typography>
                                                                            </Box>
                                                                        );
                                                                    })}
                                                                </Stack>
                                                            </Paper>
                                                        </Grid>
                                                    );
                                                })}
                                            </Grid>
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                            </Stack>
                        )}
                    </Box>
                ) : (
                    /* ── VIEW MODE 2: Flat DataGrid Table View ────────────────────────────── */
                    <Box sx={{ height: 540 }}>
                        <DataGrid
                            rows={filteredRows}
                            columns={columns}
                            loading={loading}
                            error={error && rows.length ? error : null}
                            onRetry={fetchUsage}
                            pageSize={10}
                        />
                    </Box>
                )}
            </Box>

            {/* ── Individual Baseline Reset Modal ─────────────────────────────── */}
            <Dialog
                open={individualResetModal.open}
                onClose={() => !submitting && setIndividualResetModal(p => ({ ...p, open: false }))}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", borderBottom: "1px solid", borderColor: "divider", pb: 2 }}>
                    Software Reading Reset (Individual)
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        <Alert severity="info" icon={<RestartAltIcon />}>
                            This resets the software reading baseline to <strong>0.0</strong> for the next reading cycle. Complete historical billing and usage records remain untouched.
                        </Alert>
                        <Box sx={{ p: 2, bgcolor: "action.hover", borderRadius: 2 }}>
                            <Typography variant="subtitle2" fontWeight={700}>{individualResetModal.residentName}</Typography>
                            <Typography variant="caption" color="text.secondary" display="block">Meter: {individualResetModal.meterNumber}</Typography>
                            <Typography variant="caption" color="text.secondary" display="block">Current Baseline: {individualResetModal.currentReading?.toLocaleString()} L → <strong>0.0 L</strong></Typography>
                        </Box>
                        <TextField
                            label="Reason for Baseline Reset"
                            multiline
                            rows={2}
                            fullWidth
                            size="small"
                            placeholder="e.g. End of billing cycle reading baseline reset"
                            value={individualResetModal.reason}
                            onChange={(e) => setIndividualResetModal(p => ({ ...p, reason: e.target.value }))}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ borderTop: "1px solid", borderColor: "divider", px: 3, py: 2, gap: 1 }}>
                    <Button onClick={() => setIndividualResetModal(p => ({ ...p, open: false }))} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="warning"
                        disabled={submitting}
                        onClick={handleIndividualResetSubmit}
                        startIcon={<RestartAltIcon />}
                    >
                        {submitting ? "Resetting…" : "Confirm Baseline Reset (0.0)"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Bulk Baseline Reset Modal ─────────────────────────────────────── */}
            <Dialog
                open={bulkResetModal.open}
                onClose={() => !submitting && setBulkResetModal(p => ({ ...p, open: false }))}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", borderBottom: "1px solid", borderColor: "divider", pb: 2 }}>
                    Bulk Software Reading Reset (All Meters)
                </DialogTitle>
                <DialogContent>
                    <Stack spacing= {2.5} sx={{ mt: 2 }}>
                        <Alert severity="warning" icon={<RestartAltIcon />}>
                            <strong>BULK ACTION:</strong> This will reset the software reading baseline to <strong>0.0</strong> for ALL active community water meters for the next reading cycle.<br />
                            <strong>Safety Guarantee:</strong> Historical bills, past usage records, and invoices remain 100% intact in the database.
                        </Alert>
                        <TextField
                            label="Reason for Bulk Reset"
                            multiline
                            rows={2}
                            fullWidth
                            size="small"
                            placeholder="e.g. Cycle completion - baseline reset for new cycle"
                            value={bulkResetModal.reason}
                            onChange={(e) => setBulkResetModal(p => ({ ...p, reason: e.target.value }))}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ borderTop: "1px solid", borderColor: "divider", px: 3, py: 2, gap: 1 }}>
                    <Button onClick={() => setBulkResetModal(p => ({ ...p, open: false }))} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="warning"
                        disabled={submitting}
                        onClick={handleBulkResetSubmit}
                        startIcon={<RestartAltIcon />}
                    >
                        {submitting ? "Executing Bulk Reset…" : "Execute Bulk Reset (0.0)"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Reset Audit Logs Dialog ────────────────────────────────────────── */}
            <Dialog
                open={resetLogsOpen}
                onClose={() => setResetLogsOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", borderBottom: "1px solid", borderColor: "divider", pb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>Software Reading Reset Audit Logs</span>
                    <Chip label={`${resetLogs.length} Records`} size="small" color="primary" />
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    {resetLogs.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 6 }}>
                            No meter baseline reset records logged yet.
                        </Typography>
                    ) : (
                        <TableContainer sx={{ maxHeight: 440 }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>Reset Date</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Resident</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Meter #</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Prev Reading</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>New Reading</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Reset Type</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Reset By</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Reason</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {resetLogs.map(log => (
                                        <TableRow key={log.id} hover>
                                            <TableCell sx={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                                                {new Date(log.resetDate).toLocaleString()}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 600, fontSize: "0.8rem" }}>
                                                {log.residentName} ({log.unitNumber})
                                            </TableCell>
                                            <TableCell sx={{ fontFamily: "monospace", fontSize: "0.75rem", color: "primary.main", fontWeight: 700 }}>
                                                {log.meterNumber}
                                            </TableCell>
                                            <TableCell sx={{ color: "text.secondary", fontSize: "0.75rem" }}>
                                                {log.previousReading?.toLocaleString()} L
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 800, color: "success.main", fontSize: "0.75rem" }}>
                                                {log.newReading} L
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={log.resetType}
                                                    size="small"
                                                    color={log.resetType === "BULK" ? "warning" : "info"}
                                                    sx={{ height: 18, fontSize: "0.65rem", fontWeight: 700 }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ fontSize: "0.75rem" }}>{log.resetBy}</TableCell>
                                            <TableCell sx={{ fontSize: "0.75rem", color: "text.secondary" }}>{log.reason || "—"}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>
                <DialogActions sx={{ borderTop: "1px solid", borderColor: "divider", px: 3, py: 2 }}>
                    <Button onClick={() => setResetLogsOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* ── Manual Reading dialog ─────────────────────────────────────── */}
            <Dialog open={manualDialogOpen} onClose={() => !submitting && setManualDialogOpen(false)} maxWidth="sm" fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", borderBottom: "1px solid", borderColor: "divider", pb: 2 }}>
                    Add Water Usage Reading
                </DialogTitle>
                <DialogContent>
                    <Box component="form" id="manual-entry-form" onSubmit={handleManualSubmit}>
                        <Stack spacing={2.5} sx={{ mt: 2.5 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel id="meter-select-label">Select Meter</InputLabel>
                                <Select
                                    labelId="meter-select-label"
                                    label="Select Meter"
                                    value={manualForm.waterMeterId}
                                    onChange={(e) => setManualForm(p => ({ ...p, waterMeterId: e.target.value }))}
                                >
                                    {meters.map(meter => (
                                        <MenuItem key={meter.id} value={meter.id}>
                                            <Box>
                                                <Typography variant="body2" fontWeight={600} sx={{ fontFamily: "monospace" }}>
                                                    {meter.meterNumber}
                                                </Typography>
                                                {meter.residentName && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {meter.residentName}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField
                                label="Current Reading (L)"
                                type="number"
                                fullWidth
                                size="small"
                                value={manualForm.currentReading}
                                onChange={(e) => setManualForm(p => ({ ...p, currentReading: e.target.value }))}
                                inputProps={{ min: 0, step: 0.01 }}
                            />
                            <TextField
                                label="Reading Date"
                                type="date"
                                fullWidth
                                size="small"
                                value={manualForm.readingDate}
                                onChange={(e) => setManualForm(p => ({ ...p, readingDate: e.target.value }))}
                                slotProps={{ inputLabel: { shrink: true } }}
                            />
                        </Stack>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ borderTop: "1px solid", borderColor: "divider", px: 3, py: 2, gap: 1 }}>
                    <Button onClick={() => setManualDialogOpen(false)} disabled={submitting} sx={{ textTransform: "none" }}>
                        Cancel
                    </Button>
                    <ActionButton type="submit" form="manual-entry-form" variant="contained" disabled={submitting} sx={{ textTransform: "none" }}>
                        {submitting ? "Saving…" : "Save Reading"}
                    </ActionButton>
                </DialogActions>
            </Dialog>

            {/* ── CSV Upload dialog ─────────────────────────────────────────── */}
            <Dialog open={csvDialogOpen} onClose={() => !submitting && setCsvDialogOpen(false)} maxWidth="sm" fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", borderBottom: "1px solid", borderColor: "divider", pb: 2 }}>
                    Upload CSV Readings
                </DialogTitle>
                <DialogContent>
                    <Box component="form" id="csv-upload-form" onSubmit={handleCsvSubmit}>
                        <Stack spacing={2.5} sx={{ mt: 2.5 }}>
                            <Box sx={{ p: 2, bgcolor: "action.hover", borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: "block", mb: 0.5, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                    Expected Format
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: "monospace", color: "text.primary" }}>
                                    meterId, date, reading
                                </Typography>
                            </Box>
                            <TextField
                                type="file"
                                inputProps={{ accept: ".csv" }}
                                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                                fullWidth
                                size="small"
                                helperText={csvFile ? `Selected: ${csvFile.name}` : "No file selected"}
                            />
                        </Stack>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ borderTop: "1px solid", borderColor: "divider", px: 3, py: 2, gap: 1 }}>
                    <Button onClick={() => setCsvDialogOpen(false)} disabled={submitting} sx={{ textTransform: "none" }}>
                        Cancel
                    </Button>
                    <ActionButton type="submit" form="csv-upload-form" variant="contained" disabled={submitting || !csvFile} sx={{ textTransform: "none" }}>
                        {submitting ? "Uploading…" : "Upload Readings"}
                    </ActionButton>
                </DialogActions>
            </Dialog>
        </DashboardLayout>
    );
}

export default WaterUsagePage;
