import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    Stack,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Paper,
    Grid,
    Chip,
    Avatar,
    Skeleton,
    Divider,
    Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import VisibilityIcon from "@mui/icons-material/Visibility";
import ApartmentIcon from "@mui/icons-material/Apartment";
import PeopleIcon from "@mui/icons-material/People";
import SpeedIcon from "@mui/icons-material/Speed";
import ReceiptIcon from "@mui/icons-material/Receipt";
import RefreshIcon from "@mui/icons-material/Refresh";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import DashboardLayout from "../../components/layout/DashboardLayout";
import PageSummaryHeader from "../../components/common/PageSummaryHeader";
import WidgetContainer from "../../components/widgets/WidgetContainer";
import TableToolbar from "../../components/common/TableToolbar";
import DataGrid from "../../components/common/DataGrid";
import ErrorState from "../../components/common/ErrorState";
import StatusBadge from "../../components/common/StatusBadge";
import ActionButton from "../../components/common/ActionButton";
import { UserCell, AmountCell, ConsumptionCell, TextSubtextCell } from "../../components/common/DataGridCells";

import CommunityOpsService from "../../services/CommunityOpsService";
import { formatCurrency, formatWaterUsage } from "../../helpers/numberHelper";

function HouseholdDirectoryPage() {
    const theme = useTheme();
    const navigate = useNavigate();

    const [households, setHouseholds] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Details Modal state
    const [selectedHousehold, setSelectedHousehold] = useState(null);
    const [viewOpen, setViewOpen]                   = useState(false);
    const [viewLoading, setViewLoading]             = useState(false);

    const fetchHouseholds = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await CommunityOpsService.getHouseholdDirectory();
            setHouseholds(data || []);
        } catch (err) {
            setError(err.message || "Failed to fetch household directory");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHouseholds();
    }, [fetchHouseholds]);

    const handleOpenView = (household) => {
        setSelectedHousehold(household);
        setViewOpen(true);
        setViewLoading(true);
        setTimeout(() => setViewLoading(false), 250);
    };

    const filteredHouseholds = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return households.filter(h => 
            (h.residentName || "").toLowerCase().includes(q) ||
            (h.unitNumber    || "").toLowerCase().includes(q) ||
            (h.meterNumber   || "").toLowerCase().includes(q) ||
            (h.blockName     || "").toLowerCase().includes(q)
        );
    }, [households, searchQuery]);

    const columns = useMemo(() => [
        { 
            field: "residentName", 
            headerName: "Primary Resident", 
            flex: 1.2, 
            minWidth: 200,
            renderCell: (params) => (
                <UserCell 
                    name={params.row.residentName || "Unassigned Unit"}
                    email={params.row.email}
                    role="PRIMARY_RESIDENT"
                />
            )
        },
        { 
            field: "unitNumber", 
            headerName: "Unit / Apartment", 
            width: 140,
            renderCell: (params) => (
                <TextSubtextCell 
                    primary={`Unit ${params.row.unitNumber || "—"}`}
                    secondary={params.row.blockName ? `Block: ${params.row.blockName}` : null}
                />
            )
        },
        { 
            field: "meterNumber", 
            headerName: "Water Meter", 
            width: 150,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={700} color="primary.main" sx={{ fontFamily: "monospace" }}>
                    {params.row.meterNumber || "No Meter"}
                </Typography>
            )
        },
        { 
            field: "currentReading", 
            headerName: "Current Reading", 
            width: 140,
            renderCell: (params) => (
                <ConsumptionCell value={params.row.currentReading} />
            )
        },
        { 
            field: "pendingBillsCount", 
            headerName: "Pending Bills", 
            width: 130,
            renderCell: (params) => (
                <Chip 
                    label={`${params.row.pendingBillsCount || 0} Unpaid`} 
                    size="small"
                    color={params.row.pendingBillsCount > 0 ? "warning" : "default"}
                    variant="outlined"
                    sx={{ height: 22, fontSize: "0.75rem", fontWeight: 700 }}
                />
            )
        },
        { 
            field: "pendingBillsAmount", 
            headerName: "Total Due", 
            width: 140,
            renderCell: (params) => (
                <AmountCell 
                    amount={params.row.pendingBillsAmount} 
                    color={params.row.pendingBillsAmount > 0 ? "error.main" : "text.secondary"} 
                />
            )
        },
        {
            field: "actions",
            headerName: "Actions",
            width: 100,
            align: "center",
            sortable: false,
            renderCell: (params) => (
                <Tooltip title="View Household Profile" arrow>
                    <IconButton size="small" color="primary" onClick={() => handleOpenView(params.row)}>
                        <VisibilityIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            )
        }
    ], []);

    const headerMetadata = useMemo(() => [
        { label: "Total Households", value: households.length },
        { label: "Assigned Meters", value: households.filter(h => h.meterNumber && h.meterNumber !== "No Meter").length, color: "success" },
    ], [households]);

    return (
        <DashboardLayout>
            <PageSummaryHeader
                title="Household Directory" 
                subtitle="Complete registry of community units, assigned residents, active meters, and outstanding balances." 
                icon={ApartmentIcon}
                metadata={headerMetadata}
                action={
                    <ActionButton variant="outlined" startIcon={<RefreshIcon />} onClick={fetchHouseholds} disabled={loading}>
                        Refresh
                    </ActionButton>
                }
            />
            
            <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                <TableToolbar 
                    title="All Community Households"
                    count={filteredHouseholds.length}
                    searchPlaceholder="Search unit, resident, block, or meter..."
                    onSearch={setSearchQuery}
                />
                
                <Box sx={{ height: 560 }}>
                    <DataGrid 
                        rows={filteredHouseholds}
                        columns={columns}
                        loading={loading}
                        error={error}
                        onRetry={fetchHouseholds}
                        getRowId={(row) => row.residentId || row.unitNumber}
                    />
                </Box>
            </Box>

            {/* ── RICH HOUSEHOLD PROFILE VIEW MODAL ─────────────────────────────── */}
            <Dialog
                open={viewOpen}
                onClose={() => setViewOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                {selectedHousehold && (
                    <>
                        <DialogTitle sx={{ p: 2.5, bgcolor: "background.paper", borderBottom: "1px solid", borderColor: "divider" }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Avatar sx={{ width: 52, height: 52, bgcolor: "primary.main" }}>
                                        <ApartmentIcon />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6" fontWeight={700}>
                                            Unit {selectedHousehold.unitNumber || "N/A"} Profile
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Block: {selectedHousehold.blockName || "N/A"} · Primary Resident: <strong>{selectedHousehold.residentName || "Unassigned"}</strong>
                                        </Typography>
                                    </Box>
                                </Stack>
                                <Chip label="HOUSEHOLD" color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
                            </Stack>
                        </DialogTitle>

                        <DialogContent dividers sx={{ p: 3 }}>
                            {viewLoading ? (
                                <Stack spacing={2}>
                                    <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
                                    <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2 }} />
                                </Stack>
                            ) : (
                                <Stack spacing={3}>
                                    {/* 1. Summary Cards */}
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={3}>
                                            <Paper variant="outlined" sx={{ p: 1.5, textAlign: "center", bgcolor: "grey.50" }}>
                                                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">PRIMARY RESIDENT</Typography>
                                                <Typography variant="body2" fontWeight={700} color="primary.main" noWrap>
                                                    {selectedHousehold.residentName || "Unassigned"}
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={12} sm={3}>
                                            <Paper variant="outlined" sx={{ p: 1.5, textAlign: "center", bgcolor: "grey.50" }}>
                                                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">ACTIVE METER</Typography>
                                                <Typography variant="body2" fontWeight={700} color="primary.main" sx={{ fontFamily: "monospace" }}>
                                                    {selectedHousehold.meterNumber || "None"}
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={12} sm={3}>
                                            <Paper variant="outlined" sx={{ p: 1.5, textAlign: "center", bgcolor: "grey.50" }}>
                                                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">CURRENT READING</Typography>
                                                <Typography variant="body2" fontWeight={700} color="info.main">
                                                    {selectedHousehold.currentReading != null ? `${selectedHousehold.currentReading} L` : "—"}
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={12} sm={3}>
                                            <Paper variant="outlined" sx={{ p: 1.5, textAlign: "center", bgcolor: "grey.50" }}>
                                                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">OUTSTANDING DUE</Typography>
                                                <Typography variant="body2" fontWeight={700} color={selectedHousehold.pendingBillsAmount > 0 ? "error.main" : "success.main"}>
                                                    {formatCurrency(selectedHousehold.pendingBillsAmount || 0)}
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                    </Grid>

                                    {/* 2. Information Grid */}
                                    <Grid container spacing={2.5}>
                                        <Grid item xs={12} md={6}>
                                            <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
                                                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1, color: "primary.main" }}>
                                                    <ApartmentIcon fontSize="small" /> Household Location
                                                </Typography>
                                                <Stack spacing={1}>
                                                    <Box display="flex" justifyContent="space-between">
                                                        <Typography variant="caption" color="text.secondary">Unit / Apartment #:</Typography>
                                                        <Typography variant="body2" fontWeight={600}>Unit {selectedHousehold.unitNumber}</Typography>
                                                    </Box>
                                                    <Box display="flex" justifyContent="space-between">
                                                        <Typography variant="caption" color="text.secondary">Block Name:</Typography>
                                                        <Typography variant="body2" fontWeight={600}>{selectedHousehold.blockName || "N/A"}</Typography>
                                                    </Box>
                                                    <Box display="flex" justifyContent="space-between">
                                                        <Typography variant="caption" color="text.secondary">Community Name:</Typography>
                                                        <Typography variant="body2" fontWeight={600}>{selectedHousehold.communityName || "N/A"}</Typography>
                                                    </Box>
                                                </Stack>
                                            </Paper>
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
                                                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1, color: "primary.main" }}>
                                                    <SpeedIcon fontSize="small" /> Meter & Billing Overview
                                                </Typography>
                                                <Stack spacing={1}>
                                                    <Box display="flex" justifyContent="space-between">
                                                        <Typography variant="caption" color="text.secondary">Meter Serial Number:</Typography>
                                                        <Typography variant="body2" fontWeight={700} color="primary.main" sx={{ fontFamily: "monospace" }}>
                                                            {selectedHousehold.meterNumber || "No Meter Assigned"}
                                                        </Typography>
                                                    </Box>
                                                    <Box display="flex" justifyContent="space-between">
                                                        <Typography variant="caption" color="text.secondary">Pending Bills Count:</Typography>
                                                        <Typography variant="body2" fontWeight={600}>{selectedHousehold.pendingBillsCount || 0} bill(s)</Typography>
                                                    </Box>
                                                    <Box display="flex" justifyContent="space-between">
                                                        <Typography variant="caption" color="text.secondary">Unpaid Amount:</Typography>
                                                        <Typography variant="body2" fontWeight={700} color="error.main">{formatCurrency(selectedHousehold.pendingBillsAmount || 0)}</Typography>
                                                    </Box>
                                                </Stack>
                                            </Paper>
                                        </Grid>
                                    </Grid>

                                    {/* 3. Household Members / Occupant Card */}
                                    <Paper variant="outlined" sx={{ p: 2 }}>
                                        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                                            <PeopleIcon fontSize="small" color="primary" /> Household Resident(s)
                                        </Typography>
                                        {selectedHousehold.residentName ? (
                                            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "grey.50" }}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={700}>
                                                            {selectedHousehold.residentName}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {selectedHousehold.email} · {selectedHousehold.phoneNumber || "No Phone"}
                                                        </Typography>
                                                    </Box>
                                                    <StatusBadge status="ACTIVE" />
                                                </Stack>
                                            </Paper>
                                        ) : (
                                            <Alert severity="info">No resident assigned to this household unit.</Alert>
                                        )}
                                    </Paper>

                                    {/* 4. Quick Navigation Bar */}
                                    <Box>
                                        <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" sx={{ mb: 1, textTransform: "uppercase" }}>
                                            Quick Navigation Shortcuts
                                        </Typography>
                                        <Stack direction="row" spacing={1.5} flexWrap="wrap">
                                            <Button 
                                                variant="outlined" 
                                                size="small" 
                                                startIcon={<ReceiptIcon />}
                                                endIcon={<OpenInNewIcon fontSize="small" />}
                                                onClick={() => {
                                                    setViewOpen(false);
                                                    navigate("/community-admin/bills", { state: { search: selectedHousehold.unitNumber } });
                                                }}
                                            >
                                                View Household Bills
                                            </Button>
                                            {selectedHousehold.meterNumber && (
                                                <Button 
                                                    variant="outlined" 
                                                    size="small" 
                                                    startIcon={<SpeedIcon />}
                                                    endIcon={<OpenInNewIcon fontSize="small" />}
                                                    onClick={() => {
                                                        setViewOpen(false);
                                                        navigate("/community-admin/meters", { state: { search: selectedHousehold.meterNumber } });
                                                    }}
                                                >
                                                    View Water Meter
                                                </Button>
                                            )}
                                        </Stack>
                                    </Box>
                                </Stack>
                            )}
                        </DialogContent>

                        <DialogActions sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
                            <Button onClick={() => setViewOpen(false)}>Close</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </DashboardLayout>
    );
}

export default HouseholdDirectoryPage;