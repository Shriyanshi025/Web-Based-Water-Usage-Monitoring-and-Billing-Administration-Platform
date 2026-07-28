import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { 
    Box, 
    Typography, 
    Stack, 
    Button, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    TextField, 
    MenuItem, 
    Paper, 
    Grid,
    IconButton,
    Tooltip
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SendIcon from "@mui/icons-material/Send";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import FilterListIcon from "@mui/icons-material/FilterList";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

import DashboardLayout from "../../components/layout/DashboardLayout";
import PageSummaryHeader from "../../components/common/PageSummaryHeader";
import DataGrid from "../../components/common/DataGrid";
import TableToolbar from "../../components/common/TableToolbar";
import FilterBar from "../../components/common/FilterBar";
import StatusBadge from "../../components/common/StatusBadge";
import SupportTicketService from "../../services/SupportTicketService";
import { useNotification } from "../../context/NotificationContext";
import { UserCell, PriorityCell, DateCell, TextSubtextCell, formatEnum } from "../../components/common/DataGridCells";

const TICKET_STATUSES = [
    { value: "OPEN", label: "Open" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "WAITING_FOR_USER", label: "Waiting for User" },
    { value: "RESOLVED", label: "Resolved" },
    { value: "CLOSED", label: "Closed" }
];

const TICKET_CATEGORIES = [
    { value: "ALL", label: "All Categories" },
    { value: "COMMUNITY", label: "Community Issue" },
    { value: "BILLING", label: "Billing & Charges" },
    { value: "WATER_SUPPLY", label: "Water Supply & Pressure" },
    { value: "METER", label: "Water Meter Issue" },
    { value: "TECHNICAL", label: "Technical Bug" },
    { value: "PAYMENT", label: "Payment Gateway" },
    { value: "WEBSITE", label: "Website / Login" },
    { value: "SUGGESTION", label: "Suggestion / Feature Request" },
    { value: "OTHER", label: "Other" }
];

const TICKET_PRIORITIES = [
    { value: "ALL", label: "All Priorities" },
    { value: "LOW", label: "Low" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HIGH", label: "High" },
    { value: "URGENT", label: "Urgent" }
];

const CREATED_BY_OPTIONS = [
    { value: "ALL", label: "All Users" },
    { value: "USER", label: "Residents" },
    { value: "COMMUNITY_ADMIN", label: "Community Admins" }
];

const MainAdminSupportPage = () => {
    const { showNotification } = useNotification();
    const location = useLocation();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Filter states
    const [createdByFilter, setCreatedByFilter] = useState("ALL");
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [priorityFilter, setPriorityFilter] = useState("ALL");

    // Details & Discussion Modal
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [replies, setReplies] = useState([]);
    const [replyText, setReplyText] = useState("");
    const [sendingReply, setSendingReply] = useState(false);
    const [statusUpdate, setStatusUpdate] = useState("IN_PROGRESS");
    const [resolutionNotes, setResolutionNotes] = useState("");

    const fetchTickets = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await SupportTicketService.getMainAdminTickets();
            setTickets(res?.data || []);
        } catch (err) {
            setError(err.message || "Failed to load Main Admin support center tickets");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    // Handle deep-linked ticketNumber or ticketId from query parameters
    useEffect(() => {
        if (loading) return;
        const searchParams = new URLSearchParams(location.search);
        const ticketNum = searchParams.get("ticketNumber");
        const ticketId = searchParams.get("ticketId");

        if (ticketNum || ticketId) {
            const found = tickets.find(t => 
                (ticketNum && t?.ticketNumber?.toLowerCase() === ticketNum.toLowerCase()) ||
                (ticketId && String(t?.id) === String(ticketId))
            );
            if (found) {
                handleOpenDetails(found);
            } else if (tickets.length > 0 || !loading) {
                showNotification("This support ticket is no longer available.", "warning");
            }
        }
    }, [tickets, loading, location.search]);

    const stats = useMemo(() => {
        const total = tickets.length;
        const open = tickets.filter(t => t?.status === "OPEN").length;
        const inProgress = tickets.filter(t => t?.status === "IN_PROGRESS" || t?.status === "WAITING_FOR_USER").length;
        const resolved = tickets.filter(t => t?.status === "RESOLVED" || t?.status === "CLOSED").length;
        return { total, open, inProgress, resolved };
    }, [tickets]);

    const isFilterActive = useMemo(() => {
        return createdByFilter !== "ALL" || categoryFilter !== "ALL" || statusFilter !== "ALL" || priorityFilter !== "ALL";
    }, [createdByFilter, categoryFilter, statusFilter, priorityFilter]);

    const handleResetFilters = () => {
        setCreatedByFilter("ALL");
        setCategoryFilter("ALL");
        setStatusFilter("ALL");
        setPriorityFilter("ALL");
    };

    const filteredTickets = useMemo(() => {
        return tickets.filter(t => {
            // Search query
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const matchesSearch = 
                    t?.ticketNumber?.toLowerCase().includes(q) ||
                    t?.title?.toLowerCase().includes(q) ||
                    t?.createdByName?.toLowerCase().includes(q) ||
                    t?.createdByRole?.toLowerCase().includes(q) ||
                    t?.category?.toLowerCase().includes(q);
                if (!matchesSearch) return false;
            }

            // Created By Filter
            if (createdByFilter !== "ALL") {
                const role = (t?.createdByRole || "").toUpperCase();
                if (createdByFilter === "USER" && role !== "USER" && role !== "RESIDENT") return false;
                if (createdByFilter === "COMMUNITY_ADMIN" && role !== "COMMUNITY_ADMIN") return false;
            }

            // Category Filter
            if (categoryFilter !== "ALL") {
                if ((t?.category || "").toUpperCase() !== categoryFilter) return false;
            }

            // Status Filter
            if (statusFilter !== "ALL") {
                if ((t?.status || "").toUpperCase() !== statusFilter) return false;
            }

            // Priority Filter
            if (priorityFilter !== "ALL") {
                if ((t?.priority || "").toUpperCase() !== priorityFilter) return false;
            }

            return true;
        });
    }, [tickets, searchQuery, createdByFilter, categoryFilter, statusFilter, priorityFilter]);

    const handleOpenDetails = async (ticket) => {
        if (!ticket) return;
        setSelectedTicket(ticket);
        setStatusUpdate(ticket.status || "IN_PROGRESS");
        setResolutionNotes(ticket.resolutionNotes || "");
        setDetailsOpen(true);
        try {
            const replyRes = await SupportTicketService.getTicketReplies(ticket.id);
            setReplies(replyRes?.data || []);
        } catch (err) {
            setReplies([]);
        }
    };

    const handleSendReply = async () => {
        if (!replyText.trim() || !selectedTicket) return;
        try {
            setSendingReply(true);
            await SupportTicketService.addReply(selectedTicket.id, { message: replyText });
            setReplyText("");
            const replyRes = await SupportTicketService.getTicketReplies(selectedTicket.id);
            setReplies(replyRes?.data || []);
            showNotification("Reply sent.", "success");
            fetchTickets();
        } catch (err) {
            showNotification(err.response?.data?.message || "Failed to send reply", "error");
        } finally {
            setSendingReply(false);
        }
    };

    const handleUpdateStatus = async () => {
        if (!selectedTicket) return;
        try {
            await SupportTicketService.updateTicketStatus(selectedTicket.id, {
                status: statusUpdate,
                resolutionNotes: resolutionNotes
            });
            showNotification("Ticket status updated successfully.", "success");
            setDetailsOpen(false);
            fetchTickets();
        } catch (err) {
            showNotification(err.response?.data?.message || "Failed to update status", "error");
        }
    };

    const columns = useMemo(() => [
        { 
            field: "ticketNumber", 
            headerName: "Ticket #", 
            width: 150,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={700} color="primary.main">
                    {params?.row?.ticketNumber || "—"}
                </Typography>
            )
        },
        { 
            field: "title", 
            headerName: "Subject / Title", 
            flex: 1, 
            minWidth: 200,
            renderCell: (params) => (
                <TextSubtextCell 
                    primary={params?.row?.title} 
                    secondary={params?.row?.communityName ? `Community: ${params.row.communityName}` : null}
                />
            )
        },
        { 
            field: "createdByName", 
            headerName: "Created By", 
            flex: 1.2, 
            minWidth: 200,
            renderCell: (params) => (
                <UserCell 
                    name={params?.value || params?.row?.createdByName} 
                    role={params?.row?.createdByRole} 
                    email={params?.row?.createdByEmail} 
                />
            )
        },
        { 
            field: "category", 
            headerName: "Category", 
            width: 150,
            valueGetter: (params) => formatEnum(params?.row?.category || params?.value)
        },
        { 
            field: "priority", 
            headerName: "Priority", 
            width: 120,
            renderCell: (params) => (
                <PriorityCell priority={params?.row?.priority || params?.value} />
            )
        },
        { 
            field: "createdAt", 
            headerName: "Created On", 
            width: 140,
            renderCell: (params) => (
                <DateCell date={params?.row?.createdAt || params?.value} />
            )
        },
        { 
            field: "updatedAt", 
            headerName: "Last Updated", 
            width: 140,
            renderCell: (params) => (
                <DateCell date={params?.row?.updatedAt || params?.value} />
            )
        },
        { 
            field: "status", 
            headerName: "Status", 
            width: 130,
            renderCell: (params) => (
                <StatusBadge status={params?.row?.status || params?.value || "OPEN"} />
            )
        },
        { 
            field: "actions", 
            headerName: "Actions", 
            width: 110,
            align: "center",
            renderCell: (params) => (
                <Tooltip title="View & Resolve Ticket" arrow>
                    <IconButton size="small" color="primary" onClick={() => params?.row && handleOpenDetails(params.row)}>
                        <VisibilityIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            )
        }
    ], []);

    const headerMetadata = useMemo(() => [
        { label: "Total System Tickets", value: stats.total },
        { label: "Open / Unresolved", value: stats.open, color: "error" },
        { label: "In Progress", value: stats.inProgress, color: "warning" },
        { label: "Resolved", value: stats.resolved, color: "success" },
    ], [stats]);

    return (
        <DashboardLayout>
            <PageSummaryHeader 
                title="Main Support Center" 
                subtitle="Overview of system support requests, platform issues, and requests from Community Admins."
                icon={ConfirmationNumberIcon}
                metadata={headerMetadata}
            />

            {/* Professional Filter Bar */}
            <FilterBar>
                <TextField 
                    select 
                    size="small" 
                    label="Created By" 
                    value={createdByFilter} 
                    onChange={(e) => setCreatedByFilter(e.target.value)}
                    sx={{ minWidth: 160 }}
                >
                    {CREATED_BY_OPTIONS.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                </TextField>

                <TextField 
                    select 
                    size="small" 
                    label="Category" 
                    value={categoryFilter} 
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    sx={{ minWidth: 170 }}
                >
                    {TICKET_CATEGORIES.map(c => (
                        <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                    ))}
                </TextField>

                <TextField 
                    select 
                    size="small" 
                    label="Status" 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{ minWidth: 160 }}
                >
                    <MenuItem value="ALL">All Statuses</MenuItem>
                    {TICKET_STATUSES.map(s => (
                        <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                    ))}
                </TextField>

                <TextField 
                    select 
                    size="small" 
                    label="Priority" 
                    value={priorityFilter} 
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    sx={{ minWidth: 150 }}
                >
                    {TICKET_PRIORITIES.map(p => (
                        <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
                    ))}
                </TextField>

                {isFilterActive && (
                    <Button 
                        size="small" 
                        color="secondary" 
                        startIcon={<RestartAltIcon />} 
                        onClick={handleResetFilters}
                        sx={{ ml: "auto", textTransform: "none", fontWeight: 600 }}
                    >
                        Reset Filters
                    </Button>
                )}
            </FilterBar>

            <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider', mb: 3 }}>
                <TableToolbar 
                    title="All System & Portal Tickets" 
                    count={filteredTickets.length}
                    onSearch={(q) => setSearchQuery(q)}
                />

                {!loading && filteredTickets.length === 0 ? (
                    <Box sx={{ p: 6, textAlign: "center" }}>
                        <ConfirmationNumberIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1.5, opacity: 0.7 }} />
                        <Typography variant="h6" fontWeight={700} color="text.primary" gutterBottom>
                            No support tickets match your filter criteria.
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 480, mx: "auto", mb: 2 }}>
                            Try resetting your filters or clearing your search term.
                        </Typography>
                        {isFilterActive && (
                            <Button variant="outlined" size="small" onClick={handleResetFilters}>
                                Reset All Filters
                            </Button>
                        )}
                    </Box>
                ) : (
                    <Box sx={{ height: 540 }}>
                        <DataGrid 
                            rows={filteredTickets} 
                            columns={columns} 
                            loading={loading}
                            error={error}
                            emptyTitle="No support tickets available."
                            emptyMessage="There are currently no support requests matching the active criteria."
                            onRetry={fetchTickets}
                            disableRowSelectionOnClick
                        />
                    </Box>
                )}
            </Box>

            {/* Manage & Details Modal */}
            <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
                {selectedTicket && (
                    <>
                        <DialogTitle sx={{ pb: 1 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="h6" fontWeight={700}>
                                        {selectedTicket.title}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Ticket #{selectedTicket.ticketNumber} · Submitted by <strong>{selectedTicket.createdByName}</strong> ({selectedTicket.createdByEmail}) on {selectedTicket.createdAt ? new Date(selectedTicket.createdAt).toLocaleDateString() : "N/A"}
                                    </Typography>
                                </Box>
                                <StatusBadge status={selectedTicket.status} />
                            </Stack>
                        </DialogTitle>
                        <DialogContent dividers>
                            <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: "grey.50" }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 0.5 }}>
                                    DESCRIPTION / TICKET DETAILS
                                </Typography>
                                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                                    {selectedTicket.description}
                                </Typography>
                            </Paper>

                            {/* Status & Resolution Form */}
                            <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: "background.default" }}>
                                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                                    Main Admin Ticket Action & Status
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <TextField 
                                            fullWidth 
                                            size="small" 
                                            select 
                                            label="Change Status" 
                                            value={statusUpdate} 
                                            onChange={(e) => setStatusUpdate(e.target.value)}
                                        >
                                            {TICKET_STATUSES.map(s => (
                                                <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 8 }}>
                                        <TextField 
                                            fullWidth 
                                            size="small" 
                                            label="Resolution Notes" 
                                            placeholder="Provide resolution note or technical diagnosis..." 
                                            value={resolutionNotes} 
                                            onChange={(e) => setResolutionNotes(e.target.value)} 
                                        />
                                    </Grid>
                                </Grid>
                                <Box sx={{ mt: 1.5, display: "flex", justifyContent: "flex-end" }}>
                                    <Button variant="contained" color="primary" size="small" onClick={handleUpdateStatus}>
                                        Save Resolution & Status
                                    </Button>
                                </Box>
                            </Paper>

                            {/* Discussion Thread */}
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                                Discussion Thread ({replies.length} replies)
                            </Typography>
                            <Box sx={{ maxHeight: 260, overflowY: "auto", mb: 2.5, pr: 1 }}>
                                {replies.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                                        No replies yet. Send a response below.
                                    </Typography>
                                ) : (
                                    <Stack spacing={1.5}>
                                        {replies.map(r => (
                                            <Paper key={r.id} variant="outlined" sx={{ p: 1.5, bgcolor: r.senderRole === "MAIN_ADMIN" ? "primary.50" : "grey.50" }}>
                                                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                                    <Typography variant="caption" fontWeight={700} color="primary.main">
                                                        {r.senderName} ({r.senderRole})
                                                    </Typography>
                                                    <Typography variant="caption" color="text.disabled">
                                                        {r.createdAt ? new Date(r.createdAt).toLocaleString() : ""}
                                                    </Typography>
                                                </Stack>
                                                <Typography variant="body2">{r.message}</Typography>
                                            </Paper>
                                        ))}
                                    </Stack>
                                )}
                            </Box>

                            {/* Reply Input Box */}
                            <Stack direction="row" spacing={1}>
                                <TextField 
                                    fullWidth 
                                    size="small" 
                                    placeholder="Type your response as Main Admin..." 
                                    value={replyText} 
                                    onChange={(e) => setReplyText(e.target.value)} 
                                />
                                <Button 
                                    variant="contained" 
                                    color="primary" 
                                    endIcon={<SendIcon />} 
                                    onClick={handleSendReply}
                                    disabled={sendingReply || !replyText.trim()}
                                >
                                    Send
                                </Button>
                            </Stack>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setDetailsOpen(false)}>Close</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </DashboardLayout>
    );
};

export default MainAdminSupportPage;
