import { useState, useEffect, useMemo, useCallback } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import WidgetContainer from "../../components/widgets/WidgetContainer";
import TableToolbar from "../../components/common/TableToolbar";
import DataGrid from "../../components/common/DataGrid";
import ErrorState from "../../components/common/ErrorState";
import { Box, Button, CircularProgress } from "@mui/material";
import { getMyBills, payBill } from "../../services/ResidentOpsService";

function BillsPage() {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [payingId, setPayingId] = useState(null);

    const fetchBills = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getMyBills();
            setBills(data || []);
        } catch (err) {
            setError(err.message || "Failed to fetch bills");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBills();
    }, [fetchBills]);

    const handlePay = async (id) => {
        try {
            setPayingId(id);
            await payBill(id);
            fetchBills();
        } catch (err) {
            console.error("Payment failed", err);
            alert("Payment failed: " + err.message);
        } finally {
            setPayingId(null);
        }
    };

    const columns = useMemo(() => [
        { field: "billDate", headerName: "Date", width: 120 },
        { field: "unitsConsumed", headerName: "Units", width: 120 },
        { field: "amount", headerName: "Amount ($)", width: 120 },
        { field: "status", headerName: "Status", width: 120 },
        {
            field: "actions",
            headerName: "Action",
            width: 150,
            renderCell: (params) => {
                const isUnpaid = params.row.status === "UNPAID";
                return isUnpaid ? (
                    <Button 
                        variant="contained" 
                        size="small"
                        color="primary"
                        disabled={payingId === params.row.id}
                        onClick={() => handlePay(params.row.id)}
                    >
                        {payingId === params.row.id ? "Processing..." : "Pay Now"}
                    </Button>
                ) : (
                    <Button variant="outlined" size="small" disabled>Paid</Button>
                );
            }
        }
    ], [payingId]);

    const memoizedToolbar = useMemo(() => (
        <TableToolbar 
            searchPlaceholder="Search bills..."
            onSearch={() => {}}
            filterOptions={[{ label: "Status", value: "status" }]}
            onFilter={() => {}}
        />
    ), []);

    if (error) return <DashboardLayout><ErrorState message={error} onRetry={fetchBills} /></DashboardLayout>;

    return (
        <DashboardLayout>
            <PageHeader 
                title="My Bills" 
                subtitle="View and manage your water bills" 
            />
            
            <WidgetContainer>
                {memoizedToolbar}
                <Box sx={{ mt: 3, height: 400 }}>
                    {loading && bills.length === 0 ? (
                        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                            <CircularProgress />
                        </Box>
                    ) : (
                        <DataGrid 
                            rows={bills}
                            columns={columns}
                        />
                    )}
                </Box>
            </WidgetContainer>
        </DashboardLayout>
    );
}

export default BillsPage;
