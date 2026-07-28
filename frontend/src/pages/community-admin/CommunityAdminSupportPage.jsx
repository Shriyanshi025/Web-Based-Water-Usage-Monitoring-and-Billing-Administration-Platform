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
    Tabs,
    Tab,
    IconButton,
    Tooltip
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SendIcon from "@mui/icons-material/Send";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import TaskAltIcon from "@mui/icons-material/TaskAlt";

import DashboardLayout from "../../components/layout/DashboardLayout";
import PageSummaryHeader from "../../components/common/PageSummaryHeader";
import DataGrid from "../../components/common/DataGrid";
import TableToolbar from "../../components/common/TableToolbar";
import StatusBadge from "../../components/common/StatusBadge";
import SupportTicketService from "../../services/SupportTicketService";
import { useNotification } from "../../context/NotificationContext";
import { UserCell, PriorityCell, DateCell, TextSubtextCell, formatEnum } from "../../components/common/DataGridCells";

const TICKET_CATEGORIES = [
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

const TICKET_STATUSES = [
    { value: "OPEN", label: "Open" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "WAITING_FOR_USER", label: "Waiting for User" },
    { value: "RESOLVED", label: "Resolved" },
    { value: "CLOSED", label: "Closed" }
];

const CommunityAdminSupportPage = () => {
    const { showNotification } = useNotification();
    const location = useLocation();
    const [tabIndex, setTabIndex] = useState(0);
    const [residentInbox, setResidentInbox] = useState([]);
    const [mySubmitted, setMySubmitted] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Create Modal (ONLY to Main Admin)
    const [createOpen, setCreateOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "TECHNICAL",
        priority: "MEDIUM",
        recipientType: "MAIN_ADMIN"
    });
    const [submitting, setSubmitting] = useState(false);

    // Discussion & Manage Modal
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [replies, setReplies] = useState([]);
    const [replyText, setReplyText] = useState("");
    const [sendingReply, setSendingReply] = useState(false);
    const [statusUpdate, setStatusUpdate] = useState("IN_PROGRESS");
    const [resolutionNotes, setResolutionNotes] = useState("");

    const fetchAllData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [inboxRes, myRes] = await Promise.all([
                SupportTicketService.getCommunityInboxTickets(),
                SupportTicketService.getMySubmittedTickets()
            ]);
            setResidentInbox(inboxRes?.data || []);
            setMySubmitted(myRes?.data || []);
        } catch (err) {
            setError(err.message || "Failed to load support tickets");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    // Handle deep-linked ticketNumber or ticketId from query parameters
    useEffect(() => {
        if (loading) return;
        const searchParams = new URLSearchParams(location.search);
        const ticketNum = searchParams.get("ticketNumber");
        const ticketId = searchParams.get("ticketId");

        if (ticketNum || ticketId) {
            const foundInbox = residentInbox.find(t => 
                (ticketNum && t?.ticketNumber?.toLowerCase() === ticketNum.toLowerCase()) ||
                (ticketId && String(t?.id) === String(ticketId))
            );
            const foundSubmitted = mySubmitted.find(t => 
                (ticketNum && t?.ticketNumber?.toLowerCase() === ticketNum.toLowerCase()) ||
                (ticketId && String(t?.id) === String(ticketId))
            );

            if (foundInbox) {
                setTabIndex(0);
                handleOpenDetails(foundInbox);
            } else if (foundSubmitted) {
                setTabIndex(1);
                handleOpenDetails(foundSubmitted);
            } else if (!loading && (residentInbox.length > 0 || mySubmitted.length > 0)) {
                showNotification("This support ticket is no longer available.", "warning");
            }
        }
    }, [residentInbox, mySubmitted, loading, location.search]);

    const activeList = useMemo(() => {
        return tabIndex === 0 ? residentInbox : mySubmitted;
    }, [tabIndex, residentInbox, mySubmitted]);

    const stats = useMemo(() => {
        const total = activeList.length;
        const open = activeList.filter(t => t?.status === "OPEN").length;
        const inProgress = activeList.filter(t => t?.status === "IN_PROGRESS" || t?.status === "WAITING_FOR_USER").length;
        const resolved = activeList.filter(t => t?.status === "RESOLVED" || t?.status === "CLOSED").length;
        return { total, open, inProgress, resolved };
    }, [activeList]);

    const filteredTickets = useMemo(() => {
        if (!searchQuery) return activeList;
        const q = searchQuery.toLowerCase();
        return activeList.filter(t => 
            t?.ticketNumber?.toLowerCase().includes(q) ||
            t?.title?.toLowerCase().includes(q) ||
            t?.createdByName?.toLowerCase().includes(q) ||
            t?.category?.toLowerCase().includes(q)
        );
    }, [activeList, searchQuery]);

    const handleOpenCreate = () => {
        setFormData({
            title: "",
            description: "",
            category: "TECHNICAL",
            priority: "MEDIUM",
            recipientType: "MAIN_ADMIN"
        });
        setCreateOpen(true);
    };

    const handleCreateSubmit = async () => {
        if (!formData.title.trim() || !formData.description.trim()) {
            showNotification("Please provide title and description.", "warning");
            return;
        }
        try {
            setSubmitting(true);
            await SupportTicketService.createTicket({ ...formData, recipientType: "MAIN_ADMIN" });
            showNotification("Support ticket submitted to Main Admin successfully!", "success");
            setCreateOpen(false);
            fetchAllData();
        } catch (err) {
            showNotification(err.response?.data?.message || "Failed to submit ticket", "error");
        } finally {
            setSubmitting(false);
        }
    };

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
            fetchAllData();
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
            fetchAllData();
        } catch (err) {
            showNotification(err.response?.data?.message || "Failed to update status", "error");
        }
    };

    // Dynamic Columns based on active Tab
    const columns = useMemo(() => {
        const baseColumns = [
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
                        secondary={formatEnum(params?.row?.category)}
                    />
                )
            }
        ];

        // Include Created By ONLY for Tab 0 (Resident Inbox)
        if (tabIndex === 0) {
            baseColumns.push({ 
                field: "createdByName", 
                headerName: "Created By (Resident)", 
                flex: 1.2, 
                minWidth: 200,
                renderCell: (params) => (
                    <UserCell 
                        name={params?.value || params?.row?.createdByName} 
                        role={params?.row?.createdByRole || "Resident"} 
                        email={params?.row?.createdByEmail} 
                    />
                )
            });
        }

        baseColumns.push(
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
                    <Tooltip title="View & Manage Ticket" arrow>
                        <IconButton size="small" color="primary" onClick={() => params?.row && handleOpenDetails(params.row)}>
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )
            }
        );
        return baseColumns;
    }, [tabIndex]);

    const headerMetadata = useMemo(() => [
        { label: "Total Tickets", value: stats.total },
        { label: "Open / Unresolved", value: stats.open, color: "error" },
        { label: "In Progress", value: stats.inProgress, color: "warning" },
        { label: "Resolved", value: stats.resolved, color: "success" },
    ], [stats]);

    return (
        <DashboardLayout>
            <PageSummaryHeader 
                title="Community Support Center" 
                subtitle="Manage resident helpdesk requests and communicate directly with Main System Admins."
                icon={ConfirmationNumberIcon}
                metadata={headerMetadata}
                action={
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleOpenCreate}
                        sx={{ textTransform: "none", fontWeight: 600 }}
                    >
                        Create Support Ticket
                    </Button>
                }
            />

            {/* Main Tabs Container */}
            <Paper variant="outlined" sx={{ mb: 3 }}>
                <Tabs value={tabIndex} onChange={(e, val) => setTabIndex(val)} sx={{ px: 2, pt: 1, borderBottom: 1, borderColor: "divider" }}>
                    <Tab label={`Resident Tickets Inbox (${residentInbox.length})`} />
                    <Tab label={`My Tickets to Main Admin (${mySubmitted.length})`} />
                </Tabs>

                <TableToolbar 
                    title={tabIndex === 0 ? "Resident Helpdesk Inbox" : "Submitted to Main Admin"} 
                    onSearch={(q) => setSearchQuery(q)}
                    actions={
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={handleOpenCreate}
                            sx={{ textTransform: "none", fontWeight: 600 }}
                        >
                            Create Support Ticket
                        </Button>
                    }
                />

                {!loading && filteredTickets.length === 0 ? (
                    <Box sx={{ p: 6, textAlign: "center" }}>
                        <ConfirmationNumberIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1.5, opacity: 0.7 }} />
                        <Typography variant="h6" fontWeight={700} color="text.primary" gutterBottom>
                            {tabIndex === 0 ? "No resident support tickets available." : "You haven't submitted any support tickets to the Main Admin yet."}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 480, mx: "auto", mb: 3 }}>
                            {tabIndex === 0 
                                ? "There are currently no support requests from residents in your community." 
                                : "Require platform technical assistance or Main Admin support? Click the button below to submit a ticket."}
                        </Typography>
                        {tabIndex === 1 && (
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={handleOpenCreate}
                                sx={{ textTransform: "none", fontWeight: 600 }}
                            >
                                Create Support Ticket
                            </Button>
                        )}
                    </Box>
                ) : (
                    <Box sx={{ height: 520 }}>
                        <DataGrid 
                            rows={filteredTickets} 
                            columns={columns} 
                            loading={loading}
                            error={error}
                            emptyTitle={tabIndex === 0 ? "No resident support tickets available." : "You haven't submitted any support tickets to the Main Admin yet."}
                            emptyMessage={tabIndex === 0 ? "There are currently no support requests from residents." : "Click Create Support Ticket to submit a request."}
                            onRetry={fetchAllData}
                            disableRowSelectionOnClick
                        />
                    </Box>
                )}
            </Paper>

            {/* Create Ticket Modal to Main Admin (Fixed Recipient = MAIN_ADMIN) */}
            <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>
                    Submit Support Ticket to Main Admin
                </DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2.5} sx={{ mt: 0.5 }}>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: "primary.50", borderColor: "primary.light" }}>
                            <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                                Recipient: Main System Admin
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                This ticket will be routed directly to the Main System Administrator for platform assistance or technical support.
                            </Typography>
                        </Paper>

                        <TextField 
                            fullWidth 
                            label="Ticket Subject / Title" 
                            name="title" 
                            value={formData.title} 
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                            required 
                        />
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField 
                                    fullWidth 
                                    select 
                                    label="Category" 
                                    name="category" 
                                    value={formData.category} 
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })} 
                                    required
                                >
                                    {TICKET_CATEGORIES.map(c => (
                                        <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField 
                                    fullWidth 
                                    select 
                                    label="Priority" 
                                    name="priority" 
                                    value={formData.priority} 
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })} 
                                    required
                                >
                                    <MenuItem value="LOW">Low</MenuItem>
                                    <MenuItem value="MEDIUM">Medium</MenuItem>
                                    <MenuItem value="HIGH">High</MenuItem>
                                    <MenuItem value="URGENT">Urgent</MenuItem>
                                </TextField>
                            </Grid>
                        </Grid>
                        <TextField 
                            fullWidth 
                            multiline 
                            rows={4} 
                            label="Detailed Description" 
                            value={formData.description} 
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                            required 
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateSubmit} variant="contained" color="primary" disabled={submitting}>
                        Submit to Main Admin
                    </Button>
                </DialogActions>
            </Dialog>

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
                                        Ticket #{selectedTicket.ticketNumber} · Created by {selectedTicket.createdByName} on {selectedTicket.createdAt ? new Date(selectedTicket.createdAt).toLocaleDateString() : "N/A"}
                                    </Typography>
                                </Box>
                                <StatusBadge status={selectedTicket.status} />
                            </Stack>
                        </DialogTitle>
                        <DialogContent dividers>
                            <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: "grey.50" }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 0.5 }}>
                                    PROBLEM DESCRIPTION
                                </Typography>
                                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                                    {selectedTicket.description}
                                </Typography>
                            </Paper>

                            {/* Status Management Bar */}
                            <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: "background.default" }}>
                                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                                    Update Status & Resolution
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={4}>
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
                                    <Grid item xs={12} sm={8}>
                                        <TextField 
                                            fullWidth 
                                            size="small" 
                                            label="Resolution Notes" 
                                            placeholder="Provide resolution details or action taken..." 
                                            value={resolutionNotes} 
                                            onChange={(e) => setResolutionNotes(e.target.value)} 
                                        />
                                    </Grid>
                                </Grid>
                                <Box sx={{ mt: 1.5, display: "flex", justifyContent: "flex-end" }}>
                                    <Button variant="contained" color="primary" size="small" onClick={handleUpdateStatus}>
                                        Save Status & Notes
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
                                            <Paper key={r.id} variant="outlined" sx={{ p: 1.5, bgcolor: r.senderRole === "COMMUNITY_ADMIN" ? "primary.50" : "grey.50" }}>
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
                                    placeholder="Type your reply to the user..." 
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

export default CommunityAdminSupportPage;
