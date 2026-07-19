import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
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
import { getResidentProfile, getBillsByResidentId } from "../../services/ResidentOpsService";
import { formatCurrency } from "../../helpers/numberHelper";
import { useNotification } from "../../context/NotificationContext";

import api from "../../services/api";
import { getMyPayments, getRazorpayKey, createPaymentOrder, verifyPaymentSignature } from "../../services/PaymentService";
import MockRazorpayCheckout from "../../components/payment/MockRazorpayCheckout";
import PaymentSummaryDialog from "../../components/payment/PaymentSummaryDialog";
import PaymentSuccessDialog from "../../components/payment/PaymentSuccessDialog";
import PaymentFailureDialog from "../../components/payment/PaymentFailureDialog";

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

    // Mock Razorpay Checkout State
    const [mockCheckoutOpen, setMockCheckoutOpen] = useState(false);
    const [activeRazorpayOrderId, setActiveRazorpayOrderId] = useState("");

    const handleOpenPaymentSummary = (bill) => {
        setSummaryBill(bill);
        setSummaryDialogOpen(true);
    };

    const handleMockPaymentSuccess = async (payId, paymentMethod) => {
        setMockCheckoutOpen(false);
        setLoading(true);
        try {
            const sig = "sig_simulated_" + Math.random().toString(36).substring(2, 10);
            const orderId = activeRazorpayOrderId;
            
            const verifyRes = await verifyPaymentSignature({
                razorpayOrderId: orderId,
                razorpayPaymentId: payId,
                razorpaySignature: sig
            });
            if (verifyRes.success) {
                showNotification("Payment Successful! Your payment has been completed successfully.", "success");
                setSuccessPaymentDetails({
                    billNumber: summaryBill?.billNumber || `BILL-${summaryBill?.id}`,
                    amount: summaryBill?.totalAmount !== undefined && summaryBill?.totalAmount !== null ? summaryBill.totalAmount : (summaryBill?.amount || 0),
                    transactionId: payId,
                    paymentDate: new Date().toLocaleString(),
                    paymentMethod: paymentMethod || "MOCK",
                    billId: summaryBill?.id
                });
                setPaymentSuccessOpen(true);
                handleCloseDetails();
                fetchBillsData();
                fetchPaymentsData();
            } else {
                showNotification("Payment Verification Failed. Please contact support if money was deducted.", "error");
            }
        } catch (err) {
            showNotification("Payment Verification Failed. Please contact support if money was deducted.", "error");
        } finally {
            setLoading(false);
            setPayingBillId(null);
        }
    };

    const handleMockPaymentCancel = () => {
        setMockCheckoutOpen(false);
        showNotification("Payment Cancelled. No amount was deducted.", "warning");
        setPayingBillId(null);
    };

    const handleMockPaymentFail = () => {
        setMockCheckoutOpen(false);
        setFailedBill(summaryBill);
        setPaymentErrorOpen(true);
        setPayingBillId(null);
    };

    const handlePayBill = async (bill) => {
        if (payingBillId) return;
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

            if (key.includes("placeholder") || orderData.razorpayOrderId.includes("simulated")) {
                setActiveRazorpayOrderId(orderData.razorpayOrderId);
                setMockCheckoutOpen(true);
                return;
            }

            const options = {
                key: key,
                amount: orderData.amount * 100, // paise
                currency: orderData.currency || "INR",
                name: "HydroSync",
                description: `Water Bill Payment - ${bill.billNumber || bill.id}`,
                order_id: orderData.razorpayOrderId,
                handler: async function (response) {
                    restoreAlert();
                    try {
                        setLoading(true);
                        const verifyRes = await verifyPaymentSignature({
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature
                        });
                        if (verifyRes.success) {
                            showNotification("Payment Successful! Your payment has been completed successfully.", "success");
                            setSuccessPaymentDetails({
                                billNumber: bill.billNumber || `BILL-${bill.id}`,
                                amount: bill.totalAmount !== undefined && bill.totalAmount !== null ? bill.totalAmount : (bill.amount || 0),
                                transactionId: response.razorpay_payment_id,
                                paymentDate: new Date().toLocaleString(),
                                paymentMethod: "Razorpay",
                                billId: bill.id
                            });
                            setPaymentSuccessOpen(true);
                            handleCloseDetails();
                            fetchBillsData();
                            fetchPaymentsData();
                        } else {
                            showNotification("Payment Verification Failed. Please contact support if money was deducted.", "error");
                        }
                    } catch (err) {
                        showNotification("Payment Verification Failed. Please contact support if money was deducted.", "error");
                    } finally {
                        setLoading(false);
                        setPayingBillId(null);
                    }
                },
                prefill: {
                    name: profile?.fullName || "",
                    email: profile?.email || "",
                    contact: profile?.phoneNumber || ""
                },
                theme: {
                    color: "#1976d2"
                },
                modal: {
                    ondismiss: function () {
                        restoreAlert();
                        showNotification("Payment Cancelled. No amount was deducted.", "warning");
                        setPayingBillId(null);
                    }
                }
            };

            // Intercept internal window.alerts from third-party scripts
            window.alert = function (message) {
                console.warn("Intercepted Razorpay alert:", message);
                restoreAlert();
                setPayingBillId(null);
                setFailedBill(bill);
                setPaymentErrorOpen(true);
            };

            const rzp = new window.Razorpay(options);
            rzp.on("payment.failed", function (response) {
                restoreAlert();
                console.error("Payment failed", response);
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
        try {
            const bill = bills.find(b => b.id === billId) || selectedBill;
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
            let filename = bill?.billNumber ? `Bill-${bill.billNumber}.pdf` : `Bill-BILL-${billId}.pdf`;
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
            showNotification("Failed to download bill PDF. Please try again.", "error");
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
            
            if (prof && prof.id) {
                const data = await getBillsByResidentId(prof.id);
                setBills(data || []);
                fetchPaymentsData();
            } else {
                setBills([]);
            }
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
            field: "billStatus", 
            headerName: "Bill Status", 
            width: 140,
            renderCell: (params) => {
                const status = params.row.billStatus || "GENERATED";
                return (
                    <Chip 
                        label={status} 
                        color={status === "GENERATED" ? "primary" : "default"} 
                        size="small"
                    />
                );
            }
        },
        {
            field: "actions",
            headerName: "Action",
            width: 320,
            sortable: false,
            renderCell: (params) => {
                const status = (params.row.paymentStatus || params.row.status || "UNPAID").toUpperCase();
                const isPaid = status === "PAID";
                const canPay = status === "UNPAID" || status === "PENDING";
                
                return (
                    <Stack direction="row" spacing={1}>
                        <Button 
                            variant="contained" 
                            size="small"
                            color="info"
                            onClick={() => handleOpenDetails(params.row)}
                        >
                            View Details
                        </Button>
                        <Button 
                            variant="outlined" 
                            size="small"
                            color="primary"
                            onClick={() => handleDownloadPdf(params.row.id)}
                        >
                            Download PDF
                        </Button>
                        {canPay && (
                            <Button 
                                variant="contained" 
                                size="small"
                                color="success"
                                onClick={() => handleOpenPaymentSummary(params.row)}
                                disabled={payingBillId === params.row.id}
                            >
                                {payingBillId === params.row.id ? "Processing..." : "Pay Now"}
                            </Button>
                        )}
                        {isPaid && (
                            <Button 
                                variant="contained" 
                                size="small"
                                color="success"
                                disabled
                            >
                                Paid
                            </Button>
                        )}
                    </Stack>
                );
            }
        }
    ], [bills, payingBillId]);

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

    const memoizedToolbar = useMemo(() => (
        <TableToolbar 
            searchPlaceholder="Search bills..."
            onSearch={() => {}}
            filterOptions={[{ label: "Status", value: "status" }]}
            onFilter={() => {}}
        />
    ), []);

    return (
        <DashboardLayout>
            <PageHeader 
                title="My Bills" 
                subtitle="View and track your water usage bills and statements" 
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
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Bill Number</Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {selectedBill.billNumber || "-"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Billing Period</Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {selectedBill.billingMonth && selectedBill.billingYear ? 
                                            `${new Date(selectedBill.billingYear, selectedBill.billingMonth - 1).toLocaleString('default', { month: 'long' })} ${selectedBill.billingYear}` : 
                                            selectedBill.billingCycleName || "-"
                                        }
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Generated Date</Typography>
                                    <Typography variant="body2">{selectedBill.generatedDate || "-"}</Typography>
                                </Grid>
                                <Grid item xs={6}>
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
                                <Grid item xs={4}>
                                    <Typography variant="caption" color="text.secondary">Previous Reading</Typography>
                                    <Typography variant="body2">{selectedBill.previousReading !== undefined ? `${selectedBill.previousReading} units` : "-"}</Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="caption" color="text.secondary">Current Reading</Typography>
                                    <Typography variant="body2">{selectedBill.currentReading !== undefined ? `${selectedBill.currentReading} units` : "-"}</Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="caption" color="text.secondary">Units Consumed</Typography>
                                    <Typography variant="body2" fontWeight="bold">{selectedBill.unitsConsumed} units</Typography>
                                </Grid>
                            </Grid>

                            <Divider />

                            {/* Pricing Summary */}
                            <Typography variant="subtitle2" fontWeight="bold" color="primary">
                                Charges Breakdown
                            </Typography>
                            <Stack spacing={1}>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Rate Per Unit:</Typography>
                                    <Typography variant="body2">{formatCurrency(selectedBill.ratePerUnit || 0)}</Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Fixed Base Charge:</Typography>
                                    <Typography variant="body2">{formatCurrency(selectedBill.fixedCharge || 0)}</Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Additional Charges:</Typography>
                                    <Typography variant="body2">{formatCurrency(selectedBill.additionalCharge || 0)}</Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Subtotal:</Typography>
                                    <Typography variant="body2">{formatCurrency(selectedBill.subtotal || selectedBill.amount || 0)}</Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Tax (5%):</Typography>
                                    <Typography variant="body2">{formatCurrency(selectedBill.tax || 0)}</Typography>
                                </Box>
                                
                                <Divider sx={{ my: 1 }} />
                                
                                <Box display="flex" justifyContent="space-between">
                                    <Typography variant="subtitle1" fontWeight="bold">Total Amount Due:</Typography>
                                    <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                                        {formatCurrency(selectedBill.totalAmount !== undefined && selectedBill.totalAmount !== null ? selectedBill.totalAmount : (selectedBill.amount || 0))}
                                    </Typography>
                                </Box>
                            </Stack>

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
                                    {payingBillId === selectedBill.id ? "Processing..." : "Pay Now"}
                                </Button>
                            );
                        } else if (billStatus === "PAID") {
                            return (
                                <Button 
                                    variant="contained" 
                                    color="success"
                                    disabled
                                >
                                    Paid
                                </Button>
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

            <MockRazorpayCheckout 
                open={mockCheckoutOpen}
                onClose={handleMockPaymentCancel}
                bill={summaryBill}
                profile={profile}
                onSuccess={(payId, method) => handleMockPaymentSuccess(payId, method)}
                onFailure={handleMockPaymentFail}
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
