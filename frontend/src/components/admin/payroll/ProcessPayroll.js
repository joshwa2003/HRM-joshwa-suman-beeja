import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Divider,
  Chip
} from '@mui/material';
import {
  Settings as SettingsIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  Visibility as VisibilityIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';

const ProcessPayroll = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [payrollData, setPayrollData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    employeeIds: [],
    autoCalculate: true
  });

  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [processResults, setProcessResults] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({
    department: '',
    role: '',
    search: ''
  });

  const steps = ['Select Period & Employees', 'Review & Process', 'Results'];

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [filters, employees]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/users?isActive=true&limit=1000', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEmployees(data.data.docs || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Failed to load employees');
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDepartments(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const filterEmployees = () => {
    let filtered = employees.filter(emp => emp.role !== 'Admin');

    if (filters.department) {
      filtered = filtered.filter(emp => emp.department?._id === filters.department);
    }

    if (filters.role) {
      filtered = filtered.filter(emp => emp.role === filters.role);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(emp => 
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchLower) ||
        emp.email.toLowerCase().includes(searchLower) ||
        emp.employeeId?.toLowerCase().includes(searchLower)
      );
    }

    setSelectedEmployees(filtered);
  };

  const handleEmployeeSelection = (employeeId, isSelected) => {
    setPayrollData(prev => ({
      ...prev,
      employeeIds: isSelected 
        ? [...prev.employeeIds, employeeId]
        : prev.employeeIds.filter(id => id !== employeeId)
    }));
  };

  const handleSelectAll = (isSelected) => {
    setPayrollData(prev => ({
      ...prev,
      employeeIds: isSelected ? selectedEmployees.map(emp => emp._id) : []
    }));
  };

  const handleProcessPayroll = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await fetch('/api/payroll/bulk-process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payrollData)
      });

      const data = await response.json();

      if (response.ok) {
        setProcessResults(data.data);
        setCurrentStep(2);
        setSuccess('Payroll processing completed successfully');
      } else {
        throw new Error(data.message || 'Failed to process payroll');
      }
    } catch (error) {
      console.error('Error processing payroll:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const renderStep1 = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarIcon color="primary" />
              Payroll Period
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Month</InputLabel>
                  <Select
                    value={payrollData.month}
                    label="Month"
                    onChange={(e) => setPayrollData(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                  >
                    {[...Array(12)].map((_, i) => (
                      <MenuItem key={i + 1} value={i + 1}>
                        {getMonthName(i + 1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={payrollData.year}
                    label="Year"
                    onChange={(e) => setPayrollData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                  >
                    {[...Array(5)].map((_, i) => {
                      const year = new Date().getFullYear() - 2 + i;
                      return (
                        <MenuItem key={year} value={year}>{year}</MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Box mt={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={payrollData.autoCalculate}
                    onChange={(e) => setPayrollData(prev => ({ ...prev, autoCalculate: e.target.checked }))}
                  />
                }
                label="Auto-calculate salaries using salary structures"
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} lg={8}>
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PeopleIcon color="primary" />
                Select Employees
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={payrollData.employeeIds.length === selectedEmployees.length && selectedEmployees.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                }
                label={`Select All (${selectedEmployees.length})`}
              />
            </Stack>

            {/* Filters */}
            <Grid container spacing={2} mb={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={filters.department}
                    label="Department"
                    onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                  >
                    <MenuItem value="">All Departments</MenuItem>
                    {departments.map(dept => (
                      <MenuItem key={dept._id} value={dept._id}>{dept.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={filters.role}
                    label="Role"
                    onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                  >
                    <MenuItem value="">All Roles</MenuItem>
                    <MenuItem value="Employee">Employee</MenuItem>
                    <MenuItem value="Team Leader">Team Leader</MenuItem>
                    <MenuItem value="Team Manager">Team Manager</MenuItem>
                    <MenuItem value="HR Executive">HR Executive</MenuItem>
                    <MenuItem value="HR Manager">HR Manager</MenuItem>
                    <MenuItem value="HR BP">HR BP</MenuItem>
                    <MenuItem value="Vice President">Vice President</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search employees"
                  placeholder="Search employees..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </Grid>
            </Grid>

            {/* Employee List */}
            <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto' }}>
              {selectedEmployees.length > 0 ? (
                <List>
                  {selectedEmployees.map(employee => (
                    <ListItem key={employee._id} divider>
                      <ListItemIcon>
                        <Checkbox
                          checked={payrollData.employeeIds.includes(employee._id)}
                          onChange={(e) => handleEmployeeSelection(employee._id, e.target.checked)}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${employee.firstName} ${employee.lastName}`}
                        secondary={
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="caption">{employee.employeeId}</Typography>
                            <Typography variant="caption">•</Typography>
                            <Typography variant="caption">{employee.role}</Typography>
                            <Typography variant="caption">•</Typography>
                            <Typography variant="caption">{employee.department?.name}</Typography>
                            <Typography variant="caption" sx={{ ml: 'auto' }}>{employee.email}</Typography>
                          </Stack>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box textAlign="center" py={4}>
                  <PeopleIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 1 }} />
                  <Typography color="text.secondary">No employees found</Typography>
                </Box>
              )}
            </Paper>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Stack direction="row" justifyContent="space-between">
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/admin/payroll')}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            onClick={() => setCurrentStep(1)}
            disabled={payrollData.employeeIds.length === 0}
          >
            Next: Review & Process
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );

  const renderStep2 = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VisibilityIcon color="primary" />
              Review Payroll Details
            </Typography>
            
            <Grid container spacing={3} mb={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Payroll Period
                  </Typography>
                  <Typography variant="h5">
                    {getMonthName(payrollData.month)} {payrollData.year}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Selected Employees
                  </Typography>
                  <Typography variant="h5">
                    {payrollData.employeeIds.length} employees
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                Processing Options
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={payrollData.autoCalculate}
                    onChange={(e) => setPayrollData(prev => ({ ...prev, autoCalculate: e.target.checked }))}
                  />
                }
                label={
                  <Box>
                    <Typography variant="subtitle2">Auto-calculate salaries</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Automatically calculate salaries using assigned salary structures, attendance data, and approved reimbursements.
                    </Typography>
                  </Box>
                }
              />
            </Box>

            <Alert severity="info">
              <Typography variant="subtitle2" gutterBottom>
                What happens during processing:
              </Typography>
              <Box component="ul" sx={{ mt: 1, mb: 0 }}>
                <li>Salary structures will be applied to calculate basic salary and allowances</li>
                <li>Attendance data will be fetched to calculate deductions for absences</li>
                <li>Approved reimbursements will be included in the payroll</li>
                <li>Statutory deductions (PF, ESI, Tax) will be calculated automatically</li>
                <li>Payroll records will be created with "Draft" status for review</li>
              </Box>
            </Alert>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Stack direction="row" justifyContent="space-between">
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => setCurrentStep(0)}
          >
            Back
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SettingsIcon />}
            onClick={handleProcessPayroll}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Process Payroll'}
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );

  const renderStep3 = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleIcon color="success" />
              Payroll Processing Results
            </Typography>
            
            {processResults && (
              <>
                <Grid container spacing={3} mb={4}>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
                      <CheckCircleIcon sx={{ fontSize: 48, mb: 1 }} />
                      <Typography variant="h4" gutterBottom>
                        {processResults.processed.length}
                      </Typography>
                      <Typography variant="body2">
                        Successfully Processed
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                      <WarningIcon sx={{ fontSize: 48, mb: 1 }} />
                      <Typography variant="h4" gutterBottom>
                        {processResults.skipped.length}
                      </Typography>
                      <Typography variant="body2">
                        Skipped
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'error.light', color: 'error.contrastText' }}>
                      <ErrorIcon sx={{ fontSize: 48, mb: 1 }} />
                      <Typography variant="h4" gutterBottom>
                        {processResults.errors.length}
                      </Typography>
                      <Typography variant="body2">
                        Errors
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Processed Successfully */}
                {processResults.processed.length > 0 && (
                  <Box mb={4}>
                    <Typography variant="h6" color="success.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon />
                      Successfully Processed ({processResults.processed.length})
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Employee</TableCell>
                            <TableCell align="right">Gross Salary</TableCell>
                            <TableCell align="right">Net Salary</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {processResults.processed.map((result, index) => (
                            <TableRow key={index}>
                              <TableCell>{result.employee}</TableCell>
                              <TableCell align="right">{formatCurrency(result.grossSalary)}</TableCell>
                              <TableCell align="right">
                                <Typography variant="subtitle2" fontWeight="bold">
                                  {formatCurrency(result.netSalary)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {/* Skipped */}
                {processResults.skipped.length > 0 && (
                  <Box mb={4}>
                    <Typography variant="h6" color="warning.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WarningIcon />
                      Skipped ({processResults.skipped.length})
                    </Typography>
                    <List>
                      {processResults.skipped.map((result, index) => (
                        <ListItem key={index} divider>
                          <ListItemText
                            primary={result.employee}
                            secondary={result.reason}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {/* Errors */}
                {processResults.errors.length > 0 && (
                  <Box mb={4}>
                    <Typography variant="h6" color="error.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ErrorIcon />
                      Errors ({processResults.errors.length})
                    </Typography>
                    <List>
                      {processResults.errors.map((result, index) => (
                        <ListItem key={index} divider>
                          <ListItemText
                            primary={result.employee}
                            secondary={
                              <Typography variant="body2" color="error">
                                {result.error}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Stack direction="row" justifyContent="space-between">
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/admin/payroll')}
          >
            Back to Payroll
          </Button>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                setCurrentStep(0);
                setProcessResults(null);
                setPayrollData(prev => ({ ...prev, employeeIds: [] }));
              }}
            >
              Process Another Batch
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<DescriptionIcon />}
              onClick={() => navigate('/admin/payroll/payslips')}
            >
              Generate Payslips
            </Button>
          </Stack>
        </Stack>
      </Grid>
    </Grid>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon color="primary" />
          Process Payroll
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Process monthly payroll for selected employees
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError('')}
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert 
          severity="success" 
          onClose={() => setSuccess('')}
          sx={{ mb: 3 }}
        >
          {success}
        </Alert>
      )}

      {/* Step Indicator */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Stepper activeStep={currentStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Step Content */}
      {currentStep === 0 && renderStep1()}
      {currentStep === 1 && renderStep2()}
      {currentStep === 2 && renderStep3()}
    </Container>
  );
};

export default ProcessPayroll;
