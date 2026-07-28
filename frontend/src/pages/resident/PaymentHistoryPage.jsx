import React, { useState, useEffect, useMemo, useCallback } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageSummaryHeader from "../../components/common/PageSummaryHeader";
import WidgetContainer from "../../components/widgets/WidgetContainer";
import DataGrid from "../../components/common/DataGrid";
import SearchBar from "../../components/common/SearchBar";
import {
    Box,
    Button,
    Chip,
    Stack,
    Typography,
    Tooltip,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { getMyPayments } from "../../services/PaymentService";
import api from "../../services/api";
import { formatCurrency } from "../../helpers/numberHelper";
import { useNotification } from "../../context/NotificationContext";

// ── Relative timestamp helper ─────────────────────────────────────────────────
function formatDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

const PAYMENT_STATUS_COLOR = {
    SUCCESS: "success",
    FAILED:  "error",
    PENDING: "warning",
    REFUNDED:"info",
};

function PaymentHistoryPage() {
    const { showNotification } = useNotification();
    const [payments, setPayments]       = useState([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState(null);
    const [search, setSearch]           = useState("");
    const [downloadingId, setDownloadingId] = useState(null);

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

    useEffect(() => { fetchPayments(); }, [fetchPayments]);

    const handleDownloadPdf = async (billId, invoiceNumber) => {
        if (downloadingId) return;
        setDownloadingId(billId);
        try {
            const response = await api.get(`/bills/${billId}/pdf`, { responseType: "blob" });

            if (response.data.type === "application/json") {
                const text = await response.data.text();
                const errorObj = JSON.parse(text);
                showNotification(errorObj.message || "Unable to download invoice PDF.", "error");
                return;
            }

            const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
            const link = document.createElement("a");
            link.href = url;

            const disposition = response.headers["content-disposition"];
            let filename = invoiceNumber
                ? `HydroSync-Invoice-${invoiceNumber}.pdf`
                : `HydroSync-Invoice-${billId}.pdf`;
            if (disposition && disposition.indexOf("attachment") !== -1) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(disposition);
                if (matches != null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, "");
                }
            }
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            showNotification(`Invoice downloaded: ${filename}`, "success");
        } catch (err) {
            console.error("PDF download failed", err);
            showNotification("Unable to download invoice. Please try again.", "error");
        } finally {
            setDownloadingId(null);
        }
    };

    const filteredPayments = useMemo(() => {
        const term = search.toLowerCase();
        return payments.filter((p) =>
            p.paymentNumber?.toLowerCase().includes(term) ||
            p.razorpayPaymentId?.toLowerCase().includes(term) ||
            p.bill?.billNumber?.toLowerCase().includes(term) ||
            p.invoiceNumber?.toLowerCase().includes(term)
        );
    }, [payments, search]);

    const columns = useMemo(() => [
        {
            field: "paymentNumber",
            headerName: "Payment #",
            width: 150,
            renderCell: (params) => (
                <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.8rem", color: "text.secondary" }}>
                    {params.value || "—"}
                </Typography>
            ),
        },
        {
            field: "transactionDate",
            headerName: "Date",
            width: 160,
            renderCell: (params) => (
                <Typography variant="body2" sx={{ fontSize: "0.8125rem" }}>
                    {formatDate(params.value)}
                </Typography>
            ),
        },
        {
            field: "billNumber",
            headerName: "Bill #",
            width: 130,
            renderCell: (params) => (
                <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                    {params.row?.billNumber || "—"}
                </Typography>
            ),
        },
        {
            field: "invoiceNumber",
            headerName: "Invoice #",
            width: 150,
            renderCell: (params) => (
                <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                    {params.row?.invoiceNumber || "—"}
                </Typography>
            ),
        },
        {
            field: "billingMonth",
            headerName: "Period",
            width: 120,
            renderCell: (params) => params.row?.billingMonth || "—",
        },
        {
            field: "amount",
            headerName: "Amount",
            width: 120,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={600} color="primary.main">
                    {formatCurrency(params.value)}
                </Typography>
            ),
        },
        {
            field: "paymentMethod",
            headerName: "Method",
            width: 110,
            renderCell: (params) => (
                <Chip
                    label={params.value || "UPI"}
                    size="small"
                    variant="outlined"
                    color="default"
                    sx={{ fontSize: "0.7rem", textTransform: "uppercase" }}
                />
            ),
        },
        {
            field: "razorpayPaymentId",
            headerName: "Transaction ID",
            width: 170,
            renderCell: (params) => (
                <Tooltip title={params.value || ""} arrow enterDelay={400}>
                    <Typography
                        variant="body2"
                        sx={{
                            fontFamily: "monospace",
                            fontSize: "0.75rem",
                            color: "text.secondary",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {params.value || "—"}
                    </Typography>
                </Tooltip>
            ),
        },
        {
            field: "paymentStatus",
            headerName: "Status",
            width: 110,
            renderCell: (params) => {
                const status = params.value || "SUCCESS";
                return (
                    <Chip
                        label={status}
                        color={PAYMENT_STATUS_COLOR[status] || "default"}
                        size="small"
                        variant="filled"
                    />
                );
            },
        },
        {
            field: "actions",
            headerName: "Invoice",
            width: 140,
            sortable: false,
            renderCell: (params) => {
                const isDownloading = downloadingId === params.row.billId;
                return (
                    <Button
                        variant="outlined"
                        size="small"
                        color="primary"
                        startIcon={isDownloading ? null : <FileDownloadIcon sx={{ fontSize: "0.9rem" }} />}
                        onClick={() => handleDownloadPdf(params.row.billId, params.row.invoiceNumber)}
                        disabled={!params.row.billId || !!downloadingId}
                        sx={{ fontSize: "0.75rem", px: 1.25 }}
                    >
                        {isDownloading ? "…" : "PDF"}
                    </Button>
                );
            },
        },
    ], [downloadingId]);

    const totalPaidAmount = useMemo(() => payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0), [payments]);

    const headerMetadata = useMemo(() => [
        { label: "Total Transactions", value: payments.length },
        { label: "Successful", value: payments.filter(p => p.paymentStatus === "SUCCESS" || !p.paymentStatus).length, color: "success" },
        { label: "Total Paid", value: formatCurrency(totalPaidAmount), color: "primary" },
    ], [payments, totalPaidAmount]);

    return (
        <DashboardLayout>
            <PageSummaryHeader
                title="Payment History"
                subtitle="View past transactions, invoices, and download payment receipts."
                icon={ReceiptLongIcon}
                metadata={headerMetadata}
            />

            <WidgetContainer>
                {/* ── Toolbar ── */}
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    alignItems={{ xs: "stretch", sm: "center" }}
                    sx={{ mb: 3 }}
                >
                    <SearchBar
                        value={search}
                        onChange={setSearch}
                        onClear={() => setSearch("")}
                        placeholder="Search by payment #, invoice #, transaction ID…"
                        sx={{ width: { xs: "100%", sm: 320 } }}
                    />
                </Stack>

                {/* ── Grid ── */}
                <Box sx={{ height: 520 }}>
                    <DataGrid
                        rows={filteredPayments}
                        columns={columns}
                        loading={loading}
                        error={error}
                        onRetry={fetchPayments}
                        emptyTitle="No Payments Found"
                        emptyMessage="Your payment history will appear here once you make a payment."
                    />
                </Box>
            </WidgetContainer>
        </DashboardLayout>
    );
}

export default PaymentHistoryPage;
