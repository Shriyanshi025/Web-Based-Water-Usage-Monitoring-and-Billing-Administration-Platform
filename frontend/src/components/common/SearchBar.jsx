import React from "react";
import { Paper, InputBase, IconButton, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

/**
 * Reusable SearchBar component.
 *
 * @param {Object}   props
 * @param {string}   props.value
 * @param {function} props.onChange
 * @param {string}   [props.placeholder="Search..."]
 * @param {function} [props.onClear]
 * @param {object}   [props.sx]
 */
const SearchBar = ({
    value,
    onChange,
    placeholder = "Search...",
    onClear,
    sx = {},
}) => {
    const theme = useTheme();

    return (
        <Paper
            elevation={0}
            sx={{
                display: "flex",
                alignItems: "center",
                width: 280,
                height: 36,
                px: 1,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "8px",
                bgcolor: "background.paper",
                transition: "border-color 180ms ease, box-shadow 180ms ease",
                "&:focus-within": {
                    borderColor: theme.palette.primary.main,
                    boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}`,
                },
                ...sx,
            }}
        >
            <SearchIcon
                sx={{
                    fontSize: "1rem",
                    color: "text.disabled",
                    mr: 0.75,
                    flexShrink: 0,
                }}
            />
            <InputBase
                sx={{
                    flex: 1,
                    fontSize: "0.8125rem",
                    color: "text.primary",
                    "& input::placeholder": {
                        color: "text.disabled",
                        opacity: 1,
                    },
                }}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                inputProps={{ "aria-label": placeholder }}
            />
            {value && onClear && (
                <IconButton
                    size="small"
                    aria-label="Clear search"
                    onClick={onClear}
                    sx={{
                        p: 0.25,
                        ml: 0.5,
                        color: "text.disabled",
                        borderRadius: "4px",
                        "&:hover": { color: "text.secondary", bgcolor: "action.hover" },
                    }}
                >
                    <ClearIcon sx={{ fontSize: "0.875rem" }} />
                </IconButton>
            )}
        </Paper>
    );
};

export default React.memo(SearchBar);
