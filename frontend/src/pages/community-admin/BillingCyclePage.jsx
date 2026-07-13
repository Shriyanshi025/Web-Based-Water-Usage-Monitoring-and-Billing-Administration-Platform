import React, { useEffect, useMemo, useState } from "react";
import { Alert, Box, Typography } from "@mui/material";

import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import DataGrid from "../../components/common/DataGrid";
import TableToolbar from "../../components/common/TableToolbar";
import CommunityOpsService from "../../services/CommunityOpsService";

function BillingCyclePage() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCycles = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await CommunityOpsService.getActiveBillingCycle();
                const cycle = response?.data;
                setRows(cycle ? [{ ...cycle, id: cycle.id }] : []);
            } catch (err) {
                setError(err?.response?.data?.message || err.message || "Unable to load billing cycle");
            } finally {
                setLoading(false);
            }
        };

        fetchCycles();
    }, []);

    const columns = useMemo(() => [
        { field: "name", headerName: "Cycle Name", flex: 1, minWidth: 220 },
        { field: "periodStart", headerName: "Start", width: 140 },
        { field: "periodEnd", headerName: "End", width: 140 },
        { field: "active", headerName: "Active", width: 120, renderCell: (params) => (params.row.active ? "Yes" : "No") },
        { field: "generatedAt", headerName: "Generated", width: 160 },
    ], []);

    return (
        <DashboardLayout>
            <PageHeader title="Billing Cycle" subtitle="Inspect the current billing cycle and its active window." />
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            <Box sx={{ bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                <TableToolbar title="Active Billing Cycle" />
                <Box sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        This page reflects the active cycle served by the billing foundation API.
                    </Typography>
                    <Box sx={{ height: 320 }}>
                        <DataGrid rows={rows} columns={columns} loading={loading} error={error} />
                    </Box>
                </Box>
            </Box>
        </DashboardLayout>
    );
}

export default BillingCyclePage;
