import React, { useState, useEffect, useMemo, useCallback } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import WidgetContainer from "../../components/widgets/WidgetContainer";
import TableToolbar from "../../components/common/TableToolbar";
import DataGrid from "../../components/common/DataGrid";
import { useSearchParams } from "react-router-dom";
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Grid,
    Divider,
    Chip,
    Stack,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tabs,
    Tab
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { getMyComplaints, raiseComplaint } from "../../services/ComplaintService";
import { useNotification } from "../../context/NotificationContext";

const CATEGORIES = ["BILLING", "LEAKAGE", "WATER_SUPPLY", "WATER_QUALITY", "METER", "OTHER"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

function ComplaintsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get("tab") === "raise" ? 0 : 1;

    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showNotification } = useNotification();

    // Raise Complaint Form State
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ category: "OTHER", priority: "MEDIUM", description: "" });

    // Complaint Details Dialog State
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const fetchComplaints = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getMyComplaints();
            setComplaints(res.data || []);
        } catch (err) {
            setError(err?.response?.data?.message || err.message || "Failed to fetch complaints");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchComplaints();
    }, [fetchComplaints]);

    const handleTabChange = (event, newValue) => {
        setSearchParams({ tab: newValue === 0 ? "raise" : "history" });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await raiseComplaint(form);
            showNotification("Complaint raised successfully.", "success");
            setForm({ category: "OTHER", priority: "MEDIUM", description: "" });
            setSearchParams({ tab: "history" });
            fetchComplaints();
        } catch (err) {
            showNotification(err?.response?.data?.message || err.message || "Failed to raise complaint.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenDetails = (complaint) => {
        setSelectedComplaint(complaint);
        setDetailsOpen(true);
    };

    const handleCloseDetails = () => {
        setDetailsOpen(false);
        setSelectedComplaint(null);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "OPEN": return "info";
            case "IN_PROGRESS": return "warning";
            case "RESOLVED": return "success";
            case "REJECTED": return "error";
            default: return "default";
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "LOW": return "success";
            case "MEDIUM": return "info";
            case "HIGH": return "warning";
            case "CRITICAL": return "error";
            default: return "default";
        }
    };

    const columns = useMemo(() => [
        { field: "ticketNumber", headerName: "Ticket Number", flex: 1.2, minWidth: 150 },
        {
            field: "category",
            headerName: "Category",
            width: 150,
            renderCell: (params) => (
                <Chip label={params.value} size="small" variant="outlined" />
            )
        },
        {
            field: "priority",
            headerName: "Priority",
            width: 120,
            renderCell: (params) => (
                <Chip label={params.value} color={getPriorityColor(params.value)} size="small" />
            )
        },
        {
            field: "status",
            headerName: "Status",
            width: 140,
            renderCell: (params) => (
                <Chip label={params.value} color={getStatusColor(params.value)} size="small" variant="outlined" />
            )
        },
        {
            field: "createdAt",
            headerName: "Created On",
            width: 180,
            renderCell: (params) => {
                return params.value ? new Date(params.value).toLocaleString() : "-";
            }
        },
        {
            field: "actions",
            headerName: "Action",
            width: 150,
            sortable: false,
            renderCell: (params) => (
                <Button variant="contained" size="small" color="info" onClick={() => handleOpenDetails(params.row)}>
                    View Details
                </Button>
            )
        }
    ], []);

    return (
        <DashboardLayout>
            <PageHeader
                title="Complaints & Support"
                subtitle="Raise new complaints, track issues, and view resolution remarks."
            />

            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="complaints tabs">
                    <Tab label="Raise Complaint" />
                    <Tab label="Complaint History" />
                </Tabs>
            </Box>

            {activeTab === 0 ? (
                <WidgetContainer>
                    <Box component="form" onSubmit={handleFormSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 600, p: 2 }}>
                        <Typography variant="h6" fontWeight="bold">Submit a New Support Ticket</Typography>
                        <FormControl fullWidth size="small" required>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={form.category}
                                label="Category"
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                            >
                                {CATEGORIES.map(cat => (
                                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth size="small" required>
                            <InputLabel>Priority</InputLabel>
                            <Select
                                value={form.priority}
                                label="Priority"
                                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                            >
                                {PRIORITIES.map(pri => (
                                    <MenuItem key={pri} value={pri}>{pri}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            label="Description"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            required
                            multiline
                            rows={5}
                            fullWidth
                            variant="outlined"
                            placeholder="Provide a clear description of the issue..."
                        />
                        <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2 }}>
                            <Button type="submit" color="primary" variant="contained" disabled={submitting} startIcon={<AddIcon />}>
                                {submitting ? "Submitting..." : "Submit Complaint"}
                            </Button>
                        </Box>
                    </Box>
                </WidgetContainer>
            ) : (
                <WidgetContainer>
                    <TableToolbar
                        title="Complaint History"
                        searchPlaceholder="Search complaints..."
                        onSearch={() => {}}
                    />
                    <Box sx={{ mt: 3, height: 500 }}>
                        <DataGrid
                            rows={complaints}
                            columns={columns}
                            loading={loading}
                            error={error}
                            onRetry={fetchComplaints}
                        />
                    </Box>
                </WidgetContainer>
            )}

            {/* Complaint Details Dialog */}
            <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight="bold">Complaint Details</Typography>
                        {selectedComplaint && (
                            <Chip label={selectedComplaint.status} color={getStatusColor(selectedComplaint.status)} size="small" />
                        )}
                    </Stack>
                </DialogTitle>
                <DialogContent dividers sx={{ p: 3 }}>
                    {selectedComplaint && (
                        <Stack spacing={2.5}>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Ticket Number</Typography>
                                    <Typography variant="body1" fontWeight="bold">{selectedComplaint.ticketNumber}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Category</Typography>
                                    <Typography variant="body1">{selectedComplaint.category}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Priority</Typography>
                                    <Typography variant="body1">
                                        <Chip label={selectedComplaint.priority} color={getPriorityColor(selectedComplaint.priority)} size="small" />
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Created On</Typography>
                                    <Typography variant="body2">{new Date(selectedComplaint.createdAt).toLocaleString()}</Typography>
                                </Grid>
                            </Grid>
                            <Divider />
                            <Box>
                                <Typography variant="caption" color="text.secondary">Description</Typography>
                                <Typography variant="body1">{selectedComplaint.description}</Typography>
                            </Box>
                            <Divider />
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Assigned To</Typography>
                                    <Typography variant="body2" fontWeight="medium">{selectedComplaint.assignedToName || "Unassigned"}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Resolved On</Typography>
                                    <Typography variant="body2">{selectedComplaint.resolvedAt ? new Date(selectedComplaint.resolvedAt).toLocaleString() : "Pending"}</Typography>
                                </Grid>
                            </Grid>
                            {selectedComplaint.remarks && (
                                <>
                                    <Divider />
                                    <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                                        <Typography variant="caption" color="text.secondary">Admin Remarks</Typography>
                                        <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 0.5 }}>{selectedComplaint.remarks}</Typography>
                                    </Box>
                                </>
                            )}
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDetails} variant="outlined">Close</Button>
                </DialogActions>
            </Dialog>
        </DashboardLayout>
    );
}

export default ComplaintsPage;
