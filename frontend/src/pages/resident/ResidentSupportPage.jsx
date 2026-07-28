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
    RadioGroup, 
    FormControlLabel, 
    Radio, 
    FormControl, 
    FormLabel, 
    Paper, 
    IconButton,
    Tooltip,
    Grid
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";

import DashboardLayout from "../../components/layout/DashboardLayout";
import PageSummaryHeader from "../../components/common/PageSummaryHeader";
import DataGrid from "../../components/common/DataGrid";
import TableToolbar from "../../components/common/TableToolbar";
import StatusBadge from "../../components/common/StatusBadge";
import SupportTicketService from "../../services/SupportTicketService";
import { useNotification } from "../../context/NotificationContext";
import { PriorityCell, DateCell, TextSubtextCell, formatEnum, formatRole } from "../../components/common/DataGridCells";

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

const TICKET_PRIORITIES = [
    { value: "LOW", label: "Low" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HIGH", label: "High" },
    { value: "URGENT", label: "Urgent" }
];

const ResidentSupportPage = () => {
    const { showNotification } = useNotification();
    const location = useLocation();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Create Modal state
    const [createOpen, setCreateOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "METER",
        priority: "MEDIUM",
        recipientType: "COMMUNITY_ADMIN"
    });
    const [submitting, setSubmitting] = useState(false);

    // Details & Discussion Modal state
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [replies, setReplies] = useState([]);
    const [replyText, setReplyText] = useState("");
    const [sendingReply, setSendingReply] = useState(false);

    const fetchTickets = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await SupportTicketService.getMySubmittedTickets();
            setTickets(res?.data || []);
        } catch (err) {
            setError(err.message || "Failed to load support tickets");
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

    const handleSearch = useCallback((query) => {
        setSearchQuery(query);
    }, []);

    const filteredTickets = useMemo(() => {
        if (!searchQuery) return tickets;
        const q = searchQuery.toLowerCase();
        return tickets.filter(t => 
            t?.ticketNumber?.toLowerCase().includes(q) ||
            t?.title?.toLowerCase().includes(q) ||
            t?.category?.toLowerCase().includes(q) ||
            t?.status?.toLowerCase().includes(q)
        );
    }, [tickets, searchQuery]);

    const handleOpenCreate = () => {
        setFormData({
            title: "",
            description: "",
            category: "METER",
            priority: "MEDIUM",
            recipientType: "COMMUNITY_ADMIN"
        });
        setCreateOpen(true);
    };

    const handleCloseCreate = () => {
        setCreateOpen(false);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateSubmit = async () => {
        if (!formData.title.trim() || !formData.description.trim()) {
            showNotification("Please provide both title and description.", "warning");
            return;
        }
        try {
            setSubmitting(true);
            await SupportTicketService.createTicket(formData);
            showNotification("Support ticket submitted successfully!", "success");
            handleCloseCreate();
            fetchTickets();
        } catch (err) {
            showNotification(err.response?.data?.message || err.message || "Failed to submit ticket", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenDetails = async (ticket) => {
        if (!ticket) return;
        setSelectedTicket(ticket);
        setDetailsOpen(true);
        try {
            const replyRes = await SupportTicketService.getTicketReplies(ticket.id);
            setReplies(replyRes?.data || []);
        } catch (err) {
            setReplies([]);
        }
    };

    const handleCloseDetails = () => {
        setDetailsOpen(false);
        setSelectedTicket(null);
        setReplies([]);
        setReplyText("");
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

    const handleCloseTicket = async () => {
        if (!selectedTicket) return;
        try {
            await SupportTicketService.closeTicket(selectedTicket.id);
            showNotification("Ticket marked as closed.", "success");
            handleCloseDetails();
            fetchTickets();
        } catch (err) {
            showNotification(err.response?.data?.message || "Failed to close ticket", "error");
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
                    secondary={formatEnum(params?.row?.category)}
                />
            )
        },
        { 
            field: "recipientType", 
            headerName: "Assigned To", 
            width: 160,
            renderCell: (params) => (
                <TextSubtextCell 
                    primary={formatRole(params?.row?.recipientType || params?.value)}
                    secondary="Support Queue"
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
                <Tooltip title="View Discussion & Details" arrow>
                    <IconButton size="small" color="primary" onClick={() => params?.row && handleOpenDetails(params.row)}>
                        <VisibilityIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            )
        }
    ], []);

    const headerMetadata = useMemo(() => [
        { label: "My Tickets", value: tickets.length },
        { label: "Open / Active", value: tickets.filter(t => t.status === "OPEN" || t.status === "IN_PROGRESS").length, color: "warning" },
        { label: "Resolved", value: tickets.filter(t => t.status === "RESOLVED" || t.status === "CLOSED").length, color: "success" },
    ], [tickets]);

    return (
        <DashboardLayout>
            <PageSummaryHeader 
                title="Helpdesk & Support Center" 
                subtitle="Submit tickets, get resolution assistance, and chat directly with administrators."
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

            <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider', mb: 3 }}>
                <TableToolbar 
                    title="My Support Tickets" 
                    onSearch={handleSearch}
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
                            You haven't created any support tickets yet.
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 480, mx: "auto", mb: 3 }}>
                            Need assistance with your water meter, billing, or portal features? Submit a ticket to get support from administrators.
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={handleOpenCreate}
                            sx={{ textTransform: "none", fontWeight: 600 }}
                        >
                            Create Support Ticket
                        </Button>
                    </Box>
                ) : (
                    <Box sx={{ height: 520 }}>
                        <DataGrid 
                            rows={filteredTickets} 
                            columns={columns} 
                            loading={loading}
                            error={error}
                            emptyTitle="You haven't created any support tickets yet."
                            emptyMessage="Click Create Support Ticket to submit a request."
                            onRetry={fetchTickets}
                            disableRowSelectionOnClick
                        />
                    </Box>
                )}
            </Box>

            {/* Create Support Ticket Modal */}
            <Dialog open={createOpen} onClose={handleCloseCreate} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>
                    Create Support Ticket
                </DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2.5} sx={{ mt: 0.5 }}>
                        {/* Recipient Type Choice */}
                        <FormControl component="fieldset">
                            <FormLabel component="legend" sx={{ fontWeight: 700, fontSize: "0.875rem", mb: 0.5, color: "text.primary" }}>
                                Who should receive this ticket? *
                            </FormLabel>
                            <RadioGroup
                                name="recipientType"
                                value={formData.recipientType}
                                onChange={handleFormChange}
                            >
                                <Paper variant="outlined" sx={{ p: 1.5, mb: 1, borderColor: formData.recipientType === "COMMUNITY_ADMIN" ? "primary.main" : "divider" }}>
                                    <FormControlLabel 
                                        value="COMMUNITY_ADMIN" 
                                        control={<Radio size="small" />} 
                                        label={
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight={700}>Community Admin</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    For community issues, meter faults, billing disputes, water pressure, or neighborhood services.
                                                </Typography>
                                            </Box>
                                        } 
                                    />
                                </Paper>
                                <Paper variant="outlined" sx={{ p: 1.5, borderColor: formData.recipientType === "MAIN_ADMIN" ? "primary.main" : "divider" }}>
                                    <FormControlLabel 
                                        value="MAIN_ADMIN" 
                                        control={<Radio size="small" />} 
                                        label={
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight={700}>Main System Admin</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    For portal login issues, payment gateway bugs, technical glitches, or general website support.
                                                </Typography>
                                            </Box>
                                        } 
                                    />
                                </Paper>
                            </RadioGroup>
                        </FormControl>

                        <TextField 
                            fullWidth 
                            label="Ticket Subject / Title" 
                            name="title" 
                            value={formData.title} 
                            onChange={handleFormChange} 
                            required 
                        />

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField 
                                    fullWidth 
                                    select 
                                    label="Category" 
                                    name="category" 
                                    value={formData.category} 
                                    onChange={handleFormChange} 
                                    required
                                >
                                    {TICKET_CATEGORIES.map(c => (
                                        <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField 
                                    fullWidth 
                                    select 
                                    label="Priority" 
                                    name="priority" 
                                    value={formData.priority} 
                                    onChange={handleFormChange} 
                                    required
                                >
                                    {TICKET_PRIORITIES.map(p => (
                                        <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                        </Grid>

                        <TextField 
                            fullWidth 
                            multiline 
                            rows={4} 
                            label="Detailed Description" 
                            name="description" 
                            value={formData.description} 
                            onChange={handleFormChange} 
                            placeholder="Explain your issue clearly with relevant details..."
                            required 
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseCreate}>Cancel</Button>
                    <Button onClick={handleCreateSubmit} variant="contained" color="primary" disabled={submitting}>
                        Submit Ticket
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Ticket Details & Live Discussion Modal */}
            <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="md" fullWidth>
                {selectedTicket && (
                    <>
                        <DialogTitle sx={{ pb: 1 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="h6" fontWeight={700}>
                                        {selectedTicket.title}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Ticket Number: <strong>{selectedTicket.ticketNumber}</strong> · Created on {selectedTicket.createdAt ? new Date(selectedTicket.createdAt).toLocaleDateString() : "N/A"}
                                    </Typography>
                                </Box>
                                <StatusBadge status={selectedTicket.status} />
                            </Stack>
                        </DialogTitle>
                        <DialogContent dividers>
                            <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: "grey.50" }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 0.5 }}>
                                    DESCRIPTION
                                </Typography>
                                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                                    {selectedTicket.description}
                                </Typography>
                            </Paper>

                            {selectedTicket.resolutionNotes && (
                                <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: "success.50", borderColor: "success.light" }}>
                                    <Typography variant="caption" color="success.main" fontWeight={700} display="block" sx={{ mb: 0.5 }}>
                                        RESOLUTION NOTES FROM ADMIN
                                    </Typography>
                                    <Typography variant="body2" color="success.dark">
                                        {selectedTicket.resolutionNotes}
                                    </Typography>
                                </Paper>
                            )}

                            {/* Discussion Thread */}
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                                Discussion Thread ({replies.length} messages)
                            </Typography>
                            <Box sx={{ maxHeight: 300, overflowY: "auto", mb: 2.5, pr: 1 }}>
                                {replies.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                                        No replies yet. Type a message below to start the conversation.
                                    </Typography>
                                ) : (
                                    <Stack spacing={1.5}>
                                        {replies.map(r => (
                                            <Paper key={r.id} variant="outlined" sx={{ p: 1.5, bgcolor: r.senderRole === "USER" ? "primary.50" : "grey.50" }}>
                                                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                                    <Typography variant="caption" fontWeight={700} color={r.senderRole === "USER" ? "primary.main" : "text.primary"}>
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
                            {selectedTicket.status !== "CLOSED" && (
                                <Stack direction="row" spacing={1}>
                                    <TextField 
                                        fullWidth 
                                        size="small" 
                                        placeholder="Type your response here..." 
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
                            )}
                        </DialogContent>
                        <DialogActions sx={{ justifyContent: "space-between" }}>
                            {selectedTicket.status !== "CLOSED" && (
                                <Button 
                                    onClick={handleCloseTicket} 
                                    color="success" 
                                    startIcon={<CheckCircleIcon />}
                                    sx={{ mr: "auto" }}
                                >
                                    Mark Issue Resolved & Close
                                </Button>
                            )}
                            <Button onClick={handleCloseDetails}>Close</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </DashboardLayout>
    );
};

export default ResidentSupportPage;
