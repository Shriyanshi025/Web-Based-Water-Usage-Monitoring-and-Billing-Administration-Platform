import React, { useEffect, useMemo, useState } from "react";
import { Alert, Box } from "@mui/material";

import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import DataGrid from "../../components/common/DataGrid";
import TableToolbar from "../../components/common/TableToolbar";
import CommunityOpsService from "../../services/CommunityOpsService";

function TariffPlanPage() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await CommunityOpsService.getTariffPlans();
                setRows((response?.data || []).map((item) => ({ ...item, id: item.id })));
            } catch (err) {
                setError(err?.response?.data?.message || err.message || "Unable to load tariff plans");
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, []);

    const columns = useMemo(() => [
        { field: "name", headerName: "Plan Name", flex: 1, minWidth: 220 },
        { field: "ratePerUnit", headerName: "Rate / Unit", width: 160 },
        { field: "fixedCharge", headerName: "Fixed Charge", width: 160 },
        { field: "active", headerName: "Active", width: 120, renderCell: (params) => (params.row.active ? "Yes" : "No") },
    ], []);

    return (
        <DashboardLayout>
            <PageHeader title="Tariff Plans" subtitle="Review the active tariff structure used for billing." />
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            <Box sx={{ bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                <TableToolbar title="Tariff Plans" />
                <Box sx={{ p: 2 }}>
                    <Box sx={{ height: 420 }}>
                        <DataGrid rows={rows} columns={columns} loading={loading} error={error} />
                    </Box>
                </Box>
            </Box>
        </DashboardLayout>
    );
}

export default TariffPlanPage;
