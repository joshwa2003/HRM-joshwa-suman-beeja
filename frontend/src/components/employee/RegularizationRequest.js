import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Alert,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Snackbar,
  FormHelperText,
  IconButton,
  Collapse,
  Fade,
  Skeleton
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  Info as InfoIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  LightbulbOutlined as LightbulbIcon,
  AttachFile as AttachFileIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { regularizationAPI } from '../../utils/api';

const RegularizationRequest = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    attendanceDate: '',
    requestType: '',
    reason: '',
    requestedCheckIn: '',
    requestedCheckOut: '',
    requestedStatus: 'Present',
    priority: 'Normal'
  });
  const [documents, setDocuments] = useState([]);
  const [config, setConfig] = useState({
    requestTypes: [],
    priorities: [],
    requestedStatuses: []
  });
  const [loading, setLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [attendanceData, setAttendanceData] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  useEffect(() => {
    if (formData.attendanceDate) {
      fetchAttendanceData(formData.attendanceDate);
    }
  }, [formData.attendanceDate]);

  const fetchConfig = async () => {
    try {
      setConfigLoading(true);
      const response = await regularizationAPI.getRegularizationConfig();
      setConfig(response.data.data);
    } catch (error) {
      console.error('Error fetching config:', error);
      setError('Failed to load configuration. Please refresh the page.');
    } finally {
      setConfigLoading(false);
    }
  };

  const fetchAttendanceData = async (date) => {
    try {
      setAttendanceLoading(true);
      const response = await regularizationAPI.getEmployeeAttendance({ date });
      const attendance = response.data.data.find(record => 
        new Date(record.date).toDateString() === new Date(date).toDateString()
      );
      setAttendanceData(attendance);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setDocuments(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const submitData = new FormData();
      
      // Add form data
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });

      // Add documents
      documents.forEach(file => {
        submitData.append('documents', file);
      });

      await regularizationAPI.createRegularization(submitData);
      
      setSuccess('Regularization request submitted successfully!');
      setTimeout(() => {
        navigate('/admin/leave/my-attendance');
      }, 2000);
    } catch (error) {
      console.error('Error submitting regularization:', error);
      setError(error.response?.data?.message || error.message || 'Failed to submit regularization request');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'Not recorded';
    return new Date(dateTime).toLocaleString();
  };

  const getStatusChipColor = (status) => {
    switch (status) {
      case 'Present': return 'success';
      case 'Absent': return 'error';
      case 'Late': return 'warning';
      case 'Half Day': return 'info';
      case 'Work From Home': return 'primary';
      default: return 'default';
    }
  };

  const handleCloseError = () => setError('');
  const handleCloseSuccess = () => setSuccess('');

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <ScheduleIcon sx={{ mr: 2, color: 'primary.main' }} />
              Attendance Regularization Request
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Submit a request to regularize your attendance record
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/admin/leave/my-attendance')}
            sx={{ minWidth: 'auto' }}
          >
            Back to Attendance
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      <Collapse in={!!error}>
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <IconButton size="small" onClick={handleCloseError}>
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {error}
        </Alert>
      </Collapse>

      {/* Success Alert */}
      <Collapse in={!!success}>
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          action={
            <IconButton size="small" onClick={handleCloseSuccess}>
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {success}
        </Alert>
      </Collapse>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          {/* Regularization Form */}
          <Card elevation={2}>
            <CardHeader
              avatar={<AssignmentIcon color="primary" />}
              title="Regularization Details"
              titleTypographyProps={{ variant: 'h6', color: 'primary' }}
              sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', '& .MuiCardHeader-avatar': { color: 'inherit' } }}
            />
            <CardContent sx={{ p: 3 }}>
              {configLoading ? (
                <Box>
                  <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
                  <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
                  <Skeleton variant="rectangular" height={120} sx={{ mb: 2 }} />
                </Box>
              ) : (
                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    {/* Attendance Date */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="date"
                        name="attendanceDate"
                        label="Attendance Date"
                        value={formData.attendanceDate}
                        onChange={handleInputChange}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ max: new Date().toISOString().split('T')[0] }}
                        required
                        variant="outlined"
                      />
                    </Grid>

                    {/* Request Type */}
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth required>
                        <InputLabel>Request Type</InputLabel>
                        <Select
                          name="requestType"
                          value={formData.requestType}
                          onChange={handleInputChange}
                          label="Request Type"
                        >
                          {config.requestTypes.map(type => (
                            <MenuItem key={type.value} value={type.value}>
                              {type.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Requested Check-in Time */}
                    {['Missed Check-In', 'Missed Both', 'Late Arrival'].includes(formData.requestType) && (
                      <Grid item xs={12} md={6}>
                        <Fade in={true}>
                          <TextField
                            fullWidth
                            type="datetime-local"
                            name="requestedCheckIn"
                            label="Requested Check-in Time"
                            value={formData.requestedCheckIn}
                            onChange={handleInputChange}
                            InputLabelProps={{ shrink: true }}
                            variant="outlined"
                          />
                        </Fade>
                      </Grid>
                    )}

                    {/* Requested Check-out Time */}
                    {['Missed Check-Out', 'Missed Both', 'Early Departure'].includes(formData.requestType) && (
                      <Grid item xs={12} md={6}>
                        <Fade in={true}>
                          <TextField
                            fullWidth
                            type="datetime-local"
                            name="requestedCheckOut"
                            label="Requested Check-out Time"
                            value={formData.requestedCheckOut}
                            onChange={handleInputChange}
                            InputLabelProps={{ shrink: true }}
                            variant="outlined"
                          />
                        </Fade>
                      </Grid>
                    )}

                    {/* Requested Status */}
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Requested Status</InputLabel>
                        <Select
                          name="requestedStatus"
                          value={formData.requestedStatus}
                          onChange={handleInputChange}
                          label="Requested Status"
                        >
                          <MenuItem value="Present">Present</MenuItem>
                          <MenuItem value="Half Day">Half Day</MenuItem>
                          <MenuItem value="Work From Home">Work From Home</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Priority */}
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Priority</InputLabel>
                        <Select
                          name="priority"
                          value={formData.priority}
                          onChange={handleInputChange}
                          label="Priority"
                        >
                          {config.priorities.map(priority => (
                            <MenuItem key={priority} value={priority}>{priority}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Reason */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        name="reason"
                        label="Reason"
                        value={formData.reason}
                        onChange={handleInputChange}
                        placeholder="Please provide a detailed explanation for your regularization request..."
                        inputProps={{ maxLength: 500 }}
                        required
                        variant="outlined"
                        helperText={`${formData.reason.length}/500 characters`}
                      />
                    </Grid>

                    {/* Supporting Documents */}
                    <Grid item xs={12}>
                      <Box>
                        <Typography variant="subtitle1" gutterBottom>
                          Supporting Documents (Optional)
                        </Typography>
                        <Button
                          variant="outlined"
                          component="label"
                          startIcon={<AttachFileIcon />}
                          sx={{ mb: 1 }}
                        >
                          Choose Files
                          <input
                            type="file"
                            hidden
                            multiple
                            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                            onChange={handleFileChange}
                          />
                        </Button>
                        <FormHelperText>
                          Upload supporting documents (medical certificates, transport receipts, etc.). 
                          Max 5 files, 5MB each. Supported formats: JPG, PNG, PDF, DOC, DOCX
                        </FormHelperText>
                        {documents.length > 0 && (
                          <Paper variant="outlined" sx={{ mt: 2, p: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Selected files:
                            </Typography>
                            <List dense>
                              {documents.map((file, index) => (
                                <ListItem key={index} sx={{ py: 0.5 }}>
                                  <ListItemIcon sx={{ minWidth: 32 }}>
                                    <AttachFileIcon fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText 
                                    primary={file.name}
                                    secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Paper>
                        )}
                      </Box>
                    </Grid>

                    {/* Submit Buttons */}
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          size="large"
                          startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                          disabled={loading}
                          sx={{ minWidth: 160 }}
                        >
                          {loading ? 'Submitting...' : 'Submit Request'}
                        </Button>
                        <Button
                          variant="outlined"
                          size="large"
                          onClick={() => navigate('/admin/leave/my-attendance')}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          {/* Current Attendance Record */}
          {formData.attendanceDate && (
            <Card elevation={2} sx={{ mb: 3 }}>
              <CardHeader
                avatar={<InfoIcon color="info" />}
                title="Current Attendance Record"
                titleTypographyProps={{ variant: 'h6', color: 'info.main' }}
                sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}
              />
              <CardContent>
                {attendanceLoading ? (
                  <Box>
                    <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
                    <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
                    <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
                    <Skeleton variant="text" height={24} />
                  </Box>
                ) : attendanceData ? (
                  <Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Date:</strong> {new Date(attendanceData.date).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Status:</strong>
                          </Typography>
                          <Chip 
                            label={attendanceData.status}
                            color={getStatusChipColor(attendanceData.status)}
                            size="small"
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Check-in:</strong> {formatDateTime(attendanceData.checkIn)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Check-out:</strong> {formatDateTime(attendanceData.checkOut)}
                        </Typography>
                      </Grid>
                      {attendanceData.workingHours && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Working Hours:</strong> {attendanceData.workingHours.toFixed(2)} hours
                          </Typography>
                        </Grid>
                      )}
                      {attendanceData.isLate && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="warning.main">
                            <strong>Late by:</strong> {attendanceData.lateBy} minutes
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No attendance record found for this date.
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}

          {/* Help Information */}
          <Card elevation={2}>
            <CardHeader
              avatar={<LightbulbIcon color="warning" />}
              title="When to Use Regularization"
              titleTypographyProps={{ variant: 'h6', color: 'warning.main' }}
              sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}
            />
            <CardContent>
              <List dense>
                <ListItem sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckCircleIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Forgot to check-in or check-out"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckCircleIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="System or biometric issues"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckCircleIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Work from home or field work"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckCircleIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Medical or transport emergencies"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckCircleIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Late arrival due to valid reasons"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RegularizationRequest;
