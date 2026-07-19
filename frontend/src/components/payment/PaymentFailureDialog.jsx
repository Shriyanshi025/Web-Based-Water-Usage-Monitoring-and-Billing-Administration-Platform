import React from "react";
import { Dialog, DialogContent, DialogActions, Box, Typography, Button, Stack } from "@mui/material";

export default function PaymentFailureDialog({ open, onClose, onRetry, bill }) {
    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}
        >
            <DialogContent sx={{ p: 4, textAlign: 'center' }}>
                {/* Failure Icon */}
                <Box 
                    sx={{ 
                        width: 72, 
                        height: 72, 
                        borderRadius: '50%', 
                        bgcolor: 'error.light', 
                        color: 'error.main',
                        mx: 'auto', 
                        mb: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        border: '4px solid',
                        borderColor: 'error.main'
                    }}
                >
                    ❌
                </Box>
                
                <Typography variant="h5" fontWeight="bold" color="error.main" gutterBottom>
                    Payment Failed
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Your payment could not be completed.
                </Typography>

                <Box sx={{ p: 2, bgcolor: '#fdf3f3', border: '1px solid', borderColor: '#fcd3d3', borderRadius: 2, textAlign: 'left' }}>
                    <Typography variant="caption" color="error.main" fontWeight="bold" display="block" gutterBottom>
                        Possible reasons:
                    </Typography>
                    <Typography variant="body2" color="text.secondary" component="ul" sx={{ pl: 2, m: 0 }}>
                        <li>Incorrect card details or UPI ID</li>
                        <li>Incorrect OTP verification code</li>
                        <li>Payment request cancelled or timed out</li>
                        <li>Temporary network issues or bank downtime</li>
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 1, flexDirection: 'column', gap: 1.5 }}>
                <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                    sx={{ py: 1.2, fontWeight: 'bold' }}
                    onClick={onRetry}
                >
                    Retry Payment
                </Button>
                <Button 
                    variant="outlined" 
                    color="secondary" 
                    fullWidth
                    onClick={onClose}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}
