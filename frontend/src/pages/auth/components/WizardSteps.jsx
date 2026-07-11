import React, { useEffect, useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { 
    Stack, TextField, Typography, Card, CardActionArea, CardContent, 
    Grid, Box, MenuItem, CircularProgress, Alert, Paper, Checkbox, FormControlLabel
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { getCommunities, getBlocks, getUnits } from '../../../services/LookupService';

export const WizardStep1Basic = () => {
    const { register, formState: { errors } } = useFormContext();
    return (
        <Stack spacing={3}>
            <Typography variant="h6" fontWeight="700">Basic Information</Typography>
            <TextField 
                label="Full Name" 
                {...register("fullName")} 
                error={!!errors.fullName} 
                helperText={errors.fullName?.message} 
                fullWidth 
            />
            <TextField 
                label="Email Address" 
                type="email"
                {...register("email")} 
                error={!!errors.email} 
                helperText={errors.email?.message} 
                fullWidth 
            />
        </Stack>
    );
};

export const WizardStep2Role = () => {
    const { watch, setValue } = useFormContext();
    const currentRole = watch("requestedRole");

    const roles = [
        { id: 'USER', title: 'Resident', desc: 'Monitor your personal water usage and pay bills.', icon: <PersonIcon fontSize="large" /> },
        { id: 'COMMUNITY_ADMIN', title: 'Community Admin', desc: 'Manage community meters, alerts, and resident billing.', icon: <AdminPanelSettingsIcon fontSize="large" /> }
    ];

    return (
        <Stack spacing={3}>
            <Typography variant="h6" fontWeight="700">Select Your Role</Typography>
            <Grid container spacing={3}>
                {roles.map(role => (
                    <Grid item xs={12} sm={6} key={role.id}>
                        <Card 
                            elevation={currentRole === role.id ? 4 : 0}
                            sx={{ 
                                border: '2px solid',
                                borderColor: currentRole === role.id ? 'primary.main' : 'divider',
                                borderRadius: 3,
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    borderColor: currentRole === role.id ? 'primary.main' : 'primary.light',
                                    boxShadow: '0 12px 24px rgba(0,0,0,0.05)'
                                }
                            }}
                        >
                            <CardActionArea onClick={() => setValue("requestedRole", role.id, { shouldValidate: true })} sx={{ height: '100%', p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
                                <Box sx={{ 
                                    color: currentRole === role.id ? 'primary.main' : 'text.secondary', 
                                    mb: 2,
                                    p: 2,
                                    borderRadius: '50%',
                                    bgcolor: currentRole === role.id ? 'rgba(2, 136, 209, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                                    transition: 'all 0.3s ease'
                                }}>
                                    {role.icon}
                                </Box>
                                <Typography variant="h6" fontWeight="700" gutterBottom>{role.title}</Typography>
                                <Typography variant="body2" color="text.secondary" align="center">{role.desc}</Typography>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Stack>
    );
};

export const WizardStep3Resident = () => {
    const { control, watch, setValue, formState: { errors } } = useFormContext();
    const communityId = watch("communityId");
    const blockId = watch("blockId");

    const [communities, setCommunities] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState({ c: true, b: false, u: false });

    useEffect(() => {
        getCommunities().then(res => {
            setCommunities(res.data);
            setLoading(l => ({ ...l, c: false }));
        }).catch(() => setLoading(l => ({ ...l, c: false })));
    }, []);

    useEffect(() => {
        if (communityId) {
            setLoading(l => ({ ...l, b: true }));
            setValue("blockId", "");
            setValue("unitId", "");
            getBlocks(communityId).then(res => {
                setBlocks(res.data);
                setLoading(l => ({ ...l, b: false }));
            }).catch(() => setLoading(l => ({ ...l, b: false })));
        } else {
            setBlocks([]);
        }
    }, [communityId, setValue]);

    useEffect(() => {
        if (blockId) {
            setLoading(l => ({ ...l, u: true }));
            setValue("unitId", "");
            getUnits(blockId).then(res => {
                setUnits(res.data);
                setLoading(l => ({ ...l, u: false }));
            }).catch(() => setLoading(l => ({ ...l, u: false })));
        } else {
            setUnits([]);
        }
    }, [blockId, setValue]);

    return (
        <Stack spacing={3}>
            <Typography variant="h6" fontWeight="700">Location Details</Typography>
            
            <Controller
                name="communityId"
                control={control}
                render={({ field }) => (
                    <TextField {...field} select label="Select Community" fullWidth error={!!errors.communityId} helperText={errors.communityId?.message} disabled={loading.c}>
                        {loading.c ? <MenuItem disabled><CircularProgress size={20} /></MenuItem> :
                            communities.map(c => <MenuItem key={c.id} value={c.id}>{c.communityName || c.name}</MenuItem>)
                        }
                    </TextField>
                )}
            />

            <Controller
                name="blockId"
                control={control}
                render={({ field }) => (
                    <TextField {...field} select label="Select Block" fullWidth error={!!errors.blockId} helperText={errors.blockId?.message} disabled={!communityId || loading.b}>
                        {loading.b ? <MenuItem disabled><CircularProgress size={20} /></MenuItem> :
                            blocks.length === 0 ? <MenuItem disabled>No blocks available</MenuItem> :
                            blocks.map(b => <MenuItem key={b.id} value={b.id}>{b.blockName}</MenuItem>)
                        }
                    </TextField>
                )}
            />

            <Controller
                name="unitId"
                control={control}
                render={({ field }) => (
                    <TextField {...field} select label="Select Unit" fullWidth error={!!errors.unitId} helperText={errors.unitId?.message} disabled={!blockId || loading.u}>
                        {loading.u ? <MenuItem disabled><CircularProgress size={20} /></MenuItem> :
                            units.length === 0 ? <MenuItem disabled>No units available</MenuItem> :
                            units.map(u => <MenuItem key={u.id} value={u.id}>{u.unitNumber}</MenuItem>)
                        }
                    </TextField>
                )}
            />
        </Stack>
    );
};

export const WizardStep3Admin = () => {
    const { register, control, formState: { errors } } = useFormContext();
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCommunities().then(res => {
            setCommunities(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    return (
        <Stack spacing={3}>
            <Typography variant="h6" fontWeight="700">Professional Details</Typography>

            <Controller
                name="communityId"
                control={control}
                render={({ field }) => (
                    <TextField {...field} select label="Select Community to Administer" fullWidth error={!!errors.communityId} helperText={errors.communityId?.message} disabled={loading}>
                        {loading ? <MenuItem disabled><CircularProgress size={20} /></MenuItem> :
                            communities.map(c => <MenuItem key={c.id} value={c.id}>{c.communityName || c.name}</MenuItem>)
                        }
                    </TextField>
                )}
            />

            <TextField 
                label="Professional Information" 
                multiline rows={3}
                {...register("professionalInfo")} 
                error={!!errors.professionalInfo} 
                helperText={errors.professionalInfo?.message} 
                fullWidth 
                placeholder="Briefly describe your role and experience..."
            />

            <TextField 
                label="Invitation Token (Optional)" 
                {...register("invitationToken")} 
                error={!!errors.invitationToken} 
                helperText={errors.invitationToken?.message} 
                fullWidth 
            />
        </Stack>
    );
};

export const WizardStep4Credentials = () => {
    const { register, watch, control, formState: { errors } } = useFormContext();
    const pwd = watch("password") || "";
    
    // Simple password strength
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (pwd.match(/[A-Z]/)) strength += 25;
    if (pwd.match(/[0-9]/)) strength += 25;
    if (pwd.match(/[^A-Za-z0-9]/)) strength += 25;

    const strengthColor = strength < 50 ? 'error.main' : strength < 75 ? 'warning.main' : 'success.main';

    return (
        <Stack spacing={3}>
            <Typography variant="h6" fontWeight="700">Account Credentials</Typography>
            <TextField 
                label="Password" 
                type="password"
                {...register("password")} 
                error={!!errors.password} 
                helperText={errors.password?.message} 
                fullWidth 
            />
            {pwd && (
                <Box>
                    <Stack direction="row" spacing={1} sx={{ mb: 0.5 }}>
                        {[...Array(4)].map((_, i) => (
                            <Box key={i} sx={{ height: 4, flex: 1, bgcolor: strength > i * 25 ? strengthColor : 'divider', borderRadius: 1, transition: 'all 0.3s' }} />
                        ))}
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                        {strength < 50 ? "Weak" : strength < 75 ? "Medium" : "Strong"} password
                    </Typography>
                </Box>
            )}

            <TextField 
                label="Confirm Password" 
                type="password"
                {...register("confirmPassword")} 
                error={!!errors.confirmPassword} 
                helperText={errors.confirmPassword?.message} 
                fullWidth 
            />

            <Controller
                name="termsAccepted"
                control={control}
                render={({ field }) => (
                    <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} color="primary" />}
                        label="I accept the Terms and Conditions and Privacy Policy"
                    />
                )}
            />
            {errors.termsAccepted && <Typography color="error" variant="caption">{errors.termsAccepted.message}</Typography>}
        </Stack>
    );
};

export const WizardStep5Review = () => {
    const { getValues } = useFormContext();
    const values = getValues();

    return (
        <Stack spacing={3}>
            <Typography variant="h6" fontWeight="700">Review & Submit</Typography>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: 'background.default' }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">Full Name</Typography>
                        <Typography variant="body1" fontWeight="600">{values.fullName}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">Email</Typography>
                        <Typography variant="body1" fontWeight="600">{values.email}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">Role</Typography>
                        <Typography variant="body1" fontWeight="600">{values.requestedRole === 'USER' ? 'Resident' : 'Community Admin'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">Community ID</Typography>
                        <Typography variant="body1" fontWeight="600">{values.communityId || 'N/A'}</Typography>
                    </Grid>
                </Grid>
            </Paper>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
                By clicking Submit, your profile will be sent to the administrators for verification.
            </Alert>
        </Stack>
    );
};
