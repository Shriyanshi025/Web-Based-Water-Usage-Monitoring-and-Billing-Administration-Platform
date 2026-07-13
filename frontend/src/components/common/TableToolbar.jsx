import React, { useState } from "react";
import { Toolbar, Typography, Box, Stack, Button, IconButton, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import SearchBar from "./SearchBar";

/**
 * Reusable TableToolbar component for DataGrids or tables
 * @param {Object} props
 * @param {string} props.title
 * @param {React.ReactNode} [props.action]
 * @param {function} [props.onSearch]
 * @param {string} [props.searchPlaceholder]
 * @param {function} [props.onAdd]
 * @param {string} [props.addLabel]
 * @param {Array} [props.filterOptions]
 * @param {function} [props.onFilter]
 * @param {function} [props.onExport]
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
    onExport
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
        <Toolbar
            sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                py: 1
            }}
        >
            <Typography
                sx={{ flex: '1 1 auto', fontWeight: 600, minWidth: '150px' }}
                variant="h6"
                id="tableTitle"
                component="div"
            >
                {title}
            </Typography>

            {action ? (
                <Box sx={{ flexShrink: 0 }}>{action}</Box>
            ) : (
                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" sx={{ ml: 'auto' }}>
                    {onSearch && (
                        <SearchBar 
                            value={searchValue}
                            onChange={handleSearchChange}
                            placeholder={searchPlaceholder}
                            onClear={handleSearchClear}
                            sx={{ width: { xs: '100%', sm: 250, md: 300 } }}
                        />
                    )}
                    
                    {filterOptions && filterOptions.length > 0 && (
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel id="filter-label">Filter</InputLabel>
                            <Select
                                labelId="filter-label"
                                value={filterValue}
                                label="Filter"
                                onChange={handleFilterChange}
                            >
                                <MenuItem value=""><em>None</em></MenuItem>
                                {filterOptions.map((opt, i) => (
                                    <MenuItem key={i} value={opt.value}>{opt.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}

                    {onExport && (
                        <Button 
                            variant="outlined" 
                            startIcon={<FileDownloadIcon />}
                            onClick={onExport}
                            size="small"
                        >
                            Export
                        </Button>
                    )}

                    {onAdd && (
                        <Button 
                            variant="contained" 
                            startIcon={<AddIcon />}
                            onClick={onAdd}
                            size="small"
                        >
                            {addLabel}
                        </Button>
                    )}
                </Stack>
            )}
        </Toolbar>
    );
};

export default React.memo(TableToolbar);
