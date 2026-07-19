import React, { useState, useEffect } from "react";
import { 
    Dialog, 
    DialogContent, 
    DialogActions, 
    Box, 
    Typography, 
    Button, 
    Stack, 
    TextField, 
    Chip, 
    CircularProgress,
    Fade,
    Grid
} from "@mui/material";

export default function MockRazorpayCheckout({ 
    open, 
    onClose, 
    bill, 
    profile, 
    onSuccess, 
    onFailure 
}) {
    const [tab, setTab] = useState("card"); // card, upi, qr, netbanking, wallet
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvv, setCvv] = useState("");
    const [upi, setUpi] = useState("");
    
    // Processing states
    const [loadingState, setLoadingState] = useState("idle"); // idle, processing, verifying
    const [otpOpen, setOtpOpen] = useState(false);
    const [otp, setOtp] = useState("");
    const [qrScanMode, setQrScanMode] = useState(false);

    useEffect(() => {
        if (open) {
            setTab("card");
            setCardNumber("");
            setExpiry("");
            setCvv("");
            setUpi("");
            setOtp("");
            setOtpOpen(false);
            setLoadingState("idle");
            setQrScanMode(false);
        }
    }, [open]);

    const handlePay = () => {
        if (tab === "card") {
            if (cardNumber.replace(/\s/g, "") === "4111111111111111" && expiry === "12/30" && cvv === "123") {
                setOtpOpen(true);
            } else {
                onFailure();
            }
        } else if (tab === "upi") {
            if (upi.trim() === "success@razorpay") {
                setOtpOpen(true);
            } else {
                onFailure();
            }
        }
    };

    const triggerVerificationFlow = () => {
        setLoadingState("processing");
        setTimeout(() => {
            setLoadingState("verifying");
            setTimeout(() => {
                const payId = "pay_simulated_" + Math.random().toString(36).substring(2, 10);
                onSuccess(payId, tab.toUpperCase());
            }, 1500);
        }, 1500);
    };

    const handleOtpSubmit = () => {
        if (otp === "123456") {
            triggerVerificationFlow();
        } else {
            onFailure();
        }
    };

    const formattedAmount = bill 
        ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
            bill.totalAmount !== undefined && bill.totalAmount !== null ? bill.totalAmount : (bill.amount || 0)
          )
        : "₹0.00";

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3, overflow: 'hidden' }
            }}
        >
            {/* Demo Banner */}
            <Box sx={{ bgcolor: 'warning.main', color: 'warning.contrastText', px: 2, py: 0.5, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                    ⚠️ Demo Payment Environment - No real money will be deducted.
                </Typography>
            </Box>

            {/* Header */}
            <Box sx={{ bgcolor: '#0b1d33', color: 'white', p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'black', color: '#1976d2', letterSpacing: -0.5 }}>
                            Razorpay
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.65rem', border: '1px solid', px: 0.5, borderRadius: 0.5 }}>
                            DEMO
                        </Typography>
                    </Box>
                    <Chip label="Test Mode" color="error" size="small" sx={{ fontWeight: 'bold', height: 20, fontSize: '0.65rem' }} />
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mt: 2.5 }}>
                    <Box>
                        <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.75rem', display: 'block' }}>
                            {profile?.fullName || "HydroSync Merchant"}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 0.2 }}>
                            Bill: {bill?.billNumber || `BILL-${bill?.id}`}
                        </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        {formattedAmount}
                    </Typography>
                </Stack>
            </Box>

            {loadingState === "idle" ? (
                <>
                    {!otpOpen ? (
                        <>
                            {/* Tabs */}
                            <Stack direction="row" sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#f8f9fa', flexWrap: 'wrap' }}>
                                {["card", "upi", "qr", "netbanking", "wallet"].map((t) => (
                                    <Button 
                                        key={t}
                                        onClick={() => {
                                            setTab(t);
                                            setQrScanMode(false);
                                        }}
                                        sx={{ 
                                            flex: '1 1 auto', py: 1.2, px: 1, borderRadius: 0, fontSize: '0.72rem',
                                            color: tab === t ? 'primary.main' : 'text.secondary',
                                            borderBottom: tab === t ? '2px solid' : 'none',
                                            borderColor: 'primary.main',
                                            fontWeight: 'bold',
                                            textTransform: 'capitalize',
                                            minWidth: '70px'
                                        }}
                                    >
                                        {t === 'card' ? '💳 Card' : t === 'upi' ? '📱 UPI' : t === 'qr' ? '🔳 QR' : t === 'netbanking' ? '🏦 Net' : '💼 Wallet'}
                                    </Button>
                                ))}
                            </Stack>

                            <DialogContent sx={{ p: 3 }}>
                                <Fade in={true} timeout={300}>
                                    <Box>
                                        {tab === "card" && (
                                            <Stack spacing={2.5}>
                                                <TextField 
                                                    label="Card Number"
                                                    placeholder="4111 1111 1111 1111"
                                                    fullWidth
                                                    value={cardNumber}
                                                    onChange={(e) => setCardNumber(e.target.value)}
                                                    variant="outlined"
                                                    size="small"
                                                />
                                                <Stack direction="row" spacing={2}>
                                                    <TextField 
                                                        label="Expiry (MM/YY)"
                                                        placeholder="12/30"
                                                        value={expiry}
                                                        onChange={(e) => setExpiry(e.target.value)}
                                                        size="small"
                                                        fullWidth
                                                    />
                                                    <TextField 
                                                        label="CVV"
                                                        placeholder="123"
                                                        type="password"
                                                        value={cvv}
                                                        onChange={(e) => setCvv(e.target.value)}
                                                        size="small"
                                                        fullWidth
                                                    />
                                                </Stack>
                                            </Stack>
                                        )}

                                        {tab === "upi" && (
                                            <Stack spacing={2}>
                                                <TextField 
                                                    label="UPI ID"
                                                    placeholder="success@razorpay"
                                                    fullWidth
                                                    value={upi}
                                                    onChange={(e) => setUpi(e.target.value)}
                                                    variant="outlined"
                                                    size="small"
                                                />
                                                <Typography variant="caption" color="text.secondary">
                                                    Enter `success@razorpay` to simulate a successful payment.
                                                </Typography>
                                            </Stack>
                                        )}

                                        {tab === "qr" && (
                                            <Box sx={{ py: 1, textAlign: 'center' }}>
                                                {!qrScanMode ? (
                                                    <Stack spacing={2} alignItems="center">
                                                        <Typography variant="body2" color="text.secondary">
                                                            Generate QR code to scan and pay instantly using any UPI app.
                                                        </Typography>
                                                        <Button 
                                                            variant="contained" 
                                                            onClick={() => setQrScanMode(true)}
                                                            sx={{ fontWeight: 'bold' }}
                                                        >
                                                            Scan QR
                                                        </Button>
                                                    </Stack>
                                                ) : (
                                                    <Stack spacing={2} alignItems="center">
                                                        <Typography variant="caption" color="text.secondary">
                                                            Merchant: <strong>HydroSync</strong>
                                                        </Typography>
                                                        
                                                        {/* QR Code Placeholder Graphic */}
                                                        <Box 
                                                            sx={{ 
                                                                width: 150, 
                                                                height: 150, 
                                                                border: '3px solid #1976d2', 
                                                                borderRadius: 2, 
                                                                p: 1,
                                                                bgcolor: '#ffffff'
                                                            }}
                                                        >
                                                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0.8, height: '100%' }}>
                                                                {[...Array(16)].map((_, i) => (
                                                                    <Box 
                                                                        key={i} 
                                                                        sx={{ 
                                                                            bgcolor: (i === 0 || i === 3 || i === 12 || i === 15 || i === 5 || i === 10 || i === 9 || i === 6) ? '#0b1d33' : '#e0e0e0',
                                                                            borderRadius: 0.5
                                                                        }} 
                                                                    />
                                                                ))}
                                                            </Box>
                                                        </Box>

                                                        <Typography variant="body2" fontWeight="bold" color="text.primary">
                                                            Waiting for payment...
                                                        </Typography>
                                                    </Stack>
                                                )}
                                            </Box>
                                        )}

                                        {(tab === "netbanking" || tab === "wallet") && (
                                            <Box sx={{ py: 3, textAlign: 'center' }}>
                                                <Typography variant="body2" color="text.secondary" fontWeight="bold">
                                                    Coming Soon (Demo)
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                                    Please use Card, UPI, or QR for this demonstration.
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Fade>
                            </DialogContent>

                            <DialogActions sx={{ p: 3, pt: 1, flexDirection: 'column', gap: 1.5 }}>
                                {tab === "qr" && qrScanMode ? (
                                    <Button 
                                        variant="contained" 
                                        color="success" 
                                        fullWidth
                                        sx={{ py: 1.2, fontWeight: 'bold' }}
                                        onClick={triggerVerificationFlow}
                                    >
                                        Simulate Payment Success
                                    </Button>
                                ) : (
                                    <Button 
                                        variant="contained" 
                                        color="primary" 
                                        disabled={tab === 'netbanking' || tab === 'wallet'}
                                        fullWidth
                                        sx={{ py: 1.2, fontWeight: 'bold' }}
                                        onClick={handlePay}
                                    >
                                        Pay {formattedAmount}
                                    </Button>
                                )}
                                <Button 
                                    variant="text" 
                                    color="secondary" 
                                    fullWidth
                                    onClick={onClose}
                                >
                                    Cancel Payment
                                </Button>
                            </DialogActions>
                        </>
                    ) : (
                        <>
                            <DialogContent sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    Enter OTP
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    Please enter the demo OTP `123456` to complete payment.
                                </Typography>
                                <TextField 
                                    placeholder="123456"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    variant="outlined"
                                    size="small"
                                    sx={{ width: 150, mx: 'auto', display: 'block', input: { textAlign: 'center', letterSpacing: 4, fontWeight: 'bold' } }}
                                    inputProps={{ maxLength: 6 }}
                                />
                            </DialogContent>
                            <DialogActions sx={{ p: 3, pt: 1, flexDirection: 'column', gap: 1.5 }}>
                                <Button 
                                    variant="contained" 
                                    color="success" 
                                    fullWidth
                                    sx={{ py: 1.2, fontWeight: 'bold' }}
                                    onClick={handleOtpSubmit}
                                >
                                    Submit OTP
                                </Button>
                                <Button 
                                    variant="text" 
                                    color="secondary" 
                                    fullWidth
                                    onClick={onClose}
                                >
                                    Cancel
                                </Button>
                            </DialogActions>
                        </>
                    )}
                </>
            ) : (
                <Box sx={{ py: 8, px: 3, textAlign: 'center' }}>
                    <CircularProgress size={48} sx={{ mb: 3 }} />
                    <Typography variant="h6" fontWeight="bold">
                        {loadingState === "processing" ? "Processing Payment..." : "Verifying Payment..."}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                        {loadingState === "processing" ? "Communicating with Gateway..." : "Updating Bill & Generating Receipt..."}
                    </Typography>
                </Box>
            )}

            {/* Secure Badge Footer */}
            <Box sx={{ bgcolor: '#f4f6f8', py: 1.5, textAlign: 'center', borderTop: '1px solid', borderColor: '#e0e0e0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    🔒 Secure Payment Gateway | Secured by Razorpay
                </Typography>
            </Box>
        </Dialog>
    );
}
