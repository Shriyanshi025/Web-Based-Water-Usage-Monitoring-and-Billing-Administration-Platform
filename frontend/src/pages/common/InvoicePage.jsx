import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Divider,
    Grid,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Typography,
    Alert,
    TextField,
    Chip
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";
import DownloadIcon from "@mui/icons-material/Download";
import SearchIcon from "@mui/icons-material/Search";

import DashboardLayout from "../../components/layout/DashboardLayout";
import CommunityOpsService from "../../services/CommunityOpsService";
import { formatCurrency } from "../../helpers/numberHelper";
import { useNotification } from "../../context/NotificationContext";
import api from "../../services/api";
import { ROUTES } from "../../constants/routes";
import BillBreakdownSection from "../../components/billing/BillBreakdownSection";

function InvoicePage() {
    const { billId, invoiceId } = useParams();
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchNumber, setSearchNumber] = useState("");

    const fetchInvoiceData = async () => {
        try {
            setLoading(true);
            setError(null);
            let res;
            if (billId) {
                res = await CommunityOpsService.getInvoiceByBillId(billId);
            } else if (invoiceId) {
                const response = await api.get(`/api/invoices/${invoiceId}`);
                res = response.data;
            }
            if (res?.data) {
                setInvoice(res.data);
            } else {
                setError("Invoice data could not be resolved.");
            }
        } catch (err) {
            setError(err?.response?.data?.message || err.message || "Failed to load invoice.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (billId || invoiceId) {
            fetchInvoiceData();
        }
    }, [billId, invoiceId]);

    const handleSearchInvoice = async (e) => {
        e.preventDefault();
        if (!searchNumber.trim()) return;
        try {
            setLoading(true);
            setError(null);
            const res = await CommunityOpsService.getInvoiceByNumber(searchNumber.trim());
            if (res?.data) {
                setInvoice(res.data);
                navigate(`/invoices/bill/${res.data.billId}`);
            } else {
                setError("Invoice not found.");
            }
        } catch (err) {
            setError(err?.response?.data?.message || "Invoice not found.");
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = async () => {
        if (!invoice?.id) return;
        try {
            showNotification("Generating PDF...", "info");
            const response = await CommunityOpsService.downloadInvoicePdf(invoice.id);
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Invoice-${invoice.invoiceNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            showNotification("PDF downloaded successfully.", "success");
        } catch (err) {
            showNotification("Failed to download PDF.", "error");
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
                    <CircularProgress />
                </Box>
            </DashboardLayout>
        );
    }

    const getWatermarkDetails = (status) => {
        const val = (status || "UNPAID").toUpperCase();
        switch (val) {
            case "PAID":
                return { text: "PAID", color: "rgba(46, 125, 50, 0.12)", border: "rgba(46, 125, 50, 0.3)" };
            case "OVERDUE":
                return { text: "OVERDUE", color: "rgba(211, 47, 47, 0.12)", border: "rgba(211, 47, 47, 0.3)" };
            case "UNPAID":
            default:
                return { text: "UNPAID", color: "rgba(237, 108, 2, 0.12)", border: "rgba(237, 108, 2, 0.3)" };
        }
    };

    const watermark = invoice ? getWatermarkDetails(invoice.paymentStatus || invoice.billStatus) : null;

    return (
        <DashboardLayout>
            {/* Action Header - Hidden when printing */}
            <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, "@media print": { display: "none" } }}>
                <Button
                    variant="text"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{ textTransform: "none" }}
                >
                    Back
                </Button>

                <Stack direction="row" spacing={2} alignItems="center">
                    <form onSubmit={handleSearchInvoice} style={{ display: "flex", gap: "8px" }}>
                        <TextField
                            size="small"
                            placeholder="INV-202607-001"
                            value={searchNumber}
                            onChange={(e) => setSearchNumber(e.target.value)}
                            sx={{ minWidth: 200 }}
                            InputProps={{
                                endAdornment: (
                                    <Button type="submit" size="small" sx={{ p: 0, minWidth: 32 }}>
                                        <SearchIcon size="small" />
                                    </Button>
                                )
                            }}
                        />
                    </form>

                    <Button
                        variant="outlined"
                        startIcon={<PrintIcon />}
                        onClick={handlePrint}
                        sx={{ textTransform: "none" }}
                    >
                        Print
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownload}
                        sx={{ textTransform: "none" }}
                    >
                        Download PDF
                    </Button>
                </Stack>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3, "@media print": { display: "none" } }}>
                    {error}
                </Alert>
            )}

            {invoice && (
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 3, md: 5 },
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 4,
                        position: "relative",
                        overflow: "hidden",
                        backgroundColor: "#fff",
                        color: "#000",
                        "@media print": {
                            border: "none",
                            p: 0,
                            m: 0
                        }
                    }}
                >
                    {/* Watermark background */}
                    {watermark && (
                        <Box
                            sx={{
                                position: "absolute",
                                top: "30%",
                                left: "50%",
                                transform: "translate(-50%, -50%) rotate(-30deg)",
                                zIndex: 0,
                                pointerEvents: "none",
                                border: `6px double ${watermark.border}`,
                                color: watermark.border.replace("0.3", "0.2"),
                                fontSize: { xs: "3.5rem", md: "6rem" },
                                fontWeight: 900,
                                px: 4,
                                py: 1,
                                letterSpacing: 8,
                                borderRadius: 4,
                                select: "none"
                            }}
                        >
                            {watermark.text}
                        </Box>
                    )}

                    {/* Invoice Body */}
                    <Box sx={{ position: "relative", zIndex: 1 }}>
                        {/* Company Header / Logo */}
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="h5" fontWeight="900" color="primary.main" letterSpacing={0.5}>
                                    HydroSync
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Water Monitoring and Billing Platform
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} align={{ xs: "left", sm: "right" }}>
                                <Typography variant="h5" fontWeight="bold">
                                    INVOICE
                                </Typography>
                                <Typography variant="subtitle2" sx={{ fontFamily: "monospace" }}>
                                    {invoice.invoiceNumber}
                                </Typography>
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 3 }} />

                        {/* Customer / Billing Metadata details */}
                        <Grid container spacing={4} sx={{ mb: 4 }}>
                            <Grid item xs={12} sm={4}>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block" gutterBottom>
                                    BILLED TO:
                                </Typography>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    {invoice.residentName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Unit {invoice.unitNumber}, {invoice.blockName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Community: {invoice.communityName}
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block" gutterBottom>
                                    METER DETAILS:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                    Meter No: {invoice.invoiceNumber ? "MTR-" + invoice.invoiceNumber.split("-").pop() : "N/A"}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Billing Cycle: {invoice.billingCycleName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Period: {invoice.periodStart} to {invoice.periodEnd}
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={4} align={{ xs: "left", sm: "right" }}>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block" gutterBottom>
                                    INVOICE DETAILS:
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Issue Date:</strong> {invoice.generatedDate}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Due Date:</strong> {invoice.dueDate}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    <strong>Status:</strong>{" "}
                                    <Chip
                                        label={invoice.paymentStatus || invoice.billStatus}
                                        color={invoice.paymentStatus === "PAID" ? "success" : "warning"}
                                        size="small"
                                        sx={{ fontWeight: "bold" }}
                                    />
                                </Typography>
                            </Grid>
                        </Grid>

                        {/* Bill Breakdown Section */}
                        <Box sx={{ mb: 4 }}>
                            <BillBreakdownSection bill={invoice} defaultExpanded={true} />
                        </Box>

                        {/* Summary breakdown details */}
                        <Grid container spacing={3} sx={{ mt: 2 }}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Thank you for your business. Please ensure payment is completed by the due date to avoid late fees.
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Stack spacing={1.5} align="right">
                                    <Stack direction="row" justifyContent="space-between" sx={{ width: "100%", maxWidth: 300, ml: "auto" }}>
                                        <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                                        <Typography variant="body2" fontWeight="medium">
                                            {formatCurrency(
                                                (Number(invoice.totalAmount || 0) - (Number(invoice.tax) || (invoice.bill && Number(invoice.bill.tax)) || 0))
                                            )}
                                        </Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between" sx={{ width: "100%", maxWidth: 300, ml: "auto" }}>
                                        <Typography variant="body2" color="text.secondary">Taxes (GST)</Typography>
                                        <Typography variant="body2" fontWeight="medium">
                                            {formatCurrency(Number(invoice.tax) || (invoice.bill && Number(invoice.bill.tax)) || 0)}
                                        </Typography>
                                    </Stack>
                                    <Divider sx={{ width: "100%", maxWidth: 300, ml: "auto" }} />
                                    <Stack direction="row" justifyContent="space-between" sx={{ width: "100%", maxWidth: 300, ml: "auto" }}>
                                        <Typography variant="subtitle1" fontWeight="bold">Grand Total</Typography>
                                        <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                                            {formatCurrency(invoice.totalAmount || 0)}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
            )}
        </DashboardLayout>
    );
}

export default InvoicePage;
