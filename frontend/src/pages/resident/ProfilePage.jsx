import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import WidgetContainer from "../../components/widgets/WidgetContainer";
import LoadingScreen from "../../components/common/LoadingScreen";
import ErrorState from "../../components/common/ErrorState";
import { Grid, TextField, Button, Box, Typography, Card, CardContent } from "@mui/material";
import { useNotification } from "../../context/NotificationContext";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

function ProfilePage() {
    const { user } = useAuth();
    const { showNotification } = useNotification();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        fullName: "",
        phoneNumber: "",
        officeAddress: ""
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [changingPassword, setChangingPassword] = useState(false);

    useEffect(() => {
        if (user) {
            loadProfile();
        }
    }, [user]);

    const getEndpoint = () => {
        if (user.role === "MAIN_ADMIN") return "/admin/me";
        if (user.role === "COMMUNITY_ADMIN") return "/community-admins/me";
        return "/residents/me";
    };

    const loadProfile = async () => {
        try {
            setLoading(true);
            const endpoint = getEndpoint();
            const res = await api.get(endpoint);
            const profileData = res.data.data !== undefined ? res.data.data : res.data;
            setProfile(profileData);
            setFormData({
                fullName: profileData.fullName || "",
                phoneNumber: profileData.phoneNumber || profileData.contactNumber || "",
                officeAddress: profileData.officeAddress || ""
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

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleSubmitProfile = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const endpoint = getEndpoint();
            
            // Adjust body based on role
            let body = { fullName: formData.fullName };
            if (user.role === "COMMUNITY_ADMIN") {
                body.phoneNumber = formData.phoneNumber;
                body.officeAddress = formData.officeAddress;
            } else if (user.role === "USER") {
                body.phoneNumber = formData.phoneNumber;
            }

            const res = await api.put(endpoint, body);
            const updatedProfile = res.data.data !== undefined ? res.data.data : res.data;
            setProfile(updatedProfile);
            showNotification("Profile updated successfully", "success");
        } catch (err) {
            showNotification(err.response?.data?.message || "Failed to update profile", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleSubmitPassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showNotification("New passwords do not match", "error");
            return;
        }
        try {
            setChangingPassword(true);
            await api.post("/auth/change-password", passwordData);
            showNotification("Password updated successfully", "success");
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
        } catch (err) {
            showNotification(err.response?.data?.message || "Failed to update password", "error");
        } finally {
            setChangingPassword(false);
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
                {/* Left Column: Personal Details & Password Change */}
                <Grid item xs={12} md={8}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <WidgetContainer title="Personal Details">
                                <Box component="form" onSubmit={handleSubmitProfile} sx={{ mt: 2 }}>
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
                                        
                                        {user?.role !== "MAIN_ADMIN" && (
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Contact Number"
                                                    name="phoneNumber"
                                                    value={formData.phoneNumber}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </Grid>
                                        )}

                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Email Address"
                                                value={profile?.email || ""}
                                                disabled
                                                helperText="Email cannot be changed"
                                            />
                                        </Grid>

                                        {user?.role === "COMMUNITY_ADMIN" && (
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    label="Office Address"
                                                    name="officeAddress"
                                                    value={formData.officeAddress}
                                                    onChange={handleChange}
                                                    multiline
                                                    rows={3}
                                                />
                                            </Grid>
                                        )}

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

                        <Grid item xs={12}>
                            <WidgetContainer title="Change Password">
                                <Box component="form" onSubmit={handleSubmitPassword} sx={{ mt: 2 }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                type="password"
                                                label="Current Password"
                                                name="currentPassword"
                                                value={passwordData.currentPassword}
                                                onChange={handlePasswordChange}
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                type="password"
                                                label="New Password"
                                                name="newPassword"
                                                value={passwordData.newPassword}
                                                onChange={handlePasswordChange}
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                type="password"
                                                label="Confirm New Password"
                                                name="confirmPassword"
                                                value={passwordData.confirmPassword}
                                                onChange={handlePasswordChange}
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Button 
                                                type="submit" 
                                                variant="contained" 
                                                color="secondary"
                                                disabled={changingPassword}
                                            >
                                                {changingPassword ? "Updating..." : "Change Password"}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </WidgetContainer>
                        </Grid>
                    </Grid>
                </Grid>
                
                {/* Right Column: Account Information */}
                <Grid item xs={12} md={4}>
                    <WidgetContainer title="Account Information">
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Role</Typography>
                                <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                                    {user?.role?.replace("_", " ").toLowerCase() || "N/A"}
                                </Typography>
                            </Box>
                            
                            {user?.role !== "MAIN_ADMIN" && (
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Community</Typography>
                                    <Typography variant="body1">{profile?.communityName || "N/A"}</Typography>
                                </Box>
                            )}

                            {user?.role === "USER" && (
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Block & Unit</Typography>
                                    <Typography variant="body1">
                                        {profile?.blockName || "N/A"} - {profile?.unitNumber || "N/A"}
                                    </Typography>
                                </Box>
                            )}

                            <Box>
                                <Typography variant="caption" color="text.secondary">Status</Typography>
                                <Typography variant="body1" color="success.main" sx={{ textTransform: 'capitalize' }}>
                                    {profile?.active ? "Active" : "Inactive"}
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
