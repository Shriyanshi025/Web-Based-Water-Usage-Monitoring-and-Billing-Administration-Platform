import React, { useState } from "react";
import {
    Box,
    Typography,
    Stack,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import SearchBar from "./SearchBar";

/**
 * Reusable TableToolbar — sits above DataGrid / table panels.
 */
const TableToolbar = ({
    title,
    subtitle,
    action,
    onSearch,
    searchPlaceholder = "Search...",
    onAdd,
    addLabel = "Add",
    filterOptions,
    onFilter,
    onExport,
    count,
}) => {
    const [searchValue, setSearchValue] = useState("");
    const [filterValue, setFilterValue] = useState("");

    const handleSearchChange = (val) => {
        setSearchValue(val);
        if (onSearch) onSearch(val);
    };

    const handleSearchClear = () => {
        setSearchValue("");
        if (onSearch) onSearch("");
    };

    const handleFilterChange = (e) => {
        const val = e.target.value;
        setFilterValue(val);
        if (onFilter) onFilter(val);
    };

    return (
        <Box
            sx={{
                px: 2.5,
                py: 1.5,
                borderBottom: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
            }}
        >
            {/* ── Top row: title + controls ── */}
            <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
                spacing={1.25}
                flexWrap="wrap"
                minHeight={44}
            >
                {/* Title block */}
                {title && (
                    <Box sx={{ minWidth: 0 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography
                                component="div"
                                sx={{
                                    fontWeight: 600,
                                    fontSize: "0.9375rem",
                                    color: "text.primary",
                                    lineHeight: 1.4,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {title}
                            </Typography>
                            {count !== undefined && (
                                <Box
                                    sx={{
                                        px: 0.875,
                                        py: 0.125,
                                        borderRadius: "20px",
                                        bgcolor: "action.selected",
                                        minWidth: 22,
                                        textAlign: "center",
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontSize: "0.6875rem",
                                            fontWeight: 600,
                                            color: "text.secondary",
                                            lineHeight: 1.6,
                                        }}
                                    >
                                        {count}
                                    </Typography>
                                </Box>
                            )}
                        </Stack>
                        {subtitle && (
                            <Typography
                                sx={{
                                    fontSize: "0.75rem",
                                    color: "text.disabled",
                                    lineHeight: 1.3,
                                    mt: 0.25,
                                }}
                            >
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                )}

                {/* Right side: custom action OR built-in controls */}
                {action ? (
                    <Box sx={{ ml: { sm: "auto" }, flexShrink: 0 }}>{action}</Box>
                ) : (
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                            alignItems: "center",
                            flexWrap: "wrap",
                            ml: { sm: title ? "auto" : 0 },
                        }}
                    >
                        {/* Search */}
                        {onSearch && (
                            <SearchBar
                                value={searchValue}
                                onChange={handleSearchChange}
                                placeholder={searchPlaceholder}
                                onClear={handleSearchClear}
                                sx={{ width: { xs: "100%", sm: 220 } }}
                            />
                        )}

                        {/* Filter dropdown */}
                        {filterOptions && filterOptions.length > 0 && (
                            <FormControl size="small" sx={{ minWidth: 140 }}>
                                <InputLabel id="toolbar-filter-label" sx={{ fontSize: "0.8125rem" }}>
                                    Filter
                                </InputLabel>
                                <Select
                                    labelId="toolbar-filter-label"
                                    value={filterValue}
                                    label="Filter"
                                    onChange={handleFilterChange}
                                    sx={{ fontSize: "0.8125rem" }}
                                >
                                    <MenuItem value="">
                                        <em>All</em>
                                    </MenuItem>
                                    {filterOptions.map((opt, i) => (
                                        <MenuItem key={i} value={opt.value} sx={{ fontSize: "0.8125rem" }}>
                                            {opt.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {/* Export */}
                        {onExport && (
                            <Button
                                variant="outlined"
                                startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: "0.9375rem !important" }} />}
                                onClick={onExport}
                                size="small"
                                sx={{
                                    fontSize: "0.8125rem",
                                    fontWeight: 500,
                                    borderColor: "divider",
                                    color: "text.secondary",
                                    "&:hover": {
                                        borderColor: "text.secondary",
                                        bgcolor: "action.hover",
                                        color: "text.primary",
                                    },
                                    height: 34,
                                    px: 1.5,
                                }}
                            >
                                Export
                            </Button>
                        )}

                        {/* Add */}
                        {onAdd && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon sx={{ fontSize: "0.9375rem !important" }} />}
                                onClick={onAdd}
                                size="small"
                                sx={{
                                    fontSize: "0.8125rem",
                                    fontWeight: 600,
                                    height: 34,
                                    px: 1.75,
                                    boxShadow: "none",
                                    "&:hover": { boxShadow: "none" },
                                }}
                            >
                                {addLabel}
                            </Button>
                        )}
                    </Stack>
                )}
            </Stack>
        </Box>
    );
};

export default React.memo(TableToolbar);
