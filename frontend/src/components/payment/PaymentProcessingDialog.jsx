import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, Box, CircularProgress, Typography, Stack } from "@mui/material";

export default function PaymentProcessingDialog({ open, state }) {
    const [stepText, setStepText] = useState("Processing Payment...");

    useEffect(() => {
        if (state === "processing") {
            setStepText("Processing Payment...");
            const t1 = setTimeout(() => setStepText("Communicating with Gateway..."), 700);
            return () => clearTimeout(t1);
        } else if (state === "verifying") {
            setStepText("Verifying Payment...");
            const t2 = setTimeout(() => setStepText("Updating Bill..."), 600);
            const t3 = setTimeout(() => setStepText("Generating Receipt..."), 1200);
            return () => {
                clearTimeout(t2);
                clearTimeout(t3);
            };
        }
    }, [state]);

    return (
        <Dialog 
            open={open}
            maxWidth="xs"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
        >
            <DialogContent sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={56} sx={{ mb: 3 }} />
                <Stack spacing={1}>
                    <Typography variant="h6" fontWeight="bold">
                        {stepText}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Please do not refresh or close this window.
                    </Typography>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}
