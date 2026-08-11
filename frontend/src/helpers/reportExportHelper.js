import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatWaterUsage } from "./numberHelper";

// Helper to escape CSV values properly
const escapeCSV = (val) => {
  if (val === undefined || val === null) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

// ══════════════════════════════════════════════════════════════════════════════
// 1. COMMUNITY ADMIN EXPORT CSV
// ══════════════════════════════════════════════════════════════════════════════
export function exportCommunityReportCSV({ reportsData, benchmarkingData, comparisonData, insights, filters }) {
  let csvContent = "";

  // A. Metadata
  csvContent += "REPORT HEADER & METADATA\n";
  csvContent += `Report Title,Community Water & Billing Administration Report\n`;
  csvContent += `Community Name,${escapeCSV(reportsData?.communityName || "All Communities")}\n`;
  csvContent += `Generated At,${escapeCSV(reportsData?.generatedAt || new Date().toLocaleString())}\n`;
  csvContent += `Billing Cycle ID,${escapeCSV(filters?.billingCycleId || "ALL")}\n`;
  csvContent += `Reporting Period,${escapeCSV(filters?.month ? `${filters.month}/${filters.year}` : "All Time")}\n`;
  csvContent += `Date Scope,${escapeCSV(filters?.startDate || "Start")} to ${escapeCSV(filters?.endDate || "End")}\n\n`;

  // B. Executive Summary
  csvContent += "SECTION 1: EXECUTIVE SUMMARY\n";
  csvContent += "Metric,Value,Unit\n";
  csvContent += `Total Water Purchased,${escapeCSV(reportsData?.totalWaterPurchased || 0)},kL\n`;
  csvContent += `Total Water Consumed,${escapeCSV(reportsData?.totalWaterConsumed || 0)},kL\n`;
  csvContent += `Total Water Loss,${escapeCSV(reportsData?.totalWaterLoss || 0)},kL\n`;
  csvContent += `Water Loss Percentage,${escapeCSV(reportsData?.waterLossPercentage || 0)},%\n`;
  csvContent += `Collection Efficiency,${escapeCSV(reportsData?.collectionEfficiencyPercentage || 0)},%\n`;
  csvContent += `Total Revenue Generated,${escapeCSV(reportsData?.totalRevenueGenerated || 0)},INR\n`;
  csvContent += `Total Revenue Collected,${escapeCSV(reportsData?.totalRevenueCollected || 0)},INR\n`;
  csvContent += `Total Revenue Pending,${escapeCSV(reportsData?.totalRevenuePending || 0)},INR\n\n`;

  // C. Water Reports Section
  csvContent += "SECTION 2: WATER SUPPLY & CONSUMPTION TRENDS\n";
  csvContent += "Month/Period,Water Consumed (kL),Water Purchased (kL),Water Loss (kL)\n";
  if (reportsData?.monthlyTrends) {
    reportsData.monthlyTrends.forEach(t => {
      csvContent += `${escapeCSV(t.month)},${escapeCSV(t.consumed)},${escapeCSV(t.purchased)},${escapeCSV(t.loss)}\n`;
    });
  }
  csvContent += "\n";

  // D. Billing & Revenue Analytics Trends
  csvContent += "SECTION 3: REVENUE & BILLING CYCLE TRENDS\n";
  csvContent += "Period,Revenue Billed (INR),Revenue Collected (INR),Outstanding (INR)\n";
  if (reportsData?.revenueTrends) {
    reportsData.revenueTrends.forEach(r => {
      csvContent += `${escapeCSV(r.period || r.month)},${escapeCSV(r.billed || r.revenue)},${escapeCSV(r.collected)},${escapeCSV(r.pending)}\n`;
    });
  }
  csvContent += "\n";

  // E. Benchmarking Rankings (All rows, ignoring UI page size limits)
  csvContent += "SECTION 4: HOUSEHOLD WATER EFFICIENCY RANKINGS (BENCHMARKING)\n";
  csvContent += "Rank,Flat Number,Resident Name,Block Name,Occupancy,Water Consumed (kL),Efficiency Score,Leak Suspected\n";
  if (benchmarkingData?.rankings) {
    benchmarkingData.rankings.forEach(r => {
      csvContent += `${escapeCSV(r.rank)},${escapeCSV(r.flatNumber)},${escapeCSV(r.residentName)},${escapeCSV(r.blockName)},${escapeCSV(r.occupancy)},${escapeCSV(r.waterConsumed)},${escapeCSV(r.efficiencyScore)},${escapeCSV(r.leakSuspected ? "YES" : "NO")}\n`;
    });
  }
  csvContent += "\n";

  // F. Ranking Movements
  csvContent += "SECTION 5: RANKING MOVEMENTS (TRENDS)\n";
  csvContent += "Flat Number,Resident Name,Previous Rank,Current Rank,Change\n";
  if (benchmarkingData?.rankingMovements) {
    benchmarkingData.rankingMovements.forEach(m => {
      csvContent += `${escapeCSV(m.flatNumber)},${escapeCSV(m.residentName)},${escapeCSV(m.previousRank)},${escapeCSV(m.currentRank)},${escapeCSV(m.change)}\n`;
    });
  }
  csvContent += "\n";

  // G. Block Benchmarking Performance
  csvContent += "SECTION 6: BLOCK PERFORMANCE OVERVIEW\n";
  csvContent += "Block Name,Average Consumption (kL),Total Households,Total Residents\n";
  if (benchmarkingData?.blockPerformance) {
    benchmarkingData.blockPerformance.forEach(b => {
      csvContent += `${escapeCSV(b.blockName)},${escapeCSV(b.averageConsumption)},${escapeCSV(b.totalHouseholds)},${escapeCSV(b.totalResidents)}\n`;
    });
  }
  csvContent += "\n";

  // H. Household Comparison Section
  csvContent += "SECTION 7: HISTORICAL HOUSEHOLD COMPARISON DETAILS\n";
  if (comparisonData) {
    csvContent += `Comparison Period Label,${escapeCSV(comparisonData.householdA?.comparisonPeriodLabel || "Normalized Period")}\n`;
    csvContent += "Household,Flat,Resident,Block,Period Consumption (kL),Total Billed (INR),Total Paid (INR)\n";
    csvContent += `Household A,${escapeCSV(comparisonData.householdA?.flatNumber)},${escapeCSV(comparisonData.householdA?.residentName)},${escapeCSV(comparisonData.householdA?.blockName)},${escapeCSV(comparisonData.householdA?.currentUsage)},${escapeCSV(comparisonData.householdA?.totalBilled)},${escapeCSV(comparisonData.householdA?.totalPaid)}\n`;
    csvContent += `Household B,${escapeCSV(comparisonData.householdB?.flatNumber)},${escapeCSV(comparisonData.householdB?.residentName)},${escapeCSV(comparisonData.householdB?.blockName)},${escapeCSV(comparisonData.householdB?.currentUsage)},${escapeCSV(comparisonData.householdB?.totalBilled)},${escapeCSV(comparisonData.householdB?.totalPaid)}\n`;
  } else {
    csvContent += "No household comparison performed.\n";
  }
  csvContent += "\n";

  // I. Advisory & AI Insights
  csvContent += "SECTION 8: ADVISORY & AI INSIGHTS\n";
  csvContent += "Severity,Category,Message\n";
  if (insights) {
    insights.forEach(ins => {
      csvContent += `${escapeCSV(ins.severity || ins.type)},${escapeCSV(ins.category)},${escapeCSV(ins.message || ins.description)}\n`;
    });
  }
  csvContent += "\n";

  // J. Detailed Data Tables (ALL four tabs included, export entire datasets)
  csvContent += "SECTION 9a: DETAILED RESIDENT SUMMARIES\n";
  csvContent += "Flat,Resident,Block,Meters Count,Current Consumption (kL),Avg Consumption (kL),Status\n";
  if (reportsData?.residentSummaries) {
    reportsData.residentSummaries.forEach(r => {
      csvContent += `${escapeCSV(r.flatNumber)},${escapeCSV(r.residentName)},${escapeCSV(r.blockName)},${escapeCSV(r.metersCount)},${escapeCSV(r.currentConsumption)},${escapeCSV(r.averageConsumption)},${escapeCSV(r.status)}\n`;
    });
  }
  csvContent += "\n";

  csvContent += "SECTION 9b: DETAILED BILL SUMMARIES\n";
  csvContent += "Invoice No,Flat,Resident,Billing Month,Amount Billed (INR),Amount Paid (INR),Status\n";
  if (reportsData?.billSummaries) {
    reportsData.billSummaries.forEach(b => {
      csvContent += `${escapeCSV(b.invoiceNumber)},${escapeCSV(b.flatNumber)},${escapeCSV(b.residentName)},${escapeCSV(b.billingMonth)},${escapeCSV(b.amountBilled)},${escapeCSV(b.amountPaid)},${escapeCSV(b.status)}\n`;
    });
  }
  csvContent += "\n";

  csvContent += "SECTION 9c: DETAILED COMPLAINT SUMMARIES\n";
  csvContent += "Ticket ID,Flat,Category,Subject,Raised Date,Status,Resolution Time\n";
  if (reportsData?.complaintSummaries) {
    reportsData.complaintSummaries.forEach(c => {
      csvContent += `${escapeCSV(c.ticketId)},${escapeCSV(c.flatNumber)},${escapeCSV(c.category)},${escapeCSV(c.subject)},${escapeCSV(c.raisedDate)},${escapeCSV(c.status)},${escapeCSV(c.resolutionTime || "—")}\n`;
    });
  }
  csvContent += "\n";

  csvContent += "SECTION 9d: DETAILED BLOCK PERFORMANCE\n";
  csvContent += "Block,Total Flats,Total Residents,Total Billed (INR),Total Collected (INR),Water Supplied (kL),Water Loss (kL)\n";
  if (reportsData?.blockPerformances) {
    reportsData.blockPerformances.forEach(bp => {
      csvContent += `${escapeCSV(bp.blockName)},${escapeCSV(bp.totalFlats)},${escapeCSV(bp.totalResidents)},${escapeCSV(bp.totalBilled)},${escapeCSV(bp.totalCollected)},${escapeCSV(bp.waterSupplied)},${escapeCSV(bp.waterLoss)}\n`;
    });
  }

  // Trigger file download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  const periodStr = filters?.month ? `_${filters.month}_${filters.year}` : "_AllTime";
  link.setAttribute("download", `Community_Admin_Reports${periodStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ══════════════════════════════════════════════════════════════════════════════
// 2. COMMUNITY ADMIN EXPORT PDF
// ══════════════════════════════════════════════════════════════════════════════
export function exportCommunityReportPDF({ reportsData, benchmarkingData, comparisonData, insights, filters }) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  let y = 15;

  // Cover / Header Info
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(21, 101, 192); // Primary color
  doc.text("Community Water & Billing Executive Report", 15, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Community: ${reportsData?.communityName || "All Communities"}  |  Generated At: ${reportsData?.generatedAt || new Date().toLocaleString()}`, 15, y);
  y += 5;
  doc.text(`Filters: Billing Cycle ID: ${filters?.billingCycleId || "ALL"}  |  Period: ${filters?.month ? `${filters.month}/${filters.year}` : "All Time"}  |  Dates: ${filters?.startDate || "Start"} to ${filters?.endDate || "End"}`, 15, y);
  y += 10;

  // Executive Summary Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(33, 33, 33);
  doc.text("1. Executive Summary KPIs", 15, y);
  y += 4;

  const kpiData = [
    ["Total Water Purchased", `${reportsData?.totalWaterPurchased || 0} kL`, "Total Water Consumed", `${reportsData?.totalWaterConsumed || 0} kL`],
    ["Total Water Loss", `${reportsData?.totalWaterLoss || 0} kL (${reportsData?.waterLossPercentage?.toFixed(1) || 0}%)`, "Collection Efficiency", `${reportsData?.collectionEfficiencyPercentage?.toFixed(1) || 0}%`],
    ["Total Revenue Generated", formatCurrency(reportsData?.totalRevenueGenerated || 0), "Total Revenue Collected", formatCurrency(reportsData?.totalRevenueCollected || 0)],
    ["Total Revenue Pending", formatCurrency(reportsData?.totalRevenuePending || 0), "Active Billing Cycles", String(reportsData?.activeBillingCyclesCount || "—")]
  ];

  autoTable(doc, {
    startY: y,
    head: [],
    body: kpiData,
    theme: "striped",
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: "bold", width: 50 },
      1: { width: 45 },
      2: { fontStyle: "bold", width: 50 },
      3: { width: 45 }
    }
  });

  y = doc.lastAutoTable.finalY + 10;

  // Insights / Advisory Section
  if (insights && insights.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("2. Key Operations Insights & Advisories", 15, y);
    y += 4;

    const insightRows = insights.map(i => [i.severity || i.type || "INFO", i.category || "General", i.message || i.description || ""]);
    autoTable(doc, {
      startY: y,
      head: [["Severity", "Category", "Advisory / Action Message"]],
      body: insightRows,
      theme: "grid",
      styles: { fontSize: 8.5, cellPadding: 2 },
      headStyles: { fillColor: [13, 71, 161] },
      columnStyles: {
        0: { fontStyle: "bold", width: 25 },
        1: { fontStyle: "bold", width: 35 },
        2: { width: 130 }
      }
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // Monthly trends page break
  doc.addPage();
  y = 15;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("3. Monthly Water Supply & Revenue Trends", 15, y);
  y += 4;

  const trendRows = reportsData?.monthlyTrends ? reportsData.monthlyTrends.map(t => [t.month, `${t.purchased} kL`, `${t.consumed} kL`, `${t.loss} kL`, `${((t.loss/t.purchased)*100).toFixed(1)}%`]) : [];
  autoTable(doc, {
    startY: y,
    head: [["Month", "Water Supplied", "Water Consumed", "Distribution Loss", "Loss %"]],
    body: trendRows,
    theme: "striped",
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [0, 105, 92] }
  });

  y = doc.lastAutoTable.finalY + 10;

  // Block Performance Summary
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("4. Block Performance Summary", 15, y);
  y += 4;

  const blockPerfRows = benchmarkingData?.blockPerformance ? benchmarkingData.blockPerformance.map(b => [b.blockName, `${b.averageConsumption} kL`, String(b.totalHouseholds), String(b.totalResidents)]) : [];
  autoTable(doc, {
    startY: y,
    head: [["Block Name", "Avg Consumption", "Households Count", "Total Residents"]],
    body: blockPerfRows,
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [21, 101, 192] }
  });

  y = doc.lastAutoTable.finalY + 10;

  // Household Comparison
  if (comparisonData) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`5. Household Comparison (${comparisonData.householdA?.comparisonPeriodLabel || "Selected Period"})`, 15, y);
    y += 4;

    const compRows = [
      ["Household A", comparisonData.householdA?.flatNumber || "—", comparisonData.householdA?.residentName || "—", `${comparisonData.householdA?.currentUsage || 0} kL`, formatCurrency(comparisonData.householdA?.totalBilled || 0), formatCurrency(comparisonData.householdA?.totalPaid || 0)],
      ["Household B", comparisonData.householdB?.flatNumber || "—", comparisonData.householdB?.residentName || "—", `${comparisonData.householdB?.currentUsage || 0} kL`, formatCurrency(comparisonData.householdB?.totalBilled || 0), formatCurrency(comparisonData.householdB?.totalPaid || 0)]
    ];
    autoTable(doc, {
      startY: y,
      head: [["Household", "Flat Number", "Resident Name", "Period Consumption", "Billed Amount", "Paid Amount"]],
      body: compRows,
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 2.5 },
      headStyles: { fillColor: [230, 81, 0] }
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // Section 5: Water Efficiency Rankings
  doc.addPage();
  y = 15;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("6. Household Water Efficiency Rankings", 15, y);
  y += 4;

  const rankingRows = benchmarkingData?.rankings ? benchmarkingData.rankings.map(r => [String(r.rank), r.flatNumber, r.residentName, r.blockName, String(r.occupancy), `${r.waterConsumed} kL`, String(r.efficiencyScore), r.leakSuspected ? "YES" : "NO"]) : [];
  autoTable(doc, {
    startY: y,
    head: [["Rank", "Flat", "Resident Name", "Block", "Occupancy", "Water Consumed", "Efficiency Score", "Leak Alert"]],
    body: rankingRows,
    theme: "striped",
    styles: { fontSize: 8, cellPadding: 1.8 },
    headStyles: { fillColor: [0, 105, 92] }
  });

  // Section 6: Data Tables Page Break
  doc.addPage();
  y = 15;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("7. Detailed Resident Usage Summaries", 15, y);
  y += 4;

  const detailResRows = reportsData?.residentSummaries ? reportsData.residentSummaries.map(r => [r.flatNumber, r.residentName, r.blockName, String(r.metersCount), `${r.currentConsumption} kL`, `${r.averageConsumption} kL`, r.status]) : [];
  autoTable(doc, {
    startY: y,
    head: [["Flat", "Resident Name", "Block", "Meters", "Current Usage", "Avg Usage", "Status"]],
    body: detailResRows,
    theme: "striped",
    styles: { fontSize: 8, cellPadding: 1.8 },
    headStyles: { fillColor: [21, 101, 192] }
  });

  doc.addPage();
  y = 15;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("8. Detailed Billing & Invoices Summary", 15, y);
  y += 4;

  const detailBillRows = reportsData?.billSummaries ? reportsData.billSummaries.map(b => [b.invoiceNumber, b.flatNumber, b.residentName, b.billingMonth, formatCurrency(b.amountBilled), formatCurrency(b.amountPaid), b.status]) : [];
  autoTable(doc, {
    startY: y,
    head: [["Invoice No", "Flat", "Resident Name", "Billing Month", "Amount Billed", "Amount Paid", "Status"]],
    body: detailBillRows,
    theme: "striped",
    styles: { fontSize: 8, cellPadding: 1.8 },
    headStyles: { fillColor: [21, 101, 192] }
  });

  // Save Report
  const periodStr = filters?.month ? `_${filters.month}_${filters.year}` : "_AllTime";
  doc.save(`Community_Admin_Reports${periodStr}.pdf`);
}

