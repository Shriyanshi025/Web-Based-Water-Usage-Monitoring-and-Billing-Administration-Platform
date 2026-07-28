import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Tooltip
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import CalculateIcon from "@mui/icons-material/Calculate";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PolicyIcon from "@mui/icons-material/Policy";
import LayersIcon from "@mui/icons-material/Layers";
import SearchIcon from "@mui/icons-material/Search";
import ArchiveIcon from "@mui/icons-material/Archive";
import InventoryIcon from "@mui/icons-material/Inventory";

import DashboardLayout from "../../components/layout/DashboardLayout";
import PageSummaryHeader from "../../components/common/PageSummaryHeader";
import AdminStatCard from "../../components/common/AdminStatCard";
import CommunityOpsService from "../../services/CommunityOpsService";
import ConfirmationDialog from "../../components/common/ConfirmationDialog";
import { useNotification } from "../../context/NotificationContext";
import { formatCurrency } from "../../helpers/numberHelper";

function TariffPlanPage() {
    const { showNotification } = useNotification();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Search, Filter & Sort State
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, ACTIVE, DRAFT, INACTIVE, ARCHIVED, USED, UNUSED
    const [sortBy, setSortBy] = useState("NEWEST"); // NEWEST, OLDEST, NAME

    // Dialog state for Create / Edit Plan
    const [planDialogOpen, setPlanDialogOpen] = useState(false);
    const [editingPlanId, setEditingPlanId] = useState(null);
    const [planName, setPlanName] = useState("");
    const [planDescription, setPlanDescription] = useState("");
    const [fixedCharge, setFixedCharge] = useState("0");
    const [taxRate, setTaxRate] = useState("5"); // Percentage
    const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
    const [maintenanceCharge, setMaintenanceCharge] = useState("0");
    const [serviceEnabled, setServiceEnabled] = useState(false);
    const [serviceCharge, setServiceCharge] = useState("0");
    const [policyStatus, setPolicyStatus] = useState("DRAFT");
    const [effectiveFrom, setEffectiveFrom] = useState("");
    const [effectiveTo, setEffectiveTo] = useState("");
    const [slabs, setSlabs] = useState([]);
    const [saving, setSaving] = useState(false);

    // Slab dialog state (inside Create/Edit)
    const [slabDialogOpen, setSlabDialogOpen] = useState(false);
    const [editingSlabIndex, setEditingSlabIndex] = useState(null);
    const [slabMinUnits, setSlabMinUnits] = useState("");
    const [slabMaxUnits, setSlabMaxUnits] = useState("");
    const [slabRate, setSlabRate] = useState("");
    const [slabError, setSlabError] = useState("");

    // Details Modal State
    const [detailsPlan, setDetailsPlan] = useState(null);

    // Preview Modal State
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [previewCustomUnits, setPreviewCustomUnits] = useState("8, 18, 35");

    // Action Confirmation
    const [deletingPlanId, setDeletingPlanId] = useState(null);
    const [archivingPlanId, setArchivingPlanId] = useState(null);

    const fetchPlans = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await CommunityOpsService.getAdminTariffPlans();
            setPlans(response?.data || []);
        } catch (err) {
            setError(err?.response?.data?.message || err.message || "Unable to load tariff policies.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    // ── Summary statistics ──
    const summary = useMemo(() => {
        const total = plans.length;
        const active = plans.filter(p => p.policyStatus === "ACTIVE" || p.active).length;
        const draft = plans.filter(p => p.policyStatus === "DRAFT").length;
        const archived = plans.filter(p => p.policyStatus === "ARCHIVED").length;
        const inactive = plans.filter(p => p.policyStatus === "INACTIVE").length;
        return { total, active, draft, archived, inactive };
    }, [plans]);

    // ── Filtered & Sorted Plans ──
    const filteredPlans = useMemo(() => {
        let result = [...plans];

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(p =>
                (p.name || "").toLowerCase().includes(term) ||
                (p.description || "").toLowerCase().includes(term)
            );
        }

        if (statusFilter === "ACTIVE") {
            result = result.filter(p => p.policyStatus === "ACTIVE" || p.active);
        } else if (statusFilter === "DRAFT") {
            result = result.filter(p => p.policyStatus === "DRAFT");
        } else if (statusFilter === "INACTIVE") {
            result = result.filter(p => p.policyStatus === "INACTIVE");
        } else if (statusFilter === "ARCHIVED") {
            result = result.filter(p => p.policyStatus === "ARCHIVED");
        } else if (statusFilter === "USED") {
            result = result.filter(p => p.usedInBills);
        } else if (statusFilter === "UNUSED") {
            result = result.filter(p => !p.usedInBills);
        }

        if (sortBy === "NEWEST") {
            result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        } else if (sortBy === "OLDEST") {
            result.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        } else if (sortBy === "NAME") {
            result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        }

        return result;
    }, [plans, searchTerm, statusFilter, sortBy]);

    // ── Slab Validation Rules ──
    const validateAllSlabs = (slabsList) => {
        if (!slabsList || slabsList.length === 0) return "At least one tariff slab must be configured.";
        const sorted = [...slabsList].sort((a, b) => Number(a.minUnits) - Number(b.minUnits));

        if (Number(sorted[0].minUnits) !== 0) return "First slab must start at 0 units.";

        for (let i = 0; i < sorted.length; i++) {
            const current = sorted[i];
            const min = Number(current.minUnits);
            const max = current.maxUnits !== null && current.maxUnits !== undefined && current.maxUnits !== "" ? Number(current.maxUnits) : null;
            const rate = Number(current.ratePerUnit);

            if (isNaN(min) || min < 0) return "Minimum units must be a non-negative number.";
            if (isNaN(rate) || rate < 0) return "Rate per unit must be a non-negative number.";

            if (max !== null) {
                if (isNaN(max) || max < 0) return "Maximum units must be a non-negative number.";
                if (max <= min) return `Maximum units (${max}) must be greater than minimum units (${min}).`;
            }

            if (i < sorted.length - 1) {
                if (max === null) return "Only the last slab can have an unlimited maximum units.";
                const nextMin = Number(sorted[i + 1].minUnits);
                if (nextMin < max) return `Slabs cannot overlap: Slab ending at ${max} overlaps with next starting at ${nextMin}.`;
                if (nextMin > max) return `Slabs must be continuous without gaps: Slab ending at ${max} has a gap before next starting at ${nextMin}.`;
            } else {
                if (max !== null) return "The last slab must have unlimited maximum units (leave empty).";
            }
        }
        return null;
    };

    // ── Handlers for Create / Edit Plan ──
    const handleOpenCreateDialog = () => {
        setEditingPlanId(null);
        setPlanName("");
        setPlanDescription("");
        setFixedCharge("0");
        setTaxRate("5");
        setMaintenanceEnabled(false);
        setMaintenanceCharge("0");
        setServiceEnabled(false);
        setServiceCharge("0");
        setPolicyStatus("DRAFT");
        setEffectiveFrom("");
        setEffectiveTo("");
        setSlabs([
            { minUnits: 0, maxUnits: 10, ratePerUnit: 5 },
            { minUnits: 10, maxUnits: 20, ratePerUnit: 8 },
            { minUnits: 20, maxUnits: null, ratePerUnit: 12 }
        ]);
        setPlanDialogOpen(true);
    };

    const handleOpenEditDialog = (plan) => {
        if (plan.policyStatus === "ARCHIVED") {
            showNotification("Archived tariff policies are read-only and cannot be edited.", "warning");
            return;
        }
        setEditingPlanId(plan.id);
        setPlanName(plan.name || "");
        setPlanDescription(plan.description || "");
        setFixedCharge(String(plan.fixedCharge ?? "0"));
        const storedTax = plan.taxRate != null ? Number(plan.taxRate) * 100 : 5;
        setTaxRate(String(storedTax));
        const mc = plan.maintenanceCharge != null ? Number(plan.maintenanceCharge) : 0;
        const sc = plan.serviceCharge != null ? Number(plan.serviceCharge) : 0;
        setMaintenanceEnabled(mc > 0);
        setMaintenanceCharge(String(mc));
        setServiceEnabled(sc > 0);
        setServiceCharge(String(sc));
        setPolicyStatus(plan.policyStatus || (plan.active ? "ACTIVE" : "DRAFT"));
        setEffectiveFrom(plan.effectiveFrom ? String(plan.effectiveFrom).substring(0, 10) : "");
        setEffectiveTo(plan.effectiveTo ? String(plan.effectiveTo).substring(0, 10) : "");
        setSlabs(plan.slabs || []);
        setPlanDialogOpen(true);
    };

    const handleSavePlan = async () => {
        if (!planName.trim()) { showNotification("Policy name is required.", "error"); return; }
        const fixed = Number(fixedCharge);
        if (isNaN(fixed) || fixed < 0) { showNotification("Fixed charge must be non-negative.", "error"); return; }
        const tax = Number(taxRate);
        if (isNaN(tax) || tax < 0 || tax > 100) { showNotification("Tax rate must be between 0 and 100%.", "error"); return; }
        const maint = maintenanceEnabled ? Number(maintenanceCharge) : 0;
        const svc = serviceEnabled ? Number(serviceCharge) : 0;

        if (effectiveTo && effectiveFrom && new Date(effectiveTo) < new Date(effectiveFrom)) {
            showNotification("Effective To date cannot be before Effective From date.", "error");
            return;
        }

        const err = validateAllSlabs(slabs);
        if (err) { showNotification(err, "error"); return; }

        try {
            setSaving(true);
            const payload = {
                name: planName.trim(),
                description: planDescription.trim() || null,
                fixedCharge: fixed,
                ratePerUnit: slabs[0]?.ratePerUnit || 0,
                taxRate: tax / 100,
                maintenanceCharge: maintenanceEnabled ? maint : null,
                serviceCharge: serviceEnabled ? svc : null,
                policyStatus: policyStatus,
                effectiveFrom: effectiveFrom || null,
                effectiveTo: effectiveTo || null,
                slabs: slabs.map(s => ({
                    minUnits: Number(s.minUnits),
                    maxUnits: s.maxUnits !== null && s.maxUnits !== undefined && s.maxUnits !== "" ? Number(s.maxUnits) : null,
                    ratePerUnit: Number(s.ratePerUnit)
                }))
            };

            if (editingPlanId) {
                await CommunityOpsService.updateAdminTariffPlan(editingPlanId, payload);
                showNotification("Tariff Policy updated successfully.", "success");
            } else {
                await CommunityOpsService.createAdminTariffPlan(payload);
                showNotification("Tariff Policy created successfully.", "success");
            }
            setPlanDialogOpen(false);
            await fetchPlans();
        } catch (err) {
            showNotification(err?.response?.data?.message || err.message || "Failed to save tariff policy.", "error");
        } finally {
            setSaving(false);
        }
    };

    // ── Slab Dialog Handlers ──
    const handleOpenAddSlab = () => {
        setEditingSlabIndex(null); setSlabMinUnits(""); setSlabMaxUnits(""); setSlabRate(""); setSlabError(""); setSlabDialogOpen(true);
    };
    const handleOpenEditSlab = (index) => {
        const s = slabs[index];
        setEditingSlabIndex(index);
        setSlabMinUnits(String(s.minUnits ?? "0"));
        setSlabMaxUnits(s.maxUnits !== null && s.maxUnits !== undefined ? String(s.maxUnits) : "");
        setSlabRate(String(s.ratePerUnit ?? ""));
        setSlabError(""); setSlabDialogOpen(true);
    };
    const handleSaveSlab = () => {
        setSlabError("");
        const min = Number(slabMinUnits);
        const max = slabMaxUnits.trim() === "" ? null : Number(slabMaxUnits);
        const rate = Number(slabRate);
        if (isNaN(min) || min < 0) { setSlabError("Minimum units must be a non-negative number."); return; }
        if (max !== null && (isNaN(max) || max <= min)) { setSlabError("Maximum units must be greater than minimum units."); return; }
        if (isNaN(rate) || rate < 0) { setSlabError("Rate per unit must be a non-negative number."); return; }

        const newSlab = { minUnits: min, maxUnits: max, ratePerUnit: rate };
        let updated = [...slabs];
        if (editingSlabIndex !== null) updated[editingSlabIndex] = newSlab;
        else updated.push(newSlab);
        updated.sort((a, b) => a.minUnits - b.minUnits);
        setSlabs(updated);
        setSlabDialogOpen(false);
    };
    const handleDeleteSlab = (index) => {
        const updated = slabs.filter((_, idx) => idx !== index);
        setSlabs(updated);
    };

    // ── Actions: Duplicate, Activate, Deactivate, Archive, Delete ──
    const handleDuplicate = async (id) => {
        try {
            await CommunityOpsService.duplicateTariffPlan(id);
            showNotification("Tariff Policy duplicated as DRAFT.", "success");
            await fetchPlans();
        } catch (err) {
            showNotification(err?.response?.data?.message || err.message || "Failed to duplicate policy.", "error");
        }
    };

    const handleToggleActive = async (plan) => {
        try {
            if (plan.policyStatus === "ACTIVE" || plan.active) {
                await CommunityOpsService.deactivateTariffPlan(plan.id);
                showNotification(`Policy "${plan.name}" deactivated successfully.`, "info");
            } else {
                await CommunityOpsService.activateTariffPlan(plan.id);
                showNotification(`Policy "${plan.name}" is now the ACTIVE tariff policy.`, "success");
            }
            await fetchPlans();
        } catch (err) {
            showNotification(err?.response?.data?.message || err.message || "Failed to change policy status.", "error");
        }
    };

    const handleConfirmArchive = async () => {
        if (!archivingPlanId) return;
        try {
            await CommunityOpsService.archiveTariffPlan(archivingPlanId);
            showNotification("Tariff Policy archived successfully.", "success");
            await fetchPlans();
        } catch (err) {
            showNotification(err?.response?.data?.message || err.message || "Failed to archive policy.", "error");
        } finally {
            setArchivingPlanId(null);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deletingPlanId) return;
        try {
            await CommunityOpsService.deleteTariffPlan(deletingPlanId);
            showNotification("Tariff Policy deleted successfully.", "success");
            await fetchPlans();
        } catch (err) {
            showNotification(err?.response?.data?.message || err.message || "Failed to delete policy.", "error");
        } finally {
            setDeletingPlanId(null);
        }
    };

    // ── Preview Modal Handler ──
    const handleOpenPreview = async (plan) => {
        setPreviewModalOpen(true);
        setLoadingPreview(true);
        setPreviewData(null);
        try {
            const unitsArr = previewCustomUnits.split(",").map(u => Number(u.trim())).filter(n => !isNaN(n) && n >= 0);
            const res = await CommunityOpsService.previewTariffPlan(plan.id, unitsArr.length ? unitsArr : [8, 18, 35]);
            setPreviewData(res?.data || null);
        } catch (err) {
            showNotification(err?.response?.data?.message || err.message || "Unable to fetch calculation preview.", "error");
        } finally {
            setLoadingPreview(false);
        }
    };

    const handleRefreshPreviewData = async () => {
        if (!previewData?.planId) return;
        setLoadingPreview(true);
        try {
            const unitsArr = previewCustomUnits.split(",").map(u => Number(u.trim())).filter(n => !isNaN(n) && n >= 0);
            const res = await CommunityOpsService.previewTariffPlan(previewData.planId, unitsArr.length ? unitsArr : [8, 18, 35]);
            setPreviewData(res?.data || null);
        } catch (err) {
            showNotification("Failed to refresh preview calculation.", "error");
        } finally {
            setLoadingPreview(false);
        }
    };

    const renderStatusBadge = (status) => {
        switch (status) {
            case "ACTIVE":
                return <Chip label="ACTIVE" color="success" size="small" sx={{ fontWeight: 800, fontSize: "0.7rem" }} />;
            case "DRAFT":
                return <Chip label="DRAFT" color="warning" size="small" sx={{ fontWeight: 800, fontSize: "0.7rem" }} />;
            case "ARCHIVED":
                return <Chip label="ARCHIVED" color="secondary" size="small" sx={{ fontWeight: 800, fontSize: "0.7rem" }} />;
            case "INACTIVE":
            default:
                return <Chip label="INACTIVE" variant="outlined" color="default" size="small" sx={{ fontWeight: 600, fontSize: "0.7rem" }} />;
        }
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

    const headerMetadata = useMemo(() => [
        { label: "Total Policies", value: summary.total },
        { label: "Active", value: summary.active, color: "success" },
        { label: "Draft", value: summary.draft, color: "warning" },
        { label: "Archived", value: summary.archived, color: "primary" },
    ], [summary]);

    return (
        <DashboardLayout>
            <PageSummaryHeader
                title="Enterprise Tariff Policy Management"
                subtitle="Configure production billing policies, status lifecycles (Draft, Active, Inactive, Archived), effective date ranges, and slabs."
                icon={PolicyIcon}
                metadata={headerMetadata}
                action={
                    <Stack direction="row" spacing={1.5}>
                        <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={fetchPlans} sx={{ textTransform: "none", borderRadius: 2, height: 38 }}>
                            Refresh
                        </Button>
                        <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleOpenCreateDialog} sx={{ textTransform: "none", borderRadius: 2, height: 38, fontWeight: "bold" }}>
                            Create Tariff Policy
                        </Button>
                    </Stack>
                }
            />

            {/* ── Toolbar: Search, Filter & Sort ── */}
            <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={5}>
                        <TextField
                            placeholder="Search tariff policies by name or description…"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            fullWidth size="small"
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>
                            }}
                            sx={{ borderRadius: 2 }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3.5}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Filter Status</InputLabel>
                            <Select
                                value={statusFilter}
                                label="Filter Status"
                                onChange={e => setStatusFilter(e.target.value)}
                            >
                                <MenuItem value="ALL">All Statuses ({plans.length})</MenuItem>
                                <MenuItem value="ACTIVE">Active Policy</MenuItem>
                                <MenuItem value="DRAFT">Draft Policies</MenuItem>
                                <MenuItem value="INACTIVE">Inactive Policies</MenuItem>
                                <MenuItem value="ARCHIVED">Archived Policies</MenuItem>
                                <MenuItem value="USED">Used in Generated Bills</MenuItem>
                                <MenuItem value="UNUSED">Unused Policies</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3.5}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Sort By</InputLabel>
                            <Select
                                value={sortBy}
                                label="Sort By"
                                onChange={e => setSortBy(e.target.value)}
                            >
                                <MenuItem value="NEWEST">Newest First</MenuItem>
                                <MenuItem value="OLDEST">Oldest First</MenuItem>
                                <MenuItem value="NAME">Alphabetical (A-Z)</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            {/* ── Enterprise Tariff Policy Configuration Records ── */}
            {filteredPlans.length === 0 ? (
                <Paper elevation={0} sx={{ p: 6, textAlign: "center", borderRadius: 3, border: "1px dashed", borderColor: "divider" }}>
                    <LayersIcon sx={{ fontSize: "3.5rem", color: "text.secondary", opacity: 0.5, mb: 1 }} />
                    <Typography variant="h6" fontWeight="bold">No Tariff Policies Found</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                        {searchTerm || statusFilter !== "ALL" ? "Try adjusting your search or filter parameters." : "Create your community's first tariff policy."}
                    </Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateDialog} sx={{ textTransform: "none", borderRadius: 2, fontWeight: "bold" }}>
                        Create Tariff Policy
                    </Button>
                </Paper>
            ) : (
                <Box sx={{ maxWidth: 960, mx: "auto", width: "100%" }}>
                    <Stack spacing={3}>
                        {filteredPlans.map((plan) => {
                            const st = plan.policyStatus || (plan.active ? "ACTIVE" : "DRAFT");
                            const isExpired = plan.effectiveTo && new Date(plan.effectiveTo) < new Date();

                            return (
                                <Card
                                    key={plan.id}
                                    sx={{
                                        borderRadius: "12px",
                                        border: "1px solid",
                                        borderColor: st === "ACTIVE" ? "success.main" : st === "ARCHIVED" ? "secondary.light" : "divider",
                                        bgcolor: "background.paper",
                                        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04)",
                                        transition: "all 0.2s ease-in-out",
                                        "&:hover": {
                                            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
                                        },
                                    }}
                                >
                                    <CardContent sx={{ p: { xs: 2.5, sm: 3 }, "&:last-child": { pb: { xs: 2.5, sm: 3 } } }}>
                                        {/* 1. Header: Policy Name + Status Badge & Version Subtext */}
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 2 }}>
                                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                                <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
                                                    <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1.2rem", color: "text.primary" }}>
                                                        {plan.name}
                                                    </Typography>
                                                    <Chip label={`v${plan.versionNumber || 1}.0`} variant="outlined" size="small" sx={{ fontWeight: 700, fontSize: "0.75rem", height: 22 }} />
                                                    {plan.usedInBills ? (
                                                        <Chip label={`Used in ${plan.billsCount || 1} bills`} color="info" variant="outlined" size="small" sx={{ fontSize: "0.75rem", height: 22 }} />
                                                    ) : (
                                                        <Chip label="Unused" color="default" variant="outlined" size="small" sx={{ fontSize: "0.75rem", height: 22 }} />
                                                    )}
                                                    {isExpired && (
                                                        <Chip label="EXPIRED" color="error" size="small" sx={{ fontWeight: 800, fontSize: "0.75rem", height: 22 }} />
                                                    )}
                                                </Stack>
                                                {plan.description && (
                                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                        {plan.description}
                                                    </Typography>
                                                )}
                                            </Box>
                                            <Box sx={{ flexShrink: 0 }}>
                                                {renderStatusBadge(st)}
                                            </Box>
                                        </Stack>

                                        <Divider sx={{ mb: 2.5 }} />

                                        {/* 2. Details Section: 2-Column Key-Value Configuration Layout */}
                                        <Grid container spacing={3} sx={{ mb: 2.5 }}>
                                            {/* Column 1: Financial & Tax Details */}
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1.5, letterSpacing: "0.5px", textTransform: "uppercase", fontSize: "0.75rem" }}>
                                                    Financial Configuration
                                                </Typography>
                                                <Stack spacing={1.25}>
                                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                        <Typography variant="body2" color="text.secondary">Base Rate (Fixed Charge)</Typography>
                                                        <Typography variant="body2" fontWeight={700} color="primary.main">{formatCurrency(plan.fixedCharge)}</Typography>
                                                    </Stack>
                                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                        <Typography variant="body2" color="text.secondary">GST Tax Rate</Typography>
                                                        <Typography variant="body2" fontWeight={600}>{plan.taxRate != null ? `${(Number(plan.taxRate) * 100).toFixed(1)}%` : "5.0%"}</Typography>
                                                    </Stack>
                                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                        <Typography variant="body2" color="text.secondary">Minimum Charge</Typography>
                                                        <Typography variant="body2" fontWeight={600}>₹0.00</Typography>
                                                    </Stack>
                                                </Stack>
                                            </Grid>

                                            {/* Column 2: Governance & Schedule Details */}
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1.5, letterSpacing: "0.5px", textTransform: "uppercase", fontSize: "0.75rem" }}>
                                                    Governance & Policy Dates
                                                </Typography>
                                                <Stack spacing={1.25}>
                                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                        <Typography variant="body2" color="text.secondary">Effective From</Typography>
                                                        <Typography variant="body2" fontWeight={600}>{plan.effectiveFrom || "Immediate"}</Typography>
                                                    </Stack>
                                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                        <Typography variant="body2" color="text.secondary">Effective To</Typography>
                                                        <Typography variant="body2" fontWeight={600}>{plan.effectiveTo || "Indefinite"}</Typography>
                                                    </Stack>
                                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                        <Typography variant="body2" color="text.secondary">Created By</Typography>
                                                        <Typography variant="body2" fontWeight={600}>{plan.createdBy || "System Admin"}</Typography>
                                                    </Stack>
                                                </Stack>
                                            </Grid>
                                        </Grid>

                                        {/* 3. Tier Schedule Configuration Strip */}
                                        <Box sx={{ bgcolor: "action.hover", p: 2, borderRadius: 2, mb: 2.5, border: "1px solid", borderColor: "divider" }}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                                <Typography variant="subtitle2" fontWeight={700} color="text.primary" sx={{ fontSize: "0.8rem" }}>
                                                    TIER SCHEDULE SLABS ({plan.slabs?.length || 0} Configured)
                                                </Typography>
                                                <Button
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => setDetailsPlan(plan)}
                                                    sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.8rem", p: 0 }}
                                                >
                                                    View Full Schedule →
                                                </Button>
                                            </Stack>
                                            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                                                {(plan.slabs || []).map((slab, i) => (
                                                    <Chip
                                                        key={i}
                                                        label={`Slab ${i + 1}: ${slab.minUnits}–${slab.maxUnits ?? "∞"} kL @ ₹${slab.ratePerUnit}/kL`}
                                                        size="small"
                                                        variant="outlined"
                                                        color="primary"
                                                        sx={{ fontWeight: 600, fontSize: "0.75rem", height: 26, bgcolor: "background.paper" }}
                                                    />
                                                ))}
                                            </Stack>
                                        </Box>

                                        <Divider sx={{ mb: 2 }} />

                                        {/* 4. Single Horizontal Action Footer Row */}
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5}>
                                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                                <Button
                                                    variant="outlined"
                                                    color="info"
                                                    size="small"
                                                    startIcon={<CalculateIcon />}
                                                    onClick={() => handleOpenPreview(plan)}
                                                    sx={{ textTransform: "none", borderRadius: "8px", height: 34, fontSize: "0.8rem", fontWeight: 600 }}
                                                >
                                                    Preview Output
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    color="primary"
                                                    size="small"
                                                    startIcon={<VisibilityIcon />}
                                                    onClick={() => setDetailsPlan(plan)}
                                                    sx={{ textTransform: "none", borderRadius: "8px", height: 34, fontSize: "0.8rem", fontWeight: 600 }}
                                                >
                                                    View Details
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    color="primary"
                                                    size="small"
                                                    disabled={st === "ARCHIVED"}
                                                    startIcon={<EditIcon />}
                                                    onClick={() => handleOpenEditDialog(plan)}
                                                    sx={{ textTransform: "none", borderRadius: "8px", height: 34, fontSize: "0.8rem", fontWeight: 600 }}
                                                >
                                                    Edit Policy
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    color="secondary"
                                                    size="small"
                                                    startIcon={<ContentCopyIcon />}
                                                    onClick={() => handleDuplicate(plan.id)}
                                                    sx={{ textTransform: "none", borderRadius: "8px", height: 34, fontSize: "0.8rem", fontWeight: 600 }}
                                                >
                                                    Duplicate
                                                </Button>
                                            </Stack>

                                            <Stack direction="row" spacing={1} alignItems="center">
                                                {st !== "ARCHIVED" && (
                                                    <Button
                                                        variant={st === "ACTIVE" ? "outlined" : "contained"}
                                                        color={st === "ACTIVE" ? "warning" : "success"}
                                                        size="small"
                                                        disabled={st !== "ACTIVE" && isExpired}
                                                        onClick={() => handleToggleActive(plan)}
                                                        sx={{ textTransform: "none", borderRadius: "8px", height: 34, px: 2, fontSize: "0.8rem", fontWeight: 700 }}
                                                    >
                                                        {st === "ACTIVE" ? "Deactivate Policy" : "Activate Policy"}
                                                    </Button>
                                                )}

                                                {st === "DRAFT" && (
                                                    <Button
                                                        variant="outlined"
                                                        color="secondary"
                                                        size="small"
                                                        startIcon={<ArchiveIcon />}
                                                        onClick={() => setArchivingPlanId(plan.id)}
                                                        sx={{ textTransform: "none", borderRadius: "8px", height: 34, fontSize: "0.8rem", fontWeight: 600 }}
                                                    >
                                                        Archive
                                                    </Button>
                                                )}

                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    size="small"
                                                    disabled={plan.usedInBills || st === "ACTIVE"}
                                                    startIcon={<DeleteIcon />}
                                                    onClick={() => setDeletingPlanId(plan.id)}
                                                    sx={{ textTransform: "none", borderRadius: "8px", height: 34, fontSize: "0.8rem", fontWeight: 600 }}
                                                >
                                                    Delete
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </Stack>
                </Box>
            )}

            {/* ── CREATE / EDIT PLAN DIALOG ── */}
            <Dialog open={planDialogOpen} onClose={() => !saving && setPlanDialogOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: "bold", borderBottom: "1px solid", borderColor: "divider" }}>
                    {editingPlanId ? "Edit Tariff Policy Plan" : "Create New Tariff Policy Plan"}
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={8}>
                                <TextField
                                    label="Policy Name"
                                    value={planName}
                                    onChange={e => setPlanName(e.target.value)}
                                    placeholder="e.g. Standard Residential Tariff 2026"
                                    fullWidth required
                                    helperText="Unique identifier for this billing policy"
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <FormControl fullWidth required>
                                    <InputLabel>Policy Status</InputLabel>
                                    <Select
                                        value={policyStatus}
                                        label="Policy Status"
                                        onChange={e => setPolicyStatus(e.target.value)}
                                    >
                                        <MenuItem value="DRAFT">Draft</MenuItem>
                                        <MenuItem value="ACTIVE">Active</MenuItem>
                                        <MenuItem value="INACTIVE">Inactive</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        <TextField
                            label="Description"
                            value={planDescription}
                            onChange={e => setPlanDescription(e.target.value)}
                            placeholder="e.g. Applicable for regular apartment units with 3-tier slab structure"
                            fullWidth multiline rows={2}
                        />

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Fixed Base Charge (₹)"
                                    type="number"
                                    value={fixedCharge}
                                    onChange={e => setFixedCharge(e.target.value)}
                                    fullWidth required
                                    InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                                    helperText="Flat connection charge billed every cycle"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="GST Tax Rate (%)"
                                    type="number"
                                    value={taxRate}
                                    onChange={e => setTaxRate(e.target.value)}
                                    fullWidth required
                                    InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                                    helperText="Applied on total subtotal (default 5%)"
                                />
                            </Grid>
                        </Grid>

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Effective From Date"
                                    type="date"
                                    variant="outlined"
                                    value={effectiveFrom}
                                    onChange={e => setEffectiveFrom(e.target.value)}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    slotProps={{
                                        inputLabel: { shrink: true }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Effective To Date (Optional)"
                                    type="date"
                                    variant="outlined"
                                    value={effectiveTo}
                                    onChange={e => setEffectiveTo(e.target.value)}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    slotProps={{
                                        inputLabel: { shrink: true }
                                    }}
                                    helperText="Leave empty for indefinite validity"
                                />
                            </Grid>
                        </Grid>

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                    control={<Switch checked={maintenanceEnabled} onChange={e => setMaintenanceEnabled(e.target.checked)} color="primary" />}
                                    label="Enable Maintenance Fee"
                                />
                                {maintenanceEnabled && (
                                    <TextField
                                        label="Maintenance Charge (₹)"
                                        type="number"
                                        value={maintenanceCharge}
                                        onChange={e => setMaintenanceCharge(e.target.value)}
                                        fullWidth size="small" sx={{ mt: 1 }}
                                        InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                                    />
                                )}
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                    control={<Switch checked={serviceEnabled} onChange={e => setServiceEnabled(e.target.checked)} color="primary" />}
                                    label="Enable Service Fee"
                                />
                                {serviceEnabled && (
                                    <TextField
                                        label="Service Charge (₹)"
                                        type="number"
                                        value={serviceCharge}
                                        onChange={e => setServiceCharge(e.target.value)}
                                        fullWidth size="small" sx={{ mt: 1 }}
                                        InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                                    />
                                )}
                            </Grid>
                        </Grid>

                        {/* Dynamic Slabs Editor */}
                        <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2, bgcolor: "background.paper" }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                <Typography variant="subtitle1" fontWeight="bold">Consumption Slab Schedule</Typography>
                                <Button variant="outlined" color="secondary" size="small" startIcon={<AddIcon />} onClick={handleOpenAddSlab} sx={{ textTransform: "none", fontWeight: "bold" }}>
                                    Add Slab
                                </Button>
                            </Stack>

                            <TableContainer component={Paper} elevation={0}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: "action.hover" }}>
                                            <TableCell sx={{ fontWeight: "bold" }}>Range (kL)</TableCell>
                                            <TableCell sx={{ fontWeight: "bold" }}>Min Units</TableCell>
                                            <TableCell sx={{ fontWeight: "bold" }}>Max Units</TableCell>
                                            <TableCell sx={{ fontWeight: "bold" }}>Rate (₹/kL)</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: "bold" }}>Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {slabs.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center" sx={{ py: 3, color: "text.secondary" }}>
                                                    No slabs added. Click "Add Slab" above.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            slabs.map((s, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell sx={{ fontWeight: 600 }}>
                                                        {s.maxUnits === null || s.maxUnits === undefined || s.maxUnits === "" ? `Above ${s.minUnits} kL` : `${s.minUnits} – ${s.maxUnits} kL`}
                                                    </TableCell>
                                                    <TableCell>{s.minUnits}</TableCell>
                                                    <TableCell>{s.maxUnits === null || s.maxUnits === undefined || s.maxUnits === "" ? "Unlimited" : s.maxUnits}</TableCell>
                                                    <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>₹{s.ratePerUnit}</TableCell>
                                                    <TableCell align="right">
                                                        <IconButton size="small" color="primary" onClick={() => handleOpenEditSlab(idx)}><EditIcon fontSize="small" /></IconButton>
                                                        <IconButton size="small" color="error" onClick={() => handleDeleteSlab(idx)}><DeleteIcon fontSize="small" /></IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: "1px solid", borderColor: "divider" }}>
                    <Button onClick={() => setPlanDialogOpen(false)} disabled={saving} color="inherit">Cancel</Button>
                    <Button variant="contained" onClick={handleSavePlan} disabled={saving} sx={{ fontWeight: "bold" }}>
                        {saving ? "Saving Policy…" : "Save Tariff Policy"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── SLAB EDIT DIALOG ── */}
            <Dialog open={slabDialogOpen} onClose={() => setSlabDialogOpen(false)} slotProps={{ paper: { sx: { borderRadius: 3, minWidth: 380, p: 1 } } }}>
                <DialogTitle sx={{ fontWeight: "bold" }}>
                    {editingSlabIndex !== null ? "Edit Slab Range" : "Add Slab Range"}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2.5} sx={{ mt: 1 }}>
                        {slabError && <Alert severity="error">{slabError}</Alert>}
                        <TextField label="Minimum Units (kL)" type="number" value={slabMinUnits} onChange={e => setSlabMinUnits(e.target.value)} fullWidth />
                        <TextField label="Maximum Units (kL)" type="number" value={slabMaxUnits} onChange={e => setSlabMaxUnits(e.target.value)} placeholder="Leave empty for unlimited (Above Min)" fullWidth />
                        <TextField label="Rate per Unit (₹/kL)" type="number" value={slabRate} onChange={e => setSlabRate(e.target.value)} fullWidth />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setSlabDialogOpen(false)} color="inherit">Cancel</Button>
                    <Button variant="contained" onClick={handleSaveSlab} sx={{ fontWeight: "bold" }}>Save Slab</Button>
                </DialogActions>
            </Dialog>

            {/* ── PLAN PREVIEW MODAL (BACKEND DRIVEN) ── */}
            <Dialog open={previewModalOpen} onClose={() => setPreviewModalOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: "bold", borderBottom: "1px solid", borderColor: "divider" }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <CalculateIcon color="primary" />
                        <Typography variant="h6" fontWeight="bold">Billing Engine Calculation Preview</Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    {loadingPreview ? (
                        <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
                            <CircularProgress />
                        </Box>
                    ) : previewData ? (
                        <Stack spacing={3}>
                            <Alert severity="info" sx={{ borderRadius: 2 }}>
                                Exact calculations executed by the backend Billing Engine for policy <strong>{previewData.planName}</strong>.
                            </Alert>

                            <Stack direction="row" spacing={2} alignItems="center">
                                <TextField
                                    label="Sample Consumption Levels (kL)"
                                    value={previewCustomUnits}
                                    onChange={e => setPreviewCustomUnits(e.target.value)}
                                    size="small" sx={{ width: 320 }}
                                    helperText="Comma separated values e.g. 8, 18, 35"
                                />
                                <Button variant="outlined" size="small" onClick={handleRefreshPreviewData} sx={{ textTransform: "none", height: 40 }}>
                                    Recalculate
                                </Button>
                            </Stack>

                            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: "action.hover" }}>
                                            <TableCell sx={{ fontWeight: "bold" }}>Consumption Level</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: "bold" }}>Water Charge</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: "bold" }}>Fixed Base Charge</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: "bold" }}>Subtotal</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: "bold" }}>GST ({(Number(previewData.taxRate || 0.05) * 100).toFixed(1)}%)</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: "bold" }}>Estimated Total</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {previewData.previews?.map((item, idx) => (
                                            <TableRow key={idx} hover>
                                                <TableCell sx={{ fontWeight: 700, color: "info.main" }}>
                                                    {item.unitsConsumed} kL
                                                </TableCell>
                                                <TableCell align="right">{formatCurrency(item.waterCharge)}</TableCell>
                                                <TableCell align="right">{formatCurrency(item.fixedCharge)}</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(item.subtotal)}</TableCell>
                                                <TableCell align="right" sx={{ color: "text.secondary" }}>{formatCurrency(item.taxAmount)}</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 800, color: "primary.main" }}>
                                                    {formatCurrency(item.totalAmount)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Stack>
                    ) : (
                        <Alert severity="error">Failed to load calculation preview.</Alert>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2.5, borderTop: "1px solid", borderColor: "divider" }}>
                    <Button onClick={() => setPreviewModalOpen(false)} variant="contained" color="secondary">
                        Close Preview
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── PLAN DETAILS MODAL ── */}
            <Dialog open={Boolean(detailsPlan)} onClose={() => setDetailsPlan(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: "bold", borderBottom: "1px solid", borderColor: "divider" }}>
                    Tariff Policy Details
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    {detailsPlan && (
                        <Stack spacing={2}>
                            <Typography variant="h6" fontWeight="bold">{detailsPlan.name}</Typography>
                            <Typography variant="body2" color="text.secondary">{detailsPlan.description || "No description provided."}</Typography>
                            <Divider />
                            <Grid container spacing={2}>
                                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Fixed Charge</Typography><Typography fontWeight={700}>{formatCurrency(detailsPlan.fixedCharge)}</Typography></Grid>
                                <Grid item xs={6}><Typography variant="caption" color="text.secondary">GST Rate</Typography><Typography fontWeight={700}>{(Number(detailsPlan.taxRate || 0.05) * 100).toFixed(1)}%</Typography></Grid>
                                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Policy Status</Typography><Typography fontWeight={700}>{detailsPlan.policyStatus || (detailsPlan.active ? "ACTIVE" : "DRAFT")}</Typography></Grid>
                                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Version</Typography><Typography fontWeight={700}>v{detailsPlan.versionNumber || 1}.0</Typography></Grid>
                                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Created By</Typography><Typography fontWeight={700}>{detailsPlan.createdBy || "System Admin"}</Typography></Grid>
                                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Used In Bills</Typography><Typography fontWeight={700}>{detailsPlan.usedInBills ? `Yes (${detailsPlan.billsCount || 1} bills)` : "No"}</Typography></Grid>
                                <Grid item xs={12}><Typography variant="caption" color="text.secondary">Effective Dates</Typography><Typography fontWeight={700}>{detailsPlan.effectiveFrom || "Immediate"} to {detailsPlan.effectiveTo || "Indefinite"}</Typography></Grid>
                            </Grid>
                            <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 1 }}>Slab Schedule:</Typography>
                            <Table size="small">
                                <TableHead><TableRow sx={{ bgcolor: "action.hover" }}><TableCell sx={{ fontWeight: "bold" }}>Range</TableCell><TableCell align="right" sx={{ fontWeight: "bold" }}>Rate</TableCell></TableRow></TableHead>
                                <TableBody>
                                    {(detailsPlan.slabs || []).map((s, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{s.minUnits} – {s.maxUnits ?? "∞"} kL</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: "bold", color: "primary.main" }}>₹{s.ratePerUnit}/kL</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2.5, borderTop: "1px solid", borderColor: "divider" }}>
                    <Button onClick={() => setDetailsPlan(null)} variant="contained">Close</Button>
                </DialogActions>
            </Dialog>

            {/* ── Archive Confirmation Dialog ── */}
            <ConfirmationDialog
                open={Boolean(archivingPlanId)}
                onClose={() => setArchivingPlanId(null)}
                onConfirm={handleConfirmArchive}
                title="Archive Tariff Policy"
                message="Are you sure you want to archive this policy? Archived policies become read-only and preserved for compliance history."
                confirmText="Archive Policy"
                color="secondary"
            />

            {/* ── Delete Confirmation Dialog ── */}
            <ConfirmationDialog
                open={Boolean(deletingPlanId)}
                onClose={() => setDeletingPlanId(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Tariff Policy"
                message="Are you sure you want to delete this tariff policy? This action cannot be undone."
                confirmText="Delete Policy"
                color="error"
            />
        </DashboardLayout>
    );
}

export default TariffPlanPage;
