import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  FileCopy as FileCopyIcon,
  Star as StarIcon,
  Delete as DeleteIcon,
  Calculate as CalculateIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const SalaryStructureDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [structure, setStructure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [calculatorBasic, setCalculatorBasic] = useState('');
  const [calculatorResult, setCalculatorResult] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => {
    fetchStructureDetails();
  }, [id]);

  const fetchStructureDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/salary-structures/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStructure(data.data);
        setCalculatorBasic(data.data.basicSalary.toString());
      } else {
        throw new Error('Failed to fetch salary structure details');
      }
    } catch (error) {
      console.error('Error fetching structure details:', error);
      setError('Failed to load salary structure details');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async () => {
    try {
      const response = await fetch(`/api/salary-structures/${id}/set-default`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchStructureDetails();
      } else {
        throw new Error('Failed to set default structure');
      }
    } catch (error) {
      console.error('Error setting default structure:', error);
      setError('Failed to set default structure');
    }
  };

  const handleClone = async () => {
    const newName = prompt(`Enter name for cloned structure:`, `${structure.name} - Copy`);
    if (!newName) return;

    try {
      const response = await fetch(`/api/salary-structures/${id}/clone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ newName })
      });

      if (response.ok) {
        const data = await response.json();
        navigate(`/admin/payroll/structure/${data.data._id}`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to clone structure');
      }
    } catch (error) {
      console.error('Error cloning structure:', error);
      setError(error.message);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/salary-structures/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        navigate('/admin/payroll/structure');
      } else {
        throw new Error('Failed to delete structure');
      }
    } catch (error) {
      console.error('Error deleting structure:', error);
      setError('Failed to delete structure');
    }
    setDeleteDialog(false);
  };

  const calculateSalary = async () => {
    if (!calculatorBasic || isNaN(calculatorBasic)) {
      setError('Please enter a valid basic salary amount');
      return;
    }

    try {
      const response = await fetch(`/api/salary-structures/${id}/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ basicSalary: parseFloat(calculatorBasic) })
      });

      if (response.ok) {
        const data = await response.json();
        setCalculatorResult(data.data.calculation);
      } else {
        throw new Error('Failed to calculate salary');
      }
    } catch (error) {
      console.error('Error calculating salary:', error);
      setError('Failed to calculate salary');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const calculateGrossSalary = (structure) => {
    const basic = structure.basicSalary || 0;
    const allowances = Object.values(structure.allowances || {}).reduce((sum, allowance) => {
      if (allowance.type === 'percentage') {
        return sum + (basic * allowance.value / 100);
      }
      return sum + (allowance.value || 0);
    }, 0);
    
    const customAllowances = (structure.customAllowances || []).reduce((sum, allowance) => {
      if (!allowance.isActive) return sum;
      if (allowance.type === 'percentage') {
        return sum + (basic * allowance.value / 100);
      }
      return sum + (allowance.value || 0);
    }, 0);
    
    return basic + allowances + customAllowances;
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error && !structure) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/payroll/structure')}
        >
          Back to Salary Structures
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <IconButton onClick={() => navigate('/admin/payroll/structure')}>
            <ArrowBackIcon />
          </IconButton>
          <Box flex={1}>
            <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountBalanceIcon color="primary" />
              {structure?.name}
              {structure?.isDefault && (
                <Chip label="Default" color="primary" size="small" />
              )}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {structure?.description || 'No description provided'}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Calculate Salary">
              <Button
                variant="outlined"
                startIcon={<CalculateIcon />}
                onClick={() => setCalculatorOpen(true)}
              >
                Calculator
              </Button>
            </Tooltip>
            <Tooltip title="Edit Structure">
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/admin/payroll/structure/${id}/edit`)}
              >
                Edit
              </Button>
            </Tooltip>
            <Tooltip title="Clone Structure">
              <Button
                variant="outlined"
                startIcon={<FileCopyIcon />}
                onClick={handleClone}
              >
                Clone
              </Button>
            </Tooltip>
            {!structure?.isDefault && (
              <Tooltip title="Set as Default">
                <Button
                  variant="outlined"
                  startIcon={<StarIcon />}
                  onClick={handleSetDefault}
                >
                  Set Default
                </Button>
              </Tooltip>
            )}
            <Tooltip title="Delete Structure">
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialog(true)}
              >
                Delete
              </Button>
            </Tooltip>
          </Stack>
        </Stack>

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
      </Box>

      <Grid container spacing={3}>
        {/* Overview Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoIcon color="primary" />
                Structure Overview
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Chip
                    label={structure?.isActive ? 'Active' : 'Inactive'}
                    color={structure?.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Basic Salary</Typography>
                  <Typography variant="h6" color="primary">
                    {formatCurrency(structure?.basicSalary)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Gross Salary (Approx.)</Typography>
                  <Typography variant="h6" color="success.main">
                    {formatCurrency(calculateGrossSalary(structure))}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Effective From</Typography>
                  <Typography variant="body1">
                    {new Date(structure?.effectiveFrom).toLocaleDateString()}
                  </Typography>
                </Box>
                {structure?.effectiveTo && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">Effective To</Typography>
                    <Typography variant="body1">
                      {new Date(structure.effectiveTo).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Salary Components */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            {/* Allowances */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon color="success" />
                  Allowances
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Component</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell align="right">Value</TableCell>
                        <TableCell align="right">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(structure?.allowances || {}).map(([key, allowance]) => {
                        const amount = allowance.type === 'percentage' 
                          ? (structure.basicSalary * allowance.value / 100)
                          : allowance.value;
                        return (
                          <TableRow key={key}>
                            <TableCell>{key.toUpperCase()}</TableCell>
                            <TableCell>
                              <Chip 
                                label={allowance.type} 
                                size="small" 
                                color={allowance.type === 'percentage' ? 'primary' : 'default'}
                              />
                            </TableCell>
                            <TableCell align="right">
                              {allowance.type === 'percentage' ? `${allowance.value}%` : formatCurrency(allowance.value)}
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                              {formatCurrency(amount)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {(structure?.customAllowances || []).filter(a => a.isActive).map((allowance, index) => {
                        const amount = allowance.type === 'percentage' 
                          ? (structure.basicSalary * allowance.value / 100)
                          : allowance.value;
                        return (
                          <TableRow key={`custom-${index}`}>
                            <TableCell>{allowance.name}</TableCell>
                            <TableCell>
                              <Chip 
                                label={allowance.type} 
                                size="small" 
                                color={allowance.type === 'percentage' ? 'primary' : 'default'}
                              />
                            </TableCell>
                            <TableCell align="right">
                              {allowance.type === 'percentage' ? `${allowance.value}%` : formatCurrency(allowance.value)}
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                              {formatCurrency(amount)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            {/* Deductions */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingDownIcon color="error" />
                  Deductions
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Component</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell align="right">Value</TableCell>
                        <TableCell align="right">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(structure?.deductions || {}).map(([key, deduction]) => {
                        let amount = 0;
                        if (key === 'epf') {
                          amount = deduction.type === 'percentage' 
                            ? (structure.basicSalary * deduction.value / 100)
                            : deduction.value;
                        } else {
                          const gross = calculateGrossSalary(structure);
                          amount = deduction.type === 'percentage' 
                            ? (gross * deduction.value / 100)
                            : deduction.value;
                        }
                        
                        if (deduction.maxLimit && amount > deduction.maxLimit) {
                          amount = deduction.maxLimit;
                        }
                        
                        return (
                          <TableRow key={key}>
                            <TableCell>{key.toUpperCase()}</TableCell>
                            <TableCell>
                              <Chip 
                                label={deduction.type} 
                                size="small" 
                                color={deduction.type === 'percentage' ? 'primary' : 'default'}
                              />
                            </TableCell>
                            <TableCell align="right">
                              {deduction.type === 'percentage' ? `${deduction.value}%` : formatCurrency(deduction.value)}
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                              {formatCurrency(amount)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {(structure?.customDeductions || []).filter(d => d.isActive).map((deduction, index) => {
                        const gross = calculateGrossSalary(structure);
                        const amount = deduction.type === 'percentage' 
                          ? (gross * deduction.value / 100)
                          : deduction.value;
                        return (
                          <TableRow key={`custom-${index}`}>
                            <TableCell>{deduction.name}</TableCell>
                            <TableCell>
                              <Chip 
                                label={deduction.type} 
                                size="small" 
                                color={deduction.type === 'percentage' ? 'primary' : 'default'}
                              />
                            </TableCell>
                            <TableCell align="right">
                              {deduction.type === 'percentage' ? `${deduction.value}%` : formatCurrency(deduction.value)}
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                              {formatCurrency(amount)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Applicable Criteria */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Applicable Criteria
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Roles
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {(structure?.applicableFor?.roles || []).map((role, index) => (
                      <Chip key={index} label={role} size="small" />
                    ))}
                    {(!structure?.applicableFor?.roles || structure.applicableFor.roles.length === 0) && (
                      <Typography variant="body2" color="text.secondary">All roles</Typography>
                    )}
                  </Stack>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Departments
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {(structure?.applicableFor?.departments || []).map((dept, index) => (
                      <Chip key={index} label={dept.name} size="small" />
                    ))}
                    {(!structure?.applicableFor?.departments || structure.applicableFor.departments.length === 0) && (
                      <Typography variant="body2" color="text.secondary">All departments</Typography>
                    )}
                  </Stack>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Designations
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {(structure?.applicableFor?.designations || []).map((designation, index) => (
                      <Chip key={index} label={designation} size="small" />
                    ))}
                    {(!structure?.applicableFor?.designations || structure.applicableFor.designations.length === 0) && (
                      <Typography variant="body2" color="text.secondary">All designations</Typography>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Additional Information */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Additional Information</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Bonus Rules
                  </Typography>
                  <Box>
                    <Typography variant="body2">
                      Annual Bonus: {structure?.bonusRules?.annual?.type === 'percentage' 
                        ? `${structure.bonusRules.annual.value}%` 
                        : formatCurrency(structure?.bonusRules?.annual?.value || 0)}
                    </Typography>
                    <Typography variant="body2">
                      Performance Bonus: {structure?.bonusRules?.performance?.type === 'percentage' 
                        ? `${structure.bonusRules.performance.value}%` 
                        : formatCurrency(structure?.bonusRules?.performance?.value || 0)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Overtime Rules
                  </Typography>
                  <Box>
                    <Typography variant="body2">
                      Enabled: {structure?.overtimeRules?.enabled ? 'Yes' : 'No'}
                    </Typography>
                    <Typography variant="body2">
                      Rate: {structure?.overtimeRules?.rate || 1}x of hourly rate
                    </Typography>
                    <Typography variant="body2">
                      Calculation: {structure?.overtimeRules?.calculation || 'hourly'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>

      {/* Salary Calculator Dialog */}
      <Dialog open={calculatorOpen} onClose={() => setCalculatorOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Salary Calculator</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Basic Salary"
              type="number"
              value={calculatorBasic}
              onChange={(e) => setCalculatorBasic(e.target.value)}
              sx={{ mb: 3 }}
            />
            <Button
              variant="contained"
              onClick={calculateSalary}
              sx={{ mb: 3 }}
            >
              Calculate
            </Button>
            
            {calculatorResult && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Salary Breakdown</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Basic Salary</Typography>
                      <Typography variant="h6">{formatCurrency(calculatorResult.basic)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Gross Salary</Typography>
                      <Typography variant="h6" color="success.main">{formatCurrency(calculatorResult.gross)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Total Deductions</Typography>
                      <Typography variant="h6" color="error.main">{formatCurrency(calculatorResult.totalDeductions)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Net Salary</Typography>
                      <Typography variant="h6" color="primary">{formatCurrency(calculatorResult.net)}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCalculatorOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{structure?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SalaryStructureDetails;
