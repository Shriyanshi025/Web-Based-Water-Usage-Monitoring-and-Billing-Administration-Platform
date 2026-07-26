import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import WidgetContainer from "../../components/widgets/WidgetContainer";
import LoadingScreen from "../../components/common/LoadingScreen";
import ErrorState from "../../components/common/ErrorState";
import { Grid, TextField, Button, Box, Typography, Card, CardContent, Stack } from "@mui/material";
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
                                                {saving ? "Saving…" : "Save Changes"}
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
                                                {changingPassword ? "Updating…" : "Change Password"}
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

                    <Box sx={{ mt: 3 }}>
                        <EmailPreferencesCard />
                    </Box>
                </Grid>
            </Grid>
        </DashboardLayout>
    );
}

export default ProfilePage;

function EmailPreferencesCard() {
    const { showNotification } = useNotification();
    const [prefs, setPrefs] = useState({
        billEmails: true,
        alertEmails: true,
        reminderEmails: true,
        announcementEmails: true,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        api.get("/email-preferences")
            .then(res => {
                if (res.data?.data) setPrefs(res.data.data);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleToggle = (key) => {
        setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await api.put("/email-preferences", prefs);
            showNotification("Email notification preferences updated successfully", "success");
        } catch (err) {
            showNotification("Failed to update email preferences", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return null;

    return (
        <WidgetContainer title="Email Notification Preferences">
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Control which automated email notifications you receive from HydroSync.
            </Typography>
            <Stack spacing={1.5}>
                <Grid container alignItems="center" justifyContent="space-between">
                    <Typography variant="body2" fontWeight={600}>Bill & Payment Statements</Typography>
                    <Button
                        size="small"
                        variant={prefs.billEmails ? "contained" : "outlined"}
                        color={prefs.billEmails ? "success" : "inherit"}
                        onClick={() => handleToggle("billEmails")}
                        sx={{ px: 1.5, py: 0.25, fontSize: "0.75rem" }}
                    >
                        {prefs.billEmails ? "Enabled" : "Disabled"}
                    </Button>
                </Grid>

                <Grid container alignItems="center" justifyContent="space-between">
                    <Typography variant="body2" fontWeight={600}>Water Leak & Usage Alerts</Typography>
                    <Button
                        size="small"
                        variant={prefs.alertEmails ? "contained" : "outlined"}
                        color={prefs.alertEmails ? "success" : "inherit"}
                        onClick={() => handleToggle("alertEmails")}
                        sx={{ px: 1.5, py: 0.25, fontSize: "0.75rem" }}
                    >
                        {prefs.alertEmails ? "Enabled" : "Disabled"}
                    </Button>
                </Grid>

                <Grid container alignItems="center" justifyContent="space-between">
                    <Typography variant="body2" fontWeight={600}>Bill Due Reminders</Typography>
                    <Button
                        size="small"
                        variant={prefs.reminderEmails ? "contained" : "outlined"}
                        color={prefs.reminderEmails ? "success" : "inherit"}
                        onClick={() => handleToggle("reminderEmails")}
                        sx={{ px: 1.5, py: 0.25, fontSize: "0.75rem" }}
                    >
                        {prefs.reminderEmails ? "Enabled" : "Disabled"}
                    </Button>
                </Grid>

                <Grid container alignItems="center" justifyContent="space-between">
                    <Typography variant="body2" fontWeight={600}>Community Announcements</Typography>
                    <Button
                        size="small"
                        variant={prefs.announcementEmails ? "contained" : "outlined"}
                        color={prefs.announcementEmails ? "success" : "inherit"}
                        onClick={() => handleToggle("announcementEmails")}
                        sx={{ px: 1.5, py: 0.25, fontSize: "0.75rem" }}
                    >
                        {prefs.announcementEmails ? "Enabled" : "Disabled"}
                    </Button>
                </Grid>

                <Box sx={{ pt: 1, textAlign: "right" }}>
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? "Saving..." : "Save Preferences"}
                    </Button>
                </Box>
            </Stack>
        </WidgetContainer>
    );
}
