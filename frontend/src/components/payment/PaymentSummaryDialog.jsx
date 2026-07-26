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
import LockIcon from "@mui/icons-material/Lock";
import ShieldIcon from "@mui/icons-material/Shield";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { formatCurrency } from "../../helpers/numberHelper";
import BillBreakdownSection from "../billing/BillBreakdownSection";

export default function PaymentSummaryDialog({ open, onClose, bill, profile, onProceed }) {
    const amount = bill
        ? (bill.totalAmount !== undefined && bill.totalAmount !== null ? bill.totalAmount : (bill.amount || 0))
        : 0;

    const formattedAmount = formatCurrency(amount);

    const billMonth = bill?.billingMonth && bill?.billingYear
        ? new Date(bill.billingYear, bill.billingMonth - 1).toLocaleString("default", { month: "long", year: "numeric" })
        : (bill?.billingCycleName || "—");

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={false}
            PaperProps={{
                sx: {
                    width: { xs: "100%", sm: 460 },
                    maxWidth: "100%",
                    maxHeight: { xs: "100vh", sm: "90vh" },
                    borderRadius: { xs: 0, sm: "16px" },
                    overflow: "hidden",
                    m: { xs: 0, sm: 2 },
                    boxShadow: "0 24px 48px rgba(0,0,0,0.18)",
                    display: "flex",
                    flexDirection: "column",
                }
            }}
            TransitionProps={{ timeout: 200 }}
        >
            {/* Header */}
            <Box sx={{
                bgcolor: "#0F172A",
                color: "white",
                px: 3, pt: 3, pb: 2.5,
                textAlign: "center",
                flexShrink: 0,
            }}>
                <Box sx={{
                    width: 44, height: 44,
                    borderRadius: "12px",
                    bgcolor: "#0EA5E9",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    mx: "auto", mb: 1.5,
                }}>
                    <WaterDropIcon sx={{ fontSize: "1.3rem", color: "white" }} />
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "white", mb: 0.3 }}>
                    HydroSync Checkout
                </Typography>
                <Typography sx={{ fontSize: "0.68rem", color: "#94A3B8" }}>
                    REVIEW PAYMENT SUMMARY
                </Typography>

                <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 2 }} />

                <Typography sx={{ fontSize: "0.6rem", color: "#94A3B8", letterSpacing: "0.08em", mb: 0.5, fontWeight: 600 }}>
                    TOTAL AMOUNT DUE
                </Typography>
                <Typography sx={{ fontSize: "2rem", fontWeight: 700, fontVariantNumeric: "tabular-nums", color: "white", lineHeight: 1 }}>
                    {formattedAmount}
                </Typography>
            </Box>

            <DialogContent sx={{ p: 0, flex: "1 1 auto", overflowY: "auto" }}>
                <Box sx={{ px: 3, pt: 2.5, pb: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", letterSpacing: "0.06em", display: "block", mb: 1.5 }}>
                        BILLING INFORMATION
                    </Typography>

                    <Stack spacing={1.2}>
                        {[
                            { label: "Invoice Number", value: bill?.billNumber || `INV-${bill?.id}` },
                            { label: "Billing Cycle",  value: billMonth },
                            { label: "Resident Name",  value: profile?.fullName || "Resident" },
                            { label: "Household / Flat", value: profile?.flatNumber || profile?.householdId || "—" },
                            { label: "Due Date",       value: bill?.dueDate || "—" },
                        ].map(row => (
                            <Stack key={row.label} direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                                <Typography variant="caption" color="text.secondary">{row.label}</Typography>
                                <Typography variant="body2" fontWeight={600} color="#0F172A">{row.value}</Typography>
                            </Stack>
                        ))}
                    </Stack>
                </Box>

                <Divider />

                <Box sx={{ px: 3, py: 2 }}>
                    <BillBreakdownSection bill={bill} defaultExpanded={false} />
                </Box>

                <Divider />

                <Stack direction="row" spacing={1} sx={{ justifyContent: "center", alignItems: "center", py: 1.5, opacity: 0.7 }}>
                    <ShieldIcon sx={{ fontSize: "0.82rem", color: "#64748B" }} />
                    <Typography variant="caption" sx={{ fontSize: "0.72rem", color: "#64748B" }}>
                        256-bit SSL Encrypted Payment Gateway
                    </Typography>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, pt: 1, flexDirection: "column", gap: 1 }}>
                <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={onProceed}
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                        py: 1.2, fontWeight: 700, borderRadius: 2,
                        bgcolor: "#4F46E5", "&:hover": { bgcolor: "#4338CA" },
                        textTransform: "none", fontSize: "0.95rem"
                    }}
                >
                    Proceed to Pay {formattedAmount}
                </Button>
                <Button
                    variant="text"
                    color="inherit"
                    fullWidth
                    sx={{ color: "text.secondary", fontSize: "0.8rem", textTransform: "none" }}
                    onClick={onClose}
                >
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
}
