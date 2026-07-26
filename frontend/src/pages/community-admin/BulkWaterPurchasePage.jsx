import React, { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    Grid,
    IconButton,
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
    TextField,
    Typography,
    Tooltip
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";

import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import SearchBar from "../../components/common/SearchBar";
import ConfirmationDialog from "../../components/common/ConfirmationDialog";
import CommunityOpsService from "../../services/CommunityOpsService";
import { useNotification } from "../../context/NotificationContext";

function BulkWaterPurchasePage() {
    const { showNotification } = useNotification();
    const [purchases, setPurchases] = useState([]);
    const [billingCycles, setBillingCycles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Search, Sort, Pagination
    const [searchTerm, setSearchTerm] = useState("");
    const [orderBy, setOrderBy] = useState("purchaseDate");
    const [order, setOrder] = useState("desc");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Dialog state
    const [formOpen, setFormOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");
    const [selectedPurchase, setSelectedPurchase] = useState(null);

    // Form fields
    const [supplierName, setSupplierName] = useState("");
    const [purchasedVolume, setPurchasedVolume] = useState("");
    const [unitCost, setUnitCost] = useState("");
    const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
    const [billingCycleId, setBillingCycleId] = useState("");
    const [notes, setNotes] = useState("");

    // Detail view state
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailPurchase, setDetailPurchase] = useState(null);

    // Delete confirmation state
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [purchasesRes, cyclesRes] = await Promise.all([
                CommunityOpsService.getBulkPurchases(),
                CommunityOpsService.getBillingCycles()
            ]);
            setPurchases(purchasesRes?.data || []);
            setBillingCycles(cyclesRes?.data || []);
        } catch (err) {
            setError(err?.response?.data?.message || err.message || "Failed to load data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Automatic calculation of total cost in UI for display
    const calculatedTotalCost = useMemo(() => {
        const vol = Number(purchasedVolume);
        const cost = Number(unitCost);
        if (isNaN(vol) || vol <= 0 || isNaN(cost) || cost <= 0) return 0;
        return (vol * cost).toFixed(2);
    }, [purchasedVolume, unitCost]);

    // Sorting/Filtering Logic
    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    const filteredPurchases = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return purchases.filter((p) => {
            const supplier = (p.supplierName || "").toLowerCase();
            const cycle = (p.billingCycleName || "").toLowerCase();
            return supplier.includes(term) || cycle.includes(term);
        });
    }, [purchases, searchTerm]);

    const sortedPurchases = useMemo(() => {
        return [...filteredPurchases].sort((a, b) => {
            let valA = a[orderBy];
            let valB = b[orderBy];

            if (orderBy === "billingCycleName") {
                valA = a.billingCycleName || "";
                valB = b.billingCycleName || "";
            }

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
    }, [filteredPurchases, orderBy, order]);

    const paginatedPurchases = useMemo(() => {
        const start = page * rowsPerPage;
        return sortedPurchases.slice(start, start + rowsPerPage);
    }, [sortedPurchases, page, rowsPerPage]);

    // Dialog form open
    const handleOpenCreate = () => {
        setSelectedPurchase(null);
        setSupplierName("");
        setPurchasedVolume("");
        setUnitCost("");
        setPurchaseDate(new Date().toISOString().slice(0, 10));
        setBillingCycleId(billingCycles.find(c => c.active)?.id || "");
        setNotes("");
        setFormError("");
        setFormOpen(true);
    };

    const handleOpenEdit = (p) => {
        setSelectedPurchase(p);
        setSupplierName(p.supplierName || "");
        setPurchasedVolume(String(p.purchasedVolume || ""));
        setUnitCost(String(p.unitCost || ""));
        setPurchaseDate(p.purchaseDate || new Date().toISOString().slice(0, 10));
        setBillingCycleId(p.billingCycleId || "");
        setNotes(p.notes || "");
        setFormError("");
        setFormOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");

        if (!supplierName.trim()) {
            setFormError("Supplier name is required.");
            return;
        }

        const vol = Number(purchasedVolume);
        if (isNaN(vol) || vol <= 0) {
            setFormError("Purchased volume must be a positive number.");
            return;
        }

        const cost = Number(unitCost);
        if (isNaN(cost) || cost <= 0) {
            setFormError("Unit cost must be a positive number.");
            return;
        }

        if (new Date(purchaseDate) > new Date()) {
            setFormError("Purchase date cannot be in the future.");
            return;
        }

        if (!billingCycleId) {
            setFormError("Billing cycle is required.");
            return;
        }

        const payload = {
            supplierName: supplierName.trim(),
            purchasedVolume: vol,
            unitCost: cost,
            purchaseDate,
            billingCycleId,
            notes: notes.trim()
        };

        try {
            setSubmitting(true);
            if (selectedPurchase) {
                await CommunityOpsService.updateBulkPurchase(selectedPurchase.id, payload);
                showNotification("Bulk water purchase updated successfully.", "success");
            } else {
                await CommunityOpsService.createBulkPurchase(payload);
                showNotification("Bulk water purchase recorded successfully.", "success");
            }
            setFormOpen(false);
            fetchData();
        } catch (err) {
            setFormError(err?.response?.data?.message || err.message || "Failed to save purchase.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenDelete = (id) => {
        setDeleteId(id);
        setDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await CommunityOpsService.deleteBulkPurchase(deleteId);
            showNotification("Bulk water purchase deleted successfully.", "success");
            fetchData();
        } catch (err) {
            showNotification(err?.response?.data?.message || err.message || "Failed to delete record.", "error");
        } finally {
            setDeleteOpen(false);
            setDeleteId(null);
        }
    };

    const handleOpenDetail = (p) => {
        setDetailPurchase(p);
        setDetailOpen(true);
    };

    if (loading) {
        return (
            <DashboardLayout>
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "70vh" }}>
                    <CircularProgress />
                </Box>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <PageHeader
                title="Bulk Water Purchases"
                subtitle="Track external bulk water purchases made by the community."
                action={
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<RefreshIcon />}
                            onClick={fetchData}
                            sx={{ textTransform: "none", height: 34, fontSize: "0.8125rem", borderColor: "divider", color: "text.secondary" }}
                        >
                            Refresh
                        </Button>
                        <Button
                            variant="contained"
                            size="small"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={handleOpenCreate}
                            sx={{ textTransform: "none", fontWeight: 600, height: 34, fontSize: "0.8125rem", boxShadow: "none" }}
                        >
                            Record Purchase
                        </Button>
                    </Stack>
                }
            />

            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                </Alert>
            )}

            <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid", borderColor: "divider" }}>
                <CardContent sx={{ p: 0 }}>
                    <Box sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                        <SearchBar
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by supplier or billing cycle..."
                        />
                    </Box>
                    <Divider />
                    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0 }}>
                        <Table sx={{ minWidth: 800 }}>
                            <TableHead>
                    <TableRow>
                                    <TableCell
                                        sx={{
                                            fontWeight: 600,
                                            fontSize: "0.75rem",
                                            color: "text.secondary",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.04em",
                                            py: 1.25,
                                            bgcolor: "action.hover",
                                        }}
                                    >
                                        <TableSortLabel
                                            active={orderBy === "purchaseDate"}
                                            direction={orderBy === "purchaseDate" ? order : "asc"}
                                            onClick={() => handleRequestSort("purchaseDate")}
                                        >
                                            Date
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={orderBy === "supplierName"}
                                            direction={orderBy === "supplierName" ? order : "asc"}
                                            onClick={() => handleRequestSort("supplierName")}
                                            sx={{ fontWeight: "bold" }}
                                        >
                                            Supplier
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={orderBy === "billingCycleName"}
                                            direction={orderBy === "billingCycleName" ? order : "asc"}
                                            onClick={() => handleRequestSort("billingCycleName")}
                                            sx={{ fontWeight: "bold" }}
                                        >
                                            Billing Cycle
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell align="right">
                                        <TableSortLabel
                                            active={orderBy === "purchasedVolume"}
                                            direction={orderBy === "purchasedVolume" ? order : "asc"}
                                            onClick={() => handleRequestSort("purchasedVolume")}
                                            sx={{ fontWeight: "bold" }}
                                        >
                                            Volume (kL)
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell align="right">
                                        <TableSortLabel
                                            active={orderBy === "unitCost"}
                                            direction={orderBy === "unitCost" ? order : "asc"}
                                            onClick={() => handleRequestSort("unitCost")}
                                            sx={{ fontWeight: "bold" }}
                                        >
                                            Unit Cost (₹)
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell align="right">
                                        <TableSortLabel
                                            active={orderBy === "totalCost"}
                                            direction={orderBy === "totalCost" ? order : "asc"}
                                            onClick={() => handleRequestSort("totalCost")}
                                            sx={{ fontWeight: "bold" }}
                                        >
                                            Total Cost (₹)
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: "bold", pr: 3 }}>
                                        Actions
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedPurchases.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                                                <Typography variant="h3" sx={{ mb: 1, opacity: 0.6 }}>🧾</Typography>
                                                <Typography variant="subtitle1" fontWeight="bold" color="text.secondary">
                                                    No Purchase Records Found
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320, mb: 2 }}>
                                                    No bulk water purchases match your search. Try a different supplier name or billing cycle.
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedPurchases.map((row) => (
                                        <TableRow key={row.id} hover>
                                            <TableCell>{row.purchaseDate}</TableCell>
                                            <TableCell sx={{ fontWeight: 500 }}>{row.supplierName}</TableCell>
                                            <TableCell>{row.billingCycleName}</TableCell>
                                            <TableCell align="right">{row.purchasedVolume}</TableCell>
                                            <TableCell align="right">₹{row.unitCost}</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: "bold", color: "primary.main" }}>
                                                ₹{row.totalCost}
                                            </TableCell>
                                            <TableCell align="right" sx={{ pr: 3 }}>
                                                <Tooltip title="View Details">
                                                    <IconButton onClick={() => handleOpenDetail(row)} color="info">
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit">
                                                    <IconButton onClick={() => handleOpenEdit(row)} color="primary">
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton onClick={() => handleOpenDelete(row.id)} color="error">
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={sortedPurchases.length}
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

            {/* Create/Edit dialog */}
            <Dialog
                open={formOpen}
                onClose={() => !submitting && setFormOpen(false)}
                PaperProps={{ sx: { borderRadius: 3, minWidth: 450, p: 1 } }}
            >
                <form onSubmit={handleSubmit}>
                    <DialogTitle sx={{ fontWeight: "bold" }}>
                        {selectedPurchase ? "Edit Bulk Purchase" : "Record Bulk Purchase"}
                    </DialogTitle>
                    <DialogContent>
                        <Stack spacing={3} sx={{ mt: 1 }}>
                            {formError && <Alert severity="error">{formError}</Alert>}
                            <TextField
                                label="Supplier Name"
                                value={supplierName}
                                onChange={(e) => setSupplierName(e.target.value)}
                                placeholder="e.g. Aqua Clean Corp"
                                fullWidth
                                required
                            />
                            <TextField
                                label="Volume Purchased (kL)"
                                type="number"
                                value={purchasedVolume}
                                onChange={(e) => setPurchasedVolume(e.target.value)}
                                fullWidth
                                required
                            />
                            <TextField
                                label="Unit Cost (₹/kL)"
                                type="number"
                                value={unitCost}
                                onChange={(e) => setUnitCost(e.target.value)}
                                fullWidth
                                required
                            />
                            <TextField
                                label="Total Cost (₹)"
                                value={`₹ ${calculatedTotalCost}`}
                                fullWidth
                                disabled
                                helperText="Automatically calculated based on Volume × Unit Cost"
                            />
                            <TextField
                                label="Purchase Date"
                                type="date"
                                value={purchaseDate}
                                onChange={(e) => setPurchaseDate(e.target.value)}
                                fullWidth
                                required
                                InputLabelProps={{ shrink: true }}
                            />
                            <FormControl fullWidth required>
                                <InputLabel id="billing-cycle-select-label">Billing Cycle</InputLabel>
                                <Select
                                    labelId="billing-cycle-select-label"
                                    value={billingCycleId}
                                    onChange={(e) => setBillingCycleId(e.target.value)}
                                    label="Billing Cycle"
                                >
                                    {billingCycles.map((c) => (
                                        <MenuItem key={c.id} value={c.id}>
                                            {c.name} {c.active ? "(Active)" : ""}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField
                                label="Notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Additional details..."
                                multiline
                                rows={3}
                                fullWidth
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={() => setFormOpen(false)} color="inherit" size="small" disabled={submitting} sx={{ textTransform: "none", fontWeight: "bold" }}>
                            Cancel
                        </Button>
                        <Button type="submit" size="small" variant="contained" disabled={submitting} sx={{ textTransform: "none", fontWeight: "bold" }}>
                            {submitting ? "Saving…" : "Confirm"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Detail modal */}
            <Dialog
                open={detailOpen}
                onClose={() => setDetailOpen(false)}
                PaperProps={{ sx: { borderRadius: 3, minWidth: 450, p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: "bold" }}>
                    Bulk Water Purchase Details
                </DialogTitle>
                <DialogContent>
                    {detailPurchase && (
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">Supplier</Typography>
                                <Typography variant="body1" fontWeight={500}>{detailPurchase.supplierName}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">Billing Cycle</Typography>
                                <Typography variant="body1" fontWeight={500}>{detailPurchase.billingCycleName}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">Volume</Typography>
                                <Typography variant="body1" fontWeight={500}>{detailPurchase.purchasedVolume} kL</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">Unit Cost</Typography>
                                <Typography variant="body1" fontWeight={500}>₹{detailPurchase.unitCost} / kL</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">Total Cost</Typography>
                                <Typography variant="body1" color="primary.main" fontWeight="bold">₹{detailPurchase.totalCost}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">Purchase Date</Typography>
                                <Typography variant="body1" fontWeight={500}>{detailPurchase.purchaseDate}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">Recorded By</Typography>
                                <Typography variant="body2">{detailPurchase.createdBy}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">Recorded At</Typography>
                                <Typography variant="body2">
                                    {detailPurchase.createdAt ? new Date(detailPurchase.createdAt).toLocaleString() : "N/A"}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="caption" color="text.secondary">Notes</Typography>
                                <Typography variant="body2" sx={{ bgcolor: "action.hover", p: 1.5, borderRadius: 1 }}>
                                    {detailPurchase.notes || "No notes added."}
                                </Typography>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setDetailOpen(false)} size="small" variant="contained" sx={{ textTransform: "none", fontWeight: "bold" }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete confirmation */}
            <ConfirmationDialog
                open={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Bulk Water Purchase"
                message="Are you sure you want to permanently delete this bulk water purchase record? This action cannot be undone."
                confirmText="Delete"
                color="error"
            />
        </DashboardLayout>
    );
}

export default BulkWaterPurchasePage;
