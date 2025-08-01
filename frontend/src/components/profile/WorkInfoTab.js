import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Card,
  CardContent,
  Chip,
  Divider,
  useTheme
} from '@mui/material';
import { Save, Edit, Cancel, Work, CalendarToday } from '@mui/icons-material';
import api from '../../utils/api';

const WorkInfoTab = ({ profileData, onUpdate, onNotification, isEditable }) => {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [formData, setFormData] = useState({
    employeeId: '',
    department: '',
    team: '',
    designation: '',
    employmentType: '',
    reportingManager: '',
    joiningDate: '',
    probationEndDate: '',
    confirmationStatus: '',
    employmentStatus: '',
    workLocation: '',
    shiftTiming: '',
    workAnniversary: ''
  });

  useEffect(() => {
    if (profileData) {
      setFormData({
        employeeId: profileData.employeeId || '',
        department: profileData.department || '',
        team: profileData.team || '',
        designation: profileData.designation || '',
        employmentType: profileData.employmentType || '',
        reportingManager: profileData.reportingManager?.firstName + ' ' + profileData.reportingManager?.lastName || '',
        joiningDate: profileData.joiningDate ? new Date(profileData.joiningDate).toISOString().split('T')[0] : '',
        probationEndDate: profileData.probationEndDate ? new Date(profileData.probationEndDate).toISOString().split('T')[0] : '',
        confirmationStatus: profileData.confirmationStatus || '',
        employmentStatus: profileData.employmentStatus || 'Active',
        workLocation: profileData.workLocation || '',
        shiftTiming: profileData.shiftTiming || '',
        workAnniversary: calculateWorkAnniversary(profileData.joiningDate)
      });
    }
    fetchDepartments();
  }, [profileData]);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data.departments || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const calculateWorkAnniversary = (joiningDate) => {
    if (!joiningDate) return '';
    const joining = new Date(joiningDate);
    const today = new Date();
    const years = today.getFullYear() - joining.getFullYear();
    const months = today.getMonth() - joining.getMonth();
    
    if (years === 0 && months === 0) {
      const days = today.getDate() - joining.getDate();
      return days > 0 ? `${days} days` : 'Today';
    } else if (years === 0) {
      return `${months} months`;
    } else {
      return `${years} years ${months >= 0 ? months : 12 + months} months`;
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const updateData = {
        designation: formData.designation,
        employmentType: formData.employmentType,
        workLocation: formData.workLocation,
        shiftTiming: formData.shiftTiming,
        confirmationStatus: formData.confirmationStatus
      };

      const response = await api.put('/auth/profile', updateData);
      
      if (response.data.success) {
        onUpdate(response.data.user);
        onNotification('Work information updated successfully!', 'success');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating work info:', error);
      onNotification(error.response?.data?.message || 'Failed to update work information', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (profileData) {
      setFormData({
        employeeId: profileData.employeeId || '',
        department: profileData.department || '',
        team: profileData.team || '',
        designation: profileData.designation || '',
        employmentType: profileData.employmentType || '',
        reportingManager: profileData.reportingManager?.firstName + ' ' + profileData.reportingManager?.lastName || '',
        joiningDate: profileData.joiningDate ? new Date(profileData.joiningDate).toISOString().split('T')[0] : '',
        probationEndDate: profileData.probationEndDate ? new Date(profileData.probationEndDate).toISOString().split('T')[0] : '',
        confirmationStatus: profileData.confirmationStatus || '',
        employmentStatus: profileData.employmentStatus || 'Active',
        workLocation: profileData.workLocation || '',
        shiftTiming: profileData.shiftTiming || '',
        workAnniversary: calculateWorkAnniversary(profileData.joiningDate)
      });
    }
    setIsEditing(false);
  };

  const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Intern', 'Consultant'];
  const confirmationStatuses = ['Confirmed', 'On Probation', 'Extended Probation'];
  const employmentStatuses = ['Active', 'Inactive', 'Terminated', 'Resigned'];
  const shiftTimings = ['9:00 AM - 6:00 PM', '10:00 AM - 7:00 PM', '11:00 AM - 8:00 PM', 'Flexible', 'Night Shift'];

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold" color="primary">
          Work Information
        </Typography>
        {isEditable && (
          <Box>
            {!isEditing ? (
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
            ) : (
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save'}
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Employment Details */}
        <Grid item xs={12}>
          <Card elevation={1}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Employment Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Employee ID"
                    value={formData.employeeId}
                    disabled={true}
                    helperText="Auto-generated and cannot be changed"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Department"
                    value={formData.department}
                    disabled={true}
                    helperText="Contact HR to change department"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Team"
                    value={formData.team}
                    disabled={true}
                    helperText="Contact HR to change team"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Designation"
                    value={formData.designation}
                    onChange={(e) => handleInputChange('designation', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!isEditing}>
                    <InputLabel>Employment Type</InputLabel>
                    <Select
                      value={formData.employmentType}
                      label="Employment Type"
                      onChange={(e) => handleInputChange('employmentType', e.target.value)}
                    >
                      {employmentTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Reporting Manager"
                    value={formData.reportingManager}
                    disabled={true}
                    helperText="Contact HR to change reporting manager"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Employment Status */}
        <Grid item xs={12}>
          <Card elevation={1}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Employment Status
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date of Joining"
                    type="date"
                    value={formData.joiningDate}
                    disabled={true}
                    InputLabelProps={{ shrink: true }}
                    helperText="Contact HR to correct joining date"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Probation End Date"
                    type="date"
                    value={formData.probationEndDate}
                    disabled={true}
                    InputLabelProps={{ shrink: true }}
                    helperText="Set by HR"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!isEditing}>
                    <InputLabel>Confirmation Status</InputLabel>
                    <Select
                      value={formData.confirmationStatus}
                      label="Confirmation Status"
                      onChange={(e) => handleInputChange('confirmationStatus', e.target.value)}
                    >
                      {confirmationStatuses.map((status) => (
                        <MenuItem key={status} value={status}>
                          {status}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Employment Status"
                    value={formData.employmentStatus}
                    disabled={true}
                    helperText="Managed by HR"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Work Location & Schedule */}
        <Grid item xs={12}>
          <Card elevation={1}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Work Location & Schedule
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Work Location"
                    value={formData.workLocation}
                    onChange={(e) => handleInputChange('workLocation', e.target.value)}
                    disabled={!isEditing}
                    placeholder="e.g., Head Office, Branch Office, Remote"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!isEditing}>
                    <InputLabel>Shift Timing</InputLabel>
                    <Select
                      value={formData.shiftTiming}
                      label="Shift Timing"
                      onChange={(e) => handleInputChange('shiftTiming', e.target.value)}
                    >
                      {shiftTimings.map((timing) => (
                        <MenuItem key={timing} value={timing}>
                          {timing}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={2} p={2} bgcolor={theme.palette.grey[50]} borderRadius={1}>
                    <CalendarToday color="primary" />
                    <Box>
                      <Typography variant="body1" fontWeight="bold">
                        Work Anniversary
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formData.workAnniversary || 'Not available'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12}>
          <Card elevation={1}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Quick Overview
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                <Chip 
                  icon={<Work />}
                  label={`${formData.designation || 'No Designation'}`}
                  color="primary"
                  variant="outlined"
                />
                <Chip 
                  label={`${formData.employmentType || 'Full-time'}`}
                  color="secondary"
                  variant="outlined"
                />
                <Chip 
                  label={`${formData.confirmationStatus || 'Confirmed'}`}
                  color={formData.confirmationStatus === 'Confirmed' ? 'success' : 'warning'}
                  variant="outlined"
                />
                <Chip 
                  label={`${formData.employmentStatus || 'Active'}`}
                  color={formData.employmentStatus === 'Active' ? 'success' : 'error'}
                  variant="outlined"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WorkInfoTab;
