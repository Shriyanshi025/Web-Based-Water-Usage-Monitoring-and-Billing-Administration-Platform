import React, { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Divider,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    TablePagination,
    Typography,
    Chip
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import CalculateIcon from "@mui/icons-material/Calculate";

import DashboardLayout from "../../components/layout/DashboardLayout";
import PageSummaryHeader from "../../components/common/PageSummaryHeader";
import SearchBar from "../../components/common/SearchBar";
import CommunityOpsService from "../../services/CommunityOpsService";

function CostDistributionPage() {
    const [billingCycles, setBillingCycles] = useState([]);
    const [selectedCycleId, setSelectedCycleId] = useState("");
    const [distributionData, setDistributionData] = useState(null);
    const [loadingCycles, setLoadingCycles] = useState(true);
    const [loadingData, setLoadingData] = useState(false);
    const [error, setError] = useState(null);

    // Search, Sort, Pagination
    const [searchTerm, setSearchTerm] = useState("");
    const [orderBy, setOrderBy] = useState("residentName");
    const [order, setOrder] = useState("asc");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const fetchCycles = async () => {
        try {
            setLoadingCycles(true);
            setError(null);
            const res = await CommunityOpsService.getBillingCycles();
            const cycles = res?.data || [];
            setBillingCycles(cycles);
            if (cycles.length > 0) {
                const active = cycles.find((c) => c.active);
                setSelectedCycleId(active ? active.id : cycles[0].id);
            }
        } catch (err) {
            setError(err?.response?.data?.message || err.message || "Failed to load billing cycles.");
        } finally {
            setLoadingCycles(false);
        }
    };

    const fetchDistribution = async (cycleId) => {
        if (!cycleId) return;
        try {
            setLoadingData(true);
            setError(null);
            const res = await CommunityOpsService.getCostDistribution(cycleId);
            setDistributionData(res?.data || null);
        } catch (err) {
            setError(err?.response?.data?.message || err.message || "Failed to calculate cost distribution.");
            setDistributionData(null);
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        fetchCycles();
    }, []);

    useEffect(() => {
        if (selectedCycleId) {
            fetchDistribution(selectedCycleId);
        }
    }, [selectedCycleId]);

    const handleCycleChange = (e) => {
        setSelectedCycleId(e.target.value);
        setPage(0);
    };

    const handleRefresh = () => {
        fetchDistribution(selectedCycleId);
    };

    // Sorting/Filtering logic
    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    const distributions = distributionData?.distributions || [];

    const filteredRows = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return distributions.filter((d) => {
            const name = (d.residentName || "").toLowerCase();
            const unit = (d.unitNumber || "").toLowerCase();
            return name.includes(term) || unit.includes(term);
        });
    }, [distributions, searchTerm]);

    const sortedRows = useMemo(() => {
        return [...filteredRows].sort((a, b) => {
            const valA = a[orderBy];
            const valB = b[orderBy];

            if (typeof valA === "string") {
                return order === "asc"
                    ? valA.localeCompare(valB)
                    : valB.localeCompare(valA);
            } else {
                return order === "asc"
                    ? Number(valA || 0) - Number(valB || 0)
                    : Number(valB || 0) - Number(valA || 0);
            }
        });
    }, [filteredRows, orderBy, order]);

    const paginatedRows = useMemo(() => {
        const start = page * rowsPerPage;
        return sortedRows.slice(start, start + rowsPerPage);
    }, [sortedRows, page, rowsPerPage]);

    if (loadingCycles) {
        return (
            <DashboardLayout>
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "70vh" }}>
                    <CircularProgress />
                </Box>
            </DashboardLayout>
        );
    }

    const headerMetadata = useMemo(() => [
        { label: "Total Bulk Cost", value: distributionData ? `₹ ${distributionData.totalBulkCost?.toLocaleString()}` : "—", color: "primary" },
        { label: "Community Consumption", value: distributionData ? `${distributionData.totalCommunityConsumption?.toLocaleString()} kL` : "—", color: "warning" },
        { label: "Cost Per kL", value: distributionData ? `₹ ${distributionData.costPerKl?.toLocaleString()}` : "—", color: "success" },
    ], [distributionData]);

    return (
        <DashboardLayout>
            <PageSummaryHeader
                title="Consumption-Based Cost Distribution"
                subtitle="Engine to distribute bulk water purchase costs to residents based on consumption."
                icon={CalculateIcon}
                metadata={headerMetadata}
                action={
                    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                        <FormControl variant="outlined" size="small" sx={{ minWidth: 200, height: 36 }}>
                            <InputLabel id="select-billing-cycle-label">Billing Cycle</InputLabel>
                            <Select
                                labelId="select-billing-cycle-label"
                                value={selectedCycleId}
                                onChange={handleCycleChange}
                                label="Billing Cycle"
                                sx={{ borderRadius: 2 }}
                            >
                                {billingCycles.map((c) => (
                                    <MenuItem key={c.id} value={c.id}>
                                        {c.name} {c.active ? "(Active)" : ""}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<RefreshIcon />}
                            onClick={handleRefresh}
                            sx={{ textTransform: "none", borderRadius: 2, height: 36 }}
                        >
                            Recalculate
                        </Button>
                    </Stack>
                }
            />

            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Distribution Table */}
            <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid", borderColor: "divider" }}>
                <CardContent sx={{ p: 0 }}>
                    <Box sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <SearchBar
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by resident name or unit number..."
                        />
                    </Box>
                    <Divider />
                    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0 }}>
                        {loadingData ? (
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <Table sx={{ minWidth: 800 }}>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: "action.hover" }}>
                                        <TableCell>
                                            <TableSortLabel
                                                active={orderBy === "residentName"}
                                                direction={orderBy === "residentName" ? order : "asc"}
                                                onClick={() => handleRequestSort("residentName")}
                                                sx={{ fontWeight: "bold" }}
                                            >
                                                Household / Resident
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell>
                                            <TableSortLabel
                                                active={orderBy === "unitNumber"}
                                                direction={orderBy === "unitNumber" ? order : "asc"}
                                                onClick={() => handleRequestSort("unitNumber")}
                                                sx={{ fontWeight: "bold" }}
                                            >
                                                Unit Number
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell align="right">
                                            <TableSortLabel
                                                active={orderBy === "consumption"}
                                                direction={orderBy === "consumption" ? order : "asc"}
                                                onClick={() => handleRequestSort("consumption")}
                                                sx={{ fontWeight: "bold" }}
                                            >
                                                Consumption (kL)
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell align="right">
                                            <TableSortLabel
                                                active={orderBy === "distributedCost"}
                                                direction={orderBy === "distributedCost" ? order : "asc"}
                                                onClick={() => handleRequestSort("distributedCost")}
                                                sx={{ fontWeight: "bold" }}
                                            >
                                                Distributed Cost (₹)
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: "bold", pl: 4 }}>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedRows.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                                                    <Typography variant="h3" sx={{ mb: 1, opacity: 0.6 }}>💧</Typography>
                                                    <Typography variant="subtitle1" fontWeight="bold" color="text.secondary">
                                                        No Distribution Data
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320 }}>
                                                        No household cost distributions found for the selected billing cycle.
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedRows.map((row) => (
                                            <TableRow key={row.residentProfileId} hover>
                                                <TableCell sx={{ fontWeight: 500 }}>{row.residentName}</TableCell>
                                                <TableCell>{row.unitNumber}</TableCell>
                                                <TableCell align="right">{row.consumption.toFixed(2)} kL</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: "bold", color: row.distributedCost > 0 ? "primary.main" : "text.secondary" }}>
                                                    ₹ {row.distributedCost.toFixed(2)}
                                                </TableCell>
                                                <TableCell sx={{ pl: 4 }}>
                                                    <Chip
                                                        label={row.status}
                                                        color={row.status === "Metered" ? "success" : "default"}
                                                        size="small"
                                                        variant={row.status === "Metered" ? "filled" : "outlined"}
                                                        sx={{ fontWeight: 500 }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={sortedRows.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(_, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                    />
                </CardContent>
            </Card>
        </DashboardLayout>
    );
}

export default CostDistributionPage;
