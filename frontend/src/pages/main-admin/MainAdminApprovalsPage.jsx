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
    TextField,
    Grid
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import DataGrid from "../../components/common/DataGrid";
import TableToolbar from "../../components/common/TableToolbar";
import StatusBadge from "../../components/common/StatusBadge";
import MainAdminOpsService from "../../services/MainAdminOpsService";

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
            setPendingUsers(response.data || []);
        } catch (err) {
            setError(err.message || "Failed to fetch pending users");
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
            headerName: "Name", 
            flex: 1, 
            minWidth: 200,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={500}>
                    {params.row.fullName}
                </Typography>
            )
        },
        { field: "email", headerName: "Email", flex: 1, minWidth: 200 },
        { field: "role", headerName: "Role", width: 150 },
        { 
            field: "status", 
            headerName: "Status", 
            width: 150,
            renderCell: (params) => (
                <StatusBadge status={params.row.accountStatus || "PENDING"} />
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
                    <Tooltip title="Approve" arrow>
                        <IconButton size="small" color="success" onClick={(e) => { e.stopPropagation(); handleOpenDialog(params.row, "APPROVED"); }}>
                            <CheckCircleIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Reject" arrow>
                        <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleOpenDialog(params.row, "REJECTED"); }}>
                            <CancelIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            )
        }
    ], []);

    return (
        <DashboardLayout>
            <PageHeader 
                title="Pending User Approvals" 
                subtitle="Review and approve user registrations."
            />

            <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider', mb: 3 }}>
                <TableToolbar 
                    title="Pending Approvals" 
                    onSearch={handleSearch}
                />
                
                <Box sx={{ height: 500 }}>
                    <DataGrid 
                        rows={filteredUsers} 
                        columns={columns} 
                        loading={loading}
                        error={error}
                        onRetry={fetchPendingUsers}
                        disableRowSelectionOnClick
                    />
                </Box>
            </Box>

            {/* Approval Dialog */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {approvalStatus === "APPROVED" ? "Approve User" : "Reject User"}
                </DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body1" mb={2}>
                        Are you sure you want to {approvalStatus === "APPROVED" ? "approve" : "reject"} <strong>{selectedUser?.fullName}</strong>?
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
        </DashboardLayout>
    );
};

export default MainAdminApprovalsPage;
