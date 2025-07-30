import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Grid,
  Paper,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Divider,
  Stack,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  AccessTime,
  CheckCircle,
  Cancel,
  Schedule,
  TrendingUp,
  CalendarToday,
  LocationOn,
  Notes,
  Refresh,
  Visibility,
  ExpandMore,
  PlayArrow,
  Stop,
  Warning,
  Info,
  CheckCircleOutline,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { attendanceAPI, regularizationAPI } from '../utils/api';
import mouseActivityService from '../services/mouseActivityService';

const MyAttendance = () => {
  // eslint-disable-next-line no-unused-vars
  const { user } = useAuth();
  const navigate = useNavigate();
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkOutLoading, setCheckOutLoading] = useState(false);
  const [showLateModal, setShowLateModal] = useState(false);
  const [lateArrivalData, setLateArrivalData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [location, setLocation] = useState('Office');
  const [notes, setNotes] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [regularizations, setRegularizations] = useState([]);
  const [showRegularizations, setShowRegularizations] = useState(false);
  const [workHours, setWorkHours] = useState({ checkInTime: '13:00', checkOutTime: '21:00' });
  const [smartOvertimeInfo, setSmartOvertimeInfo] = useState(null);
  const [activityStatus, setActivityStatus] = useState({ isTracking: false });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRegularization, setSelectedRegularization] = useState(null);

  // Update current time every minute for live work hours calculation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const fetchTodayAttendance = useCallback(async () => {
    try {
      const response = await attendanceAPI.getTodayAttendance();
      setTodayAttendance(response.data.attendance);
    } catch (error) {
      console.error('Error fetching today attendance:', error);
    }
  }, []);

  const fetchAttendanceHistory = useCallback(async () => {
    try {
      const response = await attendanceAPI.getMyAttendance({
        month: selectedMonth,
        year: selectedYear,
        limit: 31
      });
      setAttendanceHistory(response.data.attendance);
    } catch (error) {
      console.error('Error fetching attendance history:', error);
    }
  }, [selectedMonth, selectedYear]);

  const fetchAttendanceSummary = useCallback(async () => {
    try {
      const response = await attendanceAPI.getAttendanceSummary({
        month: selectedMonth,
        year: selectedYear
      });
      setAttendanceSummary(response.data.summary);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching attendance summary:', error);
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  const fetchRegularizations = useCallback(async () => {
    try {
      const response = await regularizationAPI.getMyRegularizations({ limit: 100 });
      
      if (response.data.success) {
        const data = response.data.data;
        setRegularizations(data.docs || data || []);
      } else {
        setRegularizations([]);
      }
    } catch (error) {
      console.error('Error fetching regularizations:', error);
      setRegularizations([]);
    }
  }, []);

  const fetchWorkHours = useCallback(async () => {
    try {
      const response = await fetch('/api/system/work-hours', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.workHours) {
          setWorkHours({
            checkInTime: data.workHours.checkInTime || '09:00',
            checkOutTime: data.workHours.checkOutTime || '18:00'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching work hours:', error);
      // Fallback to default values
      setWorkHours({ checkInTime: '09:00', checkOutTime: '18:00' });
    }
  }, []);

  useEffect(() => {
    fetchTodayAttendance();
    fetchAttendanceHistory();
    fetchAttendanceSummary();
    fetchRegularizations();
    fetchWorkHours();
  }, [fetchTodayAttendance, fetchAttendanceHistory, fetchAttendanceSummary, fetchRegularizations, fetchWorkHours]);

  // Mouse activity tracking effect
  useEffect(() => {
    // Start tracking if user is checked in but not checked out
    if (todayAttendance?.checkIn && !todayAttendance?.checkOut) {
      mouseActivityService.startTracking();
    } else {
      mouseActivityService.stopTracking();
    }

    // Update activity status periodically
    const activityInterval = setInterval(() => {
      setActivityStatus(mouseActivityService.getActivityStatus());
    }, 30000); // Update every 30 seconds

    return () => {
      clearInterval(activityInterval);
      mouseActivityService.stopTracking();
    };
  }, [todayAttendance]);

  const handleCheckIn = async () => {
    setCheckInLoading(true);
    try {
      const response = await attendanceAPI.checkIn({
        location,
        notes
      });
      
      setTodayAttendance(response.data.attendance);
      setNotes('');
      
      // Check if employee arrived late (more than 59 seconds after standard time)
      if (response.data.isLateArrival && response.data.lateMinutes > 0) {
        setLateArrivalData({
          lateMinutes: response.data.lateMinutes,
          checkInTime: response.data.attendance.checkIn
        });
        setShowLateModal(true);
      } else {
        // Show success message for on-time or early arrival
        alert('Check-in successful!');
      }
      
      // Refresh data
      fetchAttendanceHistory();
      fetchAttendanceSummary();
    } catch (error) {
      alert(error.response?.data?.message || 'Check-in failed');
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckOutLoading(true);
    try {
      const response = await attendanceAPI.checkOut({
        notes
      });
      
      setTodayAttendance(response.data.attendance);
      setSmartOvertimeInfo(response.data.smartOvertimeInfo);
      setNotes('');
      
      // Stop mouse activity tracking
      mouseActivityService.stopTracking();
      
      // Show success message with smart overtime info
      if (response.data.smartOvertimeInfo) {
        const info = response.data.smartOvertimeInfo;
        let message = 'Check-out successful!';
        
        if (info.shortageHours > 0 && info.adjustedOvertimeHours > 0) {
          message += `\n\nSmart Overtime Applied:\n• Shortage Hours Reduced: ${formatDuration(info.shortageHours)}\n• Final Overtime: ${formatDuration(info.adjustedOvertimeHours)}`;
        } else if (info.shortageHours > 0) {
          message += `\n\nShortage Hours Reduced: ${formatDuration(info.shortageHours)}`;
        } else if (info.adjustedOvertimeHours > 0) {
          message += `\n\nOvertime Earned: ${formatDuration(info.adjustedOvertimeHours)}`;
        }
        
        alert(message);
      } else {
        alert('Check-out successful!');
      }
      
      // Refresh data
      fetchAttendanceHistory();
      fetchAttendanceSummary();
    } catch (error) {
      alert(error.response?.data?.message || 'Check-out failed');
    } finally {
      setCheckOutLoading(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (hours) => {
    if (!hours) return '0h 0m';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const formatDelayTime = (minutes) => {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    
    let result = '';
    if (hours > 0) result += `${hours}h `;
    if (mins > 0 || hours === 0) result += `${mins}m`;
    
    return result.trim();
  };

  const formatWorkTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Helper function to get file icon based on mime type
  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith('image/')) return 'bi-file-earmark-image';
    if (mimeType?.includes('pdf')) return 'bi-file-earmark-pdf';
    if (mimeType?.includes('word')) return 'bi-file-earmark-word';
    if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) return 'bi-file-earmark-excel';
    return 'bi-file-earmark';
  };

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Helper function to check if file is previewable
  const isPreviewable = (mimeType) => {
    return mimeType?.startsWith('image/') || mimeType?.includes('pdf');
  };

  // Handle file download
  const handleFileDownload = (document) => {
    const downloadUrl = `http://localhost:5001${document.fileUrl}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = document.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle file preview
  const handleFilePreview = (document) => {
    const previewUrl = `http://localhost:5001${document.fileUrl}`;
    window.open(previewUrl, '_blank');
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'Urgent': return 'bg-danger';
      case 'High': return 'bg-warning';
      case 'Normal': return 'bg-info';
      case 'Low': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  };

  const calculateCurrentWorkHours = (checkInTime) => {
    if (!checkInTime) return '0h 0m';
    
    const checkIn = new Date(checkInTime);
    const now = currentTime; // Use state-managed current time for live updates
    const timeDiff = now.getTime() - checkIn.getTime();
    const totalMinutes = Math.floor(timeDiff / (1000 * 60));
    
    if (totalMinutes <= 0) return '0h 0m';
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours}h ${minutes}m`;
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      'Present': { color: 'success', icon: <CheckCircle /> },
      'Absent': { color: 'error', icon: <Cancel /> },
      'Late': { color: 'warning', icon: <Warning /> },
      'Half Day': { color: 'info', icon: <Schedule /> },
      'On Leave': { color: 'default', icon: <Info /> },
      'Holiday': { color: 'primary', icon: <CalendarToday /> }
    };
    
    const config = statusConfig[status] || { color: 'default', icon: <Info /> };
    
    return (
      <Chip
        label={status}
        color={config.color}
        icon={config.icon}
        size="small"
        variant="filled"
      />
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Present': { color: 'success', icon: <CheckCircle /> },
      'Absent': { color: 'error', icon: <Cancel /> },
      'Late': { color: 'warning', icon: <Warning /> },
      'Half Day': { color: 'info', icon: <Schedule /> },
      'On Leave': { color: 'default', icon: <Info /> },
      'Holiday': { color: 'primary', icon: <CalendarToday /> }
    };
    
    const config = statusConfig[status] || { color: 'default', icon: <Info /> };
    
    return (
      <Chip
        label={status}
        color={config.color}
        icon={config.icon}
        size="small"
        variant="filled"
      />
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading attendance data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            <AccessTime sx={{ mr: 1, verticalAlign: 'middle' }} />
            My Attendance
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Track your daily attendance and work hours
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<Schedule />}
            onClick={() => navigate('/employee/regularization/request')}
          >
            Request Regularization
          </Button>
          <Button
            variant="outlined"
            startIcon={<Visibility />}
            onClick={() => setShowRegularizations(!showRegularizations)}
          >
            My Requests ({regularizations.length})
          </Button>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Month</InputLabel>
            <Select
              value={selectedMonth}
              label="Month"
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <MenuItem key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString('en-US', { month: 'long' })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Year</InputLabel>
            <Select
              value={selectedYear}
              label="Year"
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {Array.from({ length: 10 }, (_, i) => {
                const year = new Date().getFullYear() - 5 + i;
                return (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Stack>
      </Box>

      {/* Today's Attendance Card */}
      <Card sx={{ mb: 4 }}>
        <CardHeader
          title={
            <Box display="flex" alignItems="center">
              <CalendarToday sx={{ mr: 1 }} />
              Today's Attendance - {formatDate(new Date())}
            </Box>
          }
          sx={{ bgcolor: 'primary.main', color: 'white' }}
        />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center', border: 1, borderColor: 'grey.300' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Check In
                    </Typography>
                    <Typography variant="h5" color="success.main" fontWeight="bold">
                      {formatTime(todayAttendance?.checkIn)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center', border: 1, borderColor: 'grey.300' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Check Out
                    </Typography>
                    <Typography variant="h5" color="error.main" fontWeight="bold">
                      {formatTime(todayAttendance?.checkOut)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center', border: 1, borderColor: 'grey.300' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      {todayAttendance?.checkOut ? 'Total Hours' : 'Current Hours'}
                    </Typography>
                    <Typography variant="h5" color="info.main" fontWeight="bold">
                      {todayAttendance?.checkOut 
                        ? formatDuration(todayAttendance?.totalHours)
                        : calculateCurrentWorkHours(todayAttendance?.checkIn)
                      }
                    </Typography>
                    {!todayAttendance?.checkOut && todayAttendance?.checkIn && (
                      <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" justifyContent="center">
                        <AccessTime sx={{ fontSize: 14, mr: 0.5 }} />
                        Live counter
                      </Typography>
                    )}
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center', border: 1, borderColor: 'grey.300' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Status
                    </Typography>
                    <Box>
                      {todayAttendance ? getStatusBadge(todayAttendance.status) : getStatusBadge('Absent')}
                    </Box>
                    {todayAttendance?.autoCheckedOut && (
                      <Typography variant="caption" color="info.main" display="block" sx={{ mt: 1 }}>
                        🤖 Auto-checked out
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                
                {/* Location Selection */}
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Location</InputLabel>
                  <Select
                    value={location}
                    label="Location"
                    onChange={(e) => setLocation(e.target.value)}
                    disabled={todayAttendance?.checkIn && todayAttendance?.checkOut}
                  >
                    <MenuItem value="Office">Office</MenuItem>
                    <MenuItem value="Remote">Remote</MenuItem>
                    <MenuItem value="Client Site">Client Site</MenuItem>
                  </Select>
                </FormControl>

                {/* Notes */}
                <TextField
                  fullWidth
                  label="Notes (Optional)"
                  multiline
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes..."
                  inputProps={{ maxLength: 300 }}
                  sx={{ mb: 2 }}
                />

                {/* Action Buttons */}
                <Box>
                  {!todayAttendance?.checkIn ? (
                    <Button
                      fullWidth
                      variant="contained"
                      color="success"
                      size="large"
                      onClick={handleCheckIn}
                      disabled={checkInLoading}
                      startIcon={checkInLoading ? <CircularProgress size={20} /> : <PlayArrow />}
                    >
                      {checkInLoading ? 'Checking In...' : 'Check In'}
                    </Button>
                  ) : !todayAttendance?.checkOut ? (
                    <Button
                      fullWidth
                      variant="contained"
                      color="error"
                      size="large"
                      onClick={handleCheckOut}
                      disabled={checkOutLoading}
                      startIcon={checkOutLoading ? <CircularProgress size={20} /> : <Stop />}
                    >
                      {checkOutLoading ? 'Checking Out...' : 'Check Out'}
                    </Button>
                  ) : (
                    <Alert severity="success" sx={{ mb: 0 }}>
                      <Box display="flex" alignItems="center">
                        <CheckCircle sx={{ mr: 1 }} />
                        You have completed your attendance for today!
                      </Box>
                      {smartOvertimeInfo && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" fontWeight="bold">
                            Smart Overtime Summary:
                          </Typography>
                          {smartOvertimeInfo.shortageHours > 0 && (
                            <Typography variant="caption" color="warning.main" display="block">
                              🕐 Shortage Reduced: {formatDuration(smartOvertimeInfo.shortageHours)}
                            </Typography>
                          )}
                          {smartOvertimeInfo.adjustedOvertimeHours > 0 && (
                            <Typography variant="caption" color="success.main" display="block">
                              ➕ Final Overtime: {formatDuration(smartOvertimeInfo.adjustedOvertimeHours)}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Alert>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* My Regularization Requests */}
      {showRegularizations && (
        <Card sx={{ mb: 4 }}>
          <CardHeader
            title={
              <Box display="flex" alignItems="center">
                <Schedule sx={{ mr: 1 }} />
                My Regularization Requests
              </Box>
            }
            sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}
          />
          <CardContent>
            {regularizations.length > 0 ? (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Request ID</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Submitted</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {regularizations.slice(0, 5).map((reg) => (
                      <TableRow key={reg._id}>
                        <TableCell>
                          <Typography variant="caption" fontFamily="monospace">
                            {reg.regularizationId}
                          </Typography>
                        </TableCell>
                        <TableCell>{new Date(reg.attendanceDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip
                            label={reg.requestType}
                            color="info"
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={reg.status}
                            color={
                              reg.status === 'Pending' ? 'warning' :
                              reg.status === 'Approved' ? 'success' :
                              reg.status === 'Rejected' ? 'error' : 'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {new Date(reg.submittedDate).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => {
                              setSelectedRegularization(reg);
                              setShowDetailsModal(true);
                            }}
                          >
                            <Visibility />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box textAlign="center" py={3}>
                <Notes sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No regularization requests found
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Schedule />}
                  onClick={() => navigate('/employee/regularization/request')}
                  sx={{ mt: 1 }}
                >
                  Create Request
                </Button>
              </Box>
            )}
            {regularizations.length > 5 && (
              <Box textAlign="center" mt={2}>
                <Button
                  variant="outlined"
                  color="info"
                  size="small"
                  onClick={() => navigate('/employee/regularization')}
                >
                  View All Requests ({regularizations.length})
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Monthly Summary */}
      {attendanceSummary && (
        <Card sx={{ mb: 4 }}>
          <CardHeader
            title={
              <Box display="flex" alignItems="center">
                <TrendingUp sx={{ mr: 1 }} />
                Monthly Summary - {new Date(0, selectedMonth - 1).toLocaleString('en-US', { month: 'long' })} {selectedYear}
              </Box>
            }
            sx={{ bgcolor: 'secondary.main', color: 'white' }}
          />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={6} sm={4} md={2}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
                  <Typography variant="h4" fontWeight="bold">
                    {attendanceSummary.totalDays}
                  </Typography>
                  <Typography variant="caption">Total Days</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
                  <Typography variant="h4" fontWeight="bold">
                    {attendanceSummary.presentDays}
                  </Typography>
                  <Typography variant="caption">Present</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light', color: 'white' }}>
                  <Typography variant="h4" fontWeight="bold">
                    {attendanceSummary.absentDays}
                  </Typography>
                  <Typography variant="caption">Absent</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'white' }}>
                  <Typography variant="h4" fontWeight="bold">
                    {attendanceSummary.lateDays}
                  </Typography>
                  <Typography variant="caption">Late Days</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'white' }}>
                  <Typography variant="h4" fontWeight="bold">
                    {formatDuration(attendanceSummary.totalHours)}
                  </Typography>
                  <Typography variant="caption">Total Hours</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.600', color: 'white' }}>
                  <Typography variant="h4" fontWeight="bold">
                    {formatDuration(attendanceSummary.overtimeHours)}
                  </Typography>
                  <Typography variant="caption">Overtime</Typography>
                </Paper>
              </Grid>
              {attendanceSummary.shortageHours > 0 && (
                <Grid item xs={6} sm={4} md={2}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.dark', color: 'white' }}>
                    <Typography variant="h4" fontWeight="bold">
                      {formatDuration(attendanceSummary.shortageHours)}
                    </Typography>
                    <Typography variant="caption">Shortage Hours</Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Attendance History */}
      <Card>
        <CardHeader
          title={
            <Box display="flex" alignItems="center">
              <AccessTime sx={{ mr: 1 }} />
              Attendance History
            </Box>
          }
          sx={{ bgcolor: 'info.main', color: 'white' }}
        />
        <CardContent>
          {attendanceHistory.length > 0 ? (
            <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Check In</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Check Out</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Total Hours</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendanceHistory.map((record) => (
                    <TableRow key={record._id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {formatDate(record.date)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" color="success.main" fontWeight="medium">
                            {formatTime(record.checkIn)}
                          </Typography>
                          {record.isLate && (
                            <Typography variant="caption" color="warning.main" display="flex" alignItems="center">
                              <Warning sx={{ fontSize: 12, mr: 0.5 }} />
                              Late by {formatDelayTime(record.lateMinutes)}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" color="error.main" fontWeight="medium">
                            {formatTime(record.checkOut)}
                          </Typography>
                          {record.isEarly && (
                            <Typography variant="caption" color="info.main" display="flex" alignItems="center">
                              <Info sx={{ fontSize: 12, mr: 0.5 }} />
                              Early by {formatDelayTime(record.earlyMinutes)}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {record.checkOut 
                              ? formatDuration(record.totalHours)
                              : calculateCurrentWorkHours(record.checkIn)
                            }
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {!record.checkOut && record.checkIn && (
                              <Chip 
                                label="Current" 
                                size="small" 
                                color="info" 
                                variant="outlined"
                                icon={<AccessTime />}
                              />
                            )}
                            {record.overtime > 0 && (
                              <Chip 
                                label={`+${formatDuration(record.overtime)} OT`} 
                                size="small" 
                                color="success" 
                                variant="outlined"
                              />
                            )}
                            {record.shortageHours > 0 && (
                              <Chip 
                                label={`-${formatDuration(record.shortageHours)} Shortage`} 
                                size="small" 
                                color="warning" 
                                variant="outlined"
                              />
                            )}
                            {record.adjustedOvertimeHours > 0 && record.adjustedOvertimeHours !== record.overtime && (
                              <Chip 
                                label={`Smart: ${formatDuration(record.adjustedOvertimeHours)}`} 
                                size="small" 
                                color="info" 
                                variant="outlined"
                              />
                            )}
                          </Stack>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {getStatusChip(record.status)}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={record.location} 
                          size="small" 
                          variant="outlined"
                          icon={<LocationOn />}
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          {record.notes && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              {record.notes}
                            </Typography>
                          )}
                          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 0.5 }}>
                            {record.isRegularized && (
                              <Chip 
                                label="Regularized" 
                                size="small" 
                                color="warning" 
                                variant="outlined"
                                icon={<Notes />}
                              />
                            )}
                            {record.autoCheckedOut && (
                              <Chip 
                                label="Auto-checked out" 
                                size="small" 
                                color="info" 
                                variant="outlined"
                              />
                            )}
                          </Stack>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box textAlign="center" py={6}>
              <CalendarToday sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No attendance records found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No attendance records found for {new Date(0, selectedMonth - 1).toLocaleString('en-US', { month: 'long' })} {selectedYear}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      {showDetailsModal && selectedRegularization && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="bi bi-file-text me-2"></i>
                  Regularization Request Details
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowDetailsModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  {/* Left Column - Basic Details */}
                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm mb-3">
                      <div className="card-header bg-light">
                        <h6 className="mb-0">
                          <i className="bi bi-calendar me-2"></i>
                          Request Information
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-sm-6">
                            <strong>Request ID:</strong>
                            <p className="mb-2">{selectedRegularization.regularizationId}</p>
                          </div>
                          <div className="col-sm-6">
                            <strong>Date:</strong>
                            <p className="mb-2">{formatDate(selectedRegularization.attendanceDate)}</p>
                          </div>
                          <div className="col-sm-6">
                            <strong>Type:</strong>
                            <p className="mb-2">
                              <span className="badge bg-info">{selectedRegularization.requestType}</span>
                            </p>
                          </div>
                          <div className="col-sm-6">
                            <strong>Priority:</strong>
                            <p className="mb-2">
                              <span className={`badge ${getPriorityBadgeClass(selectedRegularization.priority)}`}>
                                {selectedRegularization.priority}
                              </span>
                            </p>
                          </div>
                          <div className="col-12">
                            <strong>Reason:</strong>
                            <p className="mb-2">{selectedRegularization.reason}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Time Details */}
                    {(selectedRegularization.requestedCheckIn || selectedRegularization.requestedCheckOut) && (
                      <div className="card border-0 shadow-sm mb-3">
                        <div className="card-header bg-light">
                          <h6 className="mb-0">
                            <i className="bi bi-clock me-2"></i>
                            Requested Times
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            {selectedRegularization.requestedCheckIn && (
                              <div className="col-sm-6">
                                <strong>Check-In:</strong>
                                <p className="mb-2">{formatTime(selectedRegularization.requestedCheckIn)}</p>
                              </div>
                            )}
                            {selectedRegularization.requestedCheckOut && (
                              <div className="col-sm-6">
                                <strong>Check-Out:</strong>
                                <p className="mb-2">{formatTime(selectedRegularization.requestedCheckOut)}</p>
                              </div>
                            )}
                            {selectedRegularization.requestedStatus && (
                              <div className="col-12">
                                <strong>Requested Status:</strong>
                                <p className="mb-2">
                                  <span className="badge bg-secondary">{selectedRegularization.requestedStatus}</span>
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Status & Attachments */}
                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm mb-3">
                      <div className="card-header bg-light">
                        <h6 className="mb-0">
                          <i className="bi bi-info-circle me-2"></i>
                          Status Information
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-sm-6">
                            <strong>Current Status:</strong>
                            <p className="mb-2">
                              <span className={`badge ${
                                selectedRegularization.status === 'Pending' ? 'bg-warning' :
                                selectedRegularization.status === 'Approved' ? 'bg-success' :
                                selectedRegularization.status === 'Rejected' ? 'bg-danger' : 'bg-secondary'
                              }`}>
                                {selectedRegularization.status}
                              </span>
                            </p>
                          </div>
                          <div className="col-sm-6">
                            <strong>Current Level:</strong>
                            <p className="mb-2">
                              <span className="badge bg-secondary">{selectedRegularization.currentLevel || 'Team Manager'}</span>
                            </p>
                          </div>
                          <div className="col-sm-6">
                            <strong>Submitted:</strong>
                            <p className="mb-2">{formatDate(selectedRegularization.submittedDate)}</p>
                          </div>
                          {selectedRegularization.approvedDate && (
                            <div className="col-sm-6">
                              <strong>Approved:</strong>
                              <p className="mb-2">{formatDate(selectedRegularization.approvedDate)}</p>
                            </div>
                          )}
                          {selectedRegularization.rejectedDate && (
                            <div className="col-sm-6">
                              <strong>Rejected:</strong>
                              <p className="mb-2">{formatDate(selectedRegularization.rejectedDate)}</p>
                            </div>
                          )}
                          {selectedRegularization.rejectionReason && (
                            <div className="col-12">
                              <strong>Rejection Reason:</strong>
                              <p className="mb-2 text-danger">{selectedRegularization.rejectionReason}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Supporting Documents */}
                    {selectedRegularization.supportingDocuments && selectedRegularization.supportingDocuments.length > 0 && (
                      <div className="card border-0 shadow-sm mb-3">
                        <div className="card-header bg-light">
                          <h6 className="mb-0">
                            <i className="bi bi-paperclip me-2"></i>
                            Supporting Documents ({selectedRegularization.supportingDocuments.length})
                          </h6>
                        </div>
                        <div className="card-body">
                          {selectedRegularization.supportingDocuments.map((document, index) => (
                            <div key={index} className="border rounded p-3 mb-3">
                              <div className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center">
                                  <i className={`${getFileIcon(document.mimeType)} text-primary me-2`} style={{ fontSize: '1.5rem' }}></i>
                                  <div>
                                    <div className="fw-bold">{document.originalName}</div>
                                    <small className="text-muted">
                                      {formatFileSize(document.fileSize)} • Uploaded {formatDate(document.uploadedAt)}
                                    </small>
                                  </div>
                                </div>
                                <div className="btn-group btn-group-sm">
                                  {isPreviewable(document.mimeType) && (
                                    <button
                                      className="btn btn-outline-primary"
                                      onClick={() => handleFilePreview(document)}
                                      title="Preview"
                                    >
                                      <i className="bi bi-eye"></i>
                                    </button>
                                  )}
                                  <button
                                    className="btn btn-outline-success"
                                    onClick={() => handleFileDownload(document)}
                                    title="Download"
                                  >
                                    <i className="bi bi-download"></i>
                                  </button>
                                </div>
                              </div>
                              
                              {/* Image Preview */}
                              {document.mimeType?.startsWith('image/') && (
                                <div className="mt-3">
                                  <img
                                    src={`http://localhost:5001${document.fileUrl}`}
                                    alt={document.originalName}
                                    className="img-fluid rounded"
                                    style={{ maxHeight: '200px', cursor: 'pointer' }}
                                    onClick={() => handleFilePreview(document)}
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Approval History */}
                    <div className="card border-0 shadow-sm">
                      <div className="card-header bg-light">
                        <h6 className="mb-0">
                          <i className="bi bi-clock-history me-2"></i>
                          Approval History
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="timeline">
                          {/* Team Manager Approval */}
                          {selectedRegularization.teamManagerApproval?.status !== 'Pending' && (
                            <div className="timeline-item mb-3">
                              <div className="d-flex align-items-center">
                                <div className={`badge ${selectedRegularization.teamManagerApproval?.status === 'Approved' ? 'bg-success' : 'bg-danger'} me-2`}>
                                  <i className={`bi ${selectedRegularization.teamManagerApproval?.status === 'Approved' ? 'bi-check' : 'bi-x'}`}></i>
                                </div>
                                <div>
                                  <strong>Team Manager</strong>
                                  {selectedRegularization.teamManagerApproval?.approver && (
                                    <div className="text-muted small">
                                      {selectedRegularization.teamManagerApproval.approver.firstName} {selectedRegularization.teamManagerApproval.approver.lastName}
                                    </div>
                                  )}
                                  {selectedRegularization.teamManagerApproval?.actionDate && (
                                    <div className="text-muted small">
                                      {formatDate(selectedRegularization.teamManagerApproval.actionDate)}
                                    </div>
                                  )}
                                  {selectedRegularization.teamManagerApproval?.comments && (
                                    <div className="text-muted small mt-1">
                                      <em>"{selectedRegularization.teamManagerApproval.comments}"</em>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* HR Approval */}
                          {selectedRegularization.hrApproval?.status !== 'Pending' && (
                            <div className="timeline-item mb-3">
                              <div className="d-flex align-items-center">
                                <div className={`badge ${selectedRegularization.hrApproval?.status === 'Approved' ? 'bg-success' : 'bg-danger'} me-2`}>
                                  <i className={`bi ${selectedRegularization.hrApproval?.status === 'Approved' ? 'bi-check' : 'bi-x'}`}></i>
                                </div>
                                <div>
                                  <strong>HR / VP</strong>
                                  {selectedRegularization.hrApproval?.approver && (
                                    <div className="text-muted small">
                                      {selectedRegularization.hrApproval.approver.firstName} {selectedRegularization.hrApproval.approver.lastName}
                                    </div>
                                  )}
                                  {selectedRegularization.hrApproval?.actionDate && (
                                    <div className="text-muted small">
                                      {formatDate(selectedRegularization.hrApproval.actionDate)}
                                    </div>
                                  )}
                                  {selectedRegularization.hrApproval?.comments && (
                                    <div className="text-muted small mt-1">
                                      <em>"{selectedRegularization.hrApproval.comments}"</em>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Show current pending level */}
                          {selectedRegularization.status === 'Pending' && (
                            <div className="timeline-item mb-3">
                              <div className="d-flex align-items-center">
                                <div className="badge bg-warning me-2">
                                  <i className="bi bi-clock"></i>
                                </div>
                                <div>
                                  <strong>{selectedRegularization.currentLevel || 'Team Manager'}</strong>
                                  <br />
                                  <small className="text-muted">Pending approval</small>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Late Arrival Modal */}
      {showLateModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-warning text-dark">
                <h5 className="modal-title">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Late Arrival Notice
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowLateModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="text-center mb-3">
                  <i className="bi bi-clock text-warning" style={{ fontSize: '3rem' }}></i>
                </div>
                <div className="alert alert-warning">
                  <h6 className="alert-heading">You have arrived late today!</h6>
                  <hr />
                  <div className="row">
                    <div className="col-6">
                      <small className="text-muted">Expected Check-in:</small>
                      <div className="fw-bold">{formatWorkTime(workHours.checkInTime)}</div>
                    </div>
                    <div className="col-6">
                      <small className="text-muted">Your Check-in:</small>
                      <div className="fw-bold text-warning">
                        {lateArrivalData && formatTime(lateArrivalData.checkInTime)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <span className="badge bg-warning text-dark fs-6">
                      <i className="bi bi-stopwatch me-1"></i>
                      Late by {lateArrivalData && formatDelayTime(lateArrivalData.lateMinutes)}
                    </span>
                  </div>
                </div>
                <div className="alert alert-info">
                  <small>
                    <i className="bi bi-info-circle me-1"></i>
                    <strong>Note:</strong> Your attendance has been marked as "Late and Present". 
                    Late threshold is 59 seconds after the scheduled check-in time ({formatWorkTime(workHours.checkInTime)}).
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-warning" 
                  onClick={() => setShowLateModal(false)}
                >
                  <i className="bi bi-check-circle me-1"></i>
                  Understood
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Box>
  );
};

export default MyAttendance;
