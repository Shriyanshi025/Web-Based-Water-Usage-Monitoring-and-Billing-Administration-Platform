import React, { useState, useEffect, useMemo, useCallback } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import WidgetContainer from "../../components/widgets/WidgetContainer";
import TableToolbar from "../../components/common/TableToolbar";
import DataGrid from "../../components/common/DataGrid";
import SearchBar from "../../components/common/SearchBar";
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
    MenuItem
} from "@mui/material";
import { getCommunityComplaints, searchComplaints, updateComplaint } from "../../services/ComplaintService";
import CommunityOpsService from "../../services/CommunityOpsService";
import { useNotification } from "../../context/NotificationContext";

const CATEGORIES = ["ALL", "BILLING", "LEAKAGE", "WATER_SUPPLY", "WATER_QUALITY", "METER", "OTHER"];
const PRIORITIES = ["ALL", "LOW", "MEDIUM", "HIGH", "CRITICAL"];
const STATUSES = ["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "REJECTED"];

function ComplaintsPage() {
    const [complaints, setComplaints] = useState([]);
    const [residents, setResidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showNotification } = useNotification();

    // Filters
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [priorityFilter, setPriorityFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");

    // Action/Edit Dialog state
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [editOpen, setEditOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ status: "OPEN", remarks: "", assignedToUserId: "" });

    const fetchComplaintsData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Build query params
            const params = {};
            if (categoryFilter !== "ALL") params.category = categoryFilter;
            if (priorityFilter !== "ALL") params.priority = priorityFilter;
            if (statusFilter !== "ALL") params.status = statusFilter;
            if (search.trim()) params.search = search;

            const [complaintsRes, residentsRes] = await Promise.all([
                searchComplaints(params),
                CommunityOpsService.getAllResidents()
            ]);
            setComplaints(complaintsRes.data || []);
            setResidents(residentsRes || []);
        } catch (err) {
            setError(err?.response?.data?.message || err.message || "Failed to fetch complaints");
        } finally {
            setLoading(false);
        }
    }, [categoryFilter, priorityFilter, statusFilter, search]);

    useEffect(() => {
        fetchComplaintsData();
    }, [fetchComplaintsData]);

    const handleOpenEdit = (complaint) => {
        setSelectedComplaint(complaint);
        setForm({
            status: complaint.status,
            remarks: complaint.remarks || "",
            assignedToUserId: complaint.assignedToId || ""
        });
        setEditOpen(true);
    };

    const handleCloseEdit = () => {
        setEditOpen(false);
        setSelectedComplaint(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const updateData = {
                status: form.status,
                remarks: form.remarks || null,
                assignedToUserId: form.assignedToUserId ? Number(form.assignedToUserId) : null
            };
            await updateComplaint(selectedComplaint.id, updateData);
            showNotification("Complaint updated successfully.", "success");
            setEditOpen(false);
            fetchComplaintsData();
        } catch (err) {
            showNotification(err?.response?.data?.message || err.message || "Failed to update complaint.", "error");
        } finally {
            setSubmitting(false);
        }
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
        { field: "ticketNumber", headerName: "Ticket", flex: 1.2, minWidth: 150 },
        { field: "residentName", headerName: "Resident", width: 180 },
        {
            field: "category",
            headerName: "Category",
            width: 140,
            renderCell: (params) => (
                <Chip label={params.value} size="small" variant="outlined" />
            )
        },
        {
            field: "priority",
            headerName: "Priority",
            width: 110,
            renderCell: (params) => (
                <Chip label={params.value} color={getPriorityColor(params.value)} size="small" />
            )
        },
        {
            field: "status",
            headerName: "Status",
            width: 130,
            renderCell: (params) => (
                <Chip label={params.value} color={getStatusColor(params.value)} size="small" variant="outlined" />
            )
        },
        {
            field: "createdAt",
            headerName: "Date Raised",
            width: 170,
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
                <Button variant="contained" size="small" color="primary" onClick={() => handleOpenEdit(params.row)}>
                    Manage
                </Button>
            )
        }
    ], []);

    return (
        <DashboardLayout>
            <PageHeader
                title="Resident Complaints"
                subtitle="Review, search, filter, assign, and update community complaints."
            />

            <WidgetContainer>
                <TableToolbar
                    title="All Complaints"
                    action={
                        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                            <SearchBar
                                value={search}
                                onChange={setSearch}
                                onClear={() => setSearch("")}
                                placeholder="Search complaints..."
                                sx={{ width: 220 }}
                            />
                            <FormControl size="small" sx={{ minWidth: 130 }}>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={statusFilter}
                                    label="Status"
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    {STATUSES.map(s => (
                                        <MenuItem key={s} value={s}>{s}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ minWidth: 130 }}>
                                <InputLabel>Priority</InputLabel>
                                <Select
                                    value={priorityFilter}
                                    label="Priority"
                                    onChange={(e) => setPriorityFilter(e.target.value)}
                                >
                                    {PRIORITIES.map(p => (
                                        <MenuItem key={p} value={p}>{p}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ minWidth: 130 }}>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    value={categoryFilter}
                                    label="Category"
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                >
                                    {CATEGORIES.map(c => (
                                        <MenuItem key={c} value={c}>{c}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Stack>
                    }
                />
                <Box sx={{ mt: 3, height: 500 }}>
                    <DataGrid
                        rows={complaints}
                        columns={columns}
                        loading={loading}
                        error={error}
                        onRetry={fetchComplaintsData}
                    />
                </Box>
            </WidgetContainer>

            {/* Manage Complaint Dialog */}
            <Dialog open={editOpen} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h6" fontWeight="bold">Manage Complaint</Typography>
                </DialogTitle>
                <DialogContent dividers sx={{ p: 3 }}>
                    {selectedComplaint && (
                        <Box component="form" id="manage-complaint-form" onSubmit={handleSave} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Ticket Number</Typography>
                                    <Typography variant="body2" fontWeight="bold">{selectedComplaint.ticketNumber}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Resident Name</Typography>
                                    <Typography variant="body2">{selectedComplaint.residentName}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Category</Typography>
                                    <Typography variant="body2">{selectedComplaint.category}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Priority</Typography>
                                    <Typography variant="body2">
                                        <Chip label={selectedComplaint.priority} color={getPriorityColor(selectedComplaint.priority)} size="small" />
                                    </Typography>
                                </Grid>
                            </Grid>
                            <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                                <Typography variant="caption" color="text.secondary">Resident Description</Typography>
                                <Typography variant="body2" sx={{ mt: 0.5 }}>{selectedComplaint.description}</Typography>
                            </Box>

                            <Divider />

                            <FormControl fullWidth size="small" required>
                                <InputLabel>Update Status</InputLabel>
                                <Select
                                    value={form.status}
                                    label="Update Status"
                                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                                >
                                    <MenuItem value="OPEN">OPEN</MenuItem>
                                    <MenuItem value="IN_PROGRESS">IN_PROGRESS</MenuItem>
                                    <MenuItem value="RESOLVED">RESOLVED</MenuItem>
                                    <MenuItem value="REJECTED">REJECTED</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl fullWidth size="small">
                                <InputLabel>Assign To Staff / Resident</InputLabel>
                                <Select
                                    value={form.assignedToUserId}
                                    label="Assign To Staff / Resident"
                                    onChange={(e) => setForm({ ...form, assignedToUserId: e.target.value })}
                                >
                                    <MenuItem value=""><em>Unassigned</em></MenuItem>
                                    {residents.map(res => (
                                        <MenuItem key={res.user?.id || res.id} value={res.user?.id || res.id}>
                                            {res.fullName} (Unit {res.unitNumber})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <TextField
                                label="Admin Remarks / Resolution Details"
                                value={form.remarks}
                                onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                                multiline
                                rows={3}
                                fullWidth
                                variant="outlined"
                                placeholder="Add comments, status updates, or resolution remarks..."
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCloseEdit} color="secondary" variant="outlined">Cancel</Button>
                    <Button type="submit" form="manage-complaint-form" color="primary" variant="contained" disabled={submitting}>
                        {submitting ? "Updating..." : "Update Complaint"}
                    </Button>
                </DialogActions>
            </Dialog>
        </DashboardLayout>
    );
}

export default ComplaintsPage;
