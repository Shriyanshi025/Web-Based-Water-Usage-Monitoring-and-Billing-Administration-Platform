import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageSummaryHeader from "../../components/common/PageSummaryHeader";
import WidgetContainer from "../../components/widgets/WidgetContainer";
import TableToolbar from "../../components/common/TableToolbar";
import DataGrid from "../../components/common/DataGrid";
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
    TextField
} from "@mui/material";
import { getResidentProfile, getMyBills, getBillsByResidentId } from "../../services/ResidentOpsService";
import { formatCurrency } from "../../helpers/numberHelper";
import { useNotification } from "../../context/NotificationContext";

import api from "../../services/api";
import { getMyPayments, getRazorpayKey, createPaymentOrder, verifyPaymentSignature } from "../../services/PaymentService";
import PaymentSummaryDialog from "../../components/payment/PaymentSummaryDialog";
import PaymentSuccessDialog from "../../components/payment/PaymentSuccessDialog";
import PaymentFailureDialog from "../../components/payment/PaymentFailureDialog";
import BillBreakdownSection from "../../components/billing/BillBreakdownSection";
import AdminStatCard from "../../components/common/AdminStatCard";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PaymentIcon from "@mui/icons-material/Payment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";

const loadRazorpay = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

function BillsPage() {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [profile, setProfile] = useState(null);
    const [bills, setBills] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Detailed dialog state
    const [selectedBill, setSelectedBill] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    // Payment state
    const [payingBillId, setPayingBillId] = useState(null);
    const [paymentErrorOpen, setPaymentErrorOpen] = useState(false);
    const [failedBill, setFailedBill] = useState(null);
    const [paymentSuccessOpen, setPaymentSuccessOpen] = useState(false);
    const [successPaymentDetails, setSuccessPaymentDetails] = useState(null);
    const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
    const [summaryBill, setSummaryBill] = useState(null);

    // Download state — tracks which bill is downloading
    const [downloadingId, setDownloadingId] = useState(null);

    const handleOpenPaymentSummary = (bill) => {
        setSummaryBill(bill);
        setSummaryDialogOpen(true);
    };

    const handlePayBill = async (bill) => {
        if (payingBillId) return;

        // Validation: Verify resident profile has a valid mobile number before payment initiation
        const rawPhone = profile?.phoneNumber ? String(profile.phoneNumber).trim() : "";
        const cleanPhone = rawPhone.replace(/\D/g, "");
        if (!cleanPhone || cleanPhone.length < 10) {
            showNotification("Please update your mobile number in your profile before making a payment.", "error");
            return;
        }

        setPayingBillId(bill.id);
        
        const originalAlert = window.alert;
        const restoreAlert = () => {
            if (window.alert !== originalAlert) {
                window.alert = originalAlert;
            }
        };
        
        try {
            const loaded = await loadRazorpay();
            if (!loaded) {
                showNotification("Failed to load Razorpay SDK. Please check your internet connection.", "error");
                setPayingBillId(null);
                return;
            }

            const keyRes = await getRazorpayKey();
            const key = keyRes.data;

            const orderRes = await createPaymentOrder(bill.id);
            const orderData = orderRes.data;

            if (!orderData || !orderData.razorpayOrderId) {
                showNotification(orderRes.message || "Failed to create Razorpay order. Please try again.", "error");
                setPayingBillId(null);
                return;
            }

            // Build prefill dynamically without any hardcoded fake values
            const prefill = {
                name: profile?.fullName?.trim() || "Resident"
            };

            if (profile?.email && String(profile.email).trim()) {
                prefill.email = String(profile.email).trim();
            }

            if (cleanPhone.length >= 10) {
                prefill.contact = cleanPhone.slice(-10);
            }

            let isPaymentCompleted = false;

            const options = {
                key: key,
                amount: Math.round((orderData.amount || bill.totalAmount) * 100), // paise
                currency: orderData.currency || "INR",
                name: "HydroSync Water Platform",
                description: `Water Bill Payment - ${bill.billNumber || bill.id}`,
                order_id: orderData.razorpayOrderId,
                handler: async function (response) {
                    console.log("HANDLER CALLBACK EXECUTED", response);
                    console.log("SUCCESS HANDLER STARTED", response);
                    restoreAlert();
                    try {
                        setLoading(true);
                        console.log("Calling /api/payments/verify");
                        const verifyRes = await verifyPaymentSignature({
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature
                        });
                        console.log("verifyRes =", verifyRes);
                        console.log("verifyRes.data =", verifyRes.data);
                        if (verifyRes.success || verifyRes.data?.success) {
                            isPaymentCompleted = true;
                            console.log("1 - Notification shown");
                            showNotification("Payment Successful! Your payment has been completed successfully.", "success");
                            
                            console.log("2 - Success details set");
                            setSuccessPaymentDetails({
                                billNumber: bill.billNumber || `BILL-${bill.id}`,
                                amount: bill.totalAmount !== undefined && bill.totalAmount !== null ? bill.totalAmount : (bill.amount || 0),
                                transactionId: response.razorpay_payment_id,
                                paymentDate: new Date().toLocaleString("en-IN"),
                                paymentMethod: "Razorpay",
                                billId: bill.id,
                                householdId: profile?.flatNumber || profile?.householdId || "—",
                                residentName: profile?.fullName || "Resident",
                                billingCycle: bill.billingMonth && bill.billingYear
                                    ? `${new Date(bill.billingYear, bill.billingMonth - 1).toLocaleString("default", { month: "short" })} ${bill.billingYear}`
                                    : (bill.billingCycleName || "Current Cycle")
                            });

                            console.log("3 - Success dialog opened");
                            setPaymentSuccessOpen(true);

                            console.log("4 - Details dialog closed");
                            handleCloseDetails();

                            console.log("5 - fetchBillsData called");
                            fetchBillsData();

                            console.log("6 - fetchPaymentsData called");
                            fetchPaymentsData();

                            console.log("7 - Success handler completed");
                        } else {
                            showNotification("Payment Verification Failed. Please contact support if money was deducted.", "error");
                            setFailedBill(bill);
                            setPaymentErrorOpen(true);
                        }
                    } catch (err) {
                        console.error("Handler Exception", err);
                        showNotification(err?.response?.data?.message || "Payment Verification Failed.", "error");
                        setFailedBill(bill);
                        setPaymentErrorOpen(true);
                    } finally {
                        setLoading(false);
                        setPayingBillId(null);
                    }
                },
                prefill: prefill,
                theme: {
                    color: "#0EA5E9"
                },
                modal: {
                    ondismiss: function () {
                        console.log("MODAL.ONDISMISS CALLBACK EXECUTED");
                        restoreAlert();
                        if (!isPaymentCompleted) {
                            showNotification("Payment Cancelled. No amount was deducted.", "warning");
                            setPayingBillId(null);
                        }
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on("payment.failed", function (response) {
                console.log("PAYMENT.FAILED CALLBACK EXECUTED", response);
                if (isPaymentCompleted) {
                    console.log("Ignoring payment.failed because payment was already completed successfully.");
                    return;
                }
                restoreAlert();
                console.log("payment.failed", JSON.stringify(response, null, 2));
                console.log("response.error:", response?.error);
                console.log("response.error.code:", response?.error?.code);
                console.log("response.error.description:", response?.error?.description);
                console.log("response.error.reason:", response?.error?.reason);
                console.log("response.error.metadata:", response?.error?.metadata);
                setPayingBillId(null);
                setFailedBill(bill);
                setPaymentErrorOpen(true);
            });
            rzp.open();

        } catch (err) {
            restoreAlert();
            console.error("Payment initialization failed", err);
            showNotification(err?.response?.data?.message || "Failed to initiate payment.", "error");
            setPayingBillId(null);
        }
    };

    const handleDownloadPdf = async (billId) => {
        if (downloadingId) return; // prevent double-click
        setDownloadingId(billId);
        try {
            const bill = bills.find(b => b.id === billId) || selectedBill;
            const response = await api.get(`/bills/${billId}/pdf`, { responseType: 'blob' });

            if (response.data.type === 'application/json') {
                const text = await response.data.text();
                const errorObj = JSON.parse(text);
                showNotification(errorObj.message || "Unable to download the bill PDF. Please try again.", "error");
                return;
            }

            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;

            const disposition = response.headers['content-disposition'];
            let filename = bill?.billNumber ? `HydroSync-Bill-${bill.billNumber}.pdf` : `HydroSync-Bill-${billId}.pdf`;
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
            window.URL.revokeObjectURL(url);

            showNotification(`Bill downloaded successfully as ${filename}.`, "success");
        } catch (err) {
            console.error("PDF download failed", err);
            showNotification("Unable to download the bill PDF. Please try again.", "error");
        } finally {
            setDownloadingId(null);
        }
    };

    const fetchPaymentsData = useCallback(async () => {
        try {
            const res = await getMyPayments();
            setPayments(res.data || []);
        } catch (err) {
            console.error("Failed to fetch payment history", err);
        }
    }, []);

    const fetchBillsData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const profRes = await getResidentProfile();
            const prof = profRes.data;
            setProfile(prof);
            
            const data = await getMyBills();
            setBills(data || []);
            fetchPaymentsData();
        } catch (err) {
            setError(err?.response?.data?.message || err.message || "Failed to fetch bills");
        } finally {
            setLoading(false);
        }
    }, [fetchPaymentsData]);

    useEffect(() => {
        fetchBillsData();
    }, [fetchBillsData]);

    const handleOpenDetails = (bill) => {
        setSelectedBill(bill);
        setDialogOpen(true);
    };

    const handleCloseDetails = () => {
        setDialogOpen(false);
        setSelectedBill(null);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "PAID":
                return "success";
            case "UNPAID":
                return "warning";
            case "OVERDUE":
                return "error";
            default:
                return "default";
        }
    };

    const columns = useMemo(() => [
        { 
            field: "billNumber", 
            headerName: "Bill Number", 
            flex: 1.2, 
            minWidth: 180,
            renderCell: (params) => params.row.billNumber || "-"
        },
        { 
            field: "billingPeriod", 
            headerName: "Billing Month", 
            width: 140,
            renderCell: (params) => {
                if (params.row.billingMonth && params.row.billingYear) {
                    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    return `${months[params.row.billingMonth - 1]} ${params.row.billingYear}`;
                }
                return params.row.billingCycleName || "-";
            }
        },
        { 
            field: "unitsConsumed", 
            headerName: "Units Consumed", 
            width: 150,
            type: "number"
        },
        { 
            field: "totalAmount", 
            headerName: "Total Amount", 
            width: 150,
            renderCell: (params) => {
                const amt = params.row.totalAmount !== undefined && params.row.totalAmount !== null ? params.row.totalAmount : params.row.amount;
                return formatCurrency(amt || 0);
            }
        },
        { 
            field: "dueDate", 
            headerName: "Due Date", 
            width: 140 
        },
        { 
            field: "paymentStatus", 
            headerName: "Payment Status", 
            width: 140,
            renderCell: (params) => {
                const status = params.row.paymentStatus || params.row.status || "UNPAID";
                return (
                    <Chip 
                        label={status} 
                        color={getStatusColor(status)} 
                        size="small" 
                        variant="outlined"
                    />
                );
            }
        },
        {
            field: "actions",
            headerName: "Actions",
            width: 320,
            sortable: false,
            renderCell: (params) => {
                const status = (params.row.paymentStatus || params.row.status || "UNPAID").toUpperCase();
                const isPaid = status === "PAID";
                const canPay = status === "UNPAID" || status === "PENDING";
                const isDownloading = downloadingId === params.row.id;

                const btnStyle = {
                    width: "90px",
                    height: "32px",
                    borderRadius: "4px",
                    textTransform: "none",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    padding: "4px 8px"
                };

                return (
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Button
                            variant="outlined"
                            size="small"
                            color="primary"
                            onClick={() => navigate(`/invoices/bill/${params.row.id}`)}
                            sx={btnStyle}
                        >
                            Invoice
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            color="inherit"
                            onClick={() => handleDownloadPdf(params.row.id)}
                            disabled={isDownloading}
                            sx={{ ...btnStyle, color: "text.secondary" }}
                        >
                            {isDownloading ? "…" : "PDF"}
                        </Button>
                        {canPay && (
                            <Button
                                variant="contained"
                                size="small"
                                color="success"
                                onClick={() => handleOpenPaymentSummary(params.row)}
                                disabled={payingBillId === params.row.id}
                                sx={btnStyle}
                            >
                                {payingBillId === params.row.id ? "…" : "Pay Now"}
                            </Button>
                        )}
                        {isPaid && (
                            <Box
                                sx={{
                                    width: "90px",
                                    height: "32px",
                                    borderRadius: "4px",
                                    border: "1px solid",
                                    borderColor: "success.light",
                                    color: "success.dark",
                                    backgroundColor: "success.50",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    letterSpacing: "0.02em",
                                    pointerEvents: "none",
                                    cursor: "default",
                                    userSelect: "none",
                                    opacity: 0.8,
                                    flexShrink: 0,
                                }}
                            >
                                ✓ Paid
                            </Box>
                        )}
                    </Stack>
                );
            }
        }
    ], [bills, payingBillId, downloadingId]);

    const paymentColumns = useMemo(() => [
        { field: "id", headerName: "Payment ID", width: 100 },
        { field: "billNumber", headerName: "Bill Number", width: 150 },
        { field: "invoiceNumber", headerName: "Invoice Number", width: 180 },
        { field: "billingMonth", headerName: "Billing Month", width: 130 },
        { 
            field: "amount", 
            headerName: "Amount Paid", 
            width: 130, 
            renderCell: (params) => formatCurrency(params.value || 0)
        },
        { field: "paymentMethod", headerName: "Method", width: 120 },
        { field: "razorpayPaymentId", headerName: "Transaction ID", width: 180 },
        { 
            field: "transactionDate", 
            headerName: "Payment Date", 
            width: 170,
            renderCell: (params) => params.value ? new Date(params.value).toLocaleString() : "-"
        },
        { 
            field: "paymentStatus", 
            headerName: "Status", 
            width: 120,
            renderCell: (params) => (
                <Chip 
                    label={params.value} 
                    color={params.value === "SUCCESS" ? "success" : params.value === "FAILED" ? "error" : "warning"} 
                    size="small" 
                    variant="outlined"
                />
            )
        }
    ], []);

    const unpaidBillsCount = useMemo(() => bills.filter(b => (b.paymentStatus || b.status) !== "PAID").length, [bills]);
    const paidBillsCount = useMemo(() => bills.filter(b => (b.paymentStatus || b.status) === "PAID").length, [bills]);
    const totalOutstandingAmount = useMemo(() => {
        return bills
            .filter(b => (b.paymentStatus || b.status) !== "PAID")
            .reduce((sum, b) => sum + (b.totalAmount != null ? b.totalAmount : b.amount || 0), 0);
    }, [bills]);

    const memoizedToolbar = useMemo(() => (
        <TableToolbar 
            searchPlaceholder="Search bills..."
            onSearch={() => {}}
            filterOptions={[{ label: "Status", value: "status" }]}
            onFilter={() => {}}
        />
    ), []);

    const headerMetadata = useMemo(() => [
        { label: "Total Statements", value: bills.length },
        { label: "Unpaid", value: unpaidBillsCount, color: "warning" },
        { label: "Paid", value: paidBillsCount, color: "success" },
        { label: "Outstanding", value: formatCurrency(totalOutstandingAmount), color: "error" },
    ], [bills.length, unpaidBillsCount, paidBillsCount, totalOutstandingAmount]);

    return (
        <DashboardLayout>
            <PageSummaryHeader 
                title="My Bills" 
                subtitle="View and track your water usage bills and statements" 
                icon={ReceiptIcon}
                metadata={headerMetadata}
            />

            <WidgetContainer>
                {memoizedToolbar}
                <Box sx={{ mt: 3, height: 500 }}>
                    <DataGrid 
                        rows={bills}
                        columns={columns}
                        loading={loading}
                        error={error}
                        onRetry={fetchBillsData}
                    />
                </Box>
            </WidgetContainer>


            {/* Bill Details Dialog */}
            <Dialog 
                open={dialogOpen} 
                onClose={handleCloseDetails}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ m: 0, p: 2, bgcolor: 'background.default', borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight="bold">
                            Water Bill Invoice
                        </Typography>
                        {selectedBill && (
                            <Chip 
                                label={selectedBill.paymentStatus || selectedBill.status || "UNPAID"} 
                                color={getStatusColor(selectedBill.paymentStatus || selectedBill.status || "UNPAID")} 
                                size="small"
                            />
                        )}
                    </Stack>
                </DialogTitle>
                
                <DialogContent dividers sx={{ p: 3 }}>
                    {selectedBill && (
                        <Stack spacing={2.5}>
                            {/* Bill Header Info */}
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary">Bill Number</Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {selectedBill.billNumber || "-"}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary">Billing Period</Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {selectedBill.billingMonth && selectedBill.billingYear ? 
                                            `${new Date(selectedBill.billingYear, selectedBill.billingMonth - 1).toLocaleString('default', { month: 'long' })} ${selectedBill.billingYear}` : 
                                            selectedBill.billingCycleName || "-"
                                        }
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary">Generated Date</Typography>
                                    <Typography variant="body2">{selectedBill.generatedDate || "-"}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary">Due Date</Typography>
                                    <Typography variant="body2" color="error.main" fontWeight="medium">
                                        {selectedBill.dueDate || "-"}
                                    </Typography>
                                </Grid>
                            </Grid>

                            <Divider />

                            {/* Meter Readings */}
                            <Typography variant="subtitle2" fontWeight="bold" color="primary">
                                Meter Readings
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 4 }}>
                                    <Typography variant="caption" color="text.secondary">Previous Reading</Typography>
                                    <Typography variant="body2">{selectedBill.previousReading !== undefined ? `${selectedBill.previousReading} units` : "-"}</Typography>
                                </Grid>
                                <Grid size={{ xs: 4 }}>
                                    <Typography variant="caption" color="text.secondary">Current Reading</Typography>
                                    <Typography variant="body2">{selectedBill.currentReading !== undefined ? `${selectedBill.currentReading} units` : "-"}</Typography>
                                </Grid>
                                <Grid size={{ xs: 4 }}>
                                    <Typography variant="caption" color="text.secondary">Units Consumed</Typography>
                                    <Typography variant="body2" fontWeight="bold">{selectedBill.unitsConsumed} units</Typography>
                                </Grid>
                            </Grid>

                            <Divider />

                            {/* Detailed Bill Breakdown */}
                            <BillBreakdownSection bill={selectedBill} defaultExpanded={true} />

                            {selectedBill.remarks && (
                                <>
                                    <Divider />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Remarks / Notes</Typography>
                                        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>{selectedBill.remarks}</Typography>
                                    </Box>
                                </>
                            )}
                        </Stack>
                    )}
                </DialogContent>
                
                <DialogActions sx={{ p: 2, bgcolor: 'background.default', borderTop: '1px solid', borderColor: 'divider' }}>
                    {selectedBill && (
                        <Button 
                            onClick={() => handleDownloadPdf(selectedBill.id)} 
                            variant="contained" 
                            color="primary"
                        >
                            Download PDF
                        </Button>
                    )}
                    {selectedBill && (() => {
                        const billStatus = (selectedBill.paymentStatus || selectedBill.status || "UNPAID").toUpperCase();
                        if (billStatus === "UNPAID" || billStatus === "PENDING") {
                            return (
                                <Button 
                                    onClick={() => handleOpenPaymentSummary(selectedBill)} 
                                    variant="contained" 
                                    color="success"
                                    disabled={payingBillId === selectedBill.id}
                                >
                                    {payingBillId === selectedBill.id ? "Processing…" : "Pay Now"}
                                </Button>
                            );
                        } else if (billStatus === "PAID") {
                            return (
                                <Chip
                                    label="✓ Paid"
                                    color="success"
                                    variant="outlined"
                                    size="medium"
                                    sx={{ fontWeight: 600, pointerEvents: "none", px: 1 }}
                                />
                            );
                        }
                        return null;
                    })()}
                    <Button onClick={handleCloseDetails} variant="outlined" color="secondary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Reusable Payment Components */}
            <PaymentSummaryDialog
                open={summaryDialogOpen}
                onClose={() => setSummaryDialogOpen(false)}
                bill={summaryBill}
                profile={profile}
                onProceed={() => {
                    setSummaryDialogOpen(false);
                    if (summaryBill) {
                        handlePayBill(summaryBill);
                    }
                }}
            />

            <PaymentSuccessDialog
                open={paymentSuccessOpen}
                onClose={() => setPaymentSuccessOpen(false)}
                details={successPaymentDetails}
                onDownloadInvoice={(billId) => handleDownloadPdf(billId)}
                onViewHistory={() => {
                    setPaymentSuccessOpen(false);
                    navigate("/user/payments");
                }}
            />

            <PaymentFailureDialog
                open={paymentErrorOpen}
                onClose={() => setPaymentErrorOpen(false)}
                bill={failedBill}
                onRetry={() => {
                    setPaymentErrorOpen(false);
                    if (failedBill) {
                        handlePayBill(failedBill);
                    }
                }}
            />
        </DashboardLayout>
    );
}

export default BillsPage;
