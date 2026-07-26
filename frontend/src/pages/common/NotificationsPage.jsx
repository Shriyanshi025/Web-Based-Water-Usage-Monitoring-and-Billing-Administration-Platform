import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import WidgetContainer from "../../components/widgets/WidgetContainer";
import SearchBar from "../../components/common/SearchBar";
import DataGrid from "../../components/common/DataGrid";
import {
    Box,
    Button,
    Chip,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Tooltip,
} from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import CheckIcon from "@mui/icons-material/Check";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { AlertService } from "../../services/AlertService";
import { useNotification } from "../../context/NotificationContext";
import { useAuth } from "../../context/AuthContext";
import { alpha } from "@mui/material/styles";

const SEVERITIES = ["ALL", "LOW", "MEDIUM", "HIGH", "CRITICAL"];
const STATUSES   = ["ALL", "ACTIVE", "READ", "RESOLVED"];

// ── Relative timestamp helper ─────────────────────────────────────────────────
function relativeTime(dateStr) {
    if (!dateStr) return "—";
    const now  = Date.now();
    const then = new Date(dateStr).getTime();
    const diffSec = Math.floor((now - then) / 1000);
    if (diffSec < 60)  return "Just now";
    if (diffSec < 3600) {
        const m = Math.floor(diffSec / 60);
        return `${m} minute${m > 1 ? "s" : ""} ago`;
    }
    if (diffSec < 86400) {
        const h = Math.floor(diffSec / 3600);
        return `${h} hour${h > 1 ? "s" : ""} ago`;
    }
    if (diffSec < 604800) {
        const d = Math.floor(diffSec / 86400);
        return `${d} day${d > 1 ? "s" : ""} ago`;
    }
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// ── Severity chip color map ───────────────────────────────────────────────────
const SEVERITY_COLOR = {
    LOW:      "success",
    MEDIUM:   "info",
    HIGH:     "warning",
    CRITICAL: "error",
};

function NotificationsPage() {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const { user } = useAuth();
    const [alerts, setAlerts]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);
    const [markingId, setMarkingId] = useState(null);
    const [markingAll, setMarkingAll] = useState(false);

    const [search, setSearch]             = useState("");
    const [severityFilter, setSeverityFilter] = useState("ALL");
    const [statusFilter, setStatusFilter]     = useState("ALL");

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

    useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

    const handleMarkAsRead = async (id) => {
        setMarkingId(id);
        try {
            await AlertService.markAlertAsRead(id);
            showNotification("Notification marked as read.", "success");
            fetchAlerts();
        } catch (err) {
            showNotification("Failed to mark notification as read.", "error");
        } finally {
            setMarkingId(null);
        }
    };

    const handleDismiss = async (id) => {
        setMarkingId(id);
        try {
            await AlertService.resolveAlert(id);
            showNotification("Notification dismissed.", "info");
            fetchAlerts();
        } catch (err) {
            showNotification("Failed to dismiss notification.", "error");
        } finally {
            setMarkingId(null);
        }
    };

    const handleMarkAllRead = async () => {
        setMarkingAll(true);
        try {
            await AlertService.markAllAlertsAsRead();
            showNotification("All notifications marked as read.", "success");
            fetchAlerts();
        } catch (err) {
            showNotification("Failed to mark all as read.", "error");
        } finally {
            setMarkingAll(false);
        }
    };

    const handleNotificationClick = async (alert) => {
        if (alert.status !== "READ") {
            try { await AlertService.markAlertAsRead(alert.id); } catch (_) {}
        }

        const role = user?.role;
        const isCommunityAdmin = role === "COMMUNITY_ADMIN";
        const isMainAdmin = role === "MAIN_ADMIN";

        // Determine the correct prefix based on role
        const prefix = isCommunityAdmin
            ? "/community-admin"
            : isMainAdmin
                ? "/main-admin"
                : "/user";

        // Route map: alert type → destination path
        // Community/Main Admin: meter/usage/bill types go to the admin equivalents
        const routeMap = isCommunityAdmin || isMainAdmin
            ? {
                BILL_GENERATED:           `${prefix}/bills`,
                BILL_OVERDUE:             `${prefix}/bills`,
                PAYMENT_SUCCESS:          `${prefix}/bills`,
                PAYMENT_FAILED:           `${prefix}/bills`,
                HIGH_WATER_USAGE:         `${prefix}/usage`,
                ABNORMAL_HIGH_USAGE:      `${prefix}/usage`,
                ABNORMAL_LOW_USAGE:       `${prefix}/usage`,
                SUSPECTED_LEAK:           `${prefix}/usage`,
                POSSIBLE_LEAK:            `${prefix}/usage`,
                CONTINUOUS_CONSUMPTION:   `${prefix}/usage`,
                METER_OFFLINE:            `${prefix}/meters`,
                METER_STUCK:              `${prefix}/meters`,
                INVALID_READING:          `${prefix}/usage`,
                MANUAL_TAMPERING:         `${prefix}/meters`,
                REGISTRATION_PENDING:     "/community-admin/approvals",
                COMPLAINT_CREATED:        "/community-admin/complaints",
                COMPLAINT_STATUS_UPDATED: "/community-admin/complaints",
            }
            : {
                BILL_GENERATED:           "/user/bills",
                BILL_OVERDUE:             "/user/bills",
                PAYMENT_SUCCESS:          "/user/bills",
                PAYMENT_FAILED:           "/user/bills",
                HIGH_WATER_USAGE:         "/user/usage",
                ABNORMAL_HIGH_USAGE:      "/user/usage",
                ABNORMAL_LOW_USAGE:       "/user/usage",
                SUSPECTED_LEAK:           "/user/usage",
                POSSIBLE_LEAK:            "/user/usage",
                CONTINUOUS_CONSUMPTION:   "/user/usage",
                METER_OFFLINE:            "/user/meter",
                METER_STUCK:              "/user/meter",
                INVALID_READING:          "/user/usage",
                MANUAL_TAMPERING:         "/user/meter",
                REGISTRATION_PENDING:     "/user/notifications",
                COMPLAINT_CREATED:        "/user/complaints",
                COMPLAINT_STATUS_UPDATED: "/user/complaints",
            };

        navigate(routeMap[alert.alertType] || `${prefix}/notifications`);
    };

    const filteredAlerts = useMemo(() => {
        return alerts
            .filter((a) => {
                const term = search.toLowerCase();
                const matchSearch =
                    a.title.toLowerCase().includes(term) ||
                    a.message.toLowerCase().includes(term) ||
                    (a.alertNumber && a.alertNumber.toLowerCase().includes(term));
                const matchSeverity = severityFilter === "ALL" || a.severity === severityFilter;
                const matchStatus   = statusFilter === "ALL" || a.status === statusFilter;
                return matchSearch && matchSeverity && matchStatus;
            })
            .sort((x, y) => new Date(y.createdDate) - new Date(x.createdDate));
    }, [alerts, search, severityFilter, statusFilter]);

    const unreadCount = useMemo(
        () => alerts.filter((a) => a.status === "ACTIVE").length,
        [alerts]
    );

    // ── DataGrid columns ──────────────────────────────────────────────────────
    const columns = useMemo(() => [
        {
            field: "alertNumber",
            headerName: "Alert #",
            width: 110,
            renderCell: (params) => (
                <Typography
                    variant="body2"
                    sx={{ fontFamily: "monospace", fontSize: "0.8125rem", color: "text.secondary" }}
                >
                    {params.value || "—"}
                </Typography>
            ),
        },
        {
            field: "title",
            headerName: "Title",
            flex: 1.2,
            minWidth: 180,
            renderCell: (params) => (
                <Stack direction="row" alignItems="center" spacing={1}>
                    {params.row.status === "ACTIVE" && (
                        <Box
                            sx={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                bgcolor: "primary.main",
                                flexShrink: 0,
                            }}
                        />
                    )}
                    <Typography
                        sx={{
                            fontWeight: params.row.status === "ACTIVE" ? 700 : 400,
                            fontSize: "0.8125rem",
                            color: "text.primary",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {params.value}
                    </Typography>
                </Stack>
            ),
        },
        {
            field: "message",
            headerName: "Message",
            flex: 2,
            minWidth: 220,
            renderCell: (params) => (
                <Tooltip title={params.value} arrow enterDelay={600}>
                    <Typography
                        variant="body2"
                        sx={{
                            color: "text.secondary",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontSize: "0.8125rem",
                        }}
                    >
                        {params.value}
                    </Typography>
                </Tooltip>
            ),
        },
        {
            field: "severity",
            headerName: "Severity",
            width: 110,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    color={SEVERITY_COLOR[params.value] || "default"}
                    size="small"
                    variant="filled"
                />
            ),
        },
        {
            field: "status",
            headerName: "Status",
            width: 100,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    variant={params.value === "ACTIVE" ? "filled" : "outlined"}
                    color={params.value === "ACTIVE" ? "primary" : "default"}
                    size="small"
                />
            ),
        },
        {
            field: "createdDate",
            headerName: "Received",
            width: 140,
            renderCell: (params) => (
                <Tooltip
                    title={params.value ? new Date(params.value).toLocaleString() : ""}
                    arrow
                    enterDelay={400}
                >
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                        {relativeTime(params.value)}
                    </Typography>
                </Tooltip>
            ),
        },
        {
            field: "actions",
            headerName: "Actions",
            width: 240,
            sortable: false,
            renderCell: (params) => (
                <Stack direction="row" spacing={0.75}>
                    <Tooltip title="Open related page" arrow>
                        <Button
                            variant="contained"
                            size="small"
                            color="primary"
                            startIcon={<OpenInNewIcon sx={{ fontSize: "0.9rem" }} />}
                            onClick={() => handleNotificationClick(params.row)}
                            sx={{ px: 1, fontSize: "0.75rem" }}
                        >
                            Open
                        </Button>
                    </Tooltip>
                    {params.row.status === "ACTIVE" && (
                        <Tooltip title="Mark as read" arrow>
                            <Button
                                variant="outlined"
                                size="small"
                                color="success"
                                startIcon={
                                    markingId === params.row.id
                                        ? null
                                        : <CheckIcon sx={{ fontSize: "0.9rem" }} />
                                }
                                onClick={() => handleMarkAsRead(params.row.id)}
                                disabled={markingId === params.row.id}
                                sx={{ px: 1, fontSize: "0.75rem", minWidth: 0 }}
                            >
                                {markingId === params.row.id ? "…" : "Read"}
                            </Button>
                        </Tooltip>
                    )}
                    {params.row.status !== "RESOLVED" && (
                        <Tooltip title="Dismiss alert" arrow>
                            <Button
                                variant="outlined"
                                size="small"
                                color="inherit"
                                onClick={() => handleDismiss(params.row.id)}
                                disabled={markingId === params.row.id}
                                sx={{ px: 1, fontSize: "0.75rem", minWidth: 0 }}
                            >
                                Dismiss
                            </Button>
                        </Tooltip>
                    )}
                </Stack>
            ),
        },
    ], [markingId]);

    return (
        <DashboardLayout>
            <PageHeader
                title="Notifications"
                subtitle={
                    unreadCount > 0
                        ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}.`
                        : "All notifications are up to date."
                }
                action={
                    <Button
                        variant="outlined"
                        size="small"
                        color="primary"
                        startIcon={markingAll ? null : <DoneAllIcon />}
                        onClick={handleMarkAllRead}
                        disabled={markingAll || unreadCount === 0}
                    >
                        {markingAll ? "Marking…" : "Mark All Read"}
                    </Button>
                }
            />

            <WidgetContainer>
                {/* ── Toolbar ── */}
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    alignItems={{ xs: "stretch", sm: "center" }}
                    sx={{ mb: 3 }}
                    flexWrap="wrap"
                >
                    <SearchBar
                        value={search}
                        onChange={setSearch}
                        onClear={() => setSearch("")}
                        placeholder="Search notifications…"
                        sx={{ width: { xs: "100%", sm: 240 } }}
                    />
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={statusFilter}
                            label="Status"
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            {STATUSES.map((s) => (
                                <MenuItem key={s} value={s}>{s === "ALL" ? "All Statuses" : s}</MenuItem>
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
                            {SEVERITIES.map((sev) => (
                                <MenuItem key={sev} value={sev}>{sev === "ALL" ? "All Severities" : sev}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Unread badge in toolbar */}
                    {unreadCount > 0 && (
                        <Chip
                            icon={<NotificationsNoneIcon sx={{ fontSize: "0.9rem" }} />}
                            label={`${unreadCount} unread`}
                            color="primary"
                            size="small"
                            variant="filled"
                        />
                    )}
                </Stack>

                {/* ── Data Grid ── */}
                <Box sx={{ height: 520 }}>
                    <DataGrid
                        rows={filteredAlerts}
                        columns={columns}
                        loading={loading}
                        error={error}
                        onRetry={fetchAlerts}
                        // Style unread rows with a subtle background tint
                        sx={{
                            "& .notification-row-unread": {
                                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                                "&:hover": {
                                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                },
                            },
                        }}
                        getRowClassName={(params) =>
                            params.row.status === "ACTIVE" ? "notification-row-unread" : ""
                        }
                    />
                </Box>
            </WidgetContainer>
        </DashboardLayout>
    );
}

export default NotificationsPage;
