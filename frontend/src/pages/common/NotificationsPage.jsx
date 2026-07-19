import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import WidgetContainer from "../../components/widgets/WidgetContainer";
import TableToolbar from "../../components/common/TableToolbar";
import DataGrid from "../../components/common/DataGrid";
import SearchBar from "../../components/common/SearchBar";
import {
    Box,
    Button,
    Chip,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { AlertService } from "../../services/AlertService";
import { useNotification } from "../../context/NotificationContext";

const SEVERITIES = ["ALL", "LOW", "MEDIUM", "HIGH", "CRITICAL"];
const STATUSES = ["ALL", "ACTIVE", "READ", "RESOLVED"];

function NotificationsPage() {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [search, setSearch] = useState("");
    const [severityFilter, setSeverityFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const fetchAlerts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await AlertService.getMyAlerts();
            setAlerts(data || []);
        } catch (err) {
            setError(err?.response?.data?.message || err.message || "Failed to load notifications");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAlerts();
    }, [fetchAlerts]);

    const handleMarkAsRead = async (id) => {
        try {
            await AlertService.markAlertAsRead(id);
            showNotification("Notification marked as read.", "success");
            fetchAlerts();
        } catch (err) {
            showNotification(err?.response?.data?.message || "Failed to mark as read.", "error");
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await AlertService.markAllAlertsAsRead();
            showNotification("All notifications marked as read.", "success");
            fetchAlerts();
        } catch (err) {
            showNotification("Failed to mark all as read.", "error");
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case "LOW": return "success";
            case "MEDIUM": return "info";
            case "HIGH": return "warning";
            case "CRITICAL": return "error";
            default: return "default";
        }
    };

    const handleNotificationClick = async (alert) => {
        if (alert.status !== "READ") {
            try {
                await AlertService.markAlertAsRead(alert.id);
            } catch (e) {
                console.error("Failed to mark read on click", e);
            }
        }
        // Redirect to target route
        let route = "/";
        if (alert.alertType) {
            switch (alert.alertType) {
                case "BILL_GENERATED":
                case "BILL_OVERDUE":
                case "PAYMENT_SUCCESS":
                case "PAYMENT_FAILED":
                    route = "/user/bills";
                    break;
                case "HIGH_WATER_USAGE":
                case "SUSPECTED_LEAK":
                    route = "/user/usage";
                    break;
                case "METER_OFFLINE":
                    route = "/user/meter";
                    break;
                case "REGISTRATION_PENDING":
                    route = "/community-admin/approvals";
                    break;
                case "COMPLAINT_CREATED":
                    route = "/community-admin/complaints";
                    break;
                case "COMPLAINT_STATUS_UPDATED":
                    route = "/user/complaints?tab=history";
                    break;
                default:
                    route = "/";
            }
        }
        navigate(route);
    };

    // Filter and search logic in frontend for fast responsive search
    const filteredAlerts = useMemo(() => {
        return alerts
            .filter(a => {
                const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) || 
                                    a.message.toLowerCase().includes(search.toLowerCase()) ||
                                    (a.alertNumber && a.alertNumber.toLowerCase().includes(search.toLowerCase()));
                const matchSeverity = severityFilter === "ALL" || a.severity === severityFilter;
                const matchStatus = statusFilter === "ALL" || 
                                    (statusFilter === "ACTIVE" && a.status === "ACTIVE") || 
                                    (statusFilter === "READ" && a.status === "READ");
                return matchSearch && matchSeverity && matchStatus;
            })
            .sort((x, y) => new Date(y.createdDate) - new Date(x.createdDate));
    }, [alerts, search, severityFilter, statusFilter]);

    const columns = useMemo(() => [
        { field: "alertNumber", headerName: "Alert #", width: 130 },
        { field: "title", headerName: "Title", width: 200, renderCell: (params) => (
            <span style={{ fontWeight: params.row.status === "ACTIVE" ? "bold" : "normal" }}>
                {params.value}
            </span>
        )},
        { field: "message", headerName: "Message", flex: 1.5, minWidth: 250 },
        { field: "severity", headerName: "Severity", width: 110, renderCell: (params) => (
            <Chip label={params.value} color={getSeverityColor(params.value)} size="small" />
        )},
        { field: "status", headerName: "Status", width: 110, renderCell: (params) => (
            <Chip label={params.value} variant="outlined" color={params.value === "ACTIVE" ? "primary" : "default"} size="small" />
        )},
        { field: "createdDate", headerName: "Received", width: 170, renderCell: (params) => (
            params.value ? new Date(params.value).toLocaleString() : "-"
        )},
        {
            field: "actions",
            headerName: "Actions",
            width: 250,
            sortable: false,
            renderCell: (params) => (
                <Stack direction="row" spacing={1}>
                    <Button variant="contained" size="small" color="primary" onClick={() => handleNotificationClick(params.row)}>
                        Open Page
                    </Button>
                    {params.row.status === "ACTIVE" && (
                        <Button variant="outlined" size="small" color="success" startIcon={<CheckIcon />} onClick={() => handleMarkAsRead(params.row.id)}>
                            Mark Read
                        </Button>
                    )}
                </Stack>
            )
        }
    ], []);

    return (
        <DashboardLayout>
            <PageHeader
                title="System Notifications"
                subtitle="Review system updates, billing alerts, and tickets status."
                action={
                    <Button variant="outlined" color="primary" startIcon={<DoneAllIcon />} onClick={handleMarkAllRead}>
                        Mark All Read
                    </Button>
                }
            />

            <WidgetContainer>
                <TableToolbar
                    title="My Notifications"
                    action={
                        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                            <SearchBar
                                value={search}
                                onChange={setSearch}
                                onClear={() => setSearch("")}
                                placeholder="Search alerts..."
                                sx={{ width: 220 }}
                            />
                            <FormControl size="small" sx={{ minWidth: 130 }}>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={statusFilter}
                                    label="Status"
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    {STATUSES.map(s => (
                                        <MenuItem key={s} value={s}>{s}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ minWidth: 130 }}>
                                <InputLabel>Severity</InputLabel>
                                <Select
                                    value={severityFilter}
                                    label="Severity"
                                    onChange={(e) => setSeverityFilter(e.target.value)}
                                >
                                    {SEVERITIES.map(sev => (
                                        <MenuItem key={sev} value={sev}>{sev}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Stack>
                    }
                />
                <Box sx={{ mt: 3, height: 500 }}>
                    <DataGrid
                        rows={filteredAlerts}
                        columns={columns}
                        loading={loading}
                        error={error}
                        onRetry={fetchAlerts}
                    />
                </Box>
            </WidgetContainer>
        </DashboardLayout>
    );
}

export default NotificationsPage;
