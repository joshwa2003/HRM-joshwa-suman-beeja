import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  FormControl,
  FormControlLabel,
  Switch,
  InputAdornment,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
  AccessTime as AccessTimeIcon,
  Timer as TimerIcon,
  Warning as WarningIcon,
  Coffee as CoffeeIcon,
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
  Email as EmailIcon,
  Assignment as AssignmentIcon,
  Save as SaveIcon,
  Info as InfoIcon,
  LightbulbOutlined as LightbulbIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import api from '../../utils/api';

const WorkHoursSettings = () => {
  const [settings, setSettings] = useState({
    checkInTime: '09:00',
    checkOutTime: '18:00',
    workingHours: 8,
    minimumWorkHours: 6,
    lateThreshold: 30,
    breakTime: 60,
    enableAutoFreeze: false,
    freezeAfterDays: 30,
    requireApprovalWorkflow: true,
    maxTasksPerDay: 20,
    enableEmailNotifications: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/system/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', text: 'Error fetching settings. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await api.put('/system/settings', { settings });
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Error saving settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Work Hours Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Configure work hours, attendance policies, and system settings
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
          onClick={handleSaveSettings}
          disabled={saving}
          size="large"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </Box>

      {/* Alert Messages */}
      {message.text && (
        <Alert 
          severity={message.type === 'success' ? 'success' : 'error'} 
          onClose={() => setMessage({ type: '', text: '' })}
          sx={{ mb: 3 }}
        >
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Working Hours Configuration */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <AccessTimeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Working Hours Configuration
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="time"
                    label="Work Start Time"
                    value={settings.checkInTime}
                    onChange={(e) => handleSettingChange('checkInTime', e.target.value)}
                    helperText="Default time when employees should start work"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="time"
                    label="Work End Time"
                    value={settings.checkOutTime}
                    onChange={(e) => handleSettingChange('checkOutTime', e.target.value)}
                    helperText="Default time when employees should end work"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Expected Working Hours per Day"
                    value={settings.workingHours}
                    onChange={(e) => handleSettingChange('workingHours', parseInt(e.target.value))}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">hours</InputAdornment>,
                    }}
                    inputProps={{ min: 1, max: 24 }}
                    helperText="Standard number of hours employees should work per day"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Minimum Work Hours per Day"
                    value={settings.minimumWorkHours}
                    onChange={(e) => handleSettingChange('minimumWorkHours', parseInt(e.target.value))}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">hours</InputAdornment>,
                    }}
                    inputProps={{ min: 1, max: 24 }}
                    helperText="Minimum hours required for a valid work day"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Late Arrival Threshold"
                    value={settings.lateThreshold}
                    onChange={(e) => handleSettingChange('lateThreshold', parseInt(e.target.value))}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><WarningIcon /></InputAdornment>,
                      endAdornment: <InputAdornment position="end">minutes</InputAdornment>,
                    }}
                    inputProps={{ min: 0, max: 120 }}
                    helperText="Minutes after start time to mark as late"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Daily Break Time"
                    value={settings.breakTime}
                    onChange={(e) => handleSettingChange('breakTime', parseInt(e.target.value))}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><CoffeeIcon /></InputAdornment>,
                      endAdornment: <InputAdornment position="end">minutes</InputAdornment>,
                    }}
                    inputProps={{ min: 0, max: 240 }}
                    helperText="Total break time allowed per day"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* System Configuration */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                System Configuration
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enableAutoFreeze}
                        onChange={(e) => handleSettingChange('enableAutoFreeze', e.target.checked)}
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center">
                        <LockIcon sx={{ mr: 1 }} />
                        Enable Auto-Freeze
                      </Box>
                    }
                  />
                  <Typography variant="caption" display="block" color="text.secondary">
                    Automatically freeze attendance records after specified days
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Auto-Freeze After Days"
                    value={settings.freezeAfterDays}
                    onChange={(e) => handleSettingChange('freezeAfterDays', parseInt(e.target.value))}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">days</InputAdornment>,
                    }}
                    inputProps={{ min: 1, max: 365 }}
                    disabled={!settings.enableAutoFreeze}
                    helperText="Number of days after which to freeze attendance records"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.requireApprovalWorkflow}
                        onChange={(e) => handleSettingChange('requireApprovalWorkflow', e.target.checked)}
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center">
                        <CheckCircleIcon sx={{ mr: 1 }} />
                        Require Approval Workflow
                      </Box>
                    }
                  />
                  <Typography variant="caption" display="block" color="text.secondary">
                    Enable multi-level approval for attendance regularization
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Maximum Tasks Per Day"
                    value={settings.maxTasksPerDay}
                    onChange={(e) => handleSettingChange('maxTasksPerDay', parseInt(e.target.value))}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><AssignmentIcon /></InputAdornment>,
                    }}
                    inputProps={{ min: 1, max: 100 }}
                    helperText="Maximum number of tasks allowed in daily logs"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enableEmailNotifications}
                        onChange={(e) => handleSettingChange('enableEmailNotifications', e.target.checked)}
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center">
                        <EmailIcon sx={{ mr: 1 }} />
                        Enable Email Notifications
                      </Box>
                    }
                  />
                  <Typography variant="caption" display="block" color="text.secondary">
                    Send email notifications for attendance and leave updates
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Settings Summary Card */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Current Configuration Summary
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Work Schedule:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {settings.checkInTime} - {settings.checkOutTime}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Daily Hours:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {settings.workingHours}h (min: {settings.minimumWorkHours}h)
                  </Typography>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Late Threshold:</Typography>
                  <Typography variant="body2" fontWeight="bold">{settings.lateThreshold} minutes</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Break Time:</Typography>
                  <Typography variant="body2" fontWeight="bold">{settings.breakTime} minutes</Typography>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip 
                  label={`Auto-Freeze: ${settings.enableAutoFreeze ? 'ON' : 'OFF'}`}
                  color="primary"
                  size="small"
                />
                <Chip 
                  label={`Approvals: ${settings.requireApprovalWorkflow ? 'ON' : 'OFF'}`}
                  color="info"
                  size="small"
                />
                <Chip 
                  label={`Emails: ${settings.enableEmailNotifications ? 'ON' : 'OFF'}`}
                  color="success"
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Help Section */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                <LightbulbIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Configuration Guidelines
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="subtitle1" gutterBottom color="primary">
                      <TimerIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Working Hours Best Practices
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleIcon color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Standard 8-hour workday"
                          secondary="Most organizations use 8 hours as standard"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleIcon color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Minimum 6 hours"
                          secondary="Ensures adequate productivity while allowing flexibility"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleIcon color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="15-30 minute late threshold"
                          secondary="Reasonable buffer for traffic and minor delays"
                        />
                      </ListItem>
                    </List>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="subtitle1" gutterBottom color="primary">
                      <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      System Configuration Tips
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <InfoIcon color="info" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Auto-Freeze Records"
                          secondary="Prevents tampering with old attendance data"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <InfoIcon color="info" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Approval Workflow"
                          secondary="Ensures proper oversight for attendance changes"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <InfoIcon color="info" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Email Notifications"
                          secondary="Keeps stakeholders informed of important updates"
                        />
                      </ListItem>
                    </List>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="subtitle1" gutterBottom color="primary">
                      <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Important Considerations
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <WarningIcon color="warning" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Test Before Deployment"
                          secondary="Always test settings with a small group first"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <WarningIcon color="warning" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Communicate Changes"
                          secondary="Inform employees about policy updates"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <WarningIcon color="warning" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Regular Review"
                          secondary="Review and adjust settings quarterly"
                        />
                      </ListItem>
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WorkHoursSettings;
