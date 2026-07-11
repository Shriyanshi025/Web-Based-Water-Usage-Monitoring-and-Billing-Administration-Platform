import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Slide
} from "@mui/material";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

/**
 * Reusable ConfirmationDialog component
 * @param {Object} props
 * @param {boolean} props.open
 * @param {function} props.onClose
 * @param {function} props.onConfirm
 * @param {string} props.title
 * @param {string} props.message
 * @param {string} [props.confirmText="Confirm"]
 * @param {string} [props.cancelText="Cancel"]
 * @param {string} [props.color="primary"]
 */
const ConfirmationDialog = ({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    color = "primary"
}) => {
    return (
        <Dialog
            open={open}
            TransitionComponent={Transition}
            keepMounted
            onClose={onClose}
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    p: 1,
                    minWidth: 400
                }
            }}
        >
            <DialogTitle sx={{ fontWeight: 600 }}>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText color="text.secondary">
                    {message}
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} color="inherit" sx={{ textTransform: "none", fontWeight: 600 }}>
                    {cancelText}
                </Button>
                <Button 
                    onClick={onConfirm} 
                    color={color} 
                    variant="contained"
                    sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
                >
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default React.memo(ConfirmationDialog);
