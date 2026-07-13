import { useState, useEffect, useMemo, useCallback } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import WidgetContainer from "../../components/widgets/WidgetContainer";
import TableToolbar from "../../components/common/TableToolbar";
import DataGrid from "../../components/common/DataGrid";
import ErrorState from "../../components/common/ErrorState";
import { Box, CircularProgress } from "@mui/material";
import CommunityOpsService from "../../services/CommunityOpsService";

function HouseholdDirectoryPage() {
    const [households, setHouseholds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchHouseholds = useCallback(async () => {
        try {
            setLoading(true);
            const data = await CommunityOpsService.getHouseholdDirectory();
            setHouseholds(data || []);
        } catch (err) {
            setError(err.message || "Failed to fetch household directory");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHouseholds();
    }, [fetchHouseholds]);

    const filteredHouseholds = useMemo(() => {
        return households.filter(h => 
            (h.residentName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (h.unitNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (h.meterNumber || "").toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [households, searchQuery]);

    const columns = useMemo(() => [
        { field: "residentName", headerName: "Resident Name", flex: 1, minWidth: 150 },
        { field: "unitNumber", headerName: "Unit", width: 100 },
        { field: "meterNumber", headerName: "Meter", width: 120 },
        { field: "currentReading", headerName: "Current Reading", width: 150 },
        { field: "pendingBillsCount", headerName: "Pending Bills", width: 120 },
        { field: "pendingBillsAmount", headerName: "Total Due ($)", width: 120 }
    ], []);

    if (error) return <DashboardLayout><ErrorState message={error} onRetry={fetchHouseholds} /></DashboardLayout>;

    return (
        <DashboardLayout>
            <PageHeader 
                title="Household Directory" 
                subtitle="View resident details, meters, and pending bills" 
            />
            
            <WidgetContainer>
                <TableToolbar 
                    searchPlaceholder="Search by resident, unit, or meter..."
                    onSearch={setSearchQuery}
                    filterOptions={[]}
                    onFilter={() => {}}
                />
                <Box sx={{ mt: 3, height: 500 }}>
                    {loading && households.length === 0 ? (
                        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                            <CircularProgress />
                        </Box>
                    ) : (
                        <DataGrid 
                            rows={filteredHouseholds}
                            columns={columns}
                            getRowId={(row) => row.residentId}
                        />
                    )}
                </Box>
            </WidgetContainer>
        </DashboardLayout>
    );
}

export default HouseholdDirectoryPage;