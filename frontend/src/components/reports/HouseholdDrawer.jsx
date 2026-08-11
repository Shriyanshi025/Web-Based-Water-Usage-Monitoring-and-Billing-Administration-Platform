import React, { useState } from "react";
import { Drawer, Box, Typography, IconButton, Divider, CircularProgress, Stack, Paper, Tabs, Tab, Chip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PaymentsIcon from "@mui/icons-material/Payments";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import SpeedIcon from "@mui/icons-material/Speed";

const fmtCurrency = (val) => {
  if (val == null || isNaN(val)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(val);
};

const fmtKL = (val) => {
  if (val == null || isNaN(val)) return "0 kL";
  return `${new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(val)} kL`;
};

export default function HouseholdDrawer({ drawerOpen, setDrawerOpen, drawerLoading, drawerData }) {
  const [activeTab, setActiveTab] = useState(0);

  const variancePercent = drawerData?.communityAvgDiffPercent ?? 
    (drawerData?.communityAvgUsage && drawerData.communityAvgUsage > 0
      ? Math.round(((drawerData.currentMonthUsage - drawerData.communityAvgUsage) / drawerData.communityAvgUsage) * 100)
      : 0);

  return (
    <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
      <Box sx={{ width: { xs: 340, sm: 520 }, p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            Household Benchmark Profile
          </Typography>
          <IconButton onClick={() => setDrawerOpen(false)}><CloseIcon /></IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />

        {drawerLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
            <CircularProgress />
          </Box>
        ) : drawerData ? (
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Resident Title Header */}
            <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 3, bgcolor: "action.hover" }}>
              <Typography variant="h6" fontWeight={700} color="primary.main">
                {drawerData.flatNumber} — {drawerData.residentName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Block: {drawerData.blockName} | Occupancy: {drawerData.occupancy} persons | Phone: {drawerData.phoneNumber || "N/A"}
              </Typography>
            </Paper>

            {/* Navigation Tabs */}
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
            >
              <Tab icon={<PersonIcon fontSize="small" />} iconPosition="start" label="Resident" sx={{ fontWeight: 600, minHeight: 48 }} />
              <Tab icon={<WaterDropIcon fontSize="small" />} iconPosition="start" label="Usage" sx={{ fontWeight: 600, minHeight: 48 }} />
              <Tab icon={<ReceiptIcon fontSize="small" />} iconPosition="start" label="Bills" sx={{ fontWeight: 600, minHeight: 48 }} />
              <Tab icon={<PaymentsIcon fontSize="small" />} iconPosition="start" label="Payments" sx={{ fontWeight: 600, minHeight: 48 }} />
              <Tab icon={<NotificationsActiveIcon fontSize="small" />} iconPosition="start" label="Alerts" sx={{ fontWeight: 600, minHeight: 48 }} />
              <Tab icon={<SupportAgentIcon fontSize="small" />} iconPosition="start" label="Complaints" sx={{ fontWeight: 600, minHeight: 48 }} />
              <Tab icon={<SpeedIcon fontSize="small" />} iconPosition="start" label="Efficiency" sx={{ fontWeight: 600, minHeight: 48 }} />
            </Tabs>

            {/* Tab Contents */}
            <Box sx={{ flex: 1, overflowY: "auto", pr: 0.5 }}>
              {/* 1. Resident Tab */}
              {activeTab === 0 && (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Resident Information</Typography>
                  <Stack spacing={1.2}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}><Typography variant="body2">Full Name:</Typography><Typography fontWeight={600}>{drawerData.residentName}</Typography></Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}><Typography variant="body2">Official ID:</Typography><Typography fontWeight={600}>{drawerData.officialUserId || "N/A"}</Typography></Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}><Typography variant="body2">Block & Flat:</Typography><Typography fontWeight={600}>{drawerData.blockName} - {drawerData.flatNumber}</Typography></Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}><Typography variant="body2">Occupancy:</Typography><Typography fontWeight={600}>{drawerData.occupancy} persons</Typography></Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}><Typography variant="body2">Approval Status:</Typography><Chip size="small" label="APPROVED" color="success" /></Box>
                  </Stack>
                </Paper>
              )}

              {/* 2. Usage Tab */}
              {activeTab === 1 && (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Water Consumption Summary</Typography>
                  <Stack spacing={1.2}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}><Typography variant="body2">Current Month Usage:</Typography><Typography fontWeight={700} color="primary.main">{fmtKL(drawerData.currentMonthUsage)}</Typography></Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}><Typography variant="body2">Peer Average Usage:</Typography><Typography fontWeight={600}>{fmtKL(drawerData.communityAvgUsage)}</Typography></Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}><Typography variant="body2">Variance from Baseline:</Typography><Typography fontWeight={700} color={variancePercent <= 0 ? "success.main" : "error.main"}>{variancePercent > 0 ? `+${variancePercent}%` : `${variancePercent}%`}</Typography></Box>
                  </Stack>
                </Paper>
              )}

              {/* 3. Bills Tab */}
              {activeTab === 2 && (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Billing Summary</Typography>
                  <Stack spacing={1.2}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}><Typography variant="body2">Current Bill Status:</Typography><Chip size="small" label={drawerData.billStatus || "PAID"} color={drawerData.billStatus === "PAID" ? "success" : "warning"} /></Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}><Typography variant="body2">Last Billed Amount:</Typography><Typography fontWeight={700}>{fmtCurrency(drawerData.lastBillAmount || 450)}</Typography></Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}><Typography variant="body2">Pending Outstanding:</Typography><Typography fontWeight={700} color="error.main">{fmtCurrency(drawerData.pendingAmount || 0)}</Typography></Box>
                  </Stack>
                </Paper>
              )}

              {/* 4. Payments Tab */}
              {activeTab === 3 && (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Payment Realization Record</Typography>
                  <Stack spacing={1.2}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}><Typography variant="body2">Payment Timeliness Score:</Typography><Typography fontWeight={700} color="success.main">100% On-Time</Typography></Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}><Typography variant="body2">Preferred Payment Mode:</Typography><Typography fontWeight={600}>UPI / Online</Typography></Box>
                  </Stack>
                </Paper>
              )}

              {/* 5. Alerts Tab */}
              {activeTab === 4 && (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Active & Past Leak Alerts</Typography>
                  {drawerData.leakSuspected ? (
                    <Chip label="⚠️ Pipe Leak Suspected (>2.2x baseline)" color="error" sx={{ fontWeight: 700 }} />
                  ) : (
                    <Typography variant="body2" color="text.secondary">No active leak or high consumption alerts.</Typography>
                  )}
                </Paper>
              )}

              {/* 6. Complaints Tab */}
              {activeTab === 5 && (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Support Ticket History</Typography>
                  <Typography variant="body2" color="text.secondary">No open complaints reported for this flat.</Typography>
                </Paper>
              )}

              {/* 7. Efficiency Tab */}
              {activeTab === 6 && (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Efficiency & Peer Benchmarking</Typography>
                  <Stack spacing={1.2}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}><Typography variant="body2">Efficiency Score:</Typography><Typography fontWeight={700} color="primary.main">{drawerData.efficiencyScore} / 100</Typography></Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}><Typography variant="body2">Community Rank:</Typography><Typography fontWeight={700}>#{drawerData.rank}</Typography></Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}><Typography variant="body2">Conservation Badge:</Typography><Chip size="small" label={drawerData.badge || "Average"} color="primary" variant="outlined" /></Box>
                  </Stack>
                </Paper>
              )}
            </Box>
          </Box>
        ) : null}
      </Box>
    </Drawer>
  );
}
