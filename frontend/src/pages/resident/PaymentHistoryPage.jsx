import React, { useState, useEffect, useMemo, useCallback } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import WidgetContainer from "../../components/widgets/WidgetContainer";
import TableToolbar from "../../components/common/TableToolbar";
import DataGrid from "../../components/common/DataGrid";
import SearchBar from "../../components/common/SearchBar";
import { Box, Button, Chip, Stack } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { getMyPayments } from "../../services/PaymentService";
import api from "../../services/api";
import { formatCurrency } from "../../helpers/numberHelper";
import { useNotification } from "../../context/NotificationContext";

function PaymentHistoryPage() {
    const { showNotification } = useNotification();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");

    const fetchPayments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getMyPayments();
            setPayments(res.data || []);
        } catch (err) {
            setError(err?.response?.data?.message || err.message || "Failed to load payment history");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const handleDownloadPdf = async (billId, invoiceNumber) => {
        try {
            const response = await api.get(`/bills/${billId}/pdf`, { responseType: 'blob' });

            if (response.data.type === 'application/json') {
                const text = await response.data.text();
                const errorObj = JSON.parse(text);
                showNotification(errorObj.message || "Failed to download PDF.", "error");
                return;
            }

            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;

            const disposition = response.headers['content-disposition'];
            let filename = invoiceNumber ? `Invoice-${invoiceNumber}.pdf` : `Invoice-INV-${billId}.pdf`;
            if (disposition && disposition.indexOf('attachment') !== -1) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(disposition);
                if (matches != null && matches[1]) { 
                    filename = matches[1].replace(/['"]/g, '');
                }
            }
            link.setAttribute('download', filename);

            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("PDF download failed", err);
            showNotification("Failed to download invoice PDF. Please try again.", "error");
        }
    };

    // Front-end filter logic
    const filteredPayments = useMemo(() => {
        return payments.filter(p => {
            const term = search.toLowerCase();
            return (
                p.paymentNumber?.toLowerCase().includes(term) ||
                p.razorpayPaymentId?.toLowerCase().includes(term) ||
                p.bill?.billNumber?.toLowerCase().includes(term)
            );
        });
    }, [payments, search]);

    const columns = useMemo(() => [
        { field: "id", headerName: "Payment ID", width: 100 },
        { field: "paymentNumber", headerName: "Payment #", width: 140 },
        {
            field: "transactionDate",
            headerName: "Payment Date",
            width: 170,
            renderCell: (params) => params.value ? new Date(params.value).toLocaleString() : "-"
        },
        {
            field: "billNumber",
            headerName: "Bill Number",
            width: 140,
            renderCell: (params) => params.row?.billNumber || "N/A"
        },
        {
            field: "invoiceNumber",
            headerName: "Invoice Number",
            width: 170,
            renderCell: (params) => params.row?.invoiceNumber || "N/A"
        },
        {
            field: "billingMonth",
            headerName: "Billing Month",
            width: 130,
            renderCell: (params) => params.row?.billingMonth || "N/A"
        },
        {
            field: "amount",
            headerName: "Amount",
            width: 130,
            renderCell: (params) => formatCurrency(params.value)
        },
        {
            field: "paymentMethod",
            headerName: "Payment Method",
            width: 130,
            renderCell: (params) => params.value || "UPI"
        },
        {
            field: "razorpayPaymentId",
            headerName: "Demo Transaction ID",
            width: 180,
            renderCell: (params) => params.value || "-"
        },
        {
            field: "paymentStatus",
            headerName: "Status",
            width: 120,
            renderCell: (params) => {
                const status = params.value || params.row?.paymentStatus || "SUCCESS";
                return (
                    <Chip 
                        label={status} 
                        color={status === "SUCCESS" ? "success" : status === "FAILED" ? "error" : "warning"} 
                        size="small" 
                        variant="outlined" 
                    />
                );
            }
        },
        {
            field: "actions",
            headerName: "Action",
            width: 160,
            sortable: false,
            renderCell: (params) => (
                <Button
                    variant="outlined"
                    size="small"
                    color="primary"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownloadPdf(params.row.billId, params.row.billNumber)}
                    disabled={!params.row.billId}
                >
                    Invoice
                </Button>
            )
        }
    ], [showNotification]);

    return (
        <DashboardLayout>
            <PageHeader
                title="Payment History Ledger"
                subtitle="View past statements, transactions history, and download payment receipts."
            />

            <WidgetContainer>
                <TableToolbar
                    title="Transaction History"
                    action={
                        <SearchBar
                            value={search}
                            onChange={setSearch}
                            onClear={() => setSearch("")}
                            placeholder="Search transactions..."
                            sx={{ width: 240 }}
                        />
                    }
                />
                <Box sx={{ mt: 3, height: 500 }}>
                    <DataGrid
                        rows={filteredPayments}
                        columns={columns}
                        loading={loading}
                        error={error}
                        onRetry={fetchPayments}
                    />
                </Box>
            </WidgetContainer>
        </DashboardLayout>
    );
}

export default PaymentHistoryPage;
