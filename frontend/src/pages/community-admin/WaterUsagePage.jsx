import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
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
    TextField,
    Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import UploadFileIcon from "@mui/icons-material/UploadFile";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SpeedIcon from "@mui/icons-material/Speed";

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

const initialManualEntry = {
    waterMeterId: "",
    currentReading: "",
    readingDate: new Date().toISOString().slice(0, 10),
};

function WaterUsagePage() {
    const theme = useTheme();
    const [rows, setRows]               = useState([]);
    const [meters, setMeters]           = useState([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState(null);
    const [searchTerm, setSearchTerm]   = useState("");
    const [manualDialogOpen, setManualDialogOpen] = useState(false);
    const [csvDialogOpen, setCsvDialogOpen]       = useState(false);
    const [manualForm, setManualForm]   = useState(initialManualEntry);
    const [csvFile, setCsvFile]         = useState(null);
    const [submitting, setSubmitting]   = useState(false);
    const { showNotification } = useNotification();

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

    const fetchMeters = useCallback(async () => {
        try {
            const data = await CommunityOpsService.getAllMeters();
            setMeters(data || []);
        } catch {
            setMeters([]);
        }
    }, []);

    useEffect(() => { fetchUsage(); fetchMeters(); }, [fetchUsage, fetchMeters]);

    // ── Summary stats ─────────────────────────────────────────────────────────
    const totalUnits = useMemo(() => rows.reduce((sum, r) => sum + (Number(r.unitsConsumed) || 0), 0), [rows]);
    const uniqueMeters = useMemo(() => new Set(rows.map(r => r.meterNumber).filter(Boolean)).size, [rows]);

    // ── Filtering ─────────────────────────────────────────────────────────────
    const filteredRows = useMemo(() => {
        const term = searchTerm.toLowerCase();
        if (!term) return rows;
        return rows.filter(row =>
            [row.meterNumber, row.officialUserId, row.readingDate]
                .filter(Boolean).join(" ").toLowerCase().includes(term)
        );
    }, [rows, searchTerm]);

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

    // ── Columns ───────────────────────────────────────────────────────────────
    const columns = useMemo(() => [
        {
            field: "meterNumber", headerName: "Meter", flex: 1, minWidth: 140,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={700} color="primary.main" sx={{ fontFamily: "monospace", fontSize: "0.8125rem" }}>
                    {params.row.meterNumber || "—"}
                </Typography>
            )
        },
        {
            field: "officialUserId", headerName: "Resident", flex: 1, minWidth: 140,
            renderCell: (params) => (
                <Typography variant="body2" color={params.row.officialUserId ? "text.primary" : "text.disabled"}>
                    {params.row.officialUserId || "—"}
                </Typography>
            )
        },
        {
            field: "readingDate", headerName: "Date", width: 120,
            renderCell: (params) => (
                <Typography variant="body2" color="text.secondary">
                    {params.row.readingDate || "—"}
                </Typography>
            )
        },
        {
            field: "previousReading", headerName: "Prev. (L)", width: 110,
            renderCell: (params) => (
                <Typography variant="body2" color="text.secondary">
                    {params.row.previousReading != null ? params.row.previousReading : "—"}
                </Typography>
            )
        },
        {
            field: "currentReading", headerName: "Current (L)", width: 120,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={600}>
                    {params.row.currentReading != null ? params.row.currentReading : "—"}
                </Typography>
            )
        },
        {
            field: "unitsConsumed", headerName: "Units", width: 100,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={600} color="info.main">
                    {params.row.unitsConsumed != null ? params.row.unitsConsumed : "—"}
                </Typography>
            )
        },
        {
            field: "status", headerName: "Status", width: 110,
            renderCell: () => <StatusBadge status="RECORDED" />
        },
    ], []);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <DashboardLayout>
            <PageHeader
                title="Water Usage"
                subtitle="Record meter readings and manage bulk usage data for the community."
                action={
                    <Stack direction="row" spacing={1.5}>
                        <ActionButton variant="outlined" startIcon={<RefreshIcon />} onClick={fetchUsage} disabled={loading} sx={{ fontSize: "0.8125rem" }}>
                            Refresh
                        </ActionButton>
                    </Stack>
                }
            />

            {/* ── Summary strip ─────────────────────────────────────────────── */}
            {!loading && !error && (
                <Stack direction="row" spacing={2} sx={{ mb: 3 }} flexWrap="wrap">
                    <Box sx={{ px: 2, py: 1, bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 1 }}>
                        <CalendarMonthIcon sx={{ fontSize: "1rem", color: "info.main" }} />
                        <Typography variant="body2" fontWeight={500} color="text.secondary">Records:</Typography>
                        <Typography variant="body2" fontWeight={700}>{rows.length}</Typography>
                    </Box>
                    <Box sx={{ px: 2, py: 1, bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 1 }}>
                        <SpeedIcon sx={{ fontSize: "1rem", color: "primary.main" }} />
                        <Typography variant="body2" fontWeight={500} color="text.secondary">Meters:</Typography>
                        <Typography variant="body2" fontWeight={700}>{uniqueMeters}</Typography>
                    </Box>
                    <Box sx={{ px: 2, py: 1, bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 1 }}>
                        <WaterDropIcon sx={{ fontSize: "1rem", color: "info.main" }} />
                        <Typography variant="body2" fontWeight={500} color="text.secondary">Total Units:</Typography>
                        <Typography variant="body2" fontWeight={700} color="info.main">{totalUnits.toLocaleString()}</Typography>
                    </Box>
                </Stack>
            )}

            {/* ── Full-page error ───────────────────────────────────────────── */}
            {error && !rows.length && (
                <Box sx={{ mb: 3 }}>
                    <ErrorState title="Failed to load usage records" message={error} onRetry={fetchUsage} />
                </Box>
            )}

            {/* ── Main table panel ──────────────────────────────────────────── */}
            <Box sx={{ bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
                <TableToolbar
                    title="Usage Records"
                    action={
                        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                            <SearchBar
                                value={searchTerm}
                                onChange={setSearchTerm}
                                onClear={() => setSearchTerm("")}
                                placeholder="Search by meter, resident, or date…"
                                sx={{ width: { xs: "100%", sm: 260 } }}
                            />
                            {searchTerm && (
                                <Chip
                                    label={`${filteredRows.length} of ${rows.length}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: "0.75rem", height: 26 }}
                                    onDelete={() => setSearchTerm("")}
                                />
                            )}
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
                                sx={{ textTransform: "none", fontSize: "0.8125rem" }}
                            >
                                Add Reading
                            </ActionButton>
                        </Stack>
                    }
                />
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
            </Box>

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
                                InputLabelProps={{ shrink: true }}
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
