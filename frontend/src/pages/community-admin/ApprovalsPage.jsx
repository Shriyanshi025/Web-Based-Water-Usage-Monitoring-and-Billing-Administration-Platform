import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
    Box, 
    Typography,
    Stack,
    IconButton,
    Tooltip
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";

import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import DataGrid from "../../components/common/DataGrid";
import TableToolbar from "../../components/common/TableToolbar";
import ConfirmationDialog from "../../components/common/ConfirmationDialog";
import StatusBadge from "../../components/common/StatusBadge";

import CommunityOpsService from "../../services/CommunityOpsService";

const ApprovalsPage = () => {
    const [pendingResidents, setPendingResidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // UI State
    const [dialogConfig, setDialogConfig] = useState({ open: false, title: "", content: "", onConfirm: null, confirmText: "", confirmColor: "primary" });

    const fetchPendingResidents = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await CommunityOpsService.getPendingResidents();
            setPendingResidents(data || []);
        } catch (err) {
            // Check if it's a 403 Forbidden which means backend doesn't support Community Admin approval yet
            if (err.response?.status === 403) {
                setError("Backend Support Pending: Approvals are currently restricted to Main Admin.");
            } else {
                setError(err.message || "Failed to fetch pending residents");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPendingResidents();
    }, [fetchPendingResidents]);

    const handleAction = useCallback((actionType, row) => {
        // Backend doesn't support community admin approval yet, so we mark it as coming soon
        const isBackendSupported = false;

        if (!isBackendSupported) {
            // Could show a toast here, but the buttons are disabled anyway
            return;
        }

        if (actionType === "APPROVE") {
            setDialogConfig({
                open: true,
                title: "Approve Resident",
                content: `Are you sure you want to approve ${row.firstName} ${row.lastName}?`,
                confirmText: "Approve",
                confirmColor: "success",
                onConfirm: async () => {
                    try {
                        await CommunityOpsService.approveResident(row.user?.id, { approvalStatus: "APPROVED", remarks: "Approved by Community Admin" });
                        setPendingResidents(prev => prev.filter(r => r.id !== row.id)); // Optimistic UI Update
                    } catch (err) {
                        console.error(err);
                    } finally {
                        setDialogConfig(prev => ({ ...prev, open: false }));
                    }
                }
            });
        } else if (actionType === "REJECT") {
            setDialogConfig({
                open: true,
                title: "Reject Resident",
                content: `Are you sure you want to reject ${row.firstName} ${row.lastName}?`,
                confirmText: "Reject",
                confirmColor: "error",
                onConfirm: async () => {
                    try {
                        await CommunityOpsService.approveResident(row.user?.id, { approvalStatus: "REJECTED", remarks: "Rejected by Community Admin" });
                        setPendingResidents(prev => prev.filter(r => r.id !== row.id)); // Optimistic UI Update
                    } catch (err) {
                        console.error(err);
                    } finally {
                        setDialogConfig(prev => ({ ...prev, open: false }));
                    }
                }
            });
        }
    }, []);

    const columns = useMemo(() => [
        { 
            field: "fullName", 
            headerName: "Resident Name", 
            flex: 1, 
            minWidth: 200,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={500}>
                    {`${params.row.firstName} ${params.row.lastName}`}
                </Typography>
            )
        },
        { field: "flatNumber", headerName: "Flat", width: 120 },
        { field: "email", headerName: "Email", flex: 1, minWidth: 200 },
        { 
            field: "status", 
            headerName: "Status", 
            width: 150,
            renderCell: () => (
                <StatusBadge status="PENDING" />
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
                    <Tooltip title="Backend Support Pending" arrow>
                        <span>
                            <IconButton 
                                size="small" 
                                color="success"
                                disabled={true}
                                onClick={(e) => { e.stopPropagation(); handleAction("APPROVE", params.row); }}
                            >
                                <CheckCircleIcon fontSize="small" />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title="Backend Support Pending" arrow>
                        <span>
                            <IconButton 
                                size="small" 
                                color="error"
                                disabled={true}
                                onClick={(e) => { e.stopPropagation(); handleAction("REJECT", params.row); }}
                            >
                                <CancelIcon fontSize="small" />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title="View Details" arrow>
                        <IconButton 
                            size="small"
                            onClick={(e) => { e.stopPropagation(); /* View logic here */ }}
                        >
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            )
        }
    ], [handleAction]);

    return (
        <DashboardLayout>
            <PageHeader 
                title="Resident Approvals" 
                subtitle="Review and manage pending resident registrations."
            />

            <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider', mb: 3 }}>
                <TableToolbar title="Pending Approvals" />
                
                <Box sx={{ height: 500 }}>
                    <DataGrid 
                        rows={pendingResidents} 
                        columns={columns} 
                        loading={loading}
                        error={error}
                        onRetry={fetchPendingResidents}
                        disableRowSelectionOnClick
                    />
                </Box>
            </Box>

            <ConfirmationDialog 
                open={dialogConfig.open}
                title={dialogConfig.title}
                content={dialogConfig.content}
                onConfirm={dialogConfig.onConfirm}
                onCancel={() => setDialogConfig(prev => ({ ...prev, open: false }))}
                confirmColor={dialogConfig.confirmColor}
                confirmText={dialogConfig.confirmText}
            />
        </DashboardLayout>
    );
};

export default ApprovalsPage;
