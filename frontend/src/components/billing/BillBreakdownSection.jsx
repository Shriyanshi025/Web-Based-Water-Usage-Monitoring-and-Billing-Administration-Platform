import React from "react";
import {
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Divider,
    Stack,
    Grid,
    Chip
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CalculateIcon from "@mui/icons-material/Calculate";
import { formatCurrency } from "../../helpers/numberHelper";

export default function BillBreakdownSection({ bill, defaultExpanded = true, title = "Bill Calculation Breakdown" }) {
    if (!bill) return null;

    let slabsList = [];
    if (bill.slabBreakdown) {
        try {
            slabsList = typeof bill.slabBreakdown === "string"
                ? JSON.parse(bill.slabBreakdown)
                : bill.slabBreakdown;
        } catch (e) {
            console.error("Parse error for slabBreakdown", e);
        }
    }

    const prevReading = bill.previousReading !== undefined && bill.previousReading !== null ? bill.previousReading : "—";
    const currReading = bill.currentReading !== undefined && bill.currentReading !== null ? bill.currentReading : "—";
    const units = bill.unitsConsumed !== undefined && bill.unitsConsumed !== null ? bill.unitsConsumed : 0;
    const fixed = Number(bill.fixedCharge) || 0;
    const additional = Number(bill.additionalCharge) || 0;
    const sharedCost = Number(bill.sharedWaterCost) || 0;
    const discount = Number(bill.discount) || 0;
    const penalty = Number(bill.penalty || bill.lateFee) || 0;
    const total = Number(bill.totalAmount !== undefined && bill.totalAmount !== null ? bill.totalAmount : (bill.amount || 0));

    // Calculate water charges subtotal from slabs or backend subtotal
    let waterChargesSubtotal = 0;
    const hasSlabs = slabsList && Array.isArray(slabsList) && slabsList.length > 0;

    if (hasSlabs) {
        waterChargesSubtotal = slabsList.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    } else if (bill.subtotal !== undefined && bill.subtotal !== null) {
        waterChargesSubtotal = Number(bill.subtotal);
    } else {
        waterChargesSubtotal = Number(bill.variableCharge || bill.amount || 0);
    }

    // Dynamic Tax Rate (GST) display - read from bill or calculate percentage from tax and subtotal
    let rawTax = Number(bill.tax) || 0;
    if (!rawTax && total > (waterChargesSubtotal + fixed + additional + sharedCost - discount + penalty)) {
        rawTax = total - (waterChargesSubtotal + fixed + additional + sharedCost - discount + penalty);
    }

    let taxLabel = "Taxes (GST)";
    if (bill.taxRate != null && Number(bill.taxRate) > 0) {
        const pct = (Number(bill.taxRate) > 1 ? Number(bill.taxRate) : Number(bill.taxRate) * 100);
        taxLabel = `Taxes (GST @ ${pct.toFixed(1)}%)`;
    } else if (rawTax > 0) {
        const calcSubtotal = waterChargesSubtotal + fixed + additional;
        if (calcSubtotal > 0) {
            const calculatedPct = (rawTax / calcSubtotal) * 100;
            taxLabel = `Taxes (GST @ ${calculatedPct.toFixed(1)}%)`;
        }
    }

    const billingPeriod = bill.periodStart && bill.periodEnd
        ? `${bill.periodStart} to ${bill.periodEnd}`
        : bill.billingMonth && bill.billingYear
            ? `${new Date(bill.billingYear, bill.billingMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}`
            : bill.billingCycleName || "—";

    return (
        <Accordion defaultExpanded={defaultExpanded} variant="outlined" sx={{ borderRadius: "12px !important", overflow: "hidden", mb: 2, border: "1px solid", borderColor: "divider" }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: "action.hover", px: 2, minHeight: 48 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <CalculateIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle2" fontWeight={700}>
                        {title}
                    </Typography>
                </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 2 }}>
                {/* ── Bill Summary Header ── */}
                <Box sx={{ mb: 2, p: 1.5, bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.05em", mb: 1, display: "block" }}>
                        Bill Summary
                    </Typography>
                    <Grid container spacing={1.5}>
                        <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="text.secondary" display="block">Billing Period</Typography>
                            <Typography variant="body2" fontWeight={600}>{billingPeriod}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="text.secondary" display="block">Previous Reading</Typography>
                            <Typography variant="body2">{prevReading} kL</Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="text.secondary" display="block">Current Reading</Typography>
                            <Typography variant="body2">{currReading} kL</Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="text.secondary" display="block">Net Consumption</Typography>
                            <Typography variant="body2" fontWeight={700} color="primary.main">{units} kL</Typography>
                        </Grid>
                        {bill.tariffPlanName && (
                            <Grid item xs={12}>
                                <Typography variant="caption" color="text.secondary" display="block">Applied Tariff Plan</Typography>
                                <Chip label={bill.tariffPlanName} size="small" color="primary" variant="outlined" sx={{ fontWeight: 600, mt: 0.25 }} />
                            </Grid>
                        )}
                    </Grid>
                </Box>

                {/* ── Itemized Calculation Breakdown ── */}
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.05em", mb: 1, display: "block" }}>
                    Calculation Breakdown
                </Typography>
                <Table size="small" sx={{ mb: 1 }}>
                    <TableBody>
                        {/* Slab Breakdown Rows */}
                        {hasSlabs ? (
                            <>
                                {slabsList.map((item, idx) => {
                                    // Fix overlapping boundary in range label for non-first slabs:
                                    // e.g. "10–20 kL" becomes "11–20 kL" so slabs don't coincide.
                                    let displayRange = item.range;
                                    if (idx > 0) {
                                        displayRange = displayRange.replace(
                                            /^(\d+)(–|\u2013|-)/,
                                            (_, lower, sep) => `${parseInt(lower, 10) + 1}${sep}`
                                        );
                                    }
                                    return (
                                    <TableRow key={idx}>
                                        <TableCell sx={{ fontSize: "0.8125rem", py: 0.75, pl: 3, fontStyle: "italic", color: "text.secondary" }}>
                                            ↳ Slab {displayRange} ({item.units} kL × {formatCurrency(item.rate)})
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontSize: "0.8125rem", py: 0.75, color: "text.secondary" }}>
                                            {formatCurrency(item.amount)}
                                        </TableCell>
                                    </TableRow>
                                    );
                                })}
                                <TableRow sx={{ bgcolor: "action.hover" }}>
                                    <TableCell sx={{ fontSize: "0.8125rem", py: 0.75, fontWeight: 700 }}>
                                        Water Charges Subtotal
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.8125rem", py: 0.75 }}>
                                        {formatCurrency(waterChargesSubtotal)}
                                    </TableCell>
                                </TableRow>
                            </>
                        ) : (
                            <TableRow>
                                <TableCell sx={{ fontSize: "0.8125rem", py: 0.75, fontWeight: 600 }}>
                                    Water Consumption Charge ({units} Units)
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600, fontSize: "0.8125rem", py: 0.75 }}>
                                    {formatCurrency(waterChargesSubtotal)}
                                </TableCell>
                            </TableRow>
                        )}

                        {/* Fixed Base Charges */}
                        <TableRow>
                            <TableCell sx={{ fontSize: "0.8125rem", py: 0.75 }}>Fixed Base Charge</TableCell>
                            <TableCell align="right" sx={{ fontSize: "0.8125rem", py: 0.75 }}>{formatCurrency(fixed)}</TableCell>
                        </TableRow>

                        {/* Maintenance / Service Charges */}
                        {additional > 0 && (
                            <TableRow>
                                <TableCell sx={{ fontSize: "0.8125rem", py: 0.75 }}>Maintenance & Service Charge</TableCell>
                                <TableCell align="right" sx={{ fontSize: "0.8125rem", py: 0.75 }}>{formatCurrency(additional)}</TableCell>
                            </TableRow>
                        )}

                        {/* Shared Water Cost */}
                        {sharedCost > 0 && (
                            <TableRow>
                                <TableCell sx={{ fontSize: "0.8125rem", py: 0.75 }}>
                                    Shared Bulk Water Allocation ({bill.distributionStrategy || "EQUAL"})
                                </TableCell>
                                <TableCell align="right" sx={{ fontSize: "0.8125rem", py: 0.75 }}>{formatCurrency(sharedCost)}</TableCell>
                            </TableRow>
                        )}

                        {/* Discounts */}
                        {discount > 0 && (
                            <TableRow>
                                <TableCell sx={{ fontSize: "0.8125rem", py: 0.75, color: "success.main" }}>Discount Applied</TableCell>
                                <TableCell align="right" sx={{ fontSize: "0.8125rem", py: 0.75, color: "success.main" }}>-{formatCurrency(discount)}</TableCell>
                            </TableRow>
                        )}

                        {/* Penalties / Late Fees */}
                        {penalty > 0 && (
                            <TableRow>
                                <TableCell sx={{ fontSize: "0.8125rem", py: 0.75, color: "error.main" }}>Late Fee / Penalty</TableCell>
                                <TableCell align="right" sx={{ fontSize: "0.8125rem", py: 0.75, color: "error.main" }}>+{formatCurrency(penalty)}</TableCell>
                            </TableRow>
                        )}

                        {/* Taxes */}
                        <TableRow>
                            <TableCell sx={{ fontSize: "0.8125rem", py: 0.75 }}>{taxLabel}</TableCell>
                            <TableCell align="right" sx={{ fontSize: "0.8125rem", py: 0.75 }}>{formatCurrency(rawTax)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>

                <Divider sx={{ my: 1.5 }} />

                {/* ── Final Payable Amount ── */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 1 }}>
                    <Typography variant="subtitle2" fontWeight={800}>
                        Final Payable Amount
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={800} color="primary.main">
                        {formatCurrency(total)}
                    </Typography>
                </Stack>
            </AccordionDetails>
        </Accordion>
    );
}
