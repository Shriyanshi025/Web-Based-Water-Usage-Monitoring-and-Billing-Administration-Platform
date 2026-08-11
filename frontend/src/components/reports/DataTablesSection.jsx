import React from "react";
import { Box, Tabs, Tab, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Chip, TablePagination } from "@mui/material";
import TableChartIcon from "@mui/icons-material/TableChart";
import SearchBar from "../common/SearchBar";
import SectionCard from "./SectionCard";

const fmtCurrency = (val) => {
  if (val == null || isNaN(val)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(val);
};

const fmtPeriod = (row) => {
  if (row.billingPeriod && row.billingPeriod !== "-/-") return row.billingPeriod;
  if (row.month && row.year) return `${row.month}/${row.year}`;
  if (row.billingCycleName) return row.billingCycleName;
  if (row.createdAt) return new Date(row.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  return "N/A";
};

export default function DataTablesSection({
  activeTableTab,
  setActiveTableTab,
  searchTerm,
  setSearchTerm,
  currentTableData,
  reportsPage,
  setReportsPage,
  reportsRowsPerPage,
  setReportsRowsPerPage
}) {
  return (
    <SectionCard
      icon={<TableChartIcon />}
      title="Detailed Data Tables"
      description="Granular record breakdown across residents, bills, complaints, and block performances."
    >
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={activeTableTab} onChange={(_, val) => { setActiveTableTab(val); setReportsPage(0); }}>
          <Tab label="Resident Summary" sx={{ fontWeight: 600 }} />
          <Tab label="Billing Summary" sx={{ fontWeight: 600 }} />
          <Tab label="Complaint Summary" sx={{ fontWeight: 600 }} />
          <Tab label="Block Performance" sx={{ fontWeight: 600 }} />
        </Tabs>
      </Box>

      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
        <SearchBar value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setReportsPage(0); }} placeholder="Search table records..." />
        <Typography variant="caption" color="text.secondary">
          {currentTableData.length} records
        </Typography>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "action.hover" }}>
              {activeTableTab === 0 && (
                <>
                  <TableCell sx={{ fontWeight: 700 }}>Resident Code</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Block / Unit</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Meter No.</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Current Reading</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                </>
              )}
              {activeTableTab === 1 && (
                <>
                  <TableCell sx={{ fontWeight: 700 }}>Bill No</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Resident Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Flat</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Period</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Usage (kL)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Amount (₹)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                </>
              )}
              {activeTableTab === 2 && (
                <>
                  <TableCell sx={{ fontWeight: 700 }}>Ticket No</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Resident</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Created Date</TableCell>
                </>
              )}
              {activeTableTab === 3 && (
                <>
                  <TableCell sx={{ fontWeight: 700 }}>Block Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Total Households</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Total Consumption (kL)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Avg / Flat (kL)</TableCell>
                </>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {currentTableData.slice(reportsPage * reportsRowsPerPage, reportsPage * reportsRowsPerPage + reportsRowsPerPage).map((row, idx) => (
              <TableRow key={idx} hover>
                {activeTableTab === 0 && (
                  <>
                    <TableCell>{row.officialUserId}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell sx={{ fontSize: "0.78rem", color: "text.secondary" }}>{row.email}</TableCell>
                    <TableCell>{row.block} - {row.unit}</TableCell>
                    <TableCell>{row.meterNumber}</TableCell>
                    <TableCell>{row.currentReading} kL</TableCell>
                    <TableCell>
                      <Chip size="small" label={row.status} color={row.status === "ACTIVE" ? "success" : "default"} />
                    </TableCell>
                  </>
                )}
                {activeTableTab === 1 && (
                  <>
                    <TableCell>{row.billNumber}</TableCell>
                    <TableCell>{row.residentName}</TableCell>
                    <TableCell>{row.flatNumber}</TableCell>
                    <TableCell>{fmtPeriod(row)}</TableCell>
                    <TableCell>{row.unitsConsumed?.toFixed(2)}</TableCell>
                    <TableCell>{fmtCurrency(row.totalAmount)}</TableCell>
                    <TableCell>
                      <Chip size="small" label={row.status} color={row.status === "PAID" ? "success" : row.status === "OVERDUE" ? "error" : "warning"} />
                    </TableCell>
                  </>
                )}
                {activeTableTab === 2 && (
                  <>
                    <TableCell>{row.ticketNumber}</TableCell>
                    <TableCell>{row.residentName}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell>
                      <Chip size="small" label={row.priority} color={row.priority === "HIGH" ? "error" : row.priority === "MEDIUM" ? "warning" : "default"} variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={row.status} color={row.status === "RESOLVED" ? "success" : row.status === "REJECTED" ? "error" : "info"} />
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.78rem", color: "text.secondary" }}>{row.createdAt}</TableCell>
                  </>
                )}
                {activeTableTab === 3 && (
                  <>
                    <TableCell sx={{ fontWeight: 600 }}>{row.blockName}</TableCell>
                    <TableCell>{row.totalUnitsCount}</TableCell>
                    <TableCell>{row.totalConsumption?.toFixed(1)} kL</TableCell>
                    <TableCell>{row.averageConsumptionPerUnit?.toFixed(1)} kL</TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={currentTableData.length}
        rowsPerPage={reportsRowsPerPage}
        page={reportsPage}
        onPageChange={(_, newPage) => setReportsPage(newPage)}
        onRowsPerPageChange={(e) => {
          setReportsRowsPerPage(parseInt(e.target.value, 10));
          setReportsPage(0);
        }}
      />
    </SectionCard>
  );
}
