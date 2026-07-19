import React from "react";
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Grid, 
    Typography, 
    Chip, 
    Box, 
    Button 
} from "@mui/material";
import { formatCurrency } from "../../helpers/numberHelper";

export default function PaymentSummaryDialog({ open, onClose, bill, profile, onProceed }) {
    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 2 } }}
        >
            <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid', borderColor: 'divider' }}>
                Payment Summary
            </DialogTitle>
            <DialogContent dividers>
                {bill && (
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary" display="block">Bill Number</Typography>
                            <Typography variant="body2" fontWeight="bold">{bill.billNumber || `BILL-${bill.id}`}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary" display="block">Billing Cycle</Typography>
                            <Typography variant="body2" fontWeight="bold">{bill.billingCycle?.cycleName || bill.billingMonth || "N/A"}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary" display="block">Resident Name</Typography>
                            <Typography variant="body2">{profile?.fullName || "Resident"}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary" display="block">Community</Typography>
                            <Typography variant="body2">{profile?.community?.communityName || "Community"}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary" display="block">Amount</Typography>
                            <Typography variant="body2" fontWeight="bold" color="primary.main">
                                {formatCurrency(bill.totalAmount !== undefined && bill.totalAmount !== null ? bill.totalAmount : (bill.amount || 0))}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary" display="block">Due Date</Typography>
                            <Typography variant="body2">{bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : "N/A"}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary" display="block">Payment Gateway</Typography>
                            <Typography variant="body2" fontWeight="bold" color="secondary.main">Razorpay Test Mode</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary" display="block">Payment Status</Typography>
                            <Chip label="PENDING" color="warning" size="small" variant="outlined" />
                        </Grid>

                        <Grid item xs={12} sx={{ mt: 1 }}>
                            <Box sx={{ p: 2, bgcolor: '#f4f6f8', border: '1px solid', borderColor: '#e0e0e0', borderRadius: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center', gap: 1, color: '#0288d1' }}>
                                    <span>ℹ️</span> Demo Test Credentials
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Use these credentials in the checkout form to mock a successful payment:
                                </Typography>
                                <Grid container spacing={1} sx={{ mt: 0.5 }}>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary" display="block">Demo UPI</Typography>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>success@razorpay</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary" display="block">Demo Card</Typography>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>4111 1111 1111 1111</Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography variant="caption" color="text.secondary" display="block">Expiry</Typography>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>12/30</Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography variant="caption" color="text.secondary" display="block">CVV</Typography>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>123</Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography variant="caption" color="text.secondary" display="block">OTP</Typography>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>123456</Typography>
                                    </Grid>
                                </Grid>
                                <Typography variant="caption" color="error.main" display="block" sx={{ mt: 1.5, fontWeight: 'bold' }}>
                                    This is a Demo Payment. No real money will be deducted.
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button variant="contained" color="primary" onClick={onProceed}>
                    Proceed to Payment
                </Button>
                <Button variant="outlined" color="secondary" onClick={onClose}>
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
}
