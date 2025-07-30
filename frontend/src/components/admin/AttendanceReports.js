import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Alert,
  IconButton,
  Divider,
  Stack,
  InputAdornment
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  AccessTime as AccessTimeIcon,
  TrendingUp as TrendingUpIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { attendanceAPI } from '../../utils/api';
import { userAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const AttendanceReports = () => {
  const { user } = useAuth();
  const [attendanceData, setAttendanceData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [hierarchicalUsers, setHierarchicalUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    employee: '',
    status: '',
    startDate: '',
    endDate: '',
    searchTerm: '',
    department: '',
    role: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    totalPages: 1
  });
  const [summary, setSummary] = useState({
    totalRecords: 0,
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    totalOvertimeHours: 0,
    totalWorkHours: 0,
    averageWorkHours: 0,
    attendanceRate: 0
  });

  // Download modal states
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState('excel');
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadDateRange, setDownloadDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [downloadSummary, setDownloadSummary] = useState({
    totalRecords: 0
  });
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  
  // Advanced filters state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [quickDateFilter, setQuickDateFilter] = useState('');

  useEffect(() => {
    fetchEmployees();
    fetchHierarchicalUsers(); // Initial fetch
    fetchAttendance();
  }, [filters, pagination.page]);

  // Separate useEffect for hierarchical users that depends on employees being loaded
  useEffect(() => {
    if (employees.length > 0) {
      fetchHierarchicalUsers();
    }
  }, [employees]);

  // Handle search functionality
  useEffect(() => {
    if (!filters.searchTerm) {
      setFilteredEmployees(employees);
    } else {
      const searchLower = filters.searchTerm.toLowerCase();
      const filtered = employees.filter(employee => {
        const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
        const employeeId = employee.employeeId?.toLowerCase() || '';
        const email = employee.email.toLowerCase();
        
        return fullName.includes(searchLower) || 
               employeeId.includes(searchLower) || 
               email.includes(searchLower);
      });
      setFilteredEmployees(filtered);
    }
  }, [filters.searchTerm, employees]);

  const fetchEmployees = async () => {
    try {
      const response = await userAPI.getAllUsers({ limit: 1000 }); // Get all employees
      const allUsers = response.data?.users || [];
      
      // Filter to show only Employee, Team Leader, and Team Manager roles
      // HR should not see Admin, Vice President, HR BP, HR Manager, HR Executive
      const filteredUsers = allUsers.filter(user => 
        user.role === 'Employee' || 
        user.role === 'Team Leader' || 
        user.role === 'Team Manager'
      );
      
      // Sort employees alphabetically by first name, then by last name
      const sortedEmployees = filteredUsers.sort((a, b) => {
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
      
      setEmployees(sortedEmployees);
      setFilteredEmployees(sortedEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchHierarchicalUsers = async () => {
    try {
      console.log('Fetching hierarchical users for role:', user?.role);
      
      // First try to get hierarchical users
      let users = [];
      try {
        const response = await userAPI.getUsersByHierarchy();
        console.log('Hierarchical users response:', response.data);
        users = response.data?.data || [];
      } catch (hierarchyError) {
        console.warn('Hierarchical API failed, falling back to all users:', hierarchyError);
        // Fallback to regular user list if hierarchy API fails
        const fallbackResponse = await userAPI.getAllUsers({ limit: 1000 });
        users = fallbackResponse.data?.users || [];
      }
      
      // Filter users based on role permissions
      const filteredUsers = users.filter(user => 
        user.role === 'Employee' || 
        user.role === 'Team Leader' || 
        user.role === 'Team Manager' ||
        user.role === 'HR Executive' ||
        user.role === 'HR Manager' ||
        user.role === 'HR BP'
      );
      
      // Sort users by role hierarchy, then by name
      const sortedUsers = filteredUsers.sort((a, b) => {
        const roleOrder = {
          'Employee': 1,
          'Team Leader': 2,
          'Team Manager': 3,
          'HR Executive': 4,
          'HR Manager': 5,
          'HR BP': 6
        };
        
        const roleComparison = (roleOrder[a.role] || 999) - (roleOrder[b.role] || 999);
        if (roleComparison !== 0) return roleComparison;
        
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
      
      console.log('Sorted hierarchical users:', sortedUsers);
      setHierarchicalUsers(sortedUsers);
    } catch (error) {
      console.error('Error fetching hierarchical users:', error);
      // Set employees as fallback if everything fails
      setHierarchicalUsers(employees);
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const params = {
        employee: filters.employee || undefined,
        status: filters.status || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        page: pagination.page,
        limit: pagination.limit
      };
      const response = await attendanceAPI.getAllAttendance(params);
      let data = response.data?.attendance || [];
      
      // Apply search filter to the fetched data
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        data = data.filter(record => {
          if (!record.employee) return false;
          
          const fullName = `${record.employee.firstName} ${record.employee.lastName}`.toLowerCase();
          const employeeId = record.employee.employeeId?.toLowerCase() || '';
          const email = record.employee.email?.toLowerCase() || '';
          
          return fullName.includes(searchLower) || 
                 employeeId.includes(searchLower) || 
                 email.includes(searchLower);
        });
      }
      
      setAttendanceData(data);
      setPagination(prev => ({
        ...prev,
        totalPages: response.data?.totalPages || 1
      }));

      // Calculate summary with proper total hours calculation
      const summaryData = {
        totalRecords: data.length,
        presentDays: data.filter(record => record.status === 'Present').length,
        absentDays: data.filter(record => record.status === 'Absent').length,
        lateDays: data.filter(record => record.isLate).length,
        totalOvertimeHours: data.reduce((sum, record) => sum + (record.overtime || 0), 0),
        totalWorkHours: data.reduce((sum, record) => {
          const hours = record.totalHours || record.currentWorkHours || 0;
          return sum + (typeof hours === 'number' ? hours : 0);
        }, 0)
      };
      setSummary(summaryData);
    } catch (error) {
      console.error('Error fetching attendance reports:', error);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when filtering
  };

  const handlePageChange = (event, newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({
        ...prev,
        page: newPage
      }));
    }
  };

  const clearFilters = () => {
    setFilters({
      employee: '',
      status: '',
      startDate: '',
      endDate: '',
      searchTerm: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Fetch download count based on selected date range and employees
  const fetchDownloadCount = async () => {
    try {
      const params = {
        employee: filters.employee || undefined,
        status: filters.status || undefined,
        startDate: downloadDateRange.startDate || filters.startDate || undefined,
        endDate: downloadDateRange.endDate || filters.endDate || undefined,
        searchTerm: filters.searchTerm || undefined,
        selectedEmployees: selectedEmployees.length > 0 ? selectedEmployees.join(',') : undefined
      };
      
      const response = await attendanceAPI.getAttendanceCount(params);
      setDownloadSummary({
        totalRecords: response.data?.count || 0
      });
    } catch (error) {
      console.error('Error fetching download count:', error);
      setDownloadSummary({
        totalRecords: 0
      });
    }
  };

  // Effect to fetch download count when download date range or selected employees change
  useEffect(() => {
    if (showDownloadModal) {
      fetchDownloadCount();
    }
  }, [downloadDateRange.startDate, downloadDateRange.endDate, selectedEmployees, showDownloadModal]);

  const getStatusChip = (status, isLate) => {
    let color = 'default';
    let icon = null;
    
    switch (status) {
      case 'Present':
        color = isLate ? 'warning' : 'success';
        icon = isLate ? <WarningIcon /> : <CheckCircleIcon />;
        break;
      case 'Absent':
        color = 'error';
        icon = <CancelIcon />;
        break;
      case 'Late':
        color = 'warning';
        icon = <WarningIcon />;
        break;
      case 'Half Day':
        color = 'info';
        icon = <InfoIcon />;
        break;
      case 'On Leave':
        color = 'secondary';
        icon = <InfoIcon />;
        break;
      case 'Holiday':
        color = 'primary';
        icon = <InfoIcon />;
        break;
      default:
        color = 'default';
    }
    
    return (
      <Chip
        label={status + (isLate && status === 'Present' ? ' (Late)' : '')}
        color={color}
        size="small"
        icon={icon}
        variant="filled"
      />
    );
  };

  // Handle download functionality
  const handleDownload = async () => {
    setDownloadLoading(true);
    try {
      const params = {
        employee: filters.employee || undefined,
        status: filters.status || undefined,
        startDate: downloadDateRange.startDate || filters.startDate || undefined,
        endDate: downloadDateRange.endDate || filters.endDate || undefined,
        format: downloadFormat,
        searchTerm: filters.searchTerm || undefined,
        selectedEmployees: selectedEmployees.length > 0 ? selectedEmployees.join(',') : undefined
      };

      const response = await attendanceAPI.downloadAttendanceReport(params);
      
      // Create blob from response
      const blob = new Blob([response.data], {
        type: downloadFormat === 'excel' 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'application/pdf'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with current date and filters
      const currentDate = new Date().toISOString().split('T')[0];
      const dateRange = filters.startDate && filters.endDate 
        ? `_${filters.startDate}_to_${filters.endDate}`
        : filters.startDate 
        ? `_from_${filters.startDate}`
        : filters.endDate
        ? `_until_${filters.endDate}`
        : `_${currentDate}`;
      
      const filename = `attendance_report${dateRange}.${downloadFormat === 'excel' ? 'xlsx' : 'pdf'}`;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setShowDownloadModal(false);
      
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report. Please try again.');
    } finally {
      setDownloadLoading(false);
    }
  };

  // Helper functions for employee selection
  const handleEmployeeToggle = (employeeId) => {
    setSelectedEmployees(prev => {
      if (prev.includes(employeeId)) {
        return prev.filter(id => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  };

  const handleSelectAllEmployees = () => {
    const filteredUsers = getFilteredHierarchicalUsers();
    if (selectedEmployees.length === filteredUsers.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredUsers.map(user => user._id));
    }
  };

  const getFilteredHierarchicalUsers = () => {
    if (!employeeSearchTerm) {
      return hierarchicalUsers;
    }
    
    const searchLower = employeeSearchTerm.toLowerCase();
    return hierarchicalUsers.filter(user => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const employeeId = user.employeeId?.toLowerCase() || '';
      const email = user.email.toLowerCase();
      const role = user.role.toLowerCase();
      
      return fullName.includes(searchLower) || 
             employeeId.includes(searchLower) || 
             email.includes(searchLower) ||
             role.includes(searchLower);
    });
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      'Employee': 'Employee',
      'Team Leader': 'Team Leader',
      'Team Manager': 'Team Manager',
      'HR Executive': 'HR Executive',
      'HR Manager': 'HR Manager',
      'HR BP': 'HR Business Partner'
    };
    return roleNames[role] || role;
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssessmentIcon color="primary" />
          Attendance Reports
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="success"
            startIcon={<DownloadIcon />}
            onClick={() => {
              setDownloadDateRange({
                startDate: filters.startDate || '',
                endDate: filters.endDate || ''
              });
              setDownloadSummary({
                totalRecords: summary.totalRecords
              });
              setSelectedEmployees([]);
              setEmployeeSearchTerm('');
              setShowDownloadModal(true);
            }}
            disabled={loading || attendanceData.length === 0}
          >
            Download Report
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        </Stack>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" gutterBottom>
                {summary.totalRecords}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Records
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" gutterBottom>
                {summary.presentDays}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Present Days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main" gutterBottom>
                {summary.absentDays}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Absent Days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" gutterBottom>
                {summary.lateDays}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Late Days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main" gutterBottom>
                {summary.totalOvertimeHours.toFixed(2)} hrs
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Overtime
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" gutterBottom>
                {summary.totalWorkHours.toFixed(2)} hrs
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Work Hours
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterListIcon />
            Filters
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Search Employee"
                placeholder="Search by name, employee ID, or email..."
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                helperText="Search employees, team leaders, and managers by name, employee code, or email"
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Employee</InputLabel>
                <Select
                  value={filters.employee}
                  label="Employee"
                  onChange={(e) => handleFilterChange('employee', e.target.value)}
                >
                  <MenuItem value="">All Employees</MenuItem>
                  {filteredEmployees.map(employee => (
                    <MenuItem key={employee._id} value={employee._id}>
                      {employee.firstName} {employee.lastName} 
                      {employee.employeeId && ` (ID: ${employee.employeeId})`} - {employee.role}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="Present">Present</MenuItem>
                  <MenuItem value="Absent">Absent</MenuItem>
                  <MenuItem value="Late">Late</MenuItem>
                  <MenuItem value="Half Day">Half Day</MenuItem>
                  <MenuItem value="On Leave">On Leave</MenuItem>
                  <MenuItem value="Holiday">Holiday</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon />
            Attendance Records
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
              <CircularProgress size={60} />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Loading attendance data...
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'primary.main' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Employee</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Check In</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Check Out</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Total Hours</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Late Minutes</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Overtime (hrs)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendanceData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <CalendarIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="body1" color="text.secondary">
                              No attendance records found
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      attendanceData.map(record => (
                        <TableRow key={record._id} hover>
                          <TableCell>
                            {new Date(record.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {record.employee?.firstName} {record.employee?.lastName}
                              </Typography>
                              {record.employee?.employeeId && (
                                <Chip 
                                  label={`ID: ${record.employee.employeeId}`} 
                                  size="small" 
                                  variant="outlined" 
                                  sx={{ mt: 0.5, mr: 1 }} 
                                />
                              )}
                              <Typography variant="caption" color="text.secondary" display="block">
                                {record.employee?.email}
                              </Typography>
                              <Typography variant="caption" color="info.main" display="block">
                                {record.employee?.role}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {record.checkIn ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'success.main' }}>
                                <AccessTimeIcon fontSize="small" />
                                <Typography variant="body2">
                                  {new Date(record.checkIn).toLocaleTimeString()}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">-</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {record.checkOut ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
                                <AccessTimeIcon fontSize="small" />
                                <Typography variant="body2">
                                  {new Date(record.checkOut).toLocaleTimeString()}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">-</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {(() => {
                                const hours = record.totalHours || record.currentWorkHours || 0;
                                return (typeof hours === 'number' ? hours : 0).toFixed(2);
                              })()}
                            </Typography>
                            {record.checkIn && !record.checkOut && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                                Currently working
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {getStatusChip(record.status, record.isLate)}
                          </TableCell>
                          <TableCell>
                            {record.lateMinutes > 0 ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'warning.main' }}>
                                <WarningIcon fontSize="small" />
                                <Typography variant="body2">
                                  {record.lateMinutes} min
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">-</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {record.overtime > 0 ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'info.main' }}>
                                <TrendingUpIcon fontSize="small" />
                                <Typography variant="body2">
                                  {record.overtime?.toFixed(2)}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">0.00</Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination
                    count={pagination.totalPages}
                    page={pagination.page}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Download Modal */}
      <Dialog
        open={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: 'success.main', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
          <DownloadIcon />
          Download Attendance Report
          <IconButton
            onClick={() => setShowDownloadModal(false)}
            sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarIcon />
              Select Date Range for Download:
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="From Date"
                  value={downloadDateRange.startDate}
                  onChange={(e) => setDownloadDateRange(prev => ({
                    ...prev,
                    startDate: e.target.value
                  }))}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="To Date"
                  value={downloadDateRange.endDate}
                  onChange={(e) => setDownloadDateRange(prev => ({
                    ...prev,
                    endDate: e.target.value
                  }))}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            </Grid>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Leave empty to use current filter dates or download all available data
            </Typography>
          </Box>

          {/* Employee Selection Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PeopleIcon />
              Select Employees for Download:
            </Typography>
            <TextField
              fullWidth
              placeholder="Search employees by name, ID, email, or role..."
              value={employeeSearchTerm}
              onChange={(e) => setEmployeeSearchTerm(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Based on your role ({user?.role}), you can select from the following employees:
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={handleSelectAllEmployees}
              >
                {selectedEmployees.length === getFilteredHierarchicalUsers().length ? 'Deselect All' : 'Select All'}
              </Button>
            </Box>
            
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                maxHeight: 250, 
                overflowY: 'auto',
                backgroundColor: 'grey.50'
              }}
            >
              {hierarchicalUsers.length === 0 ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 3 }}>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Loading employees...
                  </Typography>
                </Box>
              ) : getFilteredHierarchicalUsers().length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No employees match your search criteria
                </Typography>
              ) : (
                getFilteredHierarchicalUsers().map(user => (
                  <FormControlLabel
                    key={user._id}
                    control={
                      <Checkbox
                        checked={selectedEmployees.includes(user._id)}
                        onChange={() => handleEmployeeToggle(user._id)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {user.firstName} {user.lastName}
                          {user.employeeId && (
                            <Chip 
                              label={`ID: ${user.employeeId}`} 
                              size="small" 
                              variant="outlined" 
                              sx={{ ml: 1 }} 
                            />
                          )}
                          <Chip 
                            label={getRoleDisplayName(user.role)} 
                            size="small" 
                            color="info" 
                            sx={{ ml: 1 }} 
                          />
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                    }
                    sx={{ display: 'block', mb: 1 }}
                  />
                ))
              )}
            </Paper>
            
            {selectedEmployees.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CheckCircleIcon fontSize="small" />
                  {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? 's' : ''} selected
                </Typography>
              </Box>
            )}
            
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Leave empty to download attendance for all employees (based on current filters)
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>Report Details:</Typography>
            <Stack spacing={1}>
              <Typography variant="body2">
                <strong>Total Records:</strong> {downloadSummary.totalRecords}
              </Typography>
              {(downloadDateRange.startDate || filters.startDate) && (
                <Typography variant="body2">
                  <strong>Start Date:</strong> {downloadDateRange.startDate || filters.startDate}
                </Typography>
              )}
              {(downloadDateRange.endDate || filters.endDate) && (
                <Typography variant="body2">
                  <strong>End Date:</strong> {downloadDateRange.endDate || filters.endDate}
                </Typography>
              )}
              {selectedEmployees.length > 0 && (
                <Typography variant="body2">
                  <strong>Selected Employees:</strong> {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? 's' : ''}
                </Typography>
              )}
              {filters.employee && (
                <Typography variant="body2">
                  <strong>Employee Filter:</strong> {
                    employees.find(emp => emp._id === filters.employee)?.firstName + ' ' + 
                    employees.find(emp => emp._id === filters.employee)?.lastName
                  }
                </Typography>
              )}
              {filters.status && (
                <Typography variant="body2">
                  <strong>Status Filter:</strong> {filters.status}
                </Typography>
              )}
              {filters.searchTerm && (
                <Typography variant="body2">
                  <strong>Search Term:</strong> {filters.searchTerm}
                </Typography>
              )}
            </Stack>
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              <strong>Select Download Format:</strong>
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={downloadFormat === 'excel'}
                  onChange={(e) => setDownloadFormat(e.target.checked ? 'excel' : 'pdf')}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DownloadIcon color="success" />
                  <Typography variant="body2">
                    Excel (.xlsx) - Best for data analysis and calculations
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={downloadFormat === 'pdf'}
                  onChange={(e) => setDownloadFormat(e.target.checked ? 'pdf' : 'excel')}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DownloadIcon color="error" />
                  <Typography variant="body2">
                    PDF (.pdf) - Best for printing and sharing
                  </Typography>
                </Box>
              }
            />
          </Box>

          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              The report will include all filtered data with the selected date range and search criteria.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowDownloadModal(false)}
            disabled={downloadLoading}
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            color="success"
            onClick={handleDownload}
            disabled={downloadLoading}
            startIcon={downloadLoading ? <CircularProgress size={20} /> : <DownloadIcon />}
          >
            {downloadLoading ? (
              `Generating ${downloadFormat === 'excel' ? 'Excel' : 'PDF'}...`
            ) : (
              `Download ${downloadFormat === 'excel' ? 'Excel' : 'PDF'}`
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AttendanceReports;
