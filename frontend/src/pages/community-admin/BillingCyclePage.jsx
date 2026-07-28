import React, { useEffect, useMemo, useState, useCallback } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { format, parseISO, isValid } from "date-fns";
import {
    Alert,
    Box,
    Button,
    Typography,
    Stack,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid
} from "@mui/material";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import LockIcon from "@mui/icons-material/Lock";
import ArchiveIcon from "@mui/icons-material/Archive";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";

import DashboardLayout from "../../components/layout/DashboardLayout";
import PageSummaryHeader from "../../components/common/PageSummaryHeader";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DataGrid from "../../components/common/DataGrid";
import TableToolbar from "../../components/common/TableToolbar";
import StatusBadge from "../../components/common/StatusBadge";
import ConfirmationDialog from "../../components/common/ConfirmationDialog";
import CommunityOpsService from "../../services/CommunityOpsService";
import { useNotification } from "../../context/NotificationContext";

function BillingCyclePage() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showNotification } = useNotification();

    // Dialog state
    const [confirmDialog, setConfirmDialog] = useState({
        open: false,
        type: null, // "CLOSE" | "ARCHIVE" | "OPEN"
        cycle: null
    });

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedCycle, setSelectedCycle] = useState(null);

    // Create cycle form state
    const [newCycle, setNewCycle] = useState({
        name: "",
        periodStart: "",
        periodEnd: ""
    });
    const [createError, setCreateError] = useState(null);

    const fetchCycles = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await CommunityOpsService.getAllBillingCycles();
            const cycles = response?.data || [];
            setRows(cycles.map(c => ({ ...c, id: c.id })));
        } catch (err) {
            setError(err?.response?.data?.message || err.message || "Unable to load billing cycles");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCycles();
    }, [fetchCycles]);

    const handleOpenConfirm = (cycle, type) => {
        setConfirmDialog({
            open: true,
            type,
            cycle
        });
    };

    const handleCloseConfirm = () => {
        setConfirmDialog({
            open: false,
            type: null,
            cycle: null
        });
    };

    const handleActionExecute = async () => {
        const { type, cycle } = confirmDialog;
        if (!cycle) return;

        handleCloseConfirm();
        setLoading(true);

        try {
            if (type === "OPEN") {
                await CommunityOpsService.openBillingCycle(cycle.id);
                showNotification("Billing Cycle Opened Successfully", "success");
            } else if (type === "CLOSE") {
                await CommunityOpsService.closeBillingCycle(cycle.id);
                showNotification("Billing Cycle Closed Successfully", "success");
            } else if (type === "ARCHIVE") {
                await CommunityOpsService.archiveBillingCycle(cycle.id);
                showNotification("Billing Cycle Archived Successfully", "success");
            }
            await fetchCycles();
        } catch (err) {
            showNotification(err?.response?.data?.message || err.message || "Action failed", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCycle = async (e) => {
        e.preventDefault();
        setCreateError(null);

        try {
            await CommunityOpsService.createBillingCycle(newCycle);
            showNotification("Billing Cycle Created Successfully", "success");
            setCreateModalOpen(false);
            setNewCycle({ name: "", periodStart: "", periodEnd: "" });
            await fetchCycles();
        } catch (err) {
            setCreateError(err?.response?.data?.message || err.message || "Failed to create billing cycle");
        }
    };

    const columns = useMemo(() => [
        { 
            field: "name", 
            headerName: "Cycle Name", 
            flex: 1, 
            minWidth: 150,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={600}>
                    {params.value}
                </Typography>
            )
        },
        { 
            field: "status", 
            headerName: "Status", 
            width: 140,
            renderCell: (params) => (
                <StatusBadge status={params.row.status || (params.row.active ? "ACTIVE" : "CLOSED")} />
            )
        },
        { field: "periodStart", headerName: "Start Date", width: 130 },
        { field: "periodEnd", headerName: "End Date", width: 130 },
        { 
            field: "active", 
            headerName: "Active", 
            width: 100, 
            renderCell: (params) => (params.row.active ? "Yes" : "No") 
        },
        { 
            field: "generatedAt", 
            headerName: "Generated At", 
            width: 150,
            renderCell: (params) => params.value || "—" 
        },
        {
            field: "actions",
            headerName: "Actions",
            width: 180,
            sortable: false,
            filterable: false,
            renderCell: (params) => {
                const cycle = params.row;
                const status = cycle.status || (cycle.active ? "ACTIVE" : "CLOSED");

                return (
                    <Stack direction="row" spacing={1} alignItems="center">
                        {status === "CLOSED" && (
                            <Tooltip title="Open Billing Cycle">
                                <Button
                                    size="small"
                                    variant="outlined"
                                    color="success"
                                    startIcon={<LockOpenIcon fontSize="small" />}
                                    onClick={() => handleOpenConfirm(cycle, "OPEN")}
                                    sx={{ textTransform: "none", fontSize: "0.75rem", py: 0.25, px: 1 }}
                                >
                                    Open
                                </Button>
                            </Tooltip>
                        )}
                        {status === "ACTIVE" && (
                            <Tooltip title="Close (Finalize) Billing Cycle">
                                <Button
                                    size="small"
                                    variant="outlined"
                                    color="warning"
                                    startIcon={<LockIcon fontSize="small" />}
                                    onClick={() => handleOpenConfirm(cycle, "CLOSE")}
                                    sx={{ textTransform: "none", fontSize: "0.75rem", py: 0.25, px: 1 }}
                                >
                                    Finalize
                                </Button>
                            </Tooltip>
                        )}
                        {status === "CLOSED" && (
                            <Tooltip title="Archive Billing Cycle">
                                <Button
                                    size="small"
                                    variant="outlined"
                                    color="secondary"
                                    startIcon={<ArchiveIcon fontSize="small" />}
                                    onClick={() => handleOpenConfirm(cycle, "ARCHIVE")}
                                    sx={{ textTransform: "none", fontSize: "0.75rem", py: 0.25, px: 1 }}
                                >
                                    Archive
                                </Button>
                            </Tooltip>
                        )}
                        {status === "ARCHIVED" && (
                            <Tooltip title="View Billing Cycle Details">
                                <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => {
                                        setSelectedCycle(cycle);
                                        setViewModalOpen(true);
                                    }}
                                >
                                    <VisibilityIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Stack>
                );
            }
        }
    ], []);

    // Get dialog title & message based on action type
    const dialogProps = useMemo(() => {
        if (confirmDialog.type === "CLOSE") {
            return {
                title: "Close Billing Cycle",
                message: "Closing this billing cycle will finalize it and prevent further modifications. Do you want to continue?",
                confirmText: "Finalize & Close",
                color: "warning"
            };
        }
        if (confirmDialog.type === "ARCHIVE") {
            return {
                title: "Archive Billing Cycle",
                message: "Are you sure you want to archive this billing cycle? Archived cycles remain view-only.",
                confirmText: "Archive",
                color: "secondary"
            };
        }
        if (confirmDialog.type === "OPEN") {
            return {
                title: "Open Billing Cycle",
                message: "Opening this billing cycle will set it as active. Any currently active cycle will need to be closed.",
                confirmText: "Open Cycle",
                color: "success"
            };
        }
        return {};
    }, [confirmDialog.type]);

    const headerMetadata = useMemo(() => [
        { label: "Total Cycles", value: rows.length },
        { label: "Active", value: rows.filter(r => r.active || r.status === "ACTIVE").length, color: "success" },
        { label: "Closed", value: rows.filter(r => r.status === "CLOSED").length, color: "warning" },
    ], [rows]);

    return (
        <DashboardLayout>
            <PageSummaryHeader 
                title="Billing Cycle Management" 
                subtitle="Manage, finalize, open, and archive billing cycles for your community." 
                icon={CalendarMonthIcon}
                metadata={headerMetadata}
                action={
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => setCreateModalOpen(true)}
                        sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, height: 36 }}
                    >
                        New Billing Cycle
                    </Button>
                }
            />
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Box sx={{ bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                <TableToolbar 
                    title="All Billing Cycles"
                    onAdd={() => setCreateModalOpen(true)}
                    addLabel="New Billing Cycle"
                />
                <Box sx={{ p: 2 }}>
                    <Box sx={{ height: 420 }}>
                        <DataGrid rows={rows} columns={columns} loading={loading} error={error} />
                    </Box>
                </Box>
            </Box>

            {/* Confirmation Dialog for Open / Close / Archive */}
            <ConfirmationDialog
                open={confirmDialog.open}
                onClose={handleCloseConfirm}
                onConfirm={handleActionExecute}
                title={dialogProps.title}
                message={dialogProps.message}
                confirmText={dialogProps.confirmText}
                color={dialogProps.color}
            />

            {/* View Cycle Details Modal */}
            <Dialog open={viewModalOpen} onClose={() => setViewModalOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>Billing Cycle Details</DialogTitle>
                <DialogContent dividers>
                    {selectedCycle && (
                        <Stack spacing={2}>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Cycle Name</Typography>
                                <Typography variant="body1" fontWeight={600}>{selectedCycle.name}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Status</Typography>
                                <Box sx={{ mt: 0.5 }}>
                                    <StatusBadge status={selectedCycle.status || "CLOSED"} />
                                </Box>
                            </Box>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Start Date</Typography>
                                    <Typography variant="body2">{selectedCycle.periodStart}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">End Date</Typography>
                                    <Typography variant="body2">{selectedCycle.periodEnd}</Typography>
                                </Grid>
                            </Grid>
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setViewModalOpen(false)} variant="outlined">Close</Button>
                </DialogActions>
            </Dialog>

            {/* Create New Cycle Modal */}
            <Dialog 
                open={createModalOpen} 
                onClose={() => setCreateModalOpen(false)} 
                maxWidth="sm" 
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        p: 1
                    }
                }}
            >
                <form onSubmit={handleCreateCycle}>
                    <DialogTitle sx={{ fontWeight: 700, pb: 1, pt: 2, px: 3 }}>Create New Billing Cycle</DialogTitle>
                    <DialogContent dividers sx={{ p: 3 }}>
                        {createError && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {createError}
                            </Alert>
                        )}
                        <Stack spacing={3} sx={{ py: 1 }}>
                            <TextField
                                label="Billing Cycle Name"
                                placeholder="e.g. 2026-07"
                                fullWidth
                                required
                                value={newCycle.name}
                                onChange={(e) => setNewCycle({ ...newCycle, name: e.target.value })}
                            />
                            <DatePicker
                                label="Start Date"
                                format="dd/MM/yyyy"
                                value={newCycle.periodStart ? parseISO(newCycle.periodStart) : null}
                                onChange={(newValue) => {
                                    if (newValue && isValid(newValue)) {
                                        setNewCycle(prev => ({ ...prev, periodStart: format(newValue, "yyyy-MM-dd") }));
                                    } else {
                                        setNewCycle(prev => ({ ...prev, periodStart: "" }));
                                    }
                                }}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        required: true
                                    }
                                }}
                            />
                            <DatePicker
                                label="End Date"
                                format="dd/MM/yyyy"
                                value={newCycle.periodEnd ? parseISO(newCycle.periodEnd) : null}
                                onChange={(newValue) => {
                                    if (newValue && isValid(newValue)) {
                                        setNewCycle(prev => ({ ...prev, periodEnd: format(newValue, "yyyy-MM-dd") }));
                                    } else {
                                        setNewCycle(prev => ({ ...prev, periodEnd: "" }));
                                    }
                                }}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        required: true
                                    }
                                }}
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 2.5, px: 3 }}>
                        <Button 
                            onClick={() => setCreateModalOpen(false)} 
                            color="inherit"
                            sx={{ textTransform: "none", fontWeight: 600 }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary"
                            sx={{ textTransform: "none", fontWeight: 600, px: 3, borderRadius: 2 }}
                        >
                            Create Cycle
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </DashboardLayout>
    );
}

export default BillingCyclePage;
