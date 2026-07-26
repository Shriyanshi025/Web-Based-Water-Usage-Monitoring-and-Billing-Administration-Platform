import React from "react";
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
import PrintIcon from "@mui/icons-material/Print";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ShieldIcon from "@mui/icons-material/Shield";
import { formatCurrency } from "../../helpers/numberHelper";

export default function PaymentReceiptModal({ open, onClose, details }) {
    if (!details) return null;

    const handlePrint = () => {
        window.print();
    };

    const formattedAmount = formatCurrency(details.amount || 0);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={false}
            PaperProps={{
                sx: {
                    width: { xs: "100%", sm: 500 },
                    maxWidth: "100%",
                    borderRadius: { xs: 0, sm: "16px" },
                    overflow: "hidden",
                    m: { xs: 0, sm: 2 },
                    boxShadow: "0 24px 48px rgba(0,0,0,0.18)",
                    "@media print": {
                        boxShadow: "none",
                        m: 0,
                        width: "100%",
                    }
                }
            }}
        >
            {/* Header Strip */}
            <Box sx={{
                bgcolor: "#0F172A",
                color: "white",
                px: 3.5,
                py: 3,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{
                        width: 36, height: 36,
                        borderRadius: "8px",
                        bgcolor: "#0EA5E9",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <WaterDropIcon sx={{ color: "white", fontSize: "1.2rem" }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: "1.05rem", lineHeight: 1.1 }}>
                            HydroSync
                        </Typography>
                        <Typography sx={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em" }}>
                            OFFICIAL PAYMENT RECEIPT
                        </Typography>
                    </Box>
                </Stack>
                <Chip
                    icon={<CheckCircleIcon sx={{ fontSize: "0.9rem !important", color: "#10B981 !important" }} />}
                    label="PAID"
                    size="small"
                    sx={{
                        bgcolor: "rgba(16,185,129,0.15)",
                        color: "#10B981",
                        border: "1px solid rgba(16,185,129,0.3)",
                        fontWeight: 700,
                        fontSize: "0.7rem",
                    }}
                />
            </Box>

            <DialogContent sx={{ p: 3.5 }}>
                {/* Amount Highlight */}
                <Box sx={{
                    textAlign: "center",
                    p: 2.5,
                    bgcolor: "#F8FAFC",
                    borderRadius: 2,
                    border: "1px solid #E2E8F0",
                    mb: 3,
                }}>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, letterSpacing: "0.08em", display: "block", mb: 0.5 }}>
                        AMOUNT PAID
                    </Typography>
                    <Typography sx={{
                        fontSize: "2.25rem",
                        fontWeight: 700,
                        color: "#0F172A",
                        fontVariantNumeric: "tabular-nums",
                        lineHeight: 1,
                    }}>
                        {formattedAmount}
                    </Typography>
                </Box>

                {/* Details Table */}
                <Stack spacing={1.75}>
                    {[
                        { label: "Payment ID",       value: details.transactionId || details.payId || "pay_0000000000", mono: true },
                        { label: "Invoice Number",  value: details.billNumber || details.invoiceNumber || "—" },
                        { label: "Household / Flat", value: details.householdId || details.flatNumber || "—" },
                        { label: "Resident Name",   value: details.residentName || "Resident" },
                        { label: "Billing Cycle",   value: details.billingCycle || "Current Cycle" },
                        { label: "Payment Method",  value: details.paymentMethod || "UPI / Card" },
                        { label: "Date & Time",     value: details.paymentDate || new Date().toLocaleString("en-IN") },
                        { label: "Payment Status",  value: "SUCCESS", color: "#10B981", bold: true },
                    ].map((row, idx) => (
                        <Stack key={idx} direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="body2" sx={{ color: "#64748B", fontSize: "0.85rem" }}>
                                {row.label}
                            </Typography>
                            <Typography variant="body2" sx={{
                                color: row.color || "#0F172A",
                                fontWeight: row.bold ? 700 : 600,
                                fontSize: "0.85rem",
                                ...(row.mono ? { fontFamily: "monospace", fontSize: "0.8rem" } : {}),
                            }}>
                                {row.value}
                            </Typography>
                        </Stack>
                    ))}
                </Stack>

                <Divider sx={{ my: 3 }} />

                {/* Single subtle disclaimer footer */}
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "center", opacity: 0.7 }}>
                    <ShieldIcon sx={{ fontSize: "0.85rem", color: "#64748B" }} />
                    <Typography variant="caption" sx={{ color: "#64748B", fontSize: "0.72rem" }}>
                        Simulated transaction — no real payment was processed.
                    </Typography>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3.5, pb: 3, pt: 0, justifyContent: "space-between" }}>
                <Button
                    variant="outlined"
                    startIcon={<PrintIcon />}
                    onClick={handlePrint}
                    sx={{ textTransform: "none", fontWeight: 600 }}
                >
                    Print Receipt
                </Button>
                <Button
                    variant="contained"
                    startIcon={<CloseIcon />}
                    onClick={onClose}
                    sx={{ textTransform: "none", fontWeight: 600, bgcolor: "#0F172A", "&:hover": { bgcolor: "#1E293B" } }}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}
