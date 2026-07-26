import React, { useState, useEffect, useMemo, useCallback } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import WidgetContainer from "../../components/widgets/WidgetContainer";
import SearchBar from "../../components/common/SearchBar";
import DataGrid from "../../components/common/DataGrid";
import {
    Box,
    Chip,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Tooltip,
} from "@mui/material";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import { getEmailHistory } from "../../services/EmailService";

const STATUSES = ["ALL", "SENT", "FAILED", "SUPPRESSED", "DISABLED_BY_USER"];

function relativeTime(dateStr) {
    if (!dateStr) return "—";
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diffSec = Math.floor((now - then) / 1000);
    if (diffSec < 60) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} mins ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hrs ago`;
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

const STATUS_COLOR_MAP = {
    SENT: "success",
    FAILED: "error",
    SUPPRESSED: "warning",
    DISABLED_BY_USER: "default",
};

function EmailHistoryPage() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getEmailHistory();
            setHistory(data || []);
        } catch (err) {
            setError(err?.response?.data?.message || err.message || "Failed to load email history");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchHistory(); }, [fetchHistory]);

    const filteredHistory = useMemo(() => {
        return history.filter((item) => {
            const term = search.toLowerCase();
            const matchSearch =
                (item.recipient && item.recipient.toLowerCase().includes(term)) ||
                (item.subject && item.subject.toLowerCase().includes(term)) ||
                (item.emailType && item.emailType.toLowerCase().includes(term));
            const matchStatus = statusFilter === "ALL" || item.status === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [history, search, statusFilter]);

    const columns = useMemo(() => [
        {
            field: "recipient",
            headerName: "Recipient",
            flex: 1.2,
            minWidth: 180,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={600} color="text.primary">
                    {params.value}
                </Typography>
            ),
        },
        {
            field: "emailType",
            headerName: "Email Type",
            width: 160,
            renderCell: (params) => (
                <Chip
                    label={params.value || "GENERIC"}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                />
            ),
        },
        {
            field: "subject",
            headerName: "Subject",
            flex: 2,
            minWidth: 220,
            renderCell: (params) => (
                <Tooltip title={params.value} arrow>
                    <Typography variant="body2" color="text.secondary" noWrap sx={{ fontSize: "0.8125rem" }}>
                        {params.value}
                    </Typography>
                </Tooltip>
            ),
        },
        {
            field: "status",
            headerName: "Delivery Status",
            width: 160,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    color={STATUS_COLOR_MAP[params.value] || "default"}
                    size="small"
                    sx={{ fontWeight: 700, fontSize: "0.72rem" }}
                />
            ),
        },
        {
            field: "sentTime",
            headerName: "Sent Time",
            width: 150,
            renderCell: (params) => (
                <Tooltip title={params.value ? new Date(params.value).toLocaleString() : ""} arrow>
                    <Typography variant="caption" color="text.secondary">
                        {relativeTime(params.value)}
                    </Typography>
                </Tooltip>
            ),
        },
        {
            field: "failureReason",
            headerName: "Details / Reason",
            flex: 1.5,
            minWidth: 200,
            renderCell: (params) => (
                <Typography variant="caption" color={params.row.status === "FAILED" ? "error.main" : "text.secondary"} noWrap>
                    {params.value || (params.row.status === "SENT" ? "Delivered successfully" : "N/A")}
                </Typography>
            ),
        },
    ], []);

    return (
        <DashboardLayout>
            <PageHeader
                title="Email Delivery History"
                subtitle="Complete audit log of all system emails, delivery statuses, duplicate suppressions, and user preferences."
            />

            <WidgetContainer>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                    <SearchBar
                        value={search}
                        onChange={setSearch}
                        onClear={() => setSearch("")}
                        placeholder="Search by recipient, type, or subject..."
                        sx={{ width: { xs: "100%", sm: 300 } }}
                    />
                    <FormControl size="small" sx={{ minWidth: 180 }}>
                        <InputLabel>Delivery Status</InputLabel>
                        <Select
                            value={statusFilter}
                            label="Delivery Status"
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            {STATUSES.map((s) => (
                                <MenuItem key={s} value={s}>{s === "ALL" ? "All Statuses" : s}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>

                <Box sx={{ height: 550 }}>
                    <DataGrid
                        rows={filteredHistory}
                        columns={columns}
                        loading={loading}
                        error={error}
                        onRetry={fetchHistory}
                    />
                </Box>
            </WidgetContainer>
        </DashboardLayout>
    );
}

export default EmailHistoryPage;
