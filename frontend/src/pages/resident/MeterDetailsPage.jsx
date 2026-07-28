import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageSummaryHeader from "../../components/common/PageSummaryHeader";
import WidgetContainer from "../../components/widgets/WidgetContainer";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import SkeletonCard from "../../components/common/SkeletonCard";
import {
    Grid,
    Typography,
    Stack,
    Box,
    Chip,
    Divider,
} from "@mui/material";
import SpeedIcon from "@mui/icons-material/Speed";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import BoltIcon from "@mui/icons-material/Bolt";
import HistoryIcon from "@mui/icons-material/History";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { getMyMeterDetails, getMyUsageHistory } from "../../services/ResidentOpsService";

// ── Info row for meter spec card ─────────────────────────────────────────────
const InfoRow = ({ label, value, chip }) => (
    <Box
        sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 1.5,
            borderBottom: "1px solid",
            borderColor: "divider",
            "&:last-child": { borderBottom: "none" },
        }}
    >
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {label}
        </Typography>
        {chip || (
            <Typography variant="body2" fontWeight={600} color="text.primary">
                {value ?? "—"}
            </Typography>
        )}
    </Box>
);

function MeterDetailsPage() {
    const [meter, setMeter]     = useState(null);
    const [readings, setReadings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [meterRes, usageRes] = await Promise.all([
                getMyMeterDetails(),
                getMyUsageHistory(),
            ]);
            setMeter(meterRes);
            setReadings(usageRes || []);
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to load meter details. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const isActive = meter?.meterStatus === "ACTIVE";

    const headerMetadata = useMemo(() => [
        { label: "Meter Number", value: meter?.meterNumber || "—" },
        { label: "Current Reading", value: meter?.currentReading != null ? `${meter.currentReading} units` : "—", color: "primary" },
        { label: "Status", value: meter?.meterStatus || "UNASSIGNED", color: isActive ? "success" : "warning" },
    ], [meter, isActive]);

    return (
        <DashboardLayout>
            <PageSummaryHeader
                title="Water Meter"
                subtitle="View your meter specifications, current reading, and recent consumption history."
                icon={SpeedIcon}
                metadata={headerMetadata}
            />

            <Grid container spacing={3}>
                {/* ── Left column: Meter Specs ── */}
                <Grid size={{ xs: 12, md: 5 }}>
                    {loading ? (
                        <Box sx={{ height: 300 }}><SkeletonCard /></Box>
                    ) : error && !meter ? (
                        <ErrorState message={error} onRetry={loadData} />
                    ) : !meter ? (
                        <WidgetContainer title="Meter Specifications">
                            <EmptyState
                                title="No Meter Assigned"
                                message="Your account does not have a water meter assigned yet. Contact your community admin."
                                icon={<SpeedIcon />}
                            />
                        </WidgetContainer>
                    ) : (
                        <WidgetContainer title="Meter Specifications">
                            <Stack spacing={0}>
                                <InfoRow label="Meter Number" value={meter.meterNumber} />
                                <InfoRow
                                    label="Status"
                                    chip={
                                        <Chip
                                            label={meter.meterStatus}
                                            color={isActive ? "success" : "warning"}
                                            size="small"
                                            variant="filled"
                                        />
                                    }
                                />
                                <InfoRow
                                    label="Current Reading"
                                    value={meter.currentReading != null ? `${meter.currentReading} units` : "—"}
                                />
                                {meter.installationDate && (
                                    <InfoRow
                                        label="Installation Date"
                                        value={new Date(meter.installationDate).toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    />
                                )}
                                {meter.lastReadingDate && (
                                    <InfoRow
                                        label="Last Reading"
                                        value={new Date(meter.lastReadingDate).toLocaleDateString("en-IN")}
                                    />
                                )}
                                {meter.meterBrand && (
                                    <InfoRow label="Brand / Model" value={`${meter.meterBrand}${meter.meterModel ? ` · ${meter.meterModel}` : ""}`} />
                                )}
                                {meter.location && (
                                    <InfoRow label="Location" value={meter.location} />
                                )}
                            </Stack>
                        </WidgetContainer>
                    )}
                </Grid>

                {/* ── Right column: Recent Readings ── */}
                <Grid size={{ xs: 12, md: 7 }}>
                    {loading ? (
                        <Box sx={{ height: 300 }}><SkeletonCard /></Box>
                    ) : (
                        <WidgetContainer title="Recent Consumption Readings">
                            {readings.length === 0 ? (
                                <EmptyState
                                    title="No Readings Yet"
                                    message="Consumption readings will appear here once your meter has been read."
                                    icon={<HistoryIcon />}
                                />
                            ) : (
                                <Stack spacing={0}>
                                    {readings.slice(0, 6).map((r, idx) => (
                                        <Box
                                            key={r.id ?? idx}
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 2,
                                                py: 2,
                                                px: 1,
                                                borderBottom: "1px solid",
                                                borderColor: "divider",
                                                "&:last-child": { borderBottom: "none" },
                                                "&:hover": { bgcolor: "action.hover" },
                                                borderRadius: 1,
                                                transition: "background-color 120ms ease",
                                            }}
                                        >
                                            {/* Icon */}
                                            <Box
                                                sx={{
                                                    width: 36,
                                                    height: 36,
                                                    borderRadius: "8px",
                                                    bgcolor: "primary.50",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <WaterDropIcon sx={{ fontSize: "1rem", color: "primary.main" }} />
                                            </Box>

                                            {/* Date */}
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Stack direction="row" alignItems="center" spacing={0.5} mb={0.25}>
                                                    <CalendarTodayIcon sx={{ fontSize: "0.75rem", color: "text.disabled" }} />
                                                    <Typography variant="caption" color="text.secondary">
                                                        {r.readingDate
                                                            ? new Date(r.readingDate).toLocaleDateString("en-IN", {
                                                                  day: "numeric",
                                                                  month: "short",
                                                                  year: "numeric",
                                                              })
                                                            : "—"}
                                                    </Typography>
                                                </Stack>
                                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                                                    {r.previousReading != null ? `${r.previousReading} → ${r.currentReading}` : `Reading: ${r.currentReading}`}
                                                </Typography>
                                            </Box>

                                            {/* Consumption */}
                                            <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                                    <BoltIcon sx={{ fontSize: "0.85rem", color: "warning.main" }} />
                                                    <Typography variant="body2" fontWeight={700} color="primary.main">
                                                        {r.unitsConsumed} units
                                                    </Typography>
                                                </Stack>
                                            </Box>
                                        </Box>
                                    ))}
                                </Stack>
                            )}
                        </WidgetContainer>
                    )}
                </Grid>
            </Grid>
        </DashboardLayout>
    );
}

export default MeterDetailsPage;
