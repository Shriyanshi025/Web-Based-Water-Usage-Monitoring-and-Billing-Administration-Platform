import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import WidgetContainer from "../../components/widgets/WidgetContainer";
import LoadingScreen from "../../components/common/LoadingScreen";
import ErrorState from "../../components/common/ErrorState";
import { getResidentProfile, updateResidentProfile } from "../../services/ResidentOpsService";
import { Grid, TextField, Button, Box, Typography } from "@mui/material";
import { useNotification } from "../../context/NotificationContext";

function ProfilePage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const { showNotification } = useNotification();

    const [formData, setFormData] = useState({
        fullName: "",
        contactNumber: ""
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const response = await getResidentProfile();
            setProfile(response.data);
            setFormData({
                fullName: response.data.fullName || "",
                contactNumber: response.data.contactNumber || ""
            });
            setError(null);
        } catch (err) {
            console.error("Failed to load profile", err);
            setError(err.response?.data?.message || "Failed to load profile data");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const response = await updateResidentProfile(formData);
            setProfile(response.data);
            showNotification("Profile updated successfully", "success");
        } catch (err) {
            showNotification(err.response?.data?.message || "Failed to update profile", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <LoadingScreen />
            </DashboardLayout>
        );
    }

    if (error && !profile) {
        return (
            <DashboardLayout>
                <ErrorState message={error} onRetry={loadProfile} />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <PageHeader 
                title="My Profile" 
                subtitle="Manage your personal information and contact details" 
            />
            
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <WidgetContainer title="Personal Details">
                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Full Name"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Contact Number"
                                        name="contactNumber"
                                        value={formData.contactNumber}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Email Address"
                                        value={profile?.email || ""}
                                        disabled
                                        helperText="Email cannot be changed"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Button 
                                        type="submit" 
                                        variant="contained" 
                                        color="primary"
                                        disabled={saving}
                                    >
                                        {saving ? "Saving..." : "Save Changes"}
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    </WidgetContainer>
                </Grid>
                
                <Grid item xs={12} md={4}>
                    <WidgetContainer title="Account Information">
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Community</Typography>
                                <Typography variant="body1">{profile?.communityName || "N/A"}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Block & Unit</Typography>
                                <Typography variant="body1">
                                    {profile?.blockName || "N/A"} - {profile?.unitNumber || "N/A"}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Status</Typography>
                                <Typography variant="body1" color="success.main" sx={{ textTransform: 'capitalize' }}>
                                    {profile?.status || "Active"}
                                </Typography>
                            </Box>
                        </Box>
                    </WidgetContainer>
                </Grid>
            </Grid>
        </DashboardLayout>
    );
}

export default ProfilePage;
