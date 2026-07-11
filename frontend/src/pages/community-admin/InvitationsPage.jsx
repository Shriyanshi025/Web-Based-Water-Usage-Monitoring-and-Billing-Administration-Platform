import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
    Box, 
    Typography,
    Stack,
    IconButton,
    Tooltip,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
    Chip,
    CircularProgress
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import BlockIcon from "@mui/icons-material/Block";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import DataGrid from "../../components/common/DataGrid";
import TableToolbar from "../../components/common/TableToolbar";
import StatCard from "../../components/widgets/StatCard";
import { formatDateTime } from "../../helpers/dateHelper";

import CommunityOpsService from "../../services/CommunityOpsService";

const ACTION_CONFIG = {
    COPY: { label: "Copy Link", icon: <ContentCopyIcon fontSize="small" />, enabled: true, backendSupported: true },
    REVOKE: { label: "Revoke Invitation", icon: <BlockIcon fontSize="small" color="error" />, enabled: false, backendSupported: false, comingSoon: true },
};

const InvitationsPage = () => {
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // UI State
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [createFormData, setCreateFormData] = useState({ email: "", mobileNumber: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copySuccess, setCopySuccess] = useState("");

    const fetchInvitations = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await CommunityOpsService.getInvitations();
            setInvitations(data || []);
        } catch (err) {
            setError(err.message || "Failed to fetch invitations");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInvitations();
    }, [fetchInvitations]);

    const handleMenuClick = useCallback((event, row) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setSelectedRow(row);
    }, []);

    const handleMenuClose = useCallback(() => {
        setAnchorEl(null);
        setSelectedRow(null);
    }, []);

    const handleAction = useCallback(async (actionKey) => {
        const config = ACTION_CONFIG[actionKey];
        if (!config.enabled || config.comingSoon) {
            handleMenuClose();
            return;
        }

        if (actionKey === "COPY") {
            const link = `${window.location.origin}/register?token=${selectedRow.token}`;
            try {
                await navigator.clipboard.writeText(link);
                setCopySuccess(selectedRow.id);
                setTimeout(() => setCopySuccess(""), 3000);
            } catch (err) {
                console.error("Failed to copy", err);
            }
        }
        handleMenuClose();
    }, [handleMenuClose, selectedRow]);

    const handleCreateSubmit = useCallback(async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await CommunityOpsService.createInvitation(createFormData);
            setCreateDialogOpen(false);
            setCreateFormData({ email: "", mobileNumber: "" });
            fetchInvitations();
        } catch (err) {
            console.error("Failed to create invitation", err);
            // In a real app, handle form error
        } finally {
            setIsSubmitting(false);
        }
    }, [createFormData, fetchInvitations]);

    const stats = useMemo(() => {
        const total = invitations.length;
        const active = invitations.filter(i => i.status === "PENDING" && new Date(i.expiresAt) > new Date()).length;
        const accepted = invitations.filter(i => i.status === "ACCEPTED").length;
        return { total, active, accepted };
    }, [invitations]);

    const columns = useMemo(() => [
        { 
            field: "email", 
            headerName: "Invited Email", 
            flex: 1, 
            minWidth: 200,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={500}>
                    {params.row.email}
                </Typography>
            )
        },
        { 
            field: "mobileNumber", 
            headerName: "Mobile Number", 
            width: 150 
        },
        { 
            field: "token", 
            headerName: "Token / Link", 
            width: 150,
            renderCell: (params) => (
                <Tooltip title="Click to copy link">
                    <Button 
                        size="small" 
                        variant="text" 
                        startIcon={copySuccess === params.row.id ? <CheckCircleIcon color="success" /> : <ContentCopyIcon />}
                        onClick={(e) => {
                            e.stopPropagation();
                            const link = `${window.location.origin}/register?token=${params.row.token}`;
                            navigator.clipboard.writeText(link);
                            setCopySuccess(params.row.id);
                            setTimeout(() => setCopySuccess(""), 3000);
                        }}
                    >
                        {copySuccess === params.row.id ? "Copied" : "Copy"}
                    </Button>
                </Tooltip>
            )
        },
        { 
            field: "expiresAt", 
            headerName: "Expires At", 
            width: 180,
            renderCell: (params) => (
                <Typography variant="body2" color="text.secondary">
                    {formatDateTime(params.row.expiresAt)}
                </Typography>
            )
        },
        { 
            field: "status", 
            headerName: "Status", 
            width: 130,
            renderCell: (params) => {
                const status = params.row.status;
                let color = "default";
                if (status === "ACCEPTED") color = "success";
                if (status === "PENDING") {
                    const isExpired = new Date(params.row.expiresAt) < new Date();
                    if (isExpired) color = "error";
                    else color = "warning";
                }
                if (status === "REVOKED") color = "error";
                
                return (
                    <Chip 
                        label={status} 
                        size="small" 
                        color={color}
                        variant="outlined"
                    />
                );
            }
        },
        { 
            field: "actions", 
            headerName: "Actions", 
            width: 80, 
            sortable: false,
            align: "center",
            renderCell: (params) => (
                <IconButton size="small" onClick={(e) => handleMenuClick(e, params.row)}>
                    <MoreVertIcon fontSize="small" />
                </IconButton>
            )
        }
    ], [handleMenuClick, copySuccess]);

    return (
        <DashboardLayout>
            <PageHeader 
                title="Invitation Management" 
                subtitle="Invite residents to join your community."
            />

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4}>
                    <StatCard 
                        title="Total Invitations" 
                        value={stats.total} 
                        icon="MailIcon"
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <StatCard 
                        title="Active Pending" 
                        value={stats.active} 
                        icon="DomainVerificationIcon"
                        trend="up"
                        trendValue="Awaiting Registration"
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <StatCard 
                        title="Accepted" 
                        value={stats.accepted} 
                        icon="PeopleIcon"
                    />
                </Grid>
            </Grid>

            <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider', mb: 3 }}>
                <TableToolbar 
                    title="Invitation History" 
                    action={
                        <Button 
                            variant="contained" 
                            color="primary" 
                            startIcon={<AddIcon />}
                            onClick={() => setCreateDialogOpen(true)}
                        >
                            Create Invitation
                        </Button>
                    }
                />
                
                <Box sx={{ height: 500 }}>
                    <DataGrid 
                        rows={invitations} 
                        columns={columns} 
                        loading={loading}
                        error={error}
                        onRetry={fetchInvitations}
                        disableRowSelectionOnClick
                    />
                </Box>
            </Box>

            {/* Actions Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                    elevation: 3,
                    sx: { minWidth: 200, mt: 1, borderRadius: 2 }
                }}
            >
                {Object.entries(ACTION_CONFIG).map(([key, config]) => (
                    <Tooltip key={key} title={config.comingSoon ? "Backend Support Pending" : ""} placement="left" arrow>
                        <span>
                            <MenuItem 
                                onClick={() => handleAction(key)}
                                disabled={!config.enabled || config.comingSoon}
                                sx={{ py: 1.5 }}
                            >
                                <ListItemIcon>{config.icon}</ListItemIcon>
                                <ListItemText 
                                    primary={config.label} 
                                    secondary={config.comingSoon ? "Coming Soon" : null}
                                    secondaryTypographyProps={{ variant: "caption", color: "warning.main" }}
                                />
                            </MenuItem>
                        </span>
                    </Tooltip>
                ))}
            </Menu>

            {/* Create Invitation Dialog */}
            <Dialog open={createDialogOpen} onClose={() => !isSubmitting && setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
                <form onSubmit={handleCreateSubmit}>
                    <DialogTitle>Send Invitation</DialogTitle>
                    <DialogContent dividers>
                        <Stack spacing={3} sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                Send a secure registration link to a new resident. The link will expire in 24 hours.
                            </Typography>
                            <TextField
                                label="Resident Email Address"
                                type="email"
                                fullWidth
                                required
                                value={createFormData.email}
                                onChange={(e) => setCreateFormData(prev => ({ ...prev, email: e.target.value }))}
                            />
                            <TextField
                                label="Mobile Number (Optional)"
                                type="tel"
                                fullWidth
                                value={createFormData.mobileNumber}
                                onChange={(e) => setCreateFormData(prev => ({ ...prev, mobileNumber: e.target.value }))}
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button 
                            onClick={() => setCreateDialogOpen(false)} 
                            disabled={isSubmitting}
                            color="inherit"
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            disabled={isSubmitting || !createFormData.email}
                        >
                            {isSubmitting ? <CircularProgress size={24} /> : "Send Invitation"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

        </DashboardLayout>
    );
};

export default InvitationsPage;
