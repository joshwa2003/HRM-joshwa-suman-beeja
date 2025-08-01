import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  InputLabel,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme
} from '@mui/material';
import {
  Settings,
  Security,
  Notifications,
  Palette,
  Language,
  Save,
  Lock,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import api from '../../utils/api';

const SettingsTab = ({ profileData, onUpdate, onNotification, isEditable }) => {
  const theme = useTheme();
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
      leaveReminders: true,
      payslipAlerts: true,
      birthdayWishes: true
    },
    privacy: {
      profileVisibility: 'team',
      showEmail: true,
      showPhone: false,
      showBirthday: true
    },
    preferences: {
      language: 'en',
      timezone: 'Asia/Kolkata',
      dateFormat: 'DD/MM/YYYY',
      theme: 'light'
    }
  });
  
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/auth/settings');
      if (response.data.settings) {
        setSettings(prev => ({ ...prev, ...response.data.settings }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      const response = await api.put('/auth/settings', { settings });
      
      if (response.data.success) {
        onNotification('Settings updated successfully!', 'success');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      onNotification('Failed to save settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      onNotification('New passwords do not match', 'error');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      onNotification('Password must be at least 8 characters long', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.data.success) {
        onNotification('Password changed successfully!', 'success');
        setPasswordDialog(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      onNotification(error.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'mr', name: 'Marathi' },
    { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' }
  ];

  const timezones = [
    { code: 'Asia/Kolkata', name: 'India Standard Time (IST)' },
    { code: 'Asia/Dubai', name: 'Gulf Standard Time (GST)' },
    { code: 'America/New_York', name: 'Eastern Time (ET)' },
    { code: 'Europe/London', name: 'Greenwich Mean Time (GMT)' }
  ];

  const dateFormats = [
    { code: 'DD/MM/YYYY', name: 'DD/MM/YYYY' },
    { code: 'MM/DD/YYYY', name: 'MM/DD/YYYY' },
    { code: 'YYYY-MM-DD', name: 'YYYY-MM-DD' }
  ];

  const themes = [
    { code: 'light', name: 'Light Theme' },
    { code: 'dark', name: 'Dark Theme' },
    { code: 'auto', name: 'Auto (System)' }
  ];

  const profileVisibilityOptions = [
    { code: 'public', name: 'Everyone in Organization' },
    { code: 'team', name: 'Team Members Only' },
    { code: 'private', name: 'Only Me' }
  ];

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold" color="primary">
          Settings & Preferences
        </Typography>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSaveSettings}
          disabled={loading || !isEditable}
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Notification Settings */}
        <Grid item xs={12}>
          <Card elevation={1}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Notifications color="primary" />
                <Typography variant="h6" color="primary">
                  Notification Preferences
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.email}
                        onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                        disabled={!isEditable}
                      />
                    }
                    label="Email Notifications"
                  />
                  <Typography variant="body2" color="text.secondary">
                    Receive notifications via email
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.push}
                        onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                        disabled={!isEditable}
                      />
                    }
                    label="Push Notifications"
                  />
                  <Typography variant="body2" color="text.secondary">
                    Browser push notifications
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.leaveReminders}
                        onChange={(e) => handleSettingChange('notifications', 'leaveReminders', e.target.checked)}
                        disabled={!isEditable}
                      />
                    }
                    label="Leave Reminders"
                  />
                  <Typography variant="body2" color="text.secondary">
                    Reminders for leave applications
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.payslipAlerts}
                        onChange={(e) => handleSettingChange('notifications', 'payslipAlerts', e.target.checked)}
                        disabled={!isEditable}
                      />
                    }
                    label="Payslip Alerts"
                  />
                  <Typography variant="body2" color="text.secondary">
                    Alerts when payslip is generated
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.birthdayWishes}
                        onChange={(e) => handleSettingChange('notifications', 'birthdayWishes', e.target.checked)}
                        disabled={!isEditable}
                      />
                    }
                    label="Birthday Wishes"
                  />
                  <Typography variant="body2" color="text.secondary">
                    Receive birthday wishes from colleagues
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Privacy Settings */}
        <Grid item xs={12}>
          <Card elevation={1}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Security color="primary" />
                <Typography variant="h6" color="primary">
                  Privacy Settings
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!isEditable}>
                    <InputLabel>Profile Visibility</InputLabel>
                    <Select
                      value={settings.privacy.profileVisibility}
                      label="Profile Visibility"
                      onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
                    >
                      {profileVisibilityOptions.map((option) => (
                        <MenuItem key={option.code} value={option.code}>
                          {option.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.privacy.showEmail}
                        onChange={(e) => handleSettingChange('privacy', 'showEmail', e.target.checked)}
                        disabled={!isEditable}
                      />
                    }
                    label="Show Email Address"
                  />
                  <Typography variant="body2" color="text.secondary">
                    Display email in profile
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.privacy.showPhone}
                        onChange={(e) => handleSettingChange('privacy', 'showPhone', e.target.checked)}
                        disabled={!isEditable}
                      />
                    }
                    label="Show Phone Number"
                  />
                  <Typography variant="body2" color="text.secondary">
                    Display phone in profile
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.privacy.showBirthday}
                        onChange={(e) => handleSettingChange('privacy', 'showBirthday', e.target.checked)}
                        disabled={!isEditable}
                      />
                    }
                    label="Show Birthday"
                  />
                  <Typography variant="body2" color="text.secondary">
                    Display birthday in profile
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Application Preferences */}
        <Grid item xs={12}>
          <Card elevation={1}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Palette color="primary" />
                <Typography variant="h6" color="primary">
                  Application Preferences
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!isEditable}>
                    <InputLabel>Language</InputLabel>
                    <Select
                      value={settings.preferences.language}
                      label="Language"
                      onChange={(e) => handleSettingChange('preferences', 'language', e.target.value)}
                    >
                      {languages.map((lang) => (
                        <MenuItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!isEditable}>
                    <InputLabel>Timezone</InputLabel>
                    <Select
                      value={settings.preferences.timezone}
                      label="Timezone"
                      onChange={(e) => handleSettingChange('preferences', 'timezone', e.target.value)}
                    >
                      {timezones.map((tz) => (
                        <MenuItem key={tz.code} value={tz.code}>
                          {tz.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!isEditable}>
                    <InputLabel>Date Format</InputLabel>
                    <Select
                      value={settings.preferences.dateFormat}
                      label="Date Format"
                      onChange={(e) => handleSettingChange('preferences', 'dateFormat', e.target.value)}
                    >
                      {dateFormats.map((format) => (
                        <MenuItem key={format.code} value={format.code}>
                          {format.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!isEditable}>
                    <InputLabel>Theme</InputLabel>
                    <Select
                      value={settings.preferences.theme}
                      label="Theme"
                      onChange={(e) => handleSettingChange('preferences', 'theme', e.target.value)}
                    >
                      {themes.map((theme) => (
                        <MenuItem key={theme.code} value={theme.code}>
                          {theme.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12}>
          <Card elevation={1}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Lock color="primary" />
                <Typography variant="h6" color="primary">
                  Security Settings
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      Keep your account secure by using a strong password and enabling two-factor authentication.
                    </Typography>
                  </Alert>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    startIcon={<Lock />}
                    onClick={() => setPasswordDialog(true)}
                    disabled={!isEditable}
                    fullWidth
                  >
                    Change Password
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    startIcon={<Security />}
                    disabled={!isEditable}
                    fullWidth
                    onClick={() => onNotification('Two-factor authentication coming soon!', 'info')}
                  >
                    Enable 2FA
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Current Password"
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                InputProps={{
                  endAdornment: (
                    <Button
                      onClick={() => togglePasswordVisibility('current')}
                      sx={{ minWidth: 'auto', p: 1 }}
                    >
                      {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                    </Button>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="New Password"
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                InputProps={{
                  endAdornment: (
                    <Button
                      onClick={() => togglePasswordVisibility('new')}
                      sx={{ minWidth: 'auto', p: 1 }}
                    >
                      {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                    </Button>
                  )
                }}
                helperText="Password must be at least 8 characters long"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirm New Password"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                InputProps={{
                  endAdornment: (
                    <Button
                      onClick={() => togglePasswordVisibility('confirm')}
                      sx={{ minWidth: 'auto', p: 1 }}
                    >
                      {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                    </Button>
                  )
                }}
                error={passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword}
                helperText={
                  passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword
                    ? 'Passwords do not match'
                    : ''
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handlePasswordChange}
            disabled={
              loading ||
              !passwordData.currentPassword ||
              !passwordData.newPassword ||
              !passwordData.confirmPassword ||
              passwordData.newPassword !== passwordData.confirmPassword
            }
          >
            {loading ? 'Changing...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsTab;
