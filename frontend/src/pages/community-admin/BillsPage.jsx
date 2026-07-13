import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
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
import AddIcon from "@mui/icons-material/Add";

import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import DataGrid from "../../components/common/DataGrid";
import TableToolbar from "../../components/common/TableToolbar";
import CommunityOpsService from "../../services/CommunityOpsService";
import { useNotification } from "../../context/NotificationContext";

function BillsPage() {
    const [rows, setRows] = useState([]);
    const [cycles, setCycles] = useState([]);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ billingCycleId: "", tariffPlanId: "" });
    const { showNotification } = useNotification();

    const fetchBills = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await CommunityOpsService.getBills();
            setRows((response?.data || []).map((item) => ({ ...item, id: item.id })));
        } catch (err) {
            setError(err?.response?.data?.message || err.message || "Unable to load bills");
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
        } catch (err) {
            setCycles([]);
            setPlans([]);
        }
    }, []);

    useEffect(() => {
        fetchBills();
        fetchBillingMeta();
    }, [fetchBills, fetchBillingMeta]);

    const handleGenerate = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        try {
            await CommunityOpsService.generateBills({
                billingCycleId: Number(form.billingCycleId),
                tariffPlanId: Number(form.tariffPlanId),
            });
            showNotification("Bills generated successfully.", "success");
            setDialogOpen(false);
            setForm({ billingCycleId: "", tariffPlanId: "" });
            await fetchBills();
        } catch (err) {
            showNotification(err?.response?.data?.message || err.message || "Unable to generate bills", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const columns = useMemo(() => [
        { field: "residentName", headerName: "Resident", flex: 1, minWidth: 180 },
        { field: "unitNumber", headerName: "Unit", width: 120 },
        { field: "billingCycleName", headerName: "Billing Cycle", width: 180 },
        { field: "tariffPlanName", headerName: "Tariff Plan", width: 180 },
        { field: "unitsConsumed", headerName: "Units", width: 110 },
        { field: "amount", headerName: "Amount", width: 140 },
        { field: "status", headerName: "Status", width: 120, renderCell: (params) => (params.row.status) },
    ], []);

    return (
        <DashboardLayout>
            <PageHeader
                title="Billing Foundation"
                subtitle="Review resident bills, inspect the active cycle, and generate the first billing batch."
                action={
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setDialogOpen(true)}
                    >
                        Generate Bills
                    </Button>
                }
            />

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Box sx={{ bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                <TableToolbar title="Bills" />
                <Box sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Active cycle: {cycles[0]?.name || "No active cycle configured"}
                    </Typography>
                    <Box sx={{ height: 520 }}>
                        <DataGrid rows={rows} columns={columns} loading={loading} error={error} onRetry={fetchBills} />
                    </Box>
                </Box>
            </Box>

            <Dialog open={dialogOpen} onClose={() => !submitting && setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Generate Bills</DialogTitle>
                <DialogContent dividers>
                    <Box component="form" id="generate-bills-form" onSubmit={handleGenerate} sx={{ mt: 1 }}>
                        <Stack spacing={2}>
                            <FormControl fullWidth>
                                <InputLabel>Billing Cycle</InputLabel>
                                <Select
                                    value={form.billingCycleId}
                                    label="Billing Cycle"
                                    onChange={(event) => setForm((prev) => ({ ...prev, billingCycleId: event.target.value }))}
                                >
                                    {cycles.map((cycle) => (
                                        <MenuItem key={cycle.id} value={cycle.id}>{cycle.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth>
                                <InputLabel>Tariff Plan</InputLabel>
                                <Select
                                    value={form.tariffPlanId}
                                    label="Tariff Plan"
                                    onChange={(event) => setForm((prev) => ({ ...prev, tariffPlanId: event.target.value }))}
                                >
                                    {plans.map((plan) => (
                                        <MenuItem key={plan.id} value={plan.id}>{plan.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Stack>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDialogOpen(false)} disabled={submitting}>Cancel</Button>
                    <Button type="submit" form="generate-bills-form" variant="contained" disabled={submitting}>
                        {submitting ? "Generating..." : "Generate"}
                    </Button>
                </DialogActions>
            </Dialog>
        </DashboardLayout>
    );
}

export default BillsPage;
