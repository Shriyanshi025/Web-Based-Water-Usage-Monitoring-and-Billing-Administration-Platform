import React, { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";

import DeleteIcon from "@mui/icons-material/Delete";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VisibilityIcon from "@mui/icons-material/Visibility";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";

import DashboardLayout from "../../components/layout/DashboardLayout";
import PageSummaryHeader from "../../components/common/PageSummaryHeader";
import AdminStatCard from "../../components/common/AdminStatCard";
import SearchBar from "../../components/common/SearchBar";
import CommunityOpsService from "../../services/CommunityOpsService";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";

function AlertsManagementPage() {
    const theme = useTheme();
    const { user } = useAuth();
    const { showNotification } = useNotification();

    const [alerts, setAlerts] = useState([]);
    const [billingCycles, setBillingCycles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSeverity, setSelectedSeverity] = useState("ALL");
    const [selectedStatus, setSelectedStatus] = useState("ALL");
    const [selectedType, setSelectedType] = useState("ALL");
    const [selectedResident, setSelectedResident] = useState("ALL");
    const [selectedCycle, setSelectedCycle] = useState("ALL");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Selection
    const [selectedIds, setSelectedIds] = useState([]);

    // Detail modal state
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [resolutionNotes, setResolutionNotes] = useState("");

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const activeCommunityId = user?.communityId || "me";

            const [alertsData, cyclesData] = await Promise.all([
                CommunityOpsService.getCommunityAlerts(activeCommunityId),
                CommunityOpsService.getAllBillingCycles().catch(() => [])
            ]);
            const alertList = Array.isArray(alertsData) ? alertsData : (alertsData?.content ?? alertsData?.data ?? []);
            setAlerts(alertList);

            const cycleList = Array.isArray(cyclesData) ? cyclesData : (cyclesData?.data ?? []);
            setBillingCycles(cycleList);

            setSelectedIds([]);
        } catch (err) {
            setError(err?.response?.data?.message || err.message || "Failed to load community alerts.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, [user?.communityId]);

    // Severity mapping helper
    const getSeverityStyles = (severity) => {
        switch (severity) {
            case "CRITICAL":
                return { color: "error", label: "Critical", icon: <ErrorIcon fontSize="small" />, bg: "#FEE2E2", border: "#FCA5A5", text: "#991B1B" };
            case "HIGH":
                return { color: "error", label: "High", icon: <WarningAmberIcon fontSize="small" />, bg: "#FFEDD5", border: "#FDBA74", text: "#C2410C" };
            case "MEDIUM":
                return { color: "warning", label: "Medium", icon: <WarningAmberIcon fontSize="small" />, bg: "#FEF3C7", border: "#FDE047", text: "#B45309" };
            case "LOW":
            case "INFO":
            default:
                return { color: "info", label: "Low", icon: <InfoIcon fontSize="small" />, bg: "#E0F2FE", border: "#7DD3FC", text: "#0369A1" };
        }
    };

    // Card counts
    const counts = useMemo(() => {
        const total = alerts.length;
        const critical = alerts.filter((a) => a.severity === "CRITICAL").length;
        const high = alerts.filter((a) => a.severity === "HIGH").length;
        const medium = alerts.filter((a) => a.severity === "MEDIUM").length;
        const low = alerts.filter((a) => a.severity === "LOW" || a.severity === "INFO").length;
        const resolved = alerts.filter((a) => a.status === "RESOLVED").length;
        return { total, critical, high, medium, low, resolved };
    }, [alerts]);

    // Unique list of resident names for filter
    const residentOptions = useMemo(() => {
        const names = new Set(alerts.map((a) => a.residentName).filter(Boolean));
        return Array.from(names);
    }, [alerts]);

    // Unique alert types for dropdown filter
    const alertTypes = useMemo(() => {
        const types = new Set(alerts.map((a) => a.alertType).filter(Boolean));
        return Array.from(types);
    }, [alerts]);

    // Actions
    const handleAcknowledge = async (id) => {
        try {
            const res = await CommunityOpsService.acknowledgeAlert(id);
            const updated = res?.data || res;
            setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: "ACKNOWLEDGED", acknowledgedDate: updated.acknowledgedDate || new Date().toISOString() } : a)));
            if (selectedAlert?.id === id) {
                setSelectedAlert((prev) => ({ ...prev, status: "ACKNOWLEDGED", acknowledgedDate: updated.acknowledgedDate || new Date().toISOString() }));
            }
            showNotification("Alert marked as Acknowledged.", "success");
        } catch (err) {
            showNotification(err?.response?.data?.message || "Failed to acknowledge alert.", "error");
        }
    };

    const handleResolve = async (id, notes = "") => {
        try {
            const res = await CommunityOpsService.resolveAlert(id);
            const updated = res?.data || res;
            setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: "RESOLVED", resolvedDate: updated.resolvedDate || new Date().toISOString(), resolutionNotes: notes || resolutionNotes } : a)));
            if (selectedAlert?.id === id) {
                setSelectedAlert((prev) => ({ ...prev, status: "RESOLVED", resolvedDate: updated.resolvedDate || new Date().toISOString(), resolutionNotes: notes || resolutionNotes }));
            }
            showNotification("Alert marked as Resolved.", "success");
            setDetailModalOpen(false);
        } catch (err) {
            showNotification(err?.response?.data?.message || "Failed to resolve alert.", "error");
        }
    };

    const handleDelete = async (id) => {
        try {
            await CommunityOpsService.deleteAlert(id);
            setAlerts((prev) => prev.filter((a) => a.id !== id));
            setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
            if (selectedAlert?.id === id) {
                setDetailModalOpen(false);
                setSelectedAlert(null);
            }
            showNotification("Alert deleted successfully.", "success");
        } catch (err) {
            showNotification("Failed to delete alert.", "error");
        }
    };

    const handleBulkMarkRead = async () => {
        if (selectedIds.length === 0) return;
        try {
            await CommunityOpsService.bulkMarkAlertsRead(selectedIds);
            setAlerts((prev) =>
                prev.map((a) => (selectedIds.includes(a.id) ? { ...a, status: "READ" } : a))
            );
            setSelectedIds([]);
            showNotification("Selected alerts marked as read.", "success");
        } catch (err) {
            showNotification("Bulk mark read failed.", "error");
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        try {
            await CommunityOpsService.bulkDeleteAlerts(selectedIds);
            setAlerts((prev) => prev.filter((a) => !selectedIds.includes(a.id)));
            setSelectedIds([]);
            showNotification("Selected alerts deleted.", "success");
        } catch (err) {
            showNotification("Bulk delete failed.", "error");
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(filteredRows.map((a) => a.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectRow = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleOpenDetailModal = (alertItem) => {
        setSelectedAlert(alertItem);
        setResolutionNotes(alertItem.resolutionNotes || "");
        setDetailModalOpen(true);
    };

    const resetFilters = () => {
        setSearchTerm("");
        setSelectedSeverity("ALL");
        setSelectedStatus("ALL");
        setSelectedType("ALL");
        setSelectedResident("ALL");
        setSelectedCycle("ALL");
        setFromDate("");
        setToDate("");
    };

    // Filter logic
    const filteredRows = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return alerts.filter((a) => {
            const matchesSearch =
                (a.title || "").toLowerCase().includes(term) ||
                (a.message || "").toLowerCase().includes(term) ||
                (a.reason || "").toLowerCase().includes(term) ||
                (a.alertNumber || "").toLowerCase().includes(term) ||
                (a.residentName || "").toLowerCase().includes(term) ||
                (a.meterNumber || "").toLowerCase().includes(term) ||
                (a.unitNumber || "").toLowerCase().includes(term);

            const matchesSeverity = selectedSeverity === "ALL" || a.severity === selectedSeverity;
            const matchesStatus = selectedStatus === "ALL" || a.status === selectedStatus;
            const matchesType = selectedType === "ALL" || a.alertType === selectedType;
            const matchesResident = selectedResident === "ALL" || a.residentName === selectedResident;
            const matchesCycle = selectedCycle === "ALL" || String(a.billingCycleId) === String(selectedCycle);

            let matchesFromDate = true;
            if (fromDate && a.createdDate) {
                matchesFromDate = new Date(a.createdDate) >= new Date(fromDate);
            }

            let matchesToDate = true;
            if (toDate && a.createdDate) {
                const end = new Date(toDate);
                end.setHours(23, 59, 59, 999);
                matchesToDate = new Date(a.createdDate) <= end;
            }

            return matchesSearch && matchesSeverity && matchesStatus && matchesType && matchesResident && matchesCycle && matchesFromDate && matchesToDate;
        });
    }, [alerts, searchTerm, selectedSeverity, selectedStatus, selectedType, selectedResident, selectedCycle, fromDate, toDate]);

    const paginatedRows = useMemo(() => {
        const start = page * rowsPerPage;
        return filteredRows.slice(start, start + rowsPerPage);
    }, [filteredRows, page, rowsPerPage]);

    // CSV Export
    const handleExportCSV = () => {
        if (filteredRows.length === 0) {
            showNotification("No data available to export.", "warning");
            return;
        }
        const headers = ["Alert ID", "Resident", "Unit", "Meter", "Alert Type", "Severity", "Reason & Title", "Status", "Generated Date"];
        const csvRows = [headers.join(",")];

        filteredRows.forEach((row) => {
            const values = [
                `"${row.alertNumber || ""}"`,
                `"${row.residentName || "N/A"}"`,
                `"${row.unitNumber || "N/A"}"`,
                `"${row.meterNumber || "N/A"}"`,
                `"${row.alertType || ""}"`,
                `"${row.severity || ""}"`,
                `"${(row.title || "").replace(/"/g, '""')} - ${(row.reason || row.message || "").replace(/"/g, '""')}"`,
                `"${row.status || ""}"`,
                `"${row.createdDate ? new Date(row.createdDate).toLocaleString() : ""}"`
            ];
            csvRows.push(values.join(","));
        });

        const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `community_alerts_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification("Alerts report exported to CSV.", "success");
    };

    // PDF / Print Export
    const handleExportPDF = () => {
        if (filteredRows.length === 0) {
            showNotification("No data available to export.", "warning");
            return;
        }
        const printWindow = window.open("", "_blank");
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Community Alerts Report</title>
                <style>
                    body { font-family: sans-serif; margin: 20px; color: #0f172a; }
                    h2 { color: #0284c7; margin-bottom: 4px; }
                    p { color: #64748b; font-size: 13px; margin-top: 0; }
                    table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
                    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
                    th { background-color: #f1f5f9; font-weight: bold; }
                    .badge { font-weight: bold; padding: 2px 6px; border-radius: 4px; font-size: 11px; }
                    .CRITICAL { background: #fee2e2; color: #991b1b; }
                    .HIGH { background: #ffedd5; color: #c2410c; }
                    .MEDIUM { background: #fef3c7; color: #b45309; }
                    .LOW { background: #e0f2fe; color: #0369a1; }
                </style>
            </head>
            <body>
                <h2>HydroSync - Community Alerts Report</h2>
                <p>Generated on ${new Date().toLocaleString()} | Total Records: ${filteredRows.length}</p>
                <table>
                    <thead>
                        <tr>
                            <th>Alert ID</th>
                            <th>Resident</th>
                            <th>Unit</th>
                            <th>Meter</th>
                            <th>Type</th>
                            <th>Severity</th>
                            <th>Status</th>
                            <th>Generated</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredRows.map(r => `
                            <tr>
                                <td><strong>${r.alertNumber}</strong></td>
                                <td>${r.residentName || "Community"}</td>
                                <td>${r.unitNumber || "—"}</td>
                                <td>${r.meterNumber || "—"}</td>
                                <td>${r.alertType?.replace(/_/g, " ")}</td>
                                <td><span class="badge ${r.severity}">${r.severity}</span></td>
                                <td>${r.status}</td>
                                <td>${r.createdDate ? new Date(r.createdDate).toLocaleDateString() : "—"}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
                <script>window.onload = function() { window.print(); }</script>
            </body>
            </html>
        `;
        printWindow.document.write(html);
        printWindow.document.close();
    };

    // Diagnostic extraction helper from alert message
    const getDiagnosticMetrics = (alertItem) => {
        if (!alertItem) return { usage: "—", threshold: "—", trigger: "—" };
        const msg = alertItem.reason || alertItem.message || "";
        
        const flowMatch = msg.match(/flow:\s*([\d.]+)\s*kL/i) || msg.match(/consumption\s*([\d.]+)\s*kL/i);
        const threshMatch = msg.match(/threshold:\s*([\d.]+)\s*kL/i) || msg.match(/threshold\s*([\d.]+)\s*kL/i);
        const histMatch = msg.match(/average\s*([\d.]+)\s*kL/i) || msg.match(/historical\s*([\d.]+)\s*kL/i);

        return {
            trigger: flowMatch ? `${flowMatch[1]} kL` : "Detected Anomaly",
            threshold: threshMatch ? `${threshMatch[1]} kL` : "Configured Limit",
            usage: histMatch ? `${histMatch[1]} kL / cycle` : "Standard Resident Baseline"
        };
    };

    const headerMetadata = useMemo(() => [
        { label: "Total Alerts", value: counts.total },
        { label: "Critical", value: counts.critical, color: "error" },
        { label: "High", value: counts.high, color: "warning" },
        { label: "Resolved", value: counts.resolved, color: "success" },
    ], [counts]);

    return (
        <DashboardLayout>
            <PageSummaryHeader
                title="Alerts & Incident Management"
                subtitle="Software Alert Engine for water usage anomalies, leaks, stuck meters, invalid readings, and tampering."
                icon={NotificationsActiveIcon}
                metadata={headerMetadata}
                action={
                    <Stack direction="row" spacing={1.5}>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<DownloadIcon />}
                            onClick={handleExportCSV}
                            sx={{ textTransform: "none", borderRadius: 2, height: 36, fontWeight: 600 }}
                        >
                            Export CSV
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            size="small"
                            startIcon={<PictureAsPdfIcon />}
                            onClick={handleExportPDF}
                            sx={{ textTransform: "none", borderRadius: 2, height: 36, fontWeight: 600 }}
                        >
                            Export PDF
                        </Button>
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<RefreshIcon />}
                            onClick={fetchAlerts}
                            sx={{ textTransform: "none", borderRadius: 2, height: 36, fontWeight: 600 }}
                        >
                            Refresh
                        </Button>
                    </Stack>
                }
            />

            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Bulk Actions Header */}
            {selectedIds.length > 0 && (
                <Paper sx={{ p: 2, mb: 3, bgcolor: alpha(theme.palette.primary.main, 0.08), borderRadius: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }} elevation={0}>
                    <Typography variant="subtitle2" color="primary.main" fontWeight="bold">
                        {selectedIds.length} Alert{selectedIds.length > 1 ? "s" : ""} Selected
                    </Typography>
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="contained"
                            size="small"
                            color="primary"
                            startIcon={<DoneAllIcon />}
                            onClick={handleBulkMarkRead}
                            sx={{ textTransform: "none", borderRadius: 2 }}
                        >
                            Mark Read
                        </Button>
                        <Button
                            variant="contained"
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={handleBulkDelete}
                            sx={{ textTransform: "none", borderRadius: 2 }}
                        >
                            Delete Selected
                        </Button>
                    </Stack>
                </Paper>
            )}

            {/* ── FILTERS PANEL ── */}
            <Card sx={{ borderRadius: "12px", border: "1px solid", borderColor: "divider", boxShadow: "0 1px 4px rgba(12, 25, 41, 0.05)", mb: 3 }}>
                <CardContent sx={{ p: 2.5 }}>
                    <Grid container spacing={2} alignItems="center">
                        {/* Search Bar */}
                        <Grid item xs={12} sm={6} md={3}>
                            <SearchBar
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search alert, resident, meter..."
                            />
                        </Grid>

                        {/* Severity */}
                        <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel sx={{ bgcolor: "background.paper", px: 0.5 }}>Severity</InputLabel>
                                <Select
                                    value={selectedSeverity}
                                    onChange={(e) => setSelectedSeverity(e.target.value)}
                                    label="Severity"
                                    sx={{ borderRadius: 2 }}
                                >
                                    <MenuItem value="ALL">All Severities</MenuItem>
                                    <MenuItem value="CRITICAL">Critical</MenuItem>
                                    <MenuItem value="HIGH">High</MenuItem>
                                    <MenuItem value="MEDIUM">Medium</MenuItem>
                                    <MenuItem value="LOW">Low</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Status */}
                        <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel sx={{ bgcolor: "background.paper", px: 0.5 }}>Status</InputLabel>
                                <Select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    label="Status"
                                    sx={{ borderRadius: 2 }}
                                >
                                    <MenuItem value="ALL">All Statuses</MenuItem>
                                    <MenuItem value="ACTIVE">Active</MenuItem>
                                    <MenuItem value="ACKNOWLEDGED">Acknowledged</MenuItem>
                                    <MenuItem value="READ">Read</MenuItem>
                                    <MenuItem value="RESOLVED">Resolved</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Resident */}
                        <Grid item xs={12} sm={6} md={2.5}>
                            <FormControl fullWidth size="small">
                                <InputLabel sx={{ bgcolor: "background.paper", px: 0.5 }}>Resident</InputLabel>
                                <Select
                                    value={selectedResident}
                                    onChange={(e) => setSelectedResident(e.target.value)}
                                    label="Resident"
                                    sx={{ borderRadius: 2 }}
                                >
                                    <MenuItem value="ALL">All Residents</MenuItem>
                                    {residentOptions.map((res) => (
                                        <MenuItem key={res} value={res}>{res}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Alert Type */}
                        <Grid item xs={12} sm={6} md={2.5}>
                            <FormControl fullWidth size="small">
                                <InputLabel sx={{ bgcolor: "background.paper", px: 0.5 }}>Alert Type</InputLabel>
                                <Select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    label="Alert Type"
                                    sx={{ borderRadius: 2 }}
                                >
                                    <MenuItem value="ALL">All Alert Types</MenuItem>
                                    {alertTypes.map((t) => (
                                        <MenuItem key={t} value={t}>
                                            {t.replace(/_/g, " ")}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Billing Cycle */}
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel sx={{ bgcolor: "background.paper", px: 0.5 }}>Billing Cycle</InputLabel>
                                <Select
                                    value={selectedCycle}
                                    onChange={(e) => setSelectedCycle(e.target.value)}
                                    label="Billing Cycle"
                                    sx={{ borderRadius: 2 }}
                                >
                                    <MenuItem value="ALL">All Billing Cycles</MenuItem>
                                    {billingCycles.map((c) => (
                                        <MenuItem key={c.id} value={c.id}>{c.name || `Cycle #${c.id}`}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* From Date */}
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                size="small"
                                type="date"
                                variant="outlined"
                                label="From Date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                slotProps={{
                                    inputLabel: { shrink: true }
                                }}
                            />
                        </Grid>

                        {/* To Date */}
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                size="small"
                                type="date"
                                variant="outlined"
                                label="To Date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                slotProps={{
                                    inputLabel: { shrink: true }
                                }}
                            />
                        </Grid>

                        {/* Reset Filters Button */}
                        <Grid item xs={12} sm={6} md={3}>
                            <Button
                                fullWidth
                                variant="outlined"
                                color="inherit"
                                size="small"
                                startIcon={<RestartAltIcon />}
                                onClick={resetFilters}
                                sx={{ textTransform: "none", borderRadius: 2, height: 40 }}
                            >
                                Reset Filters
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* ── ALERTS TABLE ── */}
            <Card sx={{ borderRadius: "12px", border: "1px solid", borderColor: "divider", boxShadow: "0 1px 4px rgba(12, 25, 41, 0.05)" }}>
                <CardContent sx={{ p: 0 }}>
                    <TableContainer>
                        {loading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <Table>
                                <TableHead sx={{ bgcolor: "#F0F4F8" }}>
                                    <TableRow>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                indeterminate={selectedIds.length > 0 && selectedIds.length < filteredRows.length}
                                                checked={filteredRows.length > 0 && selectedIds.length === filteredRows.length}
                                                onChange={handleSelectAll}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Alert ID</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Resident</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Unit</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Meter</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Severity</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Reason &amp; Message</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Generated</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                        <TableCell align="right" sx={{ pr: 3, fontWeight: 700 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedRows.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={11} align="center" sx={{ py: 8 }}>
                                                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                                                    <Typography variant="h3" sx={{ mb: 1, opacity: 0.6 }}>🔔</Typography>
                                                    <Typography variant="subtitle1" fontWeight="bold" color="text.secondary">
                                                        No Alerts Found
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320 }}>
                                                        No alerts matched your search or filter criteria.
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedRows.map((row) => {
                                            const sev = getSeverityStyles(row.severity);
                                            const isSelected = selectedIds.includes(row.id);
                                            return (
                                                <TableRow key={row.id} hover selected={isSelected} sx={{ opacity: row.status === "RESOLVED" ? 0.75 : 1 }}>
                                                    <TableCell padding="checkbox">
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onChange={() => handleSelectRow(row.id)}
                                                        />
                                                    </TableCell>
                                                    {/* Alert ID */}
                                                    <TableCell sx={{ fontFamily: "monospace", fontSize: "0.78rem", fontWeight: 700, color: "text.primary" }}>
                                                        {row.alertNumber}
                                                    </TableCell>
                                                    {/* Resident */}
                                                    <TableCell sx={{ fontWeight: 600 }}>
                                                        {row.residentName || "Community Alert"}
                                                    </TableCell>
                                                    {/* Unit */}
                                                    <TableCell sx={{ fontSize: "0.8125rem" }}>
                                                        {row.unitNumber ? `Unit ${row.unitNumber}` : "N/A"}
                                                    </TableCell>
                                                    {/* Meter */}
                                                    <TableCell sx={{ fontSize: "0.8125rem", fontFamily: "monospace" }}>
                                                        {row.meterNumber || "N/A"}
                                                    </TableCell>
                                                    {/* Type */}
                                                    <TableCell sx={{ fontWeight: 600, fontSize: "0.8125rem" }}>
                                                        {row.alertType?.replace(/_/g, " ")}
                                                    </TableCell>
                                                    {/* Severity */}
                                                    <TableCell>
                                                        <Chip
                                                            icon={sev.icon}
                                                            label={sev.label}
                                                            color={sev.color}
                                                            size="small"
                                                            variant="filled"
                                                            sx={{ fontWeight: "bold", fontSize: "0.7rem", height: 22 }}
                                                        />
                                                    </TableCell>
                                                    {/* Reason & Message */}
                                                    <TableCell sx={{ maxWidth: 260 }}>
                                                        <Typography variant="body2" fontWeight="bold" noWrap>
                                                            {row.title}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                                            {row.reason || row.message}
                                                        </Typography>
                                                    </TableCell>
                                                    {/* Generated */}
                                                    <TableCell sx={{ whiteSpace: "nowrap", fontSize: "0.75rem", color: "text.secondary" }}>
                                                        {row.createdDate ? new Date(row.createdDate).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                                                    </TableCell>
                                                    {/* Status */}
                                                    <TableCell>
                                                        <Chip
                                                            label={row.status}
                                                            color={row.status === "ACTIVE" ? "error" : row.status === "ACKNOWLEDGED" ? "warning" : row.status === "RESOLVED" ? "success" : "default"}
                                                            size="small"
                                                            variant={row.status === "ACTIVE" ? "filled" : "outlined"}
                                                            sx={{ fontWeight: "bold", fontSize: "0.7rem", height: 22 }}
                                                        />
                                                    </TableCell>
                                                    {/* Actions */}
                                                    <TableCell align="right" sx={{ pr: 3 }}>
                                                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                            <Tooltip title="View Details">
                                                                <IconButton color="info" size="small" onClick={() => handleOpenDetailModal(row)}>
                                                                    <VisibilityIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            {row.status === "ACTIVE" && (
                                                                <Tooltip title="Acknowledge">
                                                                    <IconButton color="warning" size="small" onClick={() => handleAcknowledge(row.id)}>
                                                                        <ThumbUpIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}
                                                            {row.status !== "RESOLVED" && (
                                                                <Tooltip title="Resolve Alert">
                                                                    <IconButton color="success" size="small" onClick={() => handleResolve(row.id)}>
                                                                        <CheckCircleIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}
                                                            <Tooltip title="Delete">
                                                                <IconButton color="error" size="small" onClick={() => handleDelete(row.id)}>
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Stack>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={filteredRows.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(_, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                    />
                </CardContent>
            </Card>

            {/* ── ALERT DETAILS & DIAGNOSTICS DIALOG ── */}
            <Dialog open={detailModalOpen} onClose={() => setDetailModalOpen(false)} maxWidth="md" fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, fontSize: "1.1rem", borderBottom: "1px solid", borderColor: "divider", pb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>Alert Details & Diagnostics</span>
                    {selectedAlert && (
                        <Chip
                            label={selectedAlert.status}
                            color={selectedAlert.status === "ACTIVE" ? "error" : selectedAlert.status === "ACKNOWLEDGED" ? "warning" : "success"}
                            size="small"
                            sx={{ fontWeight: 800 }}
                        />
                    )}
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    {selectedAlert && (() => {
                        const diag = getDiagnosticMetrics(selectedAlert);
                        const sev = getSeverityStyles(selectedAlert.severity);
                        return (
                            <Stack spacing={2.5}>
                                {/* Alert Header Box */}
                                <Box sx={{ p: 2, bgcolor: sev.bg, border: `1px solid ${sev.border}`, borderRadius: 2 }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                        <Typography variant="caption" fontWeight={800} sx={{ color: sev.text, fontFamily: "monospace" }}>
                                            {selectedAlert.alertNumber}
                                        </Typography>
                                        <Chip icon={sev.icon} label={sev.label} color={sev.color} size="small" sx={{ fontWeight: 800 }} />
                                    </Stack>
                                    <Typography variant="h6" fontWeight={800} sx={{ color: sev.text }}>
                                        {selectedAlert.title}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: sev.text, mt: 0.5, opacity: 0.9 }}>
                                        {selectedAlert.reason || selectedAlert.message}
                                    </Typography>
                                </Box>

                                {/* Overview Grid */}
                                <Grid container spacing={2}>
                                    <Grid item xs={6} sm={3}>
                                        <Typography variant="caption" color="text.secondary" display="block">Alert Type</Typography>
                                        <Typography variant="body2" fontWeight={700}>{selectedAlert.alertType?.replace(/_/g, " ")}</Typography>
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                        <Typography variant="caption" color="text.secondary" display="block">Resident Name</Typography>
                                        <Typography variant="body2" fontWeight={700}>{selectedAlert.residentName || "Community Wide"}</Typography>
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                        <Typography variant="caption" color="text.secondary" display="block">Unit Number</Typography>
                                        <Typography variant="body2" fontWeight={700}>{selectedAlert.unitNumber ? `Unit ${selectedAlert.unitNumber}` : "N/A"}</Typography>
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                        <Typography variant="caption" color="text.secondary" display="block">Water Meter</Typography>
                                        <Typography variant="body2" fontWeight={700} sx={{ fontFamily: "monospace" }}>{selectedAlert.meterNumber || "N/A"}</Typography>
                                    </Grid>
                                </Grid>

                                <Divider />

                                {/* ── Diagnostic Metrics Section ── */}
                                <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                                    Diagnostic Metrics Analysis
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={4}>
                                        <Paper variant="outlined" sx={{ p: 2, textAlign: "center", bgcolor: "background.paper", borderRadius: 2 }}>
                                            <Typography variant="caption" color="text.secondary" display="block">Historical Baseline Usage</Typography>
                                            <Typography variant="h6" fontWeight={800} color="primary.main">{diag.usage}</Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Paper variant="outlined" sx={{ p: 2, textAlign: "center", bgcolor: "background.paper", borderRadius: 2 }}>
                                            <Typography variant="caption" color="text.secondary" display="block">Configured Alert Threshold</Typography>
                                            <Typography variant="h6" fontWeight={800} color="warning.main">{diag.threshold}</Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Paper variant="outlined" sx={{ p: 2, textAlign: "center", bgcolor: "background.paper", borderRadius: 2 }}>
                                            <Typography variant="caption" color="text.secondary" display="block">Trigger Value Recorded</Typography>
                                            <Typography variant="h6" fontWeight={800} color="error.main">{diag.trigger}</Typography>
                                        </Paper>
                                    </Grid>
                                </Grid>

                                <Divider />

                                {/* ── Timeline Section ── */}
                                <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                                    Alert Activity Timeline
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={4}>
                                        <Typography variant="caption" color="text.secondary" display="block">1. Generated At</Typography>
                                        <Typography variant="body2" fontWeight={700}>
                                            {selectedAlert.createdDate ? new Date(selectedAlert.createdDate).toLocaleString("en-IN") : "—"}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Typography variant="caption" color="text.secondary" display="block">2. Acknowledged At</Typography>
                                        <Typography variant="body2" fontWeight={700} color={selectedAlert.acknowledgedDate ? "warning.main" : "text.secondary"}>
                                            {selectedAlert.acknowledgedDate ? new Date(selectedAlert.acknowledgedDate).toLocaleString("en-IN") : "Not Acknowledged"}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Typography variant="caption" color="text.secondary" display="block">3. Resolved At</Typography>
                                        <Typography variant="body2" fontWeight={700} color={selectedAlert.resolvedDate ? "success.main" : "text.secondary"}>
                                            {selectedAlert.resolvedDate ? new Date(selectedAlert.resolvedDate).toLocaleString("en-IN") : "Not Resolved"}
                                        </Typography>
                                    </Grid>
                                </Grid>

                                <Divider />

                                {/* ── Resolution Notes Section ── */}
                                <Box>
                                    <Typography variant="subtitle2" fontWeight={800} color="text.primary" sx={{ mb: 1 }}>
                                        Resolution Notes & Action Plan
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        placeholder="Enter technician inspection details, plumbing fix records, or notes for closing this alert..."
                                        value={resolutionNotes}
                                        onChange={(e) => setResolutionNotes(e.target.value)}
                                        disabled={selectedAlert.status === "RESOLVED"}
                                        sx={{ bgcolor: "background.paper" }}
                                    />
                                </Box>
                            </Stack>
                        );
                    })()}
                </DialogContent>
                <DialogActions sx={{ borderTop: "1px solid", borderColor: "divider", px: 3, py: 2, gap: 1 }}>
                    {selectedAlert?.status === "ACTIVE" && (
                        <Button variant="outlined" color="warning" onClick={() => handleAcknowledge(selectedAlert.id)}>
                            Acknowledge Alert
                        </Button>
                    )}
                    {selectedAlert?.status !== "RESOLVED" && (
                        <Button variant="contained" color="success" onClick={() => handleResolve(selectedAlert.id, resolutionNotes)}>
                            Save Notes & Resolve Alert
                        </Button>
                    )}
                    <Button onClick={() => setDetailModalOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </DashboardLayout>
    );
}

export default AlertsManagementPage;
