import React from "react";
import { Button } from "@mui/material";

/**
 * Reusable ActionButton component with standard premium styling
 * @param {Object} props
 * @param {string} [props.variant="contained"]
 * @param {string} [props.color="primary"]
 * @param {React.ReactNode} props.children
 * @param {object} [props.sx]
 */
const ActionButton = ({ variant = "contained", color = "primary", children, sx = {}, ...rest }) => {
    return (
        <Button
            variant={variant}
            color={color}
            sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 600,
                boxShadow: variant === "contained" ? "0 4px 12px rgba(0,0,0,0.1)" : "none",
                "&:hover": {
                    boxShadow: variant === "contained" ? "0 6px 16px rgba(0,0,0,0.15)" : "none",
                    transform: "translateY(-1px)",
                },
                transition: "all 0.2s ease-in-out",
                ...sx,
            }}
            {...rest}
        >
            {children}
        </Button>
    );
};

export default React.memo(ActionButton);
