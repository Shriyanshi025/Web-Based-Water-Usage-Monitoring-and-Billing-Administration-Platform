import React from "react";
import { Paper, InputBase, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

/**
 * Reusable SearchBar component
 * @param {Object} props
 * @param {string} props.value
 * @param {function} props.onChange
 * @param {string} [props.placeholder="Search..."]
 * @param {function} [props.onClear]
 * @param {object} [props.sx]
 */
const SearchBar = ({ value, onChange, placeholder = "Search...", onClear, sx = {} }) => {
    return (
        <Paper
            elevation={0}
            sx={{
                p: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                width: 300,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                transition: "all 0.2s ease",
                "&:focus-within": {
                    borderColor: "primary.main",
                    boxShadow: "0 0 0 3px rgba(25, 118, 210, 0.1)"
                },
                ...sx
            }}
        >
            <IconButton sx={{ p: '10px' }} aria-label="search" disabled>
                <SearchIcon color="action" />
            </IconButton>
            <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                inputProps={{ 'aria-label': placeholder }}
            />
            {value && onClear && (
                <IconButton sx={{ p: '10px' }} aria-label="clear" onClick={onClear} size="small">
                    <ClearIcon fontSize="small" />
                </IconButton>
            )}
        </Paper>
    );
};

export default React.memo(SearchBar);
