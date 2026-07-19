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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import SearchBar from "./SearchBar";

/**
 * Reusable TableToolbar — sits above DataGrid / table panels.
 *
 * @param {Object}           props
 * @param {string}           [props.title]             - Section title on the left
 * @param {React.ReactNode}  [props.action]            - Fully custom right-side slot (overrides built-ins)
 * @param {function}         [props.onSearch]
 * @param {string}           [props.searchPlaceholder="Search..."]
 * @param {function}         [props.onAdd]
 * @param {string}           [props.addLabel="Add"]
 * @param {Array}            [props.filterOptions]      - [{label, value}]
 * @param {function}         [props.onFilter]
 * @param {function}         [props.onExport]
 */
const TableToolbar = ({
    title,
    action,
    onSearch,
    searchPlaceholder = "Search...",
    onAdd,
    addLabel = "Add",
    filterOptions,
    onFilter,
    onExport,
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
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1.5,
                px: 2,
                py: 1.25,
                minHeight: 56,
                borderBottom: "1px solid",
                borderColor: "divider",
            }}
        >
            {/* ── Title ── */}
            {title && (
                <Typography
                    id="tableTitle"
                    component="div"
                    sx={{
                        flex: "1 1 auto",
                        fontWeight: 600,
                        fontSize: "0.9375rem",
                        color: "text.primary",
                        lineHeight: 1.4,
                        minWidth: 120,
                        whiteSpace: "nowrap",
                    }}
                >
                    {title}
                </Typography>
            )}

            {/* ── Right side: custom action OR built-in controls ── */}
            {action ? (
                <Box sx={{ ml: "auto", flexShrink: 0 }}>{action}</Box>
            ) : (
                <Stack
                    direction="row"
                    spacing={1.25}
                    alignItems="center"
                    flexWrap="wrap"
                    sx={{ ml: title ? "auto" : 0 }}
                >
                    {/* Search */}
                    {onSearch && (
                        <SearchBar
                            value={searchValue}
                            onChange={handleSearchChange}
                            placeholder={searchPlaceholder}
                            onClear={handleSearchClear}
                            sx={{ width: { xs: "100%", sm: 240 } }}
                        />
                    )}

                    {/* Filter dropdown */}
                    {filterOptions && filterOptions.length > 0 && (
                        <FormControl size="small" sx={{ minWidth: 140 }}>
                            <InputLabel id="toolbar-filter-label">Filter</InputLabel>
                            <Select
                                labelId="toolbar-filter-label"
                                value={filterValue}
                                label="Filter"
                                onChange={handleFilterChange}
                            >
                                <MenuItem value="">
                                    <em>All</em>
                                </MenuItem>
                                {filterOptions.map((opt, i) => (
                                    <MenuItem key={i} value={opt.value}>
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
                            startIcon={<FileDownloadIcon sx={{ fontSize: "1rem" }} />}
                            onClick={onExport}
                            size="small"
                        >
                            Export
                        </Button>
                    )}

                    {/* Add */}
                    {onAdd && (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon sx={{ fontSize: "1rem" }} />}
                            onClick={onAdd}
                            size="small"
                        >
                            {addLabel}
                        </Button>
                    )}
                </Stack>
            )}
        </Box>
    );
};

export default React.memo(TableToolbar);
