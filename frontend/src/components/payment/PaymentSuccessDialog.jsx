import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    Button,
    Divider,
    Stack,
    Chip,
} from "@mui/material";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import CheckIcon from "@mui/icons-material/Check";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShieldIcon from "@mui/icons-material/Shield";
import { formatCurrency } from "../../helpers/numberHelper";
import PaymentReceiptModal from "./PaymentReceiptModal";

const KEYFRAMES = `
@keyframes checkmark-stroke {
    0%   { stroke-dashoffset: 48; }
    100% { stroke-dashoffset: 0; }
}
@keyframes fade-in-up {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
}
`;

export default function PaymentSuccessDialog({
    open,
    onClose,
    details,
    onViewHistory,
}) {
    const [receiptOpen, setReceiptOpen] = useState(false);

    if (!details) return null;

    const formattedAmount = formatCurrency(details.amount || 0);

    return (
        <>
            <style>{KEYFRAMES}</style>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth={false}
                PaperProps={{
                    sx: {
                        width: { xs: "100%", sm: 460 },
                        maxWidth: "100%",
                        borderRadius: { xs: 0, sm: "16px" },
                        overflow: "hidden",
                        m: { xs: 0, sm: 2 },
                        boxShadow: "0 24px 48px rgba(0,0,0,0.18)",
                    }
                }}
                TransitionProps={{ timeout: 200 }}
            >
                <DialogContent sx={{ p: 4, textAlign: "center" }}>
                    
                    {/* Understated Single-Stroke Draw-In Checkmark */}
                    <Box sx={{
                        width: 56, height: 56,
                        borderRadius: "50%",
                        bgcolor: "#F0FDF4",
                        border: "2px solid #10B981",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        mx: "auto", mb: 2,
                    }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline
                                points="20 6 9 17 4 12"
                                style={{
                                    strokeDasharray: 48,
                                    strokeDashoffset: 48,
                                    animation: "checkmark-stroke 0.4s ease-out forwards 0.1s"
                                }}
                            />
                        </svg>
                    </Box>

                    <Typography variant="h6" fontWeight={700} sx={{ color: "#0F172A", mb: 0.5, letterSpacing: "-0.3px" }}>
                        Payment Completed Successfully
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontSize: "0.82rem" }}>
                        Your water bill status has been updated to Paid.
                    </Typography>

                    {/* Receipt-Style Summary Card */}
                    <Box sx={{
                        bgcolor: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        borderRadius: 3,
                        p: 2.5,
                        textAlign: "left",
                        mb: 3,
                        animation: "fade-in-up 0.3s ease-out"
                    }}>
                        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                            <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700, letterSpacing: "0.06em" }}>
                                TRANSACTION RECEIPT
                            </Typography>
                            <Chip label="PAID" size="small" sx={{ bgcolor: "#DCFCE7", color: "#166534", fontWeight: 700, fontSize: "0.65rem", height: 20 }} />
                        </Stack>

                        <Stack spacing={1.2}>
                            <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                                <Typography variant="caption" color="text.secondary">Amount Paid</Typography>
                                <Typography variant="body2" fontWeight={700} sx={{ fontVariantNumeric: "tabular-nums", color: "#0F172A" }}>
                                    {formattedAmount}
                                </Typography>
                            </Stack>

                            <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                                <Typography variant="caption" color="text.secondary">Payment ID</Typography>
                                <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.78rem", fontWeight: 600, color: "#0F172A" }}>
                                    {details.transactionId || details.payId || "pay_0000000000"}
                                </Typography>
                            </Stack>

                            <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                                <Typography variant="caption" color="text.secondary">Invoice Number</Typography>
                                <Typography variant="body2" fontWeight={600} color="#0F172A">
                                    {details.billNumber || "—"}
                                </Typography>
                            </Stack>

                            <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                                <Typography variant="caption" color="text.secondary">Payment Method</Typography>
                                <Typography variant="body2" fontWeight={500} color="#0F172A">
                                    {details.paymentMethod || "UPI / Card"}
                                </Typography>
                            </Stack>

                            <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                                <Typography variant="caption" color="text.secondary">Date & Time</Typography>
                                <Typography variant="body2" fontWeight={500} color="#0F172A">
                                    {details.paymentDate || new Date().toLocaleString("en-IN")}
                                </Typography>
                            </Stack>
                        </Stack>
                    </Box>

                    {/* Security Microcopy */}
                    <Stack direction="row" spacing={0.8} sx={{ justifyContent: "center", alignItems: "center", color: "#64748B", opacity: 0.8 }}>
                        <ShieldIcon sx={{ fontSize: "0.82rem" }} />
                        <Typography variant="caption" sx={{ fontSize: "0.72rem" }}>
                            Transaction recorded securely by HydroSync
                        </Typography>
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ px: 4, pb: 4, pt: 0, flexDirection: "column", gap: 1 }}>
                    <Stack direction="row" spacing={1.5} width="100%">
                        <Button
                            variant="outlined"
                            fullWidth
                            startIcon={<FileDownloadIcon />}
                            onClick={() => setReceiptOpen(true)}
                            sx={{ textTransform: "none", py: 1 }}
                        >
                            Download Receipt
                        </Button>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={onClose}
                            sx={{ textTransform: "none", py: 1, bgcolor: "#0F172A", "&:hover": { bgcolor: "#1E293B" } }}
                        >
                            Back to Dashboard
                        </Button>
                    </Stack>
                </DialogActions>

                {/* Print/Download Receipt Modal */}
                <PaymentReceiptModal
                    open={receiptOpen}
                    onClose={() => setReceiptOpen(false)}
                    details={details}
                />
            </Dialog>
        </>
    );
}
