import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageSummaryHeader from "../../components/common/PageSummaryHeader";
import WidgetContainer from "../../components/widgets/WidgetContainer";
import LoadingScreen from "../../components/common/LoadingScreen";
import ErrorState from "../../components/common/ErrorState";
import { Grid, TextField, Button, Box, Typography, Stack, Paper } from "@mui/material";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SecurityIcon from "@mui/icons-material/Security";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import BadgeIcon from "@mui/icons-material/Badge";
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
            <PageSummaryHeader 
                title="Account Settings & Profile" 
                subtitle="Manage your personal profile, credentials, and email notification preferences"
                icon={<BadgeIcon />}
                statusText={(profile?.active || user?.role === "MAIN_ADMIN") ? "Account Active" : "Account Inactive"}
                metadata={[
                    { label: "Role", value: user?.role?.replace("_", " ").toLowerCase() || "User", color: "primary" },
                    ...(profile?.communityName ? [{ label: "Community", value: profile.communityName, color: "info" }] : []),
                    ...(profile?.blockName ? [{ label: "Block / Unit", value: `${profile.blockName} - ${profile.unitNumber || ''}`, color: "secondary" }] : [])
                ]}
            />
            
            <Stack spacing={3} sx={{ pb: 4 }}>
                {/* 1. Account Information */}
                <WidgetContainer 
                    title="Account Information" 
                    subtitle="System access level, community assignment, and account status overview"
                >
                    <Grid container spacing={3} sx={{ mt: 0.5 }}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: "8px", border: "1px solid", borderColor: "divider" }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 0.5 }}>
                                    System Role
                                </Typography>
                                <Typography variant="subtitle1" fontWeight={700} sx={{ textTransform: "capitalize", color: "primary.main" }}>
                                    {user?.role?.replace("_", " ").toLowerCase() || "N/A"}
                                </Typography>
                            </Box>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: "8px", border: "1px solid", borderColor: "divider" }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 0.5 }}>
                                    Community Network
                                </Typography>
                                <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                                    {profile?.communityName || (user?.role === "MAIN_ADMIN" ? "Platform Administrator" : "N/A")}
                                </Typography>
                            </Box>
                        </Grid>

                        {user?.role === "USER" && (
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: "8px", border: "1px solid", borderColor: "divider" }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 0.5 }}>
                                        Block & Unit Location
                                    </Typography>
                                    <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                                        {profile?.blockName || "N/A"} - {profile?.unitNumber || "N/A"}
                                    </Typography>
                                </Box>
                            </Grid>
                        )}

                        <Grid size={{ xs: 12, sm: 6, md: user?.role === "USER" ? 3 : 6 }}>
                            <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: "8px", border: "1px solid", borderColor: "divider" }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 0.5 }}>
                                    Account Status
                                </Typography>
                                <Typography variant="subtitle1" fontWeight={700} color={(profile?.active || user?.role === "MAIN_ADMIN") ? "success.main" : "error.main"}>
                                    {(profile?.active || user?.role === "MAIN_ADMIN") ? "Active & Verified" : "Inactive"}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </WidgetContainer>

                {/* 2. Personal Details */}
                <WidgetContainer 
                    title="Personal Details" 
                    subtitle="Update your full name, contact information, and primary mailing address"
                >
                    <Box component="form" onSubmit={handleSubmitProfile} sx={{ mt: 1 }}>
                        <Grid container spacing={2.5}>
                            <Grid size={{ xs: 12, sm: 6 }}>
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
                                <Grid size={{ xs: 12, sm: 6 }}>
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

                            <Grid size={{ xs: 12, sm: user?.role === "MAIN_ADMIN" ? 6 : 12 }}>
                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    value={profile?.email || ""}
                                    disabled
                                    helperText="Email address is fixed to your registration credential"
                                />
                            </Grid>

                            {user?.role === "COMMUNITY_ADMIN" && (
                                <Grid size={{ xs: 12 }}>
                                    <TextField
                                        fullWidth
                                        label="Office Address"
                                        name="officeAddress"
                                        value={formData.officeAddress}
                                        onChange={handleChange}
                                        multiline
                                        rows={2}
                                    />
                                </Grid>
                            )}

                            <Grid size={{ xs: 12 }}>
                                <Button 
                                    type="submit" 
                                    variant="contained" 
                                    color="primary"
                                    disabled={saving}
                                    sx={{ px: 3, fontWeight: 700 }}
                                >
                                    {saving ? "Saving…" : "Save Changes"}
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </WidgetContainer>

                {/* 3. Security & Password */}
                <WidgetContainer 
                    title="Security & Password" 
                    subtitle="Update your account password to ensure ongoing platform security"
                >
                    <Box component="form" onSubmit={handleSubmitPassword} sx={{ mt: 1 }}>
                        <Grid container spacing={2.5}>
                            <Grid size={{ xs: 12 }}>
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
                            <Grid size={{ xs: 12, sm: 6 }}>
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
                            <Grid size={{ xs: 12, sm: 6 }}>
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
                            <Grid size={{ xs: 12 }}>
                                <Button 
                                    type="submit" 
                                    variant="contained" 
                                    color="secondary"
                                    disabled={changingPassword}
                                    sx={{ px: 3, fontWeight: 700 }}
                                >
                                    {changingPassword ? "Updating…" : "Update Password"}
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </WidgetContainer>

                {/* 4. Notification Preferences */}
                <EmailPreferencesCard />
            </Stack>
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
        <WidgetContainer 
            title="Email Notification Preferences" 
            subtitle="Configure automated email alerts and operational notifications"
        >
            <Stack spacing={2} sx={{ mt: 1 }}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Paper variant="outlined" sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Box>
                                <Typography variant="subtitle2" fontWeight={700}>Bill & Payment Statements</Typography>
                                <Typography variant="caption" color="text.secondary">Invoices, payment receipts, and billing summaries</Typography>
                            </Box>
                            <Button
                                size="small"
                                variant={prefs.billEmails ? "contained" : "outlined"}
                                color={prefs.billEmails ? "success" : "inherit"}
                                onClick={() => handleToggle("billEmails")}
                                sx={{ px: 2, py: 0.5, fontSize: "0.75rem", fontWeight: 700 }}
                            >
                                {prefs.billEmails ? "Enabled" : "Disabled"}
                            </Button>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Paper variant="outlined" sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Box>
                                <Typography variant="subtitle2" fontWeight={700}>Water Leak & Usage Alerts</Typography>
                                <Typography variant="caption" color="text.secondary">Excessive consumption warnings and leak detection</Typography>
                            </Box>
                            <Button
                                size="small"
                                variant={prefs.alertEmails ? "contained" : "outlined"}
                                color={prefs.alertEmails ? "success" : "inherit"}
                                onClick={() => handleToggle("alertEmails")}
                                sx={{ px: 2, py: 0.5, fontSize: "0.75rem", fontWeight: 700 }}
                            >
                                {prefs.alertEmails ? "Enabled" : "Disabled"}
                            </Button>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Paper variant="outlined" sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Box>
                                <Typography variant="subtitle2" fontWeight={700}>Bill Due Reminders</Typography>
                                <Typography variant="caption" color="text.secondary">Automated reminders before invoice due dates</Typography>
                            </Box>
                            <Button
                                size="small"
                                variant={prefs.reminderEmails ? "contained" : "outlined"}
                                color={prefs.reminderEmails ? "success" : "inherit"}
                                onClick={() => handleToggle("reminderEmails")}
                                sx={{ px: 2, py: 0.5, fontSize: "0.75rem", fontWeight: 700 }}
                            >
                                {prefs.reminderEmails ? "Enabled" : "Disabled"}
                            </Button>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Paper variant="outlined" sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Box>
                                <Typography variant="subtitle2" fontWeight={700}>Community Announcements</Typography>
                                <Typography variant="caption" color="text.secondary">Important maintenance notices and community updates</Typography>
                            </Box>
                            <Button
                                size="small"
                                variant={prefs.announcementEmails ? "contained" : "outlined"}
                                color={prefs.announcementEmails ? "success" : "inherit"}
                                onClick={() => handleToggle("announcementEmails")}
                                sx={{ px: 2, py: 0.5, fontSize: "0.75rem", fontWeight: 700 }}
                            >
                                {prefs.announcementEmails ? "Enabled" : "Disabled"}
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>

                <Box sx={{ pt: 1, textAlign: "left" }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                        disabled={saving}
                        sx={{ px: 3, fontWeight: 700 }}
                    >
                        {saving ? "Saving..." : "Save Preferences"}
                    </Button>
                </Box>
            </Stack>
        </WidgetContainer>
    );
}
