import React from "react";
import { Dialog, DialogContent, DialogActions, Box, Typography, Button, Grid, Divider } from "@mui/material";
import { formatCurrency } from "../../helpers/numberHelper";

export default function PaymentSuccessDialog({ open, onClose, details, onDownloadInvoice, onViewHistory }) {
    if (!details) return null;

    const formattedAmount = formatCurrency(details.amount);

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}
        >
            <DialogContent sx={{ p: 4, textAlign: 'center' }}>
                {/* Success Icon */}
                <Box 
                    sx={{ 
                        width: 72, 
                        height: 72, 
                        borderRadius: '50%', 
                        bgcolor: 'success.light', 
                        color: 'success.main',
                        mx: 'auto', 
                        mb: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        border: '4px solid',
                        borderColor: 'success.main'
                    }}
                >
                    ✔
                </Box>
                
                <Typography variant="h5" fontWeight="bold" color="success.main" gutterBottom>
                    Payment Successful
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Your water utility bill payment has been successfully processed and verified.
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2} sx={{ textAlign: 'left', mt: 1 }}>
                    <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" display="block">Merchant</Typography>
                        <Typography variant="body2" fontWeight="bold">HydroSync</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" display="block">Bill Number</Typography>
                        <Typography variant="body2" fontWeight="bold">{details.billNumber}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" display="block">Amount Paid</Typography>
                        <Typography variant="body2" fontWeight="bold" color="primary.main">{formattedAmount}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" display="block">Gateway</Typography>
                        <Typography variant="body2">Razorpay Demo</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" display="block">Transaction ID</Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{details.transactionId}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" display="block">Payment Date</Typography>
                        <Typography variant="body2">{details.paymentDate || new Date().toLocaleString()}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" display="block">Payment Method</Typography>
                        <Typography variant="body2" fontWeight="bold">{details.paymentMethod || "UPI"}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" display="block">Status</Typography>
                        <Typography variant="body2" fontWeight="bold" color="success.main">PAID</Typography>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 4, pb: 4, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 1.5 }}>
                <Button 
                    variant="outlined" 
                    onClick={() => {
                        if (onDownloadInvoice) onDownloadInvoice(details.billId);
                    }}
                >
                    Download Invoice
                </Button>
                <Button 
                    variant="outlined" 
                    onClick={() => window.print()}
                >
                    Print Receipt
                </Button>
                <Button 
                    variant="outlined" 
                    onClick={onViewHistory}
                >
                    View Payment History
                </Button>
                <Button 
                    variant="contained" 
                    color="primary"
                    onClick={onClose}
                >
                    Done
                </Button>
            </DialogActions>
        </Dialog>
    );
}
