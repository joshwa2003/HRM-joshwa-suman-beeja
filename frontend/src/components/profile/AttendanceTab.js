import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme
} from '@mui/material';
import {
  Schedule,
  CheckCircle,
  Cancel,
  Warning,
  AccessTime,
  CalendarMonth,
  TrendingUp
} from '@mui/icons-material';
import api from '../../utils/api';

const AttendanceTab = ({ profileData, onUpdate, onNotification, isEditable }) => {
  const theme = useTheme();
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedMonth, selectedYear]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      
      // Use mock data for now since the endpoint might not exist
      const mockAttendanceData = [
        {
          date: '2024-01-15',
          status: 'Present',
          checkIn: '09:15:00',
          checkOut: '18:30:00',
          breakTime: '1h 00m',
          overtime: '0h 30m',
          remarks: 'Regular day'
        },
        {
          date: '2024-01-14',
          status: 'Present',
          checkIn: '09:00:00',
          checkOut: '18:00:00',
          breakTime: '1h 00m',
          overtime: '0h 00m',
          remarks: 'On time'
        },
        {
          date: '2024-01-13',
          status: 'Late',
          checkIn: '09:30:00',
          checkOut: '18:30:00',
          breakTime: '1h 00m',
          overtime: '0h 30m',
          remarks: 'Traffic delay'
        }
      ];
      
      const mockSummary = {
        presentDays: 22,
        absentDays: 2,
        lateDays: 1,
        totalHours: '176h'
      };
      
      setAttendanceData(mockAttendanceData);
      setAttendanceSummary(mockSummary);

    } catch (error) {
      console.error('Error fetching attendance data:', error);
      onNotification('Failed to load attendance information', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return 'success';
      case 'absent':
        return 'error';
      case 'late':
        return 'warning';
      case 'half-day':
        return 'info';
      case 'holiday':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return <CheckCircle />;
      case 'absent':
        return <Cancel />;
      case 'late':
        return <Warning />;
      case 'half-day':
        return <AccessTime />;
      default:
        return <Schedule />;
    }
  };

  const formatTime = (time) => {
    if (!time) return 'N/A';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateWorkingHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 'N/A';
    
    const checkInTime = new Date(`2000-01-01T${checkIn}`);
    const checkOutTime = new Date(`2000-01-01T${checkOut}`);
    const diffMs = checkOutTime - checkInTime;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHours}h ${diffMinutes}m`;
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography variant="body1">Loading attendance information...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold" color="primary">
          Attendance Records
        </Typography>
        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Month</InputLabel>
            <Select
              value={selectedMonth}
              label="Month"
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {months.map((month, index) => (
                <MenuItem key={index} value={index}>
                  {month}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Year</InputLabel>
            <Select
              value={selectedYear}
              label="Year"
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {years.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Attendance Summary Cards */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom color="primary">
            Monthly Summary - {months[selectedMonth]} {selectedYear}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={1}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <CheckCircle sx={{ fontSize: 40, color: theme.palette.success.main, mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {attendanceSummary.presentDays || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Present Days
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={1}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Cancel sx={{ fontSize: 40, color: theme.palette.error.main, mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold" color="error.main">
                    {attendanceSummary.absentDays || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Absent Days
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={1}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Warning sx={{ fontSize: 40, color: theme.palette.warning.main, mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {attendanceSummary.lateDays || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Late Arrivals
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={1}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <TrendingUp sx={{ fontSize: 40, color: theme.palette.info.main, mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {attendanceSummary.totalHours || '0h'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Hours
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Detailed Attendance Table */}
        <Grid item xs={12}>
          <Card elevation={1}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Daily Attendance Details
              </Typography>
              {attendanceData.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Check In</TableCell>
                        <TableCell>Check Out</TableCell>
                        <TableCell>Working Hours</TableCell>
                        <TableCell>Break Time</TableCell>
                        <TableCell>Overtime</TableCell>
                        <TableCell>Remarks</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {attendanceData.map((record, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {formatDate(record.date)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getStatusIcon(record.status)}
                              label={record.status}
                              size="small"
                              color={getStatusColor(record.status)}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatTime(record.checkIn)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatTime(record.checkOut)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {calculateWorkingHours(record.checkIn, record.checkOut)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {record.breakTime || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {record.overtime || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ maxWidth: 150 }} noWrap>
                              {record.remarks || '-'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                  No attendance records found for {months[selectedMonth]} {selectedYear}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Attendance Guidelines */}
        <Grid item xs={12}>
          <Card elevation={1} sx={{ backgroundColor: theme.palette.info.main + '08' }}>
            <CardContent>
              <Typography variant="h6" color="info.main" gutterBottom>
                <CalendarMonth sx={{ mr: 1, verticalAlign: 'middle' }} />
                Attendance Guidelines
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" component="div">
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      <li>Standard working hours: 9:00 AM to 6:00 PM</li>
                      <li>Grace period: 15 minutes for check-in</li>
                      <li>Lunch break: 1 hour (not counted in working hours)</li>
                      <li>Minimum working hours per day: 8 hours</li>
                    </ul>
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" component="div">
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      <li>Late arrival after 9:15 AM is marked as late</li>
                      <li>Half-day: Less than 4 hours of work</li>
                      <li>Overtime: Work beyond 6:00 PM (pre-approved)</li>
                      <li>Contact HR for attendance regularization</li>
                    </ul>
                  </Typography>
                </Grid>
              </Grid>
              
              {isEditable && (
                <Box mt={2}>
                  <Button
                    variant="outlined"
                    color="info"
                    onClick={() => onNotification('Regularization feature coming soon!', 'info')}
                  >
                    Request Regularization
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AttendanceTab;