// ══════════════════════════════════════════════════════════════════════════════
// 3. MAIN ADMIN EXPORT CSV
// ══════════════════════════════════════════════════════════════════════════════
export function exportMainAdminReportCSV({ dashData, communities, communityAdmins }) {
  let csvContent = "";

  // A. Header Metadata
  csvContent += "SYSTEM-WIDE PLATFORM REPORTS & TELEMETRY SUMMARY\n";
  csvContent += `Generated At,${escapeCSV(new Date().toLocaleString())}\n\n`;

  // B. Executive Summary KPIs
  csvContent += "SECTION 1: SYSTEM KPI METRICS\n";
  csvContent += "Metric,Value,Sub-details\n";
  csvContent += `Total Communities,${escapeCSV(dashData?.totalCommunities || 0)},Registered across the platform\n`;
  csvContent += `Total Residents,${escapeCSV(dashData?.totalResidents || 0)},Registered resident users\n`;
  csvContent += `Total Water Consumption,${escapeCSV(dashData?.totalWaterConsumption || 0)},kL Platform consumption\n`;
  csvContent += `Total Platform Revenue,${escapeCSV(dashData?.totalRevenue || 0)},INR total billing volume\n`;
  csvContent += `Total Community Admins,${escapeCSV(dashData?.totalCommunityAdmins || 0)},Total registered admins\n`;
  csvContent += `Pending Admin Approvals,${escapeCSV(dashData?.pendingCommunityAdmins || 0)},Awaiting action\n\n`;

  // C. Monthly Consumption Trend Dataset
  csvContent += "SECTION 2: MONTHLY WATER CONSUMPTION TELEMETRY\n";
  csvContent += "Month,Consumption (kL)\n";
  if (dashData?.monthlyWaterConsumptionChart) {
    dashData.monthlyWaterConsumptionChart.forEach(m => {
      csvContent += `${escapeCSV(m.month)},${escapeCSV(m.usage || m.value || 0)}\n`;
    });
  }
  csvContent += "\n";

  // D. Community Growth Trend Dataset
  csvContent += "SECTION 3: COMMUNITY REGISTRATION GROWTH\n";
  csvContent += "Period,Total Communities Registered\n";
  if (dashData?.communityGrowth) {
    dashData.communityGrowth.forEach(g => {
      csvContent += `${escapeCSV(g.label)},${escapeCSV(g.count || g.value || 0)}\n`;
    });
  }
  csvContent += "\n";

  // E. Communities Directory
  csvContent += "SECTION 4: REGISTERED COMMUNITIES DIRECTORY\n";
  csvContent += "Community ID,Community Name,City,Status,Households Count,Residents Count\n";
  if (communities) {
    communities.forEach(c => {
      csvContent += `${escapeCSV(c.id)},${escapeCSV(c.name || c.communityName)},${escapeCSV(c.city || c.location)},${escapeCSV(c.active !== false ? "ACTIVE" : "INACTIVE")},${escapeCSV(c.totalHouseholds || c.householdCount || 0)},${escapeCSV(c.totalResidents || c.residentCount || 0)}\n`;
    });
  }
  csvContent += "\n";

  // F. Community Admins Overview
  csvContent += "SECTION 5: COMMUNITY ADMINS OVERVIEW\n";
  csvContent += "Admin ID,FullName,Email,Community Name,Approval Status,Active Status\n";
  if (communityAdmins) {
    communityAdmins.forEach(a => {
      csvContent += `${escapeCSV(a.id)},${escapeCSV(a.fullName || a.name)},${escapeCSV(a.email)},${escapeCSV(a.communityName || a.community?.name || "—")},${escapeCSV(a.approvalStatus)},${escapeCSV(a.active !== false ? "ACTIVE" : "INACTIVE")}\n`;
    });
  }

  // Trigger file download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Main_Admin_System_Report_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ══════════════════════════════════════════════════════════════════════════════
// 4. MAIN ADMIN EXPORT PDF
// ══════════════════════════════════════════════════════════════════════════════
export function exportMainAdminReportPDF({ dashData, communities, communityAdmins }) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  let y = 15;

  // Header Cover Info
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(21, 101, 192); // Primary Blue
  doc.text("System-Wide Platform Executive Report", 15, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Scope: Platform Level Administration  |  Generated At: ${new Date().toLocaleString()}`, 15, y);
  y += 10;

  // Section 1: KPIs
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(33, 33, 33);
  doc.text("1. Executive Summary KPIs", 15, y);
  y += 4;

  const activeComms = communities ? communities.filter(c => c.active !== false).length : 0;
  const kpis = [
    ["Total Communities", `${dashData?.totalCommunities || 0} (${activeComms} active)`, "Total Residents", String(dashData?.totalResidents || 0)],
    ["Total Platform Water", formatWaterUsage(dashData?.totalWaterConsumption || 0), "Total Revenue Generated", formatCurrency(dashData?.totalRevenue || 0)],
    ["Total Registered Admins", String(dashData?.totalCommunityAdmins || 0), "Pending Admin Approvals", String(dashData?.pendingCommunityAdmins || 0)]
  ];

  autoTable(doc, {
    startY: y,
    head: [],
    body: kpis,
    theme: "striped",
    styles: { fontSize: 9.5, cellPadding: 2.5 },
    columnStyles: {
      0: { fontStyle: "bold", width: 50 },
      1: { width: 45 },
      2: { fontStyle: "bold", width: 50 },
      3: { width: 45 }
    }
  });

  y = doc.lastAutoTable.finalY + 10;

  // Section 2: Water Consumption Telemetry
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("2. Monthly Platform Water Consumption Telemetry", 15, y);
  y += 4;

  const monthRows = dashData?.monthlyWaterConsumptionChart ? dashData.monthlyWaterConsumptionChart.map(m => [m.month, formatWaterUsage(m.usage || m.value || 0)]) : [];
  autoTable(doc, {
    startY: y,
    head: [["Billing Month", "Total Consumption"]],
    body: monthRows,
    theme: "striped",
    styles: { fontSize: 9.5, cellPadding: 2 },
    headStyles: { fillColor: [0, 105, 92] }
  });

  // Section 3: Communities Directory Page Break
  doc.addPage();
  y = 15;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("3. Communities Directory Overview", 15, y);
  y += 4;

  const commRows = communities ? communities.map((c, i) => [String(i + 1), c.name || c.communityName || "—", c.city || c.location || "—", c.active !== false ? "ACTIVE" : "INACTIVE", String(c.totalHouseholds || c.householdCount || 0), String(c.totalResidents || c.residentCount || 0)]) : [];
  autoTable(doc, {
    startY: y,
    head: [["#", "Community Name", "City", "Status", "Households", "Residents"]],
    body: commRows,
    theme: "striped",
    styles: { fontSize: 8.5, cellPadding: 1.8 },
    headStyles: { fillColor: [21, 101, 192] }
  });

  // Section 4: Community Admins Page Break
  doc.addPage();
  y = 15;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("4. Registered Community Admins Overview", 15, y);
  y += 4;

  const adminRows = communityAdmins ? communityAdmins.map((a, i) => [String(i + 1), a.fullName || a.name || "—", a.email || "—", a.communityName || a.community?.name || "—", a.approvalStatus, a.active !== false ? "ACTIVE" : "INACTIVE"]) : [];
  autoTable(doc, {
    startY: y,
    head: [["#", "Admin Name", "Email Address", "Allocated Community", "Approval", "Status"]],
    body: adminRows,
    theme: "striped",
    styles: { fontSize: 8.5, cellPadding: 1.8 },
    headStyles: { fillColor: [21, 101, 192] }
  });

  doc.save(`Main_Admin_System_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
}
