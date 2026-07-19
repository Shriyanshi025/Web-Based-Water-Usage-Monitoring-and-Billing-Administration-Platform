import React from "react";
import { Box, Typography, Stack } from "@mui/material";

/**
 * Reusable SectionHeader — sub-section titles within a page or card.
 *
 * @param {Object}           props
 * @param {string}           props.title  - Section title
 * @param {React.ReactNode}  [props.action] - Optional right-side action
 */
const SectionHeader = ({ title, action }) => {
    return (
        <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
                mb: 1.5,
                pb: 1.25,
                borderBottom: "1px solid",
                borderColor: "divider",
            }}
        >
            <Typography
                variant="subtitle1"
                sx={{
                    fontWeight: 600,
                    fontSize: "0.9375rem",
                    color: "text.primary",
                    lineHeight: 1.4,
                }}
            >
                {title}
            </Typography>
            {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
        </Stack>
    );
};

export default React.memo(SectionHeader);
