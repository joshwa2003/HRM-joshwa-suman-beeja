import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme
} from '@mui/material';
import {
  EventAvailable,
  Sick,
  BeachAccess,
  Work,
  ChildCare,
  Person,
  CalendarMonth
} from '@mui/icons-material';
import api from '../../utils/api';

const LeaveSummaryTab = ({ profileData, onUpdate, onNotification, isEditable }) => {
  const theme = useTheme();
  const [leaveBalance, setLeaveBalance] = useState({});
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [upcomingLeaves, setUpcomingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const fetchLeaveData = async () => {
    try {
      setLoading(true);
      
      // Use mock data for now since the endpoint might not exist
      const mockLeaveBalance = {
        casual: { available: 8, used: 4, total: 12 },
        sick: { available: 6, used: 2, total: 8 },
        earned: { available: 15, used: 5, total: 20 },
        maternity: { available: 180, used: 0, total: 180 },
        paternity: { available: 15, used: 0, total: 15 },
        compOff: { available: 2, used: 1, total: 3 }
      };

      const mockLeaveHistory = [
        {
          leaveType: 'Casual Leave',
          fromDate: '2024-01-10',
          toDate: '2024-01-12',
          totalDays: 3,
          reason: 'Personal work',
          status: 'Approved',
          appliedDate: '2024-01-05'
        },
        {
          leaveType: 'Sick Leave',
          fromDate: '2024-01-20',
          toDate: '2024-01-21',
          totalDays: 2,
          reason: 'Fever and cold',
          status: 'Approved',
          appliedDate: '2024-01-19'
        }
      ];

      const mockUpcomingLeaves = [
        {
          leaveType: 'Earned Leave',
          fromDate: '2024-02-15',
          toDate: '2024-02-20',
          totalDays: 6,
          status: 'Approved'
        }
      ];
      
      setLeaveBalance(mockLeaveBalance);
      setLeaveHistory(mockLeaveHistory);
      setUpcomingLeaves(mockUpcomingLeaves);

    } catch (error) {
      console.error('Error fetching leave data:', error);
      onNotification('Failed to load leave information', 'error');
    } finally {
      setLoading(false);
    }
  };

  const leaveTypes = [
    {
      key: 'casual',
      name: 'Casual Leave',
      icon: <BeachAccess />,
      color: 'primary',
      description: 'For personal work and short breaks'
    },
    {
      key: 'sick',
      name: 'Sick Leave',
      icon: <Sick />,
      color: 'error',
      description: 'For medical emergencies and health issues'
    },
    {
      key: 'earned',
      name: 'Earned Leave',
      icon: <EventAvailable />,
      color: 'success',
      description: 'Annual vacation leave'
    },
    {
      key: 'maternity',
      name: 'Maternity Leave',
      icon: <ChildCare />,
      color: 'secondary',
      description: 'For new mothers'
    },
    {
      key: 'paternity',
      name: 'Paternity Leave',
      icon: <Person />,
      color: 'info',
      description: 'For new fathers'
    },
    {
      key: 'compOff',
      name: 'Comp Off',
      icon: <Work />,
      color: 'warning',
      description: 'Compensatory off for overtime work'
    }
  ];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateUsagePercentage = (used, total) => {
    if (!total || total === 0) return 0;
    return Math.round((used / total) * 100);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography variant="body1">Loading leave information...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold" color="primary">
          Leave Summary
        </Typography>
        <Chip
          icon={<CalendarMonth />}
          label={`Current Year: ${new Date().getFullYear()}`}
          color="primary"
          variant="outlined"
        />
      </Box>

      <Grid container spacing={3}>
        {/* Leave Balance Cards */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom color="primary">
            Current Leave Balance
          </Typography>
          <Grid container spacing={2}>
            {leaveTypes.map((leaveType) => {
              const balance = leaveBalance[leaveType.key] || { available: 0, used: 0, total: 0 };
              const usagePercentage = calculateUsagePercentage(balance.used, balance.total);

              return (
                <Grid item xs={12} sm={6} md={4} key={leaveType.key}>
                  <Card elevation={1} sx={{ height: '100%' }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <Box color={`${leaveType.color}.main`}>
                          {leaveType.icon}
                        </Box>
                        <Typography variant="h6" color={`${leaveType.color}.main`}>
                          {balance.available || 0}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body1" fontWeight="bold" gutterBottom>
                        {leaveType.name}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {leaveType.description}
                      </Typography>

                      <Box mb={2}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="caption">
                            Used: {balance.used || 0}
                          </Typography>
                          <Typography variant="caption">
                            Total: {balance.total || 0}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={usagePercentage}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: theme.palette.grey[200],
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 3,
                              backgroundColor: usagePercentage > 80 ? theme.palette.error.main :
                                             usagePercentage > 60 ? theme.palette.warning.main :
                                             theme.palette.success.main
                            }
                          }}
                        />
                      </Box>

                      <Typography variant="caption" color="text.secondary">
                        {usagePercentage}% utilized
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Grid>

        {/* Upcoming Leaves */}
        {upcomingLeaves.length > 0 && (
          <Grid item xs={12}>
            <Card elevation={1}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Upcoming Leaves
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Leave Type</TableCell>
                        <TableCell>From Date</TableCell>
                        <TableCell>To Date</TableCell>
                        <TableCell>Days</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {upcomingLeaves.map((leave, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Chip
                              label={leave.leaveType}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>{formatDate(leave.fromDate)}</TableCell>
                          <TableCell>{formatDate(leave.toDate)}</TableCell>
                          <TableCell>{leave.totalDays}</TableCell>
                          <TableCell>
                            <Chip
                              label={leave.status}
                              size="small"
                              color={getStatusColor(leave.status)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Recent Leave History */}
        <Grid item xs={12}>
          <Card elevation={1}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Recent Leave History
              </Typography>
              {leaveHistory.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Leave Type</TableCell>
                        <TableCell>From Date</TableCell>
                        <TableCell>To Date</TableCell>
                        <TableCell>Days</TableCell>
                        <TableCell>Reason</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Applied On</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {leaveHistory.map((leave, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Chip
                              label={leave.leaveType}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>{formatDate(leave.fromDate)}</TableCell>
                          <TableCell>{formatDate(leave.toDate)}</TableCell>
                          <TableCell>{leave.totalDays}</TableCell>
                          <TableCell>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                              {leave.reason || 'No reason provided'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={leave.status}
                              size="small"
                              color={getStatusColor(leave.status)}
                            />
                          </TableCell>
                          <TableCell>{formatDate(leave.appliedDate)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                  No leave history found
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Leave Policy Summary */}
        <Grid item xs={12}>
          <Card elevation={1} sx={{ backgroundColor: theme.palette.info.main + '08' }}>
            <CardContent>
              <Typography variant="h6" color="info.main" gutterBottom>
                Leave Policy Highlights
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" component="div">
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      <li>Casual Leave: Can be taken for personal work, maximum 3 consecutive days</li>
                      <li>Sick Leave: Requires medical certificate for more than 2 days</li>
                      <li>Earned Leave: Can be carried forward to next year (max 15 days)</li>
                    </ul>
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" component="div">
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      <li>Leave application should be submitted at least 2 days in advance</li>
                      <li>Emergency leaves can be applied retrospectively with proper justification</li>
                      <li>Comp-off expires after 90 days if not utilized</li>
                    </ul>
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LeaveSummaryTab;
