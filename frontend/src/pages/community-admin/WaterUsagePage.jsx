import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Stack,
    TextField,
    Typography,
    Alert,
    InputLabel,
    FormControl,
    Select,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import AddIcon from "@mui/icons-material/Add";

import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import DataGrid from "../../components/common/DataGrid";
import TableToolbar from "../../components/common/TableToolbar";
import SearchBar from "../../components/common/SearchBar";
import CommunityOpsService from "../../services/CommunityOpsService";
import { useNotification } from "../../context/NotificationContext";

const initialManualEntry = {
    waterMeterId: "",
    currentReading: "",
    readingDate: new Date().toISOString().slice(0, 10),
};

function WaterUsagePage() {
    const [rows, setRows] = useState([]);
    const [meters, setMeters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [manualDialogOpen, setManualDialogOpen] = useState(false);
    const [csvDialogOpen, setCsvDialogOpen] = useState(false);
    const [manualForm, setManualForm] = useState(initialManualEntry);
    const [csvFile, setCsvFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const { showNotification } = useNotification();

    const fetchUsage = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await CommunityOpsService.getAllWaterUsage();
            setRows((data || []).map((item) => ({ ...item, id: item.id })));
        } catch (err) {
            setError(err?.response?.data?.message || err.message || "Unable to load water usage records");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchMeters = useCallback(async () => {
        try {
            const data = await CommunityOpsService.getAllMeters();
            setMeters(data || []);
        } catch (err) {
            // Keep page usable even if meters fail to load.
            setMeters([]);
        }
    }, []);

    useEffect(() => {
        fetchUsage();
        fetchMeters();
    }, [fetchUsage, fetchMeters]);

    const filteredRows = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return rows.filter((row) => {
            if (!term) return true;
            return [
                row.meterNumber,
                row.officialUserId,
                row.readingDate,
                row.currentReading,
                row.unitsConsumed,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(term);
        });
    }, [rows, searchTerm]);

    const handleManualSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);

        try {
            const payload = {
                waterMeterId: Number(manualForm.waterMeterId),
                currentReading: Number(manualForm.currentReading),
                readingDate: manualForm.readingDate,
            };

            if (!payload.waterMeterId || Number.isNaN(payload.currentReading) || !payload.readingDate) {
                throw new Error("Please complete all fields before submitting.");
            }

            await CommunityOpsService.addWaterUsage(payload);
            showNotification("Water usage reading added successfully.", "success");
            setManualForm(initialManualEntry);
            setManualDialogOpen(false);
            await fetchUsage();
        } catch (err) {
            showNotification(err?.response?.data?.message || err.message || "Failed to add reading", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCsvSubmit = async (event) => {
        event.preventDefault();
        if (!csvFile) {
            showNotification("Select a CSV file to upload.", "error");
            return;
        }

        setSubmitting(true);
        try {
            const result = await CommunityOpsService.uploadWaterUsageCsv(csvFile);
            showNotification(`Uploaded ${result.length} reading${result.length === 1 ? "" : "s"}.`, "success");
            setCsvFile(null);
            setCsvDialogOpen(false);
            await fetchUsage();
        } catch (err) {
            showNotification(err?.response?.data?.message || err.message || "CSV upload failed", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const columns = useMemo(() => [
        {
            field: "meterNumber",
            headerName: "Meter",
            flex: 1,
            minWidth: 140,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={600} color="primary.main">
                    {params.row.meterNumber}
                </Typography>
            ),
        },
        {
            field: "officialUserId",
            headerName: "Resident",
            flex: 1,
            minWidth: 150,
        },
        {
            field: "readingDate",
            headerName: "Date",
            width: 140,
        },
        {
            field: "previousReading",
            headerName: "Prev Reading",
            width: 140,
        },
        {
            field: "currentReading",
            headerName: "Current Reading",
            width: 150,
        },
        {
            field: "unitsConsumed",
            headerName: "Units",
            width: 110,
        },
        {
            field: "status",
            headerName: "Status",
            width: 120,
            renderCell: (params) => (
                <Chip label="Recorded" size="small" color="success" variant="outlined" />
            ),
        },
    ], []);

    return (
        <DashboardLayout>
            <PageHeader
                title="Water Usage Management"
                subtitle="Record manual readings or upload bulk usage data for your community."
            />

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Box sx={{ bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "divider", mb: 3 }}>
                <TableToolbar
                    title="Usage Records"
                    action={
                        <Stack direction="row" spacing={1}>
                            <Button
                                variant="outlined"
                                startIcon={<UploadFileIcon />}
                                onClick={() => setCsvDialogOpen(true)}
                            >
                                Upload CSV
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => setManualDialogOpen(true)}
                            >
                                Add Reading
                            </Button>
                        </Stack>
                    }
                />

                <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
                    <SearchBar
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Search by meter, resident, or date"
                        onClear={() => setSearchTerm("")}
                    />
                </Box>

                <Box sx={{ height: 540 }}>
                    <DataGrid
                        rows={filteredRows}
                        columns={columns}
                        loading={loading}
                        error={error}
                        onRetry={fetchUsage}
                    />
                </Box>
            </Box>

            <Dialog open={manualDialogOpen} onClose={() => !submitting && setManualDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Water Usage Reading</DialogTitle>
                <DialogContent dividers>
                    <Box component="form" id="manual-entry-form" onSubmit={handleManualSubmit} sx={{ mt: 1 }}>
                        <Stack spacing={2}>
                            <FormControl fullWidth>
                                <InputLabel id="meter-select-label">Meter</InputLabel>
                                <Select
                                    labelId="meter-select-label"
                                    label="Meter"
                                    value={manualForm.waterMeterId}
                                    onChange={(event) => setManualForm((prev) => ({ ...prev, waterMeterId: event.target.value }))}
                                >
                                    {meters.map((meter) => (
                                        <MenuItem key={meter.id} value={meter.id}>
                                            {meter.meterNumber} — {meter.residentName || "Unassigned"}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField
                                label="Current Reading"
                                type="number"
                                fullWidth
                                value={manualForm.currentReading}
                                onChange={(event) => setManualForm((prev) => ({ ...prev, currentReading: event.target.value }))}
                            />
                            <TextField
                                label="Reading Date"
                                type="date"
                                fullWidth
                                value={manualForm.readingDate}
                                onChange={(event) => setManualForm((prev) => ({ ...prev, readingDate: event.target.value }))}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Stack>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setManualDialogOpen(false)} disabled={submitting}>Cancel</Button>
                    <Button type="submit" form="manual-entry-form" variant="contained" disabled={submitting}>
                        {submitting ? "Saving..." : "Save Reading"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={csvDialogOpen} onClose={() => !submitting && setCsvDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Upload CSV Readings</DialogTitle>
                <DialogContent dividers>
                    <Box component="form" id="csv-upload-form" onSubmit={handleCsvSubmit} sx={{ mt: 1 }}>
                        <Stack spacing={2}>
                            <Typography variant="body2" color="text.secondary">
                                CSV format: meterId,date,reading
                            </Typography>
                            <TextField
                                type="file"
                                inputProps={{ accept: ".csv" }}
                                onChange={(event) => setCsvFile(event.target.files?.[0] || null)}
                                fullWidth
                            />
                        </Stack>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setCsvDialogOpen(false)} disabled={submitting}>Cancel</Button>
                    <Button type="submit" form="csv-upload-form" variant="contained" disabled={submitting}>
                        {submitting ? "Uploading..." : "Upload"}
                    </Button>
                </DialogActions>
            </Dialog>
        </DashboardLayout>
    );
}

export default WaterUsagePage;
