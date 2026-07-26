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
} from "@mui/material";
import ReplayIcon from "@mui/icons-material/Replay";
import CloseIcon from "@mui/icons-material/Close";
import ShieldIcon from "@mui/icons-material/Shield";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export default function PaymentFailureDialog({ open, onClose, bill, onRetry }) {
    if (!open) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={false}
            PaperProps={{
                sx: {
                    width: { xs: "100%", sm: 440 },
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
                
                {/* Understated Neutral Icon */}
                <Box sx={{
                    width: 52, height: 52,
                    borderRadius: "50%",
                    bgcolor: "#FFFBEB",
                    border: "2px solid #F59E0B",
                    color: "#D97706",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    mx: "auto", mb: 2,
                }}>
                    <InfoOutlinedIcon sx={{ fontSize: "1.6rem" }} />
                </Box>

                <Typography variant="h6" fontWeight={700} sx={{ color: "#0F172A", mb: 0.5, letterSpacing: "-0.3px" }}>
                    We Couldn't Process This Payment
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontSize: "0.82rem", maxWidth: 340, mx: "auto" }}>
                    Your bank or payment network could not complete the request. No money was deducted from your account.
                </Typography>

                {/* Common Reasons Card */}
                <Box sx={{
                    bgcolor: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: 2.5,
                    p: 2.5,
                    textAlign: "left",
                    mb: 3,
                }}>
                    <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700, letterSpacing: "0.06em", display: "block", mb: 1.5 }}>
                        COMMON REASONS FOR UNSUCCESSFUL PAYMENTS
                    </Typography>

                    <Stack spacing={1}>
                        {[
                            "Temporary bank server delay or timeout",
                            "Incorrect OTP or security code entered",
                            "Insufficient balance or daily transaction limit exceeded",
                        ].map((reason, idx) => (
                            <Stack key={idx} direction="row" spacing={1} alignItems="flex-start">
                                <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: "#94A3B8", mt: 0.95, flexShrink: 0 }} />
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.78rem" }}>
                                    {reason}
                                </Typography>
                            </Stack>
                        ))}
                    </Stack>
                </Box>

                {/* Security Note */}
                <Stack direction="row" spacing={0.8} sx={{ justifyContent: "center", alignItems: "center", color: "#64748B", opacity: 0.8 }}>
                    <ShieldIcon sx={{ fontSize: "0.82rem" }} />
                    <Typography variant="caption" sx={{ fontSize: "0.72rem" }}>
                        Your payment information remains 100% secure
                    </Typography>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 4, pb: 4, pt: 0, flexDirection: "column", gap: 1 }}>
                <Button
                    variant="contained"
                    fullWidth
                    startIcon={<ReplayIcon />}
                    onClick={onRetry}
                    sx={{ textTransform: "none", py: 1.1, bgcolor: "#0F172A", "&:hover": { bgcolor: "#1E293B" }, fontWeight: 600 }}
                >
                    Try Again
                </Button>
                <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<CloseIcon />}
                    onClick={onClose}
                    sx={{ textTransform: "none", py: 1, color: "#64748B", borderColor: "#CBD5E1" }}
                >
                    Cancel & Return to Bills
                </Button>
            </DialogActions>
        </Dialog>
    );
}
