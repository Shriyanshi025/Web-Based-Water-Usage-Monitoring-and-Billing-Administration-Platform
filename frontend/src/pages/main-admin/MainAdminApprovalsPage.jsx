import React, { useState, useEffect, useMemo, useCallback } from "react";
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
    TextField
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import ConfirmationDialog from "../../components/common/ConfirmationDialog";

import DashboardLayout from "../../components/layout/DashboardLayout";
import PageSummaryHeader from "../../components/common/PageSummaryHeader";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import DataGrid from "../../components/common/DataGrid";
import TableToolbar from "../../components/common/TableToolbar";
import StatusBadge from "../../components/common/StatusBadge";
import MainAdminOpsService from "../../services/MainAdminOpsService";
import { UserCell, TextSubtextCell, formatRole } from "../../components/common/DataGridCells";

const MainAdminApprovalsPage = () => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [approvalStatus, setApprovalStatus] = useState(""); // APPROVED or REJECTED
    const [remarks, setRemarks] = useState("");

    const fetchPendingUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await MainAdminOpsService.getPendingUsers();
            // Ensure only COMMUNITY_ADMIN requests are handled
            const list = (response?.data || []).filter(u => u.role === "COMMUNITY_ADMIN" || !u.role);
            setPendingUsers(list);
        } catch (err) {
            setError(err.message || "Failed to fetch pending community admin approvals");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPendingUsers();
    }, [fetchPendingUsers]);

    const handleSearch = useCallback((query) => {
        setSearchQuery(query);
    }, []);

    const filteredUsers = useMemo(() => {
        if (!searchQuery) return pendingUsers;
        const q = searchQuery.toLowerCase();
        return pendingUsers.filter(u => 
            u.fullName?.toLowerCase().includes(q) || 
            u.email?.toLowerCase().includes(q) ||
            u.role?.toLowerCase().includes(q)
        );
    }, [pendingUsers, searchQuery]);

    const handleOpenDialog = (user, status) => {
        setSelectedUser(user);
        setApprovalStatus(status);
        setRemarks("");
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
    };

    // Confirm Dialog state for Delete
    const [confirmConfig, setConfirmConfig] = useState({ open: false, title: "", content: "", onConfirm: null, confirmColor: "primary", confirmText: "" });

    const handleDeleteUser = (user) => {
        setConfirmConfig({
            open: true,
            title: "Delete User Request",
            content: `Are you sure you want to completely delete ${user.fullName}? This action cannot be undone.`,
            confirmColor: "error",
            confirmText: "Delete",
            onConfirm: async () => {
                try {
                    await MainAdminOpsService.deleteUser(user.id || user.userId);
                    fetchPendingUsers();
                } catch (err) {
                    alert(err.response?.data?.message || "Failed to delete user");
                } finally {
                    setConfirmConfig(prev => ({ ...prev, open: false }));
                }
            }
        });
    };

    const handleConfirm = async () => {
        try {
            if (selectedUser) {
                await MainAdminOpsService.approveUser(selectedUser.id, {
                    approvalStatus,
                    remarks
                });
            }
            handleCloseDialog();
            fetchPendingUsers();
        } catch (err) {
            alert(err.response?.data?.message || err.message || "Failed to process approval");
        }
    };

    const columns = useMemo(() => [
        { 
            field: "fullName", 
            headerName: "Applicant", 
            flex: 1, 
            minWidth: 220,
            renderCell: (params) => (
                <UserCell 
                    name={params?.row?.fullName} 
                    role={params?.row?.role || "COMMUNITY_ADMIN"} 
                    email={params?.row?.email} 
                />
            )
        },
        { 
            field: "email", 
            headerName: "Email Address", 
            flex: 1, 
            minWidth: 200,
            renderCell: (params) => (
                <TextSubtextCell 
                    primary={params?.row?.email} 
                    secondary="Community Admin Applicant"
                />
            )
        },
        { 
            field: "role", 
            headerName: "Role Requested", 
            width: 180,
            valueGetter: (params) => formatRole(params?.row?.role || "COMMUNITY_ADMIN")
        },
        { 
            field: "status", 
            headerName: "Approval Status", 
            width: 160,
            renderCell: (params) => (
                <StatusBadge status={params?.row?.approvalStatus || params?.row?.accountStatus || "PENDING"} />
            )
        },
        { 
            field: "actions", 
            headerName: "Actions", 
            width: 150, 
            sortable: false,
            align: "center",
            renderCell: (params) => (
                <Stack direction="row" spacing={1} justifyContent="center">
                    <Tooltip title="Approve Community Admin" arrow>
                        <IconButton size="small" color="success" onClick={(e) => { e.stopPropagation(); handleOpenDialog(params.row, "APPROVED"); }}>
                            <CheckCircleIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Reject Request" arrow>
                        <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleOpenDialog(params.row, "REJECTED"); }}>
                            <CancelIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Request" arrow>
                        <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDeleteUser(params.row); }}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            )
        }
    ], []);

    const headerMetadata = useMemo(() => [
        { label: "Pending Admin Applications", value: pendingUsers.length, color: "warning" }
    ], [pendingUsers]);

    return (
        <DashboardLayout>
            <PageSummaryHeader 
                title="Community Admin Approvals" 
                subtitle="Review and approve registration requests for Community Administrators."
                icon={HowToRegIcon}
                metadata={headerMetadata}
            />

            <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider', mb: 3 }}>
                <TableToolbar 
                    title="Pending Community Admin Applications" 
                    onSearch={handleSearch}
                />
                
                <Box sx={{ height: 520 }}>
                    <DataGrid 
                        rows={filteredUsers} 
                        columns={columns} 
                        loading={loading}
                        error={error}
                        emptyTitle="No pending Community Admin applications"
                        emptyMessage="There are currently no Community Admin registration requests awaiting approval."
                        onRetry={fetchPendingUsers}
                        disableRowSelectionOnClick
                    />
                </Box>
            </Box>

            {/* Approval Dialog */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>
                    {approvalStatus === "APPROVED" ? "Approve Community Admin" : "Reject Community Admin Request"}
                </DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body1" mb={2}>
                        Are you sure you want to {approvalStatus === "APPROVED" ? "approve" : "reject"} <strong>{selectedUser?.fullName}</strong> ({selectedUser?.email}) as a Community Admin?
                    </Typography>
                    <TextField 
                        fullWidth 
                        multiline 
                        rows={3} 
                        label="Remarks (Optional)" 
                        value={remarks} 
                        onChange={(e) => setRemarks(e.target.value)} 
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button 
                        onClick={handleConfirm} 
                        variant="contained" 
                        color={approvalStatus === "APPROVED" ? "success" : "error"}
                    >
                        {approvalStatus === "APPROVED" ? "Confirm Approval" : "Confirm Rejection"}
                    </Button>
                </DialogActions>
            </Dialog>

            <ConfirmationDialog 
                open={confirmConfig.open}
                title={confirmConfig.title}
                content={confirmConfig.content}
                onConfirm={confirmConfig.onConfirm}
                onCancel={() => setConfirmConfig(prev => ({ ...prev, open: false }))}
                confirmColor={confirmConfig.confirmColor}
                confirmText={confirmConfig.confirmText}
            />
        </DashboardLayout>
    );
};

export default MainAdminApprovalsPage;
