import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, Button, Stack } from "@mui/material";
import { formatCurrency } from "../../helpers/numberHelper";

export default function QrPaymentDialog({ open, onClose, bill, onSimulateSuccess }) {
    const formattedAmount = bill 
        ? formatCurrency(bill.totalAmount !== undefined && bill.totalAmount !== null ? bill.totalAmount : (bill.amount || 0))
        : "₹0.00";

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}
        >
            <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                Scan QR to Pay
            </DialogTitle>
            <DialogContent sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Merchant: <strong>HydroSync</strong>
                </Typography>
                <Typography variant="h5" color="primary.main" fontWeight="bold" sx={{ mb: 3 }}>
                    {formattedAmount}
                </Typography>

                {/* QR Code Graphic */}
                <Box 
                    sx={{ 
                        width: 200, 
                        height: 200, 
                        mx: 'auto', 
                        mb: 3, 
                        border: '4px solid #1976d2', 
                        borderRadius: 2, 
                        p: 1.5,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        bgcolor: '#ffffff'
                    }}
                >
                    {/* A realistic looking QR Code layout using css grid */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, height: '100%' }}>
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
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                    Scan using any UPI App (BHIM, PhonePe, Google Pay, Paytm)
                </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 1, flexDirection: 'column', gap: 1.5 }}>
                <Button 
                    variant="contained" 
                    color="success" 
                    fullWidth
                    sx={{ py: 1.2, fontWeight: 'bold' }}
                    onClick={onSimulateSuccess}
                >
                    Simulate Payment Success
                </Button>
                <Button 
                    variant="outlined" 
                    color="secondary" 
                    fullWidth
                    onClick={onClose}
                >
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
}
